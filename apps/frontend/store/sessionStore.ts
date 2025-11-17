import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Types matching backend
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

export interface SessionUser {
  userId: string;
  username: string;
  isHost: boolean;
  hasVoted: boolean;
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

export interface SessionSettings {
  maxRounds: number;
  timePerRound: number;
  energyLevel: 'low' | 'medium' | 'high';
  requireAllVotes: boolean;
}

export type SessionStatus = 'pending' | 'active' | 'voting' | 'completed' | 'cancelled';

export interface SessionState {
  sessionId: string;
  groupId: string;
  status: SessionStatus;
  users: SessionUser[];
  currentRound: number;
  timer: TimerState | null;
  currentItem: RestaurantItem | null;
  settings: SessionSettings;
  lastActivity: Date;
}

export interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

interface SessionStore {
  // Connection State
  socket: Socket | null;
  connection: ConnectionState;

  // Session State
  session: SessionState | null;
  currentUser: { userId: string; username: string } | null;

  // UI State
  swipedItems: RestaurantItem[];
  isSwipeEnabled: boolean;
  showTimer: boolean;

  // Recent Activity
  recentVotes: Array<{
    userId: string;
    username: string;
    vote: 'like' | 'dislike' | 'skip';
    timestamp: Date;
  }>;

  matches: MatchResult[];
  finalMatches: MatchResult[];

  // Actions
  connect: (token: string) => Promise<void>;
  disconnect: () => void;
  joinSession: (sessionId: string) => Promise<void>;
  leaveSession: () => void;
  startSession: () => Promise<void>;
  swipeVote: (direction: 'like' | 'dislike' | 'skip', item: RestaurantItem) => void;
  skipItem: (itemId: string) => void;
  extendTimer: (additionalSeconds: number) => void;
  nextRound: () => void;
  endSession: () => void;

  // Internal
  setSession: (session: SessionState) => void;
  setConnectionState: (state: Partial<ConnectionState>) => void;
  addRecentVote: (vote: { userId: string; username: string; vote: 'like' | 'dislike' | 'skip' }) => void;
  clearSession: () => void;
}

const BACKEND_URL = 'http://localhost:3001'; // Update for production

export const useSessionStore = create<SessionStore>((set, get) => ({
  // Initial state
  socket: null,
  connection: {
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0,
  },

  session: null,
  currentUser: null,

  swipedItems: [],
  isSwipeEnabled: true,
  showTimer: false,

  recentVotes: [],
  matches: [],
  finalMatches: [],

  // Connection management
  connect: async (token: string) => {
    const { socket: existingSocket, connection } = get();

    if (existingSocket?.connected) {
      console.log('🔌 Already connected to socket');
      return;
    }

    set({ connection: { ...connection, isConnecting: true, error: null } });

    try {
      // Store token for reconnections
      await SecureStore.setItemAsync('socket_token', token);

      const socket = io(BACKEND_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        retries: 3,
      });

      // Connection event handlers
      socket.on('connect', () => {
        console.log('🔌 Connected to socket server');
        set({
          socket,
          connection: {
            isConnected: true,
            isConnecting: false,
            error: null,
            reconnectAttempts: 0,
          },
        });
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        set((state) => ({
          connection: {
            ...state.connection,
            isConnecting: false,
            error: error.message,
            reconnectAttempts: state.connection.reconnectAttempts + 1,
          },
        }));
      });

      socket.on('disconnect', (reason) => {
        console.log('📴 Socket disconnected:', reason);
        set((state) => ({
          connection: {
            ...state.connection,
            isConnected: false,
          },
        }));

        // Auto-reconnect for client-side disconnects
        if (reason === 'io client disconnect') {
          // Manual disconnect, don't reconnect
        } else {
          // Server disconnect, attempt to reconnect
          setTimeout(() => {
            const currentSocket = get().socket;
            if (currentSocket && !currentSocket.connected) {
              currentSocket.connect();
            }
          }, 2000);
        }
      });

      // Session event handlers
      socket.on('session_state', (sessionState: SessionState) => {
        console.log('📋 Session state updated:', sessionState);
        set({ session: sessionState });
      });

      socket.on('user_joined', ({ user, totalUsers }) => {
        console.log(`👤 User joined: ${user.username} (${totalUsers} total)`);
        // Session state will be updated via session_state event
      });

      socket.on('user_left', ({ userId, username, totalUsers }) => {
        console.log(`👋 User left: ${username} (${totalUsers} remaining)`);
        // Session state will be updated via session_state event
      });

      socket.on('vote_received', ({ userId, username, vote, totalVotes, requiredVotes }) => {
        console.log(`🗳️  Vote received: ${username} voted ${vote} (${totalVotes}/${requiredVotes})`);

        get().addRecentVote({
          userId,
          username,
          vote,
        });
      });

      socket.on('round_complete', ({ matches, nextRound }) => {
        console.log('🏁 Round complete!', { matches, nextRound });

        set((state) => ({
          matches: [...state.matches, ...matches],
          isSwipeEnabled: false, // Disable during transition
        }));

        if (matches.length > 0) {
          Alert.alert(
            '🎉 Match Found!',
            `You all agreed on ${matches.map(m => m.item.name).join(', ')}!`,
            [{ text: 'Awesome!', onPress: () => {} }]
          );
        } else if (nextRound) {
          setTimeout(() => {
            set({ isSwipeEnabled: true });
          }, 2000);
        }
      });

      socket.on('new_item', ({ item, round }) => {
        console.log(`🍽️  New item for round ${round}:`, item.name);
        set({
          isSwipeEnabled: true,
          session: get().session ? {
            ...get().session!,
            currentItem: item,
            currentRound: round,
          } : null
        });
      });

      // Timer events
      socket.on('timer_start', (timerState: TimerState) => {
        console.log('⏰ Timer started:', timerState);
        set({
          showTimer: true,
          session: get().session ? {
            ...get().session!,
            timer: timerState,
          } : null
        });
      });

      socket.on('timer_update', ({ timeRemaining }) => {
        set((state) => ({
          session: state.session ? {
            ...state.session,
            timer: state.session.timer ? {
              ...state.session.timer,
              timeRemaining,
            } : null,
          } : null
        }));
      });

      socket.on('timer_warning', ({ timeRemaining, level }) => {
        if (level === 'critical' && timeRemaining <= 10) {
          Alert.alert('⏰ Time Running Out!', `${timeRemaining} seconds left!`);
        }
      });

      socket.on('timer_end', ({ autoAdvance }) => {
        console.log('⏰ Timer ended, auto-advance:', autoAdvance);
        set({
          showTimer: false,
          isSwipeEnabled: false,
        });
      });

      // Session control events
      socket.on('session_started', ({ sessionId, startTime }) => {
        console.log('🚀 Session started!', sessionId);
        Alert.alert('🚀 Session Started!', 'Let the swiping begin!');
      });

      socket.on('session_ended', ({ sessionId, endTime, finalMatches }) => {
        console.log('🏁 Session ended!', { finalMatches });
        set({
          finalMatches,
          isSwipeEnabled: false,
          showTimer: false,
        });

        Alert.alert(
          '🏁 Session Complete!',
          finalMatches.length > 0
            ? `Final matches: ${finalMatches.map(m => m.item.name).join(', ')}`
            : 'No matches found. Maybe try again?'
        );
      });

      socket.on('host_changed', ({ newHostId, newHostUsername }) => {
        console.log(`👑 New host: ${newHostUsername}`);
        Alert.alert('👑 New Host', `${newHostUsername} is now the session host`);
      });

      // Error handling
      socket.on('error', ({ message, code, details }) => {
        console.error(`❌ Socket error [${code}]:`, message, details);
        Alert.alert('Error', message);

        set((state) => ({
          connection: {
            ...state.connection,
            error: message,
          },
        }));
      });

      // Heartbeat
      socket.on('pong', () => {
        // Server responded to ping
      });

      set({ socket });

    } catch (error) {
      console.error('❌ Failed to connect to socket:', error);
      set((state) => ({
        connection: {
          ...state.connection,
          isConnecting: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }));
    }
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  // Session actions
  joinSession: async (sessionId: string) => {
    const { socket } = get();
    if (!socket?.connected) {
      throw new Error('Not connected to server');
    }

    const token = await SecureStore.getItemAsync('socket_token');
    if (!token) {
      throw new Error('No authentication token');
    }

    socket.emit('join_session', { sessionId, token });
  },

  leaveSession: () => {
    const { socket, session } = get();
    if (socket?.connected && session) {
      socket.emit('leave_session', { sessionId: session.sessionId });
      get().clearSession();
    }
  },

  startSession: async () => {
    const { socket, session, currentUser } = get();
    if (!socket?.connected || !session) {
      throw new Error('Not connected or no session');
    }

    const user = session.users.find(u => u.userId === currentUser?.userId);
    if (!user?.isHost) {
      throw new Error('Only host can start session');
    }

    socket.emit('start_session', { sessionId: session.sessionId });
  },

  swipeVote: (direction: 'like' | 'dislike' | 'skip', item: RestaurantItem) => {
    const { socket, session, currentUser, isSwipeEnabled } = get();

    if (!isSwipeEnabled || !socket?.connected || !session || !currentUser) {
      console.warn('Cannot swipe: not enabled or not connected');
      return;
    }

    // Optimistically add to swiped items
    set((state) => ({
      swipedItems: [...state.swipedItems, item],
    }));

    const swipeEvent = {
      sessionId: session.sessionId,
      userId: currentUser.userId,
      itemId: item.id,
      vote: direction,
      itemData: item,
    };

    socket.emit('swipe_vote', swipeEvent);
  },

  skipItem: (itemId: string) => {
    const { socket, session } = get();
    if (socket?.connected && session) {
      socket.emit('skip_item', { sessionId: session.sessionId, itemId });
    }
  },

  extendTimer: (additionalSeconds: number) => {
    const { socket, session } = get();
    if (socket?.connected && session) {
      socket.emit('extend_timer', {
        sessionId: session.sessionId,
        additionalSeconds
      });
    }
  },

  nextRound: () => {
    const { socket, session } = get();
    if (socket?.connected && session) {
      socket.emit('next_round', { sessionId: session.sessionId });
    }
  },

  endSession: () => {
    const { socket, session } = get();
    if (socket?.connected && session) {
      socket.emit('end_session', { sessionId: session.sessionId });
    }
  },

  // Internal actions
  setSession: (session: SessionState) => {
    set({ session });
  },

  setConnectionState: (state: Partial<ConnectionState>) => {
    set((current) => ({
      connection: { ...current.connection, ...state },
    }));
  },

  addRecentVote: (vote) => {
    set((state) => ({
      recentVotes: [
        { ...vote, timestamp: new Date() },
        ...state.recentVotes.slice(0, 9), // Keep last 10 votes
      ],
    }));
  },

  clearSession: () => {
    set({
      session: null,
      swipedItems: [],
      recentVotes: [],
      matches: [],
      finalMatches: [],
      isSwipeEnabled: true,
      showTimer: false,
    });
  },

  setCurrentUser: (user: { userId: string; username: string }) => {
    set({ currentUser: user });
  },
}));

// Helper to automatically connect when store is used
export const initializeSocket = async () => {
  try {
    const token = await SecureStore.getItemAsync('socket_token');
    if (token) {
      await useSessionStore.getState().connect(token);
    }
  } catch (error) {
    console.error('Failed to initialize socket:', error);
  }
};