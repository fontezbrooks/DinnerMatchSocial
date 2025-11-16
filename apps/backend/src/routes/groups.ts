import { Router } from 'express';
import { randomUUID } from 'crypto';
import { db } from '../config/database';
import { AppError, asyncHandler } from '../middleware/error';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Helper function to generate invite code
const generateInviteCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         created_by:
 *           type: string
 *           format: uuid
 *         max_members:
 *           type: integer
 *         invite_code:
 *           type: string
 *         member_count:
 *           type: integer
 *         user_role:
 *           type: string
 *           enum: [admin, member]
 *         created_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               max_members:
 *                 type: integer
 *                 minimum: 2
 *                 maximum: 50
 *     responses:
 *       201:
 *         description: Group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       400:
 *         description: Validation error
 */
router.post(
  '/',
  validate(schemas.createGroup),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { name, description, max_members } = req.body;

    const groupData = {
      id: randomUUID(),
      name,
      description,
      created_by: req.user!.id,
      max_members: max_members || 10,
      invite_code: generateInviteCode(),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Create group and add creator as admin in a transaction
    await db.transaction(async (trx) => {
      await trx('groups').insert(groupData);

      await trx('group_members').insert({
        id: randomUUID(),
        group_id: groupData.id,
        user_id: req.user!.id,
        role: 'admin',
        is_active: true,
        joined_at: new Date()
      });
    });

    res.status(201).json({
      ...groupData,
      member_count: 1,
      user_role: 'admin'
    });
  })
);

/**
 * @swagger
 * /api/groups/join:
 *   post:
 *     summary: Join a group using invite code
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - invite_code
 *             properties:
 *               invite_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Joined group successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       400:
 *         description: Invalid invite code or already member
 *       404:
 *         description: Group not found
 */
router.post(
  '/join',
  validate(schemas.joinGroup),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { invite_code } = req.body;

    const group = await db('groups')
      .where({ invite_code, is_active: true })
      .first();

    if (!group) {
      throw new AppError('Invalid invite code', 400);
    }

    // Check if user is already a member
    const existingMember = await db('group_members')
      .where({ group_id: group.id, user_id: req.user!.id, is_active: true })
      .first();

    if (existingMember) {
      throw new AppError('Already a member of this group', 400);
    }

    // Check if group is full
    const memberCount = await db('group_members')
      .where({ group_id: group.id, is_active: true })
      .count('id as count')
      .first();

    if (parseInt(memberCount!.count as string) >= group.max_members) {
      throw new AppError('Group is full', 400);
    }

    // Add user to group
    await db('group_members').insert({
      id: randomUUID(),
      group_id: group.id,
      user_id: req.user!.id,
      role: 'member',
      is_active: true,
      joined_at: new Date()
    });

    const newMemberCount = await db('group_members')
      .where({ group_id: group.id, is_active: true })
      .count('id as count')
      .first();

    res.json({
      ...group,
      member_count: parseInt(newMemberCount!.count as string),
      user_role: 'member'
    });
  })
);

/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: Get user's groups
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Groups retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Group'
 */
router.get(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const groups = await db('groups')
      .select(
        'groups.*',
        db.raw('COUNT(group_members.id) as member_count'),
        'gm.role as user_role'
      )
      .join('group_members as gm', function() {
        this.on('groups.id', '=', 'gm.group_id')
          .andOn('gm.user_id', '=', db.raw('?', [req.user!.id]))
          .andOn('gm.is_active', '=', db.raw('?', [true]));
      })
      .leftJoin('group_members', function() {
        this.on('groups.id', '=', 'group_members.group_id')
          .andOn('group_members.is_active', '=', db.raw('?', [true]));
      })
      .where('groups.is_active', true)
      .groupBy('groups.id', 'gm.role')
      .orderBy('groups.created_at', 'desc');

    res.json(groups);
  })
);

/**
 * @swagger
 * /api/groups/{groupId}:
 *   get:
 *     summary: Get group details
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Group details retrieved successfully
 *       403:
 *         description: Not a member of this group
 *       404:
 *         description: Group not found
 */
router.get(
  '/:groupId',
  validate(schemas.groupParams),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { groupId } = req.params;

    // Check if user is a member
    const membership = await db('group_members')
      .where({ group_id: groupId, user_id: req.user!.id, is_active: true })
      .first();

    if (!membership) {
      throw new AppError('Not a member of this group', 403);
    }

    const group = await db('groups')
      .select(
        'groups.*',
        db.raw('COUNT(group_members.id) as member_count')
      )
      .leftJoin('group_members', function() {
        this.on('groups.id', '=', 'group_members.group_id')
          .andOn('group_members.is_active', '=', db.raw('?', [true]));
      })
      .where('groups.id', groupId)
      .where('groups.is_active', true)
      .groupBy('groups.id')
      .first();

    if (!group) {
      throw new AppError('Group not found', 404);
    }

    res.json({
      ...group,
      user_role: membership.role
    });
  })
);

/**
 * @swagger
 * /api/groups/{groupId}/leave:
 *   post:
 *     summary: Leave a group
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Left group successfully
 *       403:
 *         description: Not a member of this group
 *       400:
 *         description: Cannot leave group as the only admin
 */
router.post(
  '/:groupId/leave',
  validate(schemas.groupParams),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { groupId } = req.params;

    const membership = await db('group_members')
      .where({ group_id: groupId, user_id: req.user!.id, is_active: true })
      .first();

    if (!membership) {
      throw new AppError('Not a member of this group', 403);
    }

    // If user is admin, check if there are other admins
    if (membership.role === 'admin') {
      const adminCount = await db('group_members')
        .where({ group_id: groupId, role: 'admin', is_active: true })
        .count('id as count')
        .first();

      if (parseInt(adminCount!.count as string) <= 1) {
        throw new AppError('Cannot leave group as the only admin', 400);
      }
    }

    await db('group_members')
      .where({ group_id: groupId, user_id: req.user!.id })
      .update({
        is_active: false,
        left_at: new Date()
      });

    res.json({ message: 'Left group successfully' });
  })
);

export default router;