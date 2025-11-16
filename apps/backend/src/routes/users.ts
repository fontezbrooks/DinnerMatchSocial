import { Router } from 'express';
import { db } from '../config/database';
import { AppError, asyncHandler } from '../middleware/error';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/me',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const user = await db('users')
      .where({ id: req.user!.id, is_active: true })
      .first();

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      dietary_restrictions: user.dietary_restrictions,
      created_at: user.created_at
    });
  })
);

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               dietary_restrictions:
 *                 type: array
 *                 items:
 *                   type: string
 *               avatar_url:
 *                 type: string
 *                 format: url
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/me',
  validate(schemas.updateUser),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { name, dietary_restrictions, avatar_url } = req.body;

    const updateData: any = {
      updated_at: new Date()
    };

    if (name !== undefined) updateData.name = name;
    if (dietary_restrictions !== undefined) updateData.dietary_restrictions = JSON.stringify(dietary_restrictions);
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    await db('users')
      .where({ id: req.user!.id })
      .update(updateData);

    const updatedUser = await db('users')
      .where({ id: req.user!.id })
      .first();

    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      avatar_url: updatedUser.avatar_url,
      dietary_restrictions: updatedUser.dietary_restrictions,
      created_at: updatedUser.created_at
    });
  })
);

/**
 * @swagger
 * /api/users/me:
 *   delete:
 *     summary: Deactivate current user account
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Account deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
router.delete(
  '/me',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    // Soft delete by setting is_active to false
    await db('users')
      .where({ id: req.user!.id })
      .update({
        is_active: false,
        updated_at: new Date()
      });

    res.json({ message: 'Account deactivated successfully' });
  })
);

export default router;