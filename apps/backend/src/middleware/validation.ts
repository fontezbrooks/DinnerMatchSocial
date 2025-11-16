import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });

      req.body = validated.body || req.body;
      req.query = validated.query || req.query;
      req.params = validated.params || req.params;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));

        res.status(400).json({
          error: 'Validation error',
          details: errorMessages
        });
        return;
      }

      console.error('Validation middleware error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Common validation schemas
export const schemas = {
  // Auth schemas
  login: z.object({
    body: z.object({
      email: z.string().email(),
      oauth_provider: z.string().optional(),
      oauth_id: z.string().optional(),
      name: z.string().optional()
    })
  }),

  refreshToken: z.object({
    body: z.object({
      refresh_token: z.string()
    })
  }),

  // User schemas
  updateUser: z.object({
    body: z.object({
      name: z.string().min(1).optional(),
      dietary_restrictions: z.array(z.string()).optional(),
      avatar_url: z.string().url().optional()
    })
  }),

  // Group schemas
  createGroup: z.object({
    body: z.object({
      name: z.string().min(1).max(100),
      description: z.string().max(500).optional(),
      max_members: z.number().int().min(2).max(50).default(10)
    })
  }),

  updateGroup: z.object({
    body: z.object({
      name: z.string().min(1).max(100).optional(),
      description: z.string().max(500).optional(),
      max_members: z.number().int().min(2).max(50).optional()
    }),
    params: z.object({
      groupId: z.string().uuid()
    })
  }),

  joinGroup: z.object({
    body: z.object({
      invite_code: z.string().min(6)
    })
  }),

  groupParams: z.object({
    params: z.object({
      groupId: z.string().uuid()
    })
  }),

  // Session schemas
  createSession: z.object({
    body: z.object({
      group_id: z.string().uuid(),
      energy_level: z.enum(['low', 'medium', 'high']).default('medium'),
      session_config: z.object({}).optional()
    })
  }),

  sessionParams: z.object({
    params: z.object({
      sessionId: z.string().uuid()
    })
  }),

  vote: z.object({
    body: z.object({
      item_id: z.string(),
      item_type: z.enum(['restaurant', 'dish', 'cuisine']).default('restaurant'),
      vote: z.enum(['like', 'dislike', 'skip']),
      item_data: z.object({}).optional()
    }),
    params: z.object({
      sessionId: z.string().uuid()
    })
  })
};