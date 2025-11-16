import { Router } from 'express';
import { randomUUID } from 'crypto';
import { db, redis, SessionKeys } from '../config/database';
import { AppError, asyncHandler } from '../middleware/error';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { sessionLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Session:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         group_id:
 *           type: string
 *           format: uuid
 *         status:
 *           type: string
 *           enum: [pending, active, voting, completed, cancelled]
 *         energy_level:
 *           type: string
 *           enum: [low, medium, high]
 *         round_number:
 *           type: integer
 *         session_config:
 *           type: object
 *         started_at:
 *           type: string
 *           format: date-time
 *         ended_at:
 *           type: string
 *           format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/sessions:
 *   post:
 *     summary: Create a new session
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - group_id
 *             properties:
 *               group_id:
 *                 type: string
 *                 format: uuid
 *               energy_level:
 *                 type: string
 *                 enum: [low, medium, high]
 *               session_config:
 *                 type: object
 *     responses:
 *       201:
 *         description: Session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Session'
 */
router.post(
  '/',
  sessionLimiter,
  validate(schemas.createSession),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { group_id, energy_level, session_config } = req.body;

    // Verify user is a member of the group
    const membership = await db('group_members')
      .where({ group_id, user_id: req.user!.id, is_active: true })
      .first();

    if (!membership) {
      throw new AppError('Not a member of this group', 403);
    }

    // Check if there's already an active session for this group
    const activeSession = await db('sessions')
      .where({ group_id, status: 'active' })
      .orWhere({ group_id, status: 'voting' })
      .first();

    if (activeSession) {
      throw new AppError('Group already has an active session', 400);
    }

    const sessionData = {
      id: randomUUID(),
      group_id,
      status: 'pending',
      energy_level: energy_level || 'medium',
      round_number: 1,
      session_config: session_config ? JSON.stringify(session_config) : null,
      created_at: new Date(),
      updated_at: new Date()
    };

    await db('sessions').insert(sessionData);

    // Store session state in Redis
    await redis.setex(
      SessionKeys.session(sessionData.id),
      3600, // 1 hour TTL
      JSON.stringify({
        ...sessionData,
        participants: [req.user!.id],
        votes: {},
        current_items: []
      })
    );

    res.status(201).json(sessionData);
  })
);

/**
 * @swagger
 * /api/sessions/{sessionId}:
 *   get:
 *     summary: Get session details
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Session details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Session'
 */
router.get(
  '/:sessionId',
  validate(schemas.sessionParams),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { sessionId } = req.params;

    const session = await db('sessions')
      .where({ id: sessionId })
      .first();

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    // Verify user is a member of the group
    const membership = await db('group_members')
      .where({ group_id: session.group_id, user_id: req.user!.id, is_active: true })
      .first();

    if (!membership) {
      throw new AppError('Not authorized to view this session', 403);
    }

    res.json(session);
  })
);

/**
 * @swagger
 * /api/sessions/{sessionId}/vote:
 *   post:
 *     summary: Submit a vote for an item
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - item_id
 *               - vote
 *             properties:
 *               item_id:
 *                 type: string
 *               item_type:
 *                 type: string
 *                 enum: [restaurant, dish, cuisine]
 *               vote:
 *                 type: string
 *                 enum: [like, dislike, skip]
 *               item_data:
 *                 type: object
 *     responses:
 *       201:
 *         description: Vote submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 vote_id:
 *                   type: string
 */
router.post(
  '/:sessionId/vote',
  validate(schemas.vote),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { sessionId } = req.params;
    const { item_id, item_type, vote, item_data } = req.body;

    const session = await db('sessions')
      .where({ id: sessionId })
      .first();

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    if (session.status !== 'active' && session.status !== 'voting') {
      throw new AppError('Session is not accepting votes', 400);
    }

    // Verify user is a member of the group
    const membership = await db('group_members')
      .where({ group_id: session.group_id, user_id: req.user!.id, is_active: true })
      .first();

    if (!membership) {
      throw new AppError('Not authorized to vote in this session', 403);
    }

    // Check if user already voted for this item in current round
    const existingVote = await db('session_votes')
      .where({
        session_id: sessionId,
        user_id: req.user!.id,
        item_id,
        round_number: session.round_number
      })
      .first();

    if (existingVote) {
      throw new AppError('Already voted for this item in current round', 400);
    }

    const voteData = {
      id: randomUUID(),
      session_id: sessionId,
      user_id: req.user!.id,
      item_id,
      item_type: item_type || 'restaurant',
      vote,
      item_data: item_data ? JSON.stringify(item_data) : null,
      round_number: session.round_number,
      voted_at: new Date()
    };

    await db('session_votes').insert(voteData);

    // Update Redis with the vote
    const voteKey = SessionKeys.sessionVotes(sessionId, session.round_number);
    const userVotes = await redis.hget(voteKey, req.user!.id) || '{}';
    const votes = JSON.parse(userVotes);
    votes[item_id] = { vote, item_data, voted_at: new Date().toISOString() };
    await redis.hset(voteKey, req.user!.id, JSON.stringify(votes));
    await redis.expire(voteKey, 3600); // 1 hour TTL

    res.status(201).json({
      message: 'Vote submitted successfully',
      vote_id: voteData.id
    });
  })
);

/**
 * @swagger
 * /api/sessions/{sessionId}/votes:
 *   get:
 *     summary: Get session votes
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: round
 *         schema:
 *           type: integer
 *         description: Round number (defaults to current round)
 *     responses:
 *       200:
 *         description: Session votes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get(
  '/:sessionId/votes',
  validate(schemas.sessionParams),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { sessionId } = req.params;
    const round = req.query.round ? parseInt(req.query.round as string) : undefined;

    const session = await db('sessions')
      .where({ id: sessionId })
      .first();

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    // Verify user is a member of the group
    const membership = await db('group_members')
      .where({ group_id: session.group_id, user_id: req.user!.id, is_active: true })
      .first();

    if (!membership) {
      throw new AppError('Not authorized to view session votes', 403);
    }

    const votes = await db('session_votes')
      .where({ session_id: sessionId })
      .where('round_number', round || session.round_number)
      .orderBy('voted_at', 'desc');

    res.json(votes);
  })
);

/**
 * @swagger
 * /api/sessions/{sessionId}/status:
 *   put:
 *     summary: Update session status
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, voting, completed, cancelled]
 *     responses:
 *       200:
 *         description: Session status updated successfully
 */
router.put(
  '/:sessionId/status',
  validate(schemas.sessionParams),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { sessionId } = req.params;
    const { status } = req.body;

    const session = await db('sessions')
      .where({ id: sessionId })
      .first();

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    // Verify user is admin of the group
    const membership = await db('group_members')
      .where({ group_id: session.group_id, user_id: req.user!.id, is_active: true })
      .first();

    if (!membership || membership.role !== 'admin') {
      throw new AppError('Only group admins can update session status', 403);
    }

    const updateData: any = {
      status,
      updated_at: new Date()
    };

    if (status === 'active' && !session.started_at) {
      updateData.started_at = new Date();
    } else if ((status === 'completed' || status === 'cancelled') && !session.ended_at) {
      updateData.ended_at = new Date();
    }

    await db('sessions')
      .where({ id: sessionId })
      .update(updateData);

    // Update Redis session state
    const sessionState = await redis.get(SessionKeys.session(sessionId));
    if (sessionState) {
      const state = JSON.parse(sessionState);
      state.status = status;
      if (updateData.started_at) state.started_at = updateData.started_at;
      if (updateData.ended_at) state.ended_at = updateData.ended_at;
      await redis.setex(SessionKeys.session(sessionId), 3600, JSON.stringify(state));
    }

    res.json({ message: 'Session status updated successfully' });
  })
);

export default router;