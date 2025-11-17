import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import { SessionManager } from './sessionManager';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  AuthenticatedSocket
} from './types';

export class DinnerMatchSocketServer {
  private io: SocketServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;
  private redis: Redis;
  private pubRedis: Redis;
  private subRedis: Redis;
  private sessionManager: SessionManager;

  constructor(httpServer: HttpServer) {
    // Initialize Redis connections
    this.redis = new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    });

    this.pubRedis = new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD
    });

    this.subRedis = new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD
    });

    // Initialize Socket.io server
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: [env.FRONTEND_URL, 'http://localhost:19006'],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    // Set up Redis adapter for scaling
    this.io.adapter(createAdapter(this.pubRedis, this.subRedis));

    // Initialize session manager
    this.sessionManager = new SessionManager(this.redis);

    this.setupEventHandlers();
    this.setupMiddleware();
  }

  private setupMiddleware(): void {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          throw new Error('No token provided');
        }

        // Verify JWT token
        const decoded = jwt.verify(token, env.JWT_SECRET) as any;
        socket.userId = decoded.userId;
        socket.username = decoded.username || decoded.email;

        console.log(`🔌 User authenticated: ${socket.username} (${socket.userId})`);
        next();
      } catch (error) {
        console.error('❌ Socket authentication failed:', error);
        next(new Error('Authentication failed'));
      }
    });

    // Connection logging
    this.io.use((socket, next) => {
      console.log(`🔌 New socket connection: ${socket.id}`);
      next();
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      this.handleConnection(socket);
    });

    // Session manager event handlers
    this.sessionManager.on('session_state_changed', (sessionState) => {
      this.io.to(`session:${sessionState.sessionId}`).emit('session_state', sessionState);
    });

    this.sessionManager.on('timer_tick', ({ sessionId, timeRemaining }) => {
      this.io.to(`session:${sessionId}`).emit('timer_update', { timeRemaining });
    });

    this.sessionManager.on('timer_warning', ({ sessionId, timeRemaining, level }) => {
      this.io.to(`session:${sessionId}`).emit('timer_warning', { timeRemaining, level });
    });

    this.sessionManager.on('timer_expired', ({ sessionId }) => {
      this.io.to(`session:${sessionId}`).emit('timer_end', { sessionId, autoAdvance: true });
    });

    this.sessionManager.on('remote_vote', (data) => {
      // Handle vote from another server instance
      this.io.to(`session:${data.sessionId}`).emit('vote_received', {
        userId: data.userId,
        username: data.username || 'User',
        vote: data.vote,
        totalVotes: 0, // This should be calculated
        requiredVotes: 0 // This should be calculated
      });
    });
  }

  private handleConnection(socket: AuthenticatedSocket): void {
    const { userId, username } = socket;
    if (!userId || !username) return;

    console.log(`👤 User connected: ${username} (${userId})`);

    // Handle session joining
    socket.on('join_session', async (data) => {
      try {
        const { sessionId } = data;

        // Verify user has access to this session
        // This should check database permissions
        const hasAccess = await this.verifySessionAccess(userId!, sessionId);
        if (!hasAccess) {
          socket.emit('error', {
            message: 'Access denied to session',
            code: 'ACCESS_DENIED'
          });
          return;
        }

        // Create or join session
        const session = await this.sessionManager.createOrJoinSession(
          sessionId,
          userId!,
          username!,
          'group-id', // This should come from database
          false // isHost should be determined from database
        );

        // Update user socket ID
        await this.sessionManager.updateUserSocket(userId!, socket.id);

        // Join socket room
        await socket.join(`session:${sessionId}`);

        console.log(`🏠 User ${username} joined session ${sessionId}`);

        // Send current session state
        const sessionState = await this.sessionManager.getSessionState(sessionId);
        if (sessionState) {
          socket.emit('session_state', sessionState);
        }

        // Notify other users
        socket.to(`session:${sessionId}`).emit('user_joined', {
          user: {
            userId: userId!,
            socketId: socket.id,
            username: username!,
            isHost: false, // Determine from session
            joinedAt: new Date()
          },
          totalUsers: session.users.size
        });

      } catch (error) {
        console.error('❌ Error joining session:', error);
        socket.emit('error', {
          message: 'Failed to join session',
          code: 'JOIN_FAILED',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Handle session leaving
    socket.on('leave_session', async (data) => {
      try {
        const { sessionId } = data;

        await socket.leave(`session:${sessionId}`);
        const session = await this.sessionManager.removeUserFromSession(userId!);

        if (session) {
          socket.to(`session:${sessionId}`).emit('user_left', {
            userId: userId!,
            username: username!,
            totalUsers: session.users.size
          });
        }

        console.log(`🚪 User ${username} left session ${sessionId}`);
      } catch (error) {
        console.error('❌ Error leaving session:', error);
      }
    });

    // Handle session start (host only)
    socket.on('start_session', async (data) => {
      try {
        const { sessionId } = data;
        const session = await this.sessionManager.startSession(sessionId, userId!);

        this.io.to(`session:${sessionId}`).emit('session_started', {
          sessionId,
          startTime: new Date()
        });

        console.log(`🚀 Session ${sessionId} started by ${username}`);
      } catch (error) {
        console.error('❌ Error starting session:', error);
        socket.emit('error', {
          message: 'Failed to start session',
          code: 'START_FAILED',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Handle swipe voting
    socket.on('swipe_vote', async (swipeEvent) => {
      try {
        // Validate the vote
        if (swipeEvent.userId !== userId) {
          socket.emit('error', {
            message: 'Invalid user ID in vote',
            code: 'INVALID_VOTE'
          });
          return;
        }

        const result = await this.sessionManager.handleSwipeVote({
          ...swipeEvent,
          timestamp: new Date()
        });

        const { session, isRoundComplete, matches } = result;

        // Notify all session participants about the vote
        this.io.to(`session:${swipeEvent.sessionId}`).emit('vote_received', {
          userId: userId!,
          username: username!,
          vote: swipeEvent.vote,
          totalVotes: session.votedUsers.size,
          requiredVotes: session.settings.requireAllVotes ?
            session.users.size :
            Math.ceil(session.users.size / 2)
        });

        if (isRoundComplete) {
          this.io.to(`session:${swipeEvent.sessionId}`).emit('round_complete', {
            matches,
            nextRound: matches.length === 0 && session.currentRound < session.settings.maxRounds ?
              session.currentRound + 1 :
              undefined
          });

          if (session.status === 'completed') {
            this.io.to(`session:${swipeEvent.sessionId}`).emit('session_ended', {
              sessionId: swipeEvent.sessionId,
              endTime: new Date(),
              finalMatches: matches
            });
          }
        }

        console.log(`🗳️  Vote received: ${username} voted ${swipeEvent.vote} for ${swipeEvent.itemId}`);
      } catch (error) {
        console.error('❌ Error processing vote:', error);
        socket.emit('error', {
          message: 'Failed to process vote',
          code: 'VOTE_FAILED',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Handle skip item
    socket.on('skip_item', async (data) => {
      try {
        const { sessionId, itemId } = data;

        // Create a skip vote
        await socket.emit('swipe_vote', {
          sessionId,
          userId: userId!,
          itemId,
          vote: 'skip' as const,
          itemData: { id: itemId, name: 'Skipped Item' },
          timestamp: new Date()
        });
      } catch (error) {
        console.error('❌ Error skipping item:', error);
      }
    });

    // Handle timer extension (host only)
    socket.on('extend_timer', async (data) => {
      try {
        const { sessionId, additionalSeconds } = data;

        // Verify host permissions
        const session = this.sessionManager.getSession(sessionId);
        const user = session?.users.get(userId!);

        if (!user?.isHost) {
          socket.emit('error', {
            message: 'Only host can extend timer',
            code: 'PERMISSION_DENIED'
          });
          return;
        }

        // This would extend the current timer
        // Implementation depends on your timer logic
        console.log(`⏰ Timer extended by ${additionalSeconds}s for session ${sessionId}`);
      } catch (error) {
        console.error('❌ Error extending timer:', error);
      }
    });

    // Handle next round (host only)
    socket.on('next_round', async (data) => {
      try {
        const { sessionId } = data;

        // Verify host permissions and advance to next round
        const session = this.sessionManager.getSession(sessionId);
        const user = session?.users.get(userId!);

        if (!user?.isHost) {
          socket.emit('error', {
            message: 'Only host can advance rounds',
            code: 'PERMISSION_DENIED'
          });
          return;
        }

        // Force advance to next round
        // Implementation would depend on your session logic
        console.log(`⏭️  Next round triggered for session ${sessionId}`);
      } catch (error) {
        console.error('❌ Error advancing round:', error);
      }
    });

    // Handle session end (host only)
    socket.on('end_session', async (data) => {
      try {
        const { sessionId } = data;

        const session = this.sessionManager.getSession(sessionId);
        const user = session?.users.get(userId!);

        if (!user?.isHost) {
          socket.emit('error', {
            message: 'Only host can end session',
            code: 'PERMISSION_DENIED'
          });
          return;
        }

        // End the session
        if (session) {
          session.status = 'cancelled';
          this.io.to(`session:${sessionId}`).emit('session_ended', {
            sessionId,
            endTime: new Date(),
            finalMatches: []
          });
        }

        console.log(`🛑 Session ${sessionId} ended by host ${username}`);
      } catch (error) {
        console.error('❌ Error ending session:', error);
      }
    });

    // Handle heartbeat
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // Handle disconnect
    socket.on('disconnect', async (reason) => {
      console.log(`👋 User ${username} disconnected: ${reason}`);

      try {
        const session = await this.sessionManager.removeUserFromSession(userId!);
        if (session) {
          socket.to(`session:${session.sessionId}`).emit('user_left', {
            userId: userId!,
            username: username!,
            totalUsers: session.users.size
          });
        }
      } catch (error) {
        console.error('❌ Error handling disconnect:', error);
      }
    });
  }

  private async verifySessionAccess(userId: string, sessionId: string): Promise<boolean> {
    // This should check if the user has access to the session
    // For now, return true - implement based on your authorization logic
    console.log(`🔐 Verifying session access for user ${userId} to session ${sessionId}`);
    return true;
  }

  async shutdown(): Promise<void> {
    console.log('📴 Shutting down Socket.io server...');

    await this.sessionManager.cleanup();

    this.io.close();
    this.redis.disconnect();
    this.pubRedis.disconnect();
    this.subRedis.disconnect();

    console.log('✅ Socket.io server shutdown complete');
  }

  getIO() {
    return this.io;
  }

  getSessionManager() {
    return this.sessionManager;
  }
}