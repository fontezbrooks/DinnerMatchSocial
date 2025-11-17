import { Socket } from 'socket.io';

export interface SessionUser {
  userId: string;
  socketId: string;
  username: string;
  isHost: boolean;
  joinedAt: Date;
}

export interface SessionRoom {
  sessionId: string;
  groupId: string;
  users: Map<string, SessionUser>;
  status: 'pending' | 'active' | 'voting' | 'completed' | 'cancelled';
  currentRound: number;
  timerEndTime?: Date;
  timerDuration?: number;
  currentItem?: RestaurantItem;
  votedUsers: Set<string>;
  settings: SessionSettings;
}

export interface RestaurantItem {
  id: string;
  name: string;
  imageUrl?: string;
  rating?: number;
  priceLevel?: string;
  cuisine?: string;
  address?: string;
  phone?: string;
  url?: string;
  categories?: string[];
}

export interface SessionSettings {
  maxRounds: number;
  timePerRound: number; // seconds
  energyLevel: 'low' | 'medium' | 'high';
  requireAllVotes: boolean;
}

export interface SwipeEvent {
  sessionId: string;
  userId: string;
  itemId: string;
  vote: 'like' | 'dislike' | 'skip';
  itemData: RestaurantItem;
  timestamp: Date;
}

export interface TimerState {
  sessionId: string;
  timeRemaining: number;
  isActive: boolean;
  endTime: Date;
}

export interface MatchResult {
  sessionId: string;
  item: RestaurantItem;
  matchedUsers: string[];
  round: number;
  timestamp: Date;
}

export interface SessionState {
  sessionId: string;
  groupId: string;
  status: SessionRoom['status'];
  users: Array<{
    userId: string;
    username: string;
    isHost: boolean;
    hasVoted: boolean;
  }>;
  currentRound: number;
  timer: TimerState | null;
  currentItem: RestaurantItem | null;
  settings: SessionSettings;
  lastActivity: Date;
}

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

// Client-to-Server Events
export interface ClientToServerEvents {
  // Session Management
  join_session: (data: { sessionId: string; token: string }) => void;
  leave_session: (data: { sessionId: string }) => void;
  start_session: (data: { sessionId: string }) => void;

  // Voting
  swipe_vote: (data: SwipeEvent) => void;
  skip_item: (data: { sessionId: string; itemId: string }) => void;

  // Timer
  extend_timer: (data: { sessionId: string; additionalSeconds: number }) => void;

  // Host Controls
  next_round: (data: { sessionId: string }) => void;
  end_session: (data: { sessionId: string }) => void;

  // Heartbeat
  ping: () => void;
}

// Server-to-Client Events
export interface ServerToClientEvents {
  // Session State Updates
  session_state: (data: SessionState) => void;
  user_joined: (data: { user: SessionUser; totalUsers: number }) => void;
  user_left: (data: { userId: string; username: string; totalUsers: number }) => void;

  // Voting Updates
  vote_received: (data: { userId: string; username: string; vote: string; totalVotes: number; requiredVotes: number }) => void;
  round_complete: (data: { matches: MatchResult[]; nextRound?: number }) => void;
  new_item: (data: { item: RestaurantItem; round: number }) => void;

  // Timer Updates
  timer_start: (data: TimerState) => void;
  timer_update: (data: { timeRemaining: number }) => void;
  timer_warning: (data: { timeRemaining: number; level: 'low' | 'critical' }) => void;
  timer_end: (data: { sessionId: string; autoAdvance: boolean }) => void;

  // Session Control
  session_started: (data: { sessionId: string; startTime: Date }) => void;
  session_ended: (data: { sessionId: string; endTime: Date; finalMatches: MatchResult[] }) => void;
  host_changed: (data: { newHostId: string; newHostUsername: string }) => void;

  // Error Events
  error: (data: { message: string; code: string; details?: any }) => void;

  // Heartbeat
  pong: () => void;
}

// Inter-Server Events (for scaling)
export interface InterServerEvents {
  session_update: (data: SessionState) => void;
  user_disconnected: (data: { userId: string; sessionId: string }) => void;
}

export interface SocketData {
  userId: string;
  username: string;
  sessionId?: string;
}