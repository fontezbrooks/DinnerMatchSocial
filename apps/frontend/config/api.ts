// API Configuration for DinnerMatchSocial

export const API_BASE_URL = __DEV__
  ? 'http://localhost:3001/api'  // Development server
  : 'https://api.dinnermatchsocial.com/api'; // Production server

export const WEBSOCKET_URL = __DEV__
  ? 'http://localhost:3001'      // Development WebSocket
  : 'https://api.dinnermatchsocial.com'; // Production WebSocket

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },

  // Users
  users: {
    profile: '/users/profile',
    update: '/users/profile',
    delete: '/users/profile',
  },

  // Groups
  groups: {
    list: '/groups',
    create: '/groups',
    join: '/groups/join',
    leave: '/groups/leave',
    members: (id: string) => `/groups/${id}/members`,
    details: (id: string) => `/groups/${id}`,
  },

  // Sessions
  sessions: {
    create: '/sessions',
    join: (id: string) => `/sessions/${id}/join`,
    leave: (id: string) => `/sessions/${id}/leave`,
    details: (id: string) => `/sessions/${id}`,
    active: '/sessions/active',
  },

  // Discovery
  discovery: {
    restaurants: {
      search: '/discovery/restaurants/search',
      details: (id: string) => `/discovery/restaurants/${id}`,
      reviews: (id: string) => `/discovery/restaurants/${id}/reviews`,
    },
    recipes: {
      search: '/discovery/recipes/search',
      details: (id: string) => `/discovery/recipes/${id}`,
      byIngredients: '/discovery/recipes/by-ingredients',
      random: '/discovery/recipes/random',
      autocomplete: '/discovery/recipes/autocomplete',
    },
    recommendations: '/discovery/recommendations',
  },
};

// Request timeout configuration
export const REQUEST_TIMEOUT = 10000; // 10 seconds

// Retry configuration
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryMultiplier: 2, // Exponential backoff
};

// WebSocket events
export const WS_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',

  // Authentication
  JOIN_SESSION: 'join_session',
  LEAVE_SESSION: 'leave_session',

  // Session management
  START_SESSION: 'start_session',
  END_SESSION: 'end_session',
  SESSION_STATE: 'session_state',

  // User events
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',

  // Voting
  SWIPE_VOTE: 'swipe_vote',
  VOTE_RECEIVED: 'vote_received',

  // Round management
  ROUND_COMPLETE: 'round_complete',
  NEXT_ROUND: 'next_round',

  // Timer
  TIMER_UPDATE: 'timer_update',
  TIMER_WARNING: 'timer_warning',
  TIMER_END: 'timer_end',

  // Results
  SESSION_ENDED: 'session_ended',

  // Errors
  ERROR: 'error',

  // Heartbeat
  PING: 'ping',
  PONG: 'pong',
};

// Error codes
export const ERROR_CODES = {
  // Authentication
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  ACCESS_DENIED: 'ACCESS_DENIED',

  // Network
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  SERVER_ERROR: 'SERVER_ERROR',

  // Validation
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED: 'MISSING_REQUIRED',

  // Session
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  SESSION_FULL: 'SESSION_FULL',
  SESSION_ENDED: 'SESSION_ENDED',

  // Discovery
  LOCATION_REQUIRED: 'LOCATION_REQUIRED',
  API_LIMIT_EXCEEDED: 'API_LIMIT_EXCEEDED',
  NO_RESULTS: 'NO_RESULTS',
};

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;