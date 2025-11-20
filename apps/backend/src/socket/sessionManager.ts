import { EventEmitter } from "events";
import Redis from "ioredis";
import {
  SessionRoom,
  SessionUser,
  SwipeEvent,
  MatchResult,
  SessionState,
  TimerState,
  RestaurantItem,
  SessionSettings,
} from "./types";
import { MatchDetectionService } from "./matchDetection";

export class SessionManager extends EventEmitter {
  private sessions: Map<string, SessionRoom> = new Map();
  private userSessions: Map<string, string> = new Map(); // userId -> sessionId
  private redis: Redis;
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private matchDetection: MatchDetectionService;

  constructor(redis: Redis) {
    super();
    this.redis = redis;
    this.matchDetection = new MatchDetectionService();
    this.setupRedisListeners();
  }

  private setupRedisListeners() {
    // Subscribe to session events from other instances
    this.redis.subscribe("session:update", "session:timer", "session:vote");

    this.redis.on("message", (channel, message) => {
      try {
        const data = JSON.parse(message);
        this.handleRedisMessage(channel, data);
      } catch (error) {
        console.error("Error parsing Redis message:", error);
      }
    });
  }

  private handleRedisMessage(channel: string, data: any) {
    switch (channel) {
      case "session:update":
        this.emit("session_state_changed", data);
        break;
      case "session:timer":
        this.handleRemoteTimer(data);
        break;
      case "session:vote":
        this.emit("remote_vote", data);
        break;
    }
  }

  async createOrJoinSession(
    sessionId: string,
    userId: string,
    username: string,
    groupId: string,
    isHost: boolean = false
  ): Promise<SessionRoom> {
    // Check if user is already in another session
    const existingSessionId = this.userSessions.get(userId);
    if (existingSessionId && existingSessionId !== sessionId) {
      throw new Error("User already in another session");
    }

    let session = this.sessions.get(sessionId);

    if (!session) {
      // Create new session
      session = {
        sessionId,
        groupId,
        users: new Map(),
        status: "pending",
        currentRound: 1,
        votedUsers: new Set(),
        settings: {
          maxRounds: 5,
          timePerRound: 30,
          energyLevel: "medium",
          requireAllVotes: true,
        },
      };
      this.sessions.set(sessionId, session);
    }

    // Add user to session
    const user: SessionUser = {
      userId,
      socketId: "",
      username,
      isHost: session.users.size === 0 || isHost,
      joinedAt: new Date(),
    };

    session.users.set(userId, user);
    this.userSessions.set(userId, sessionId);

    // Persist session state to Redis
    await this.persistSessionState(session);

    return session;
  }

  async updateUserSocket(userId: string, socketId: string): Promise<void> {
    const sessionId = this.userSessions.get(userId);
    if (!sessionId) return;

    const session = this.sessions.get(sessionId);
    if (!session) return;

    const user = session.users.get(userId);
    if (user) {
      user.socketId = socketId;
      await this.persistSessionState(session);
    }
  }

  async removeUserFromSession(userId: string): Promise<SessionRoom | null> {
    const sessionId = this.userSessions.get(userId);
    if (!sessionId) return null;

    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const removedUser = session.users.get(userId);
    session.users.delete(userId);
    this.userSessions.delete(userId);

    // If this was the host, reassign host to another user
    if (removedUser?.isHost && session.users.size > 0) {
      const newHost = Array.from(session.users.values())[0];
      newHost.isHost = true;
    }

    // If session is empty, clean it up
    if (session.users.size === 0) {
      this.sessions.delete(sessionId);
      this.clearTimer(sessionId);
      await this.redis.del(`session:${sessionId}`);
    } else {
      await this.persistSessionState(session);
    }

    return session;
  }

  async handleSwipeVote(swipeEvent: SwipeEvent): Promise<{
    session: SessionRoom;
    isRoundComplete: boolean;
    matches: MatchResult[];
  }> {
    const session = this.sessions.get(swipeEvent.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    if (session.status !== "voting") {
      throw new Error("Session is not in voting state");
    }

    // Record the vote in database
    await this.recordVote(swipeEvent);

    // Add user to voted set
    session.votedUsers.add(swipeEvent.userId);

    // Check if all users have voted
    const requiredVotes = session.settings.requireAllVotes
      ? session.users.size
      : Math.ceil(session.users.size / 2);

    const isRoundComplete = session.votedUsers.size >= requiredVotes;
    let matches: MatchResult[] = [];

    if (isRoundComplete) {
      // Calculate matches for this round
      matches = await this.calculateMatches(
        swipeEvent.sessionId,
        session.currentRound
      );

      if (matches.length > 0) {
        // Found matches, session is complete
        session.status = "completed";
        this.clearTimer(swipeEvent.sessionId);
      } else if (session.currentRound >= session.settings.maxRounds) {
        // No more rounds, session complete without matches
        session.status = "completed";
        this.clearTimer(swipeEvent.sessionId);
      } else {
        // Move to next round
        session.currentRound++;
        session.votedUsers.clear();
        session.currentItem = undefined;
      }
    }

    await this.persistSessionState(session);

    // Publish vote event to Redis for other instances
    await this.redis.publish(
      "session:vote",
      JSON.stringify({
        sessionId: swipeEvent.sessionId,
        userId: swipeEvent.userId,
        vote: swipeEvent.vote,
        isRoundComplete,
        matches,
      })
    );

    return { session, isRoundComplete, matches };
  }

  async startSession(
    sessionId: string,
    hostUserId: string
  ): Promise<SessionRoom> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const host = session.users.get(hostUserId);
    if (!host?.isHost) {
      throw new Error("Only host can start session");
    }

    if (session.users.size < 2) {
      throw new Error("Need at least 2 users to start session");
    }

    session.status = "active";
    await this.persistSessionState(session);

    return session;
  }

  async startVotingRound(
    sessionId: string,
    item: RestaurantItem,
    timeLimit?: number
  ): Promise<SessionRoom> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    session.status = "voting";
    session.currentItem = item;
    session.votedUsers.clear();

    // Start timer
    const duration = timeLimit || session.settings.timePerRound;
    await this.startTimer(sessionId, duration);

    await this.persistSessionState(session);

    return session;
  }

  async startTimer(sessionId: string, seconds: number): Promise<TimerState> {
    // Clear existing timer
    this.clearTimer(sessionId);

    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const endTime = new Date(Date.now() + seconds * 1000);
    session.timerEndTime = endTime;
    session.timerDuration = seconds;

    const timerState: TimerState = {
      sessionId,
      timeRemaining: seconds,
      isActive: true,
      endTime,
    };

    // Publish timer start to Redis
    await this.redis.publish(
      "session:timer",
      JSON.stringify({
        action: "start",
        sessionId,
        endTime: endTime.toISOString(),
        duration: seconds,
      })
    );

    // Set up countdown
    const timer = setInterval(async () => {
      const remaining = Math.max(
        0,
        Math.floor((endTime.getTime() - Date.now()) / 1000)
      );

      if (remaining <= 0) {
        // Timer expired
        this.clearTimer(sessionId);
        this.emit("timer_expired", { sessionId });

        // Auto-advance if configured
        await this.handleTimerExpiration(sessionId);
      } else {
        // Emit timer updates
        this.emit("timer_tick", { sessionId, timeRemaining: remaining });

        // Send warnings
        if (remaining === 30 || remaining === 10) {
          this.emit("timer_warning", {
            sessionId,
            timeRemaining: remaining,
            level: remaining === 10 ? "critical" : "low",
          });
        }
      }
    }, 1000);

    this.timers.set(sessionId, timer);
    return timerState;
  }

  private clearTimer(sessionId: string): void {
    const timer = this.timers.get(sessionId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(sessionId);
    }
  }

  private async handleTimerExpiration(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Force advance to next round or complete session
    if (session.status === "voting") {
      const matches = await this.calculateMatches(
        sessionId,
        session.currentRound
      );

      if (
        matches.length > 0 ||
        session.currentRound >= session.settings.maxRounds
      ) {
        session.status = "completed";
      } else {
        // Next round
        session.currentRound++;
        session.votedUsers.clear();
        session.currentItem = undefined;
        session.status = "active";
      }

      await this.persistSessionState(session);
    }
  }

  private async handleRemoteTimer(data: any): Promise<void> {
    if (data.action === "start") {
      // Sync timer from another instance
      const endTime = new Date(data.endTime);
      const remaining = Math.max(
        0,
        Math.floor((endTime.getTime() - Date.now()) / 1000)
      );

      if (remaining > 0) {
        await this.startTimer(data.sessionId, remaining);
      }
    }
  }

  private async recordVote(swipeEvent: SwipeEvent): Promise<void> {
    try {
      await this.matchDetection.recordVote(
        swipeEvent.sessionId,
        swipeEvent.userId,
        swipeEvent.itemId,
        swipeEvent.vote,
        swipeEvent.itemData,
        this.getSession(swipeEvent.sessionId)?.currentRound || 1
      );
    } catch (error) {
      console.error("❌ Error recording vote:", error);
      throw error;
    }
  }

  private async calculateMatches(
    sessionId: string,
    round: number
  ): Promise<MatchResult[]> {
    try {
      const session = this.getSession(sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      const requireAllUsers = session.settings.requireAllVotes;
      return await this.matchDetection.calculateMatches(
        sessionId,
        round,
        requireAllUsers
      );
    } catch (error) {
      console.error("❌ Error calculating matches:", error);
      throw error;
    }
  }

  async getSessionState(sessionId: string): Promise<SessionState | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const users = Array.from(session.users.values()).map((user) => ({
      userId: user.userId,
      username: user.username,
      isHost: user.isHost,
      hasVoted: session.votedUsers.has(user.userId),
    }));

    let timer: TimerState | null = null;
    if (session.timerEndTime) {
      const timeRemaining = Math.max(
        0,
        Math.floor((session.timerEndTime.getTime() - Date.now()) / 1000)
      );
      timer = {
        sessionId,
        timeRemaining,
        isActive: timeRemaining > 0,
        endTime: session.timerEndTime,
      };
    }

    return {
      sessionId: session.sessionId,
      groupId: session.groupId,
      status: session.status,
      users,
      currentRound: session.currentRound,
      timer,
      currentItem: session.currentItem || null,
      settings: session.settings,
      lastActivity: new Date(),
    };
  }

  getSession(sessionId: string): SessionRoom | undefined {
    return this.sessions.get(sessionId);
  }

  getUserSession(userId: string): SessionRoom | undefined {
    const sessionId = this.userSessions.get(userId);
    return sessionId ? this.sessions.get(sessionId) : undefined;
  }

  async getVotingProgress(sessionId: string, roundNumber: number) {
    return await this.matchDetection.getVotingProgress(sessionId, roundNumber);
  }

  async getSessionMatches(sessionId: string): Promise<MatchResult[]> {
    return await this.matchDetection.getSessionMatches(sessionId);
  }

  async hasUserVoted(
    sessionId: string,
    userId: string,
    itemId: string,
    roundNumber: number
  ): Promise<boolean> {
    return await this.matchDetection.hasUserVoted(
      sessionId,
      userId,
      itemId,
      roundNumber
    );
  }

  private async persistSessionState(session: SessionRoom): Promise<void> {
    const sessionState = await this.getSessionState(session.sessionId);
    if (sessionState) {
      await this.redis.setex(
        `session:${session.sessionId}`,
        3600, // 1 hour TTL
        JSON.stringify(sessionState)
      );
    }
  }

  async cleanup(): Promise<void> {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearInterval(timer);
    }
    this.timers.clear();

    // Close Redis connection
    this.redis.disconnect();
  }
}
