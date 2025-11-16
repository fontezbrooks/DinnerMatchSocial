import { Router } from 'express';
import { randomUUID } from 'crypto';
import { db } from '../config/database';
import { AppError, asyncHandler } from '../middleware/error';
import { validate, schemas } from '../middleware/validation';
import { authLimiter } from '../middleware/rateLimiter';
import { generateTokens, verifyRefreshToken } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         oauth_provider:
 *           type: string
 *           example: google
 *         oauth_id:
 *           type: string
 *         name:
 *           type: string
 *     AuthResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *         access_token:
 *           type: string
 *         refresh_token:
 *           type: string
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         name:
 *           type: string
 *         avatar_url:
 *           type: string
 *         dietary_restrictions:
 *           type: array
 *           items:
 *             type: string
 *         created_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login or register a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post(
  '/login',
  authLimiter,
  validate(schemas.login),
  asyncHandler(async (req, res) => {
    const { email, oauth_provider, oauth_id, name } = req.body;

    // Check if user exists
    let user = await db('users')
      .where({ email, is_active: true })
      .first();

    if (!user) {
      // Create new user
      if (!name) {
        throw new AppError('Name is required for new users', 400);
      }

      const userData = {
        id: randomUUID(),
        email,
        name,
        oauth_provider,
        oauth_id,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      await db('users').insert(userData);
      user = userData;
    } else {
      // Update OAuth info if provided
      if (oauth_provider && oauth_id) {
        await db('users')
          .where({ id: user.id })
          .update({
            oauth_provider,
            oauth_id,
            updated_at: new Date()
          });

        user.oauth_provider = oauth_provider;
        user.oauth_id = oauth_id;
      }
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({
      id: user.id,
      email: user.email,
      name: user.name
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        dietary_restrictions: user.dietary_restrictions,
        created_at: user.created_at
      },
      access_token: accessToken,
      refresh_token: refreshToken
    });
  })
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post(
  '/refresh',
  validate(schemas.refreshToken),
  asyncHandler(async (req, res) => {
    const { refresh_token } = req.body;

    try {
      const decoded = verifyRefreshToken(refresh_token);

      // Verify user still exists and is active
      const user = await db('users')
        .where({ id: decoded.id, is_active: true })
        .first();

      if (!user) {
        throw new AppError('User not found or inactive', 401);
      }

      // Generate new tokens
      const { accessToken, refreshToken } = generateTokens({
        id: user.id,
        email: user.email,
        name: user.name
      });

      res.json({
        access_token: accessToken,
        refresh_token: refreshToken
      });
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 401);
    }
  })
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user (placeholder for token blacklisting)
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post('/logout', (req, res) => {
  // TODO: Implement token blacklisting in Redis if needed
  res.json({ message: 'Logout successful' });
});

export default router;