const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});

app.use(cors());
app.use(express.json());

// Serve static files for testing
app.use(express.static(__dirname));

// Store room and connection data
const rooms = new Map();
const connections = new Map();
const metrics = {
  totalConnections: 0,
  activeRooms: 0,
  messagesProcessed: 0,
  averageLatency: 0,
  latencyHistory: []
};

// Room management utility functions
function createRoom(coupleId = null) {
  const roomId = coupleId || uuidv4();
  const room = {
    id: roomId,
    users: [],
    createdAt: Date.now(),
    lastActivity: Date.now(),
    messageCount: 0,
    latencyStats: {
      total: 0,
      count: 0,
      average: 0,
      min: Infinity,
      max: 0
    }
  };

  rooms.set(roomId, room);
  metrics.activeRooms = rooms.size;

  console.log(`✅ Room created: ${roomId}`);
  return room;
}

function joinRoom(socket, roomId, userId) {
  const room = rooms.get(roomId);
  if (!room) {
    socket.emit('error', { message: 'Room not found' });
    return false;
  }

  if (room.users.length >= 2) {
    socket.emit('error', { message: 'Room is full' });
    return false;
  }

  // Check if user already in room
  const existingUser = room.users.find(user => user.id === userId);
  if (existingUser) {
    existingUser.socketId = socket.id;
    existingUser.status = 'connected';
  } else {
    room.users.push({
      id: userId,
      socketId: socket.id,
      joinedAt: Date.now(),
      status: 'connected'
    });
  }

  socket.join(roomId);
  room.lastActivity = Date.now();

  console.log(`👥 User ${userId} joined room ${roomId} (${room.users.length}/2 users)`);

  // Notify room about user joining
  io.to(roomId).emit('userJoined', {
    roomId,
    userId,
    usersCount: room.users.length,
    users: room.users.map(u => ({ id: u.id, status: u.status }))
  });

  return true;
}

function leaveRoom(socket, roomId, userId) {
  const room = rooms.get(roomId);
  if (!room) return;

  const userIndex = room.users.findIndex(user => user.socketId === socket.id);
  if (userIndex !== -1) {
    const user = room.users[userIndex];
    user.status = 'disconnected';

    console.log(`👋 User ${userId} left room ${roomId}`);

    // Notify remaining users
    socket.to(roomId).emit('userLeft', {
      roomId,
      userId,
      usersCount: room.users.filter(u => u.status === 'connected').length
    });

    // Remove room if empty for more than 5 minutes
    setTimeout(() => {
      const currentRoom = rooms.get(roomId);
      if (currentRoom && currentRoom.users.every(u => u.status === 'disconnected')) {
        rooms.delete(roomId);
        metrics.activeRooms = rooms.size;
        console.log(`🗑️  Room ${roomId} cleaned up (empty)`);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }
}

function updateLatencyStats(room, latency) {
  room.latencyStats.total += latency;
  room.latencyStats.count += 1;
  room.latencyStats.average = room.latencyStats.total / room.latencyStats.count;
  room.latencyStats.min = Math.min(room.latencyStats.min, latency);
  room.latencyStats.max = Math.max(room.latencyStats.max, latency);

  // Update global metrics
  metrics.latencyHistory.push({
    timestamp: Date.now(),
    latency,
    roomId: room.id
  });

  // Keep only last 1000 latency measurements
  if (metrics.latencyHistory.length > 1000) {
    metrics.latencyHistory = metrics.latencyHistory.slice(-1000);
  }

  // Calculate global average latency
  const recentLatencies = metrics.latencyHistory.slice(-100); // Last 100 measurements
  metrics.averageLatency = recentLatencies.reduce((sum, item) => sum + item.latency, 0) / recentLatencies.length;
}

// Socket.io connection handling
io.on('connection', (socket) => {
  metrics.totalConnections++;
  connections.set(socket.id, {
    connectedAt: Date.now(),
    userId: null,
    roomId: null
  });

  console.log(`🔌 Client connected: ${socket.id} (Total: ${io.engine.clientsCount})`);

  // Handle room creation
  socket.on('createRoom', (data, callback) => {
    try {
      const { coupleId, userId } = data;
      const room = createRoom(coupleId);

      connections.get(socket.id).userId = userId;
      connections.get(socket.id).roomId = room.id;

      joinRoom(socket, room.id, userId);

      callback({
        success: true,
        roomId: room.id,
        message: 'Room created successfully'
      });
    } catch (error) {
      console.error('Error creating room:', error);
      callback({
        success: false,
        message: 'Failed to create room'
      });
    }
  });

  // Handle room joining
  socket.on('joinRoom', (data, callback) => {
    try {
      const { roomId, userId } = data;

      connections.get(socket.id).userId = userId;
      connections.get(socket.id).roomId = roomId;

      const success = joinRoom(socket, roomId, userId);

      if (success) {
        const room = rooms.get(roomId);
        callback({
          success: true,
          roomId,
          usersCount: room.users.filter(u => u.status === 'connected').length,
          message: 'Joined room successfully'
        });
      } else {
        callback({
          success: false,
          message: 'Failed to join room'
        });
      }
    } catch (error) {
      console.error('Error joining room:', error);
      callback({
        success: false,
        message: 'Failed to join room'
      });
    }
  });

  // Handle swipe events
  socket.on('swipe', (data) => {
    try {
      const { roomId, direction, timestamp, restaurantId } = data;
      const room = rooms.get(roomId);

      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      const latency = Date.now() - timestamp;
      updateLatencyStats(room, latency);

      room.messageCount++;
      room.lastActivity = Date.now();
      metrics.messagesProcessed++;

      // Broadcast swipe to other users in room
      socket.to(roomId).emit('partnerSwipe', {
        direction,
        timestamp: Date.now(),
        restaurantId,
        latency,
        userId: connections.get(socket.id).userId
      });

      // Send acknowledgment back to sender with latency info
      socket.emit('swipeAck', {
        timestamp: Date.now(),
        latency,
        messageId: data.messageId || null
      });

      console.log(`👆 Swipe ${direction} in room ${roomId} (latency: ${latency}ms)`);
    } catch (error) {
      console.error('Error handling swipe:', error);
      socket.emit('error', { message: 'Failed to process swipe' });
    }
  });

  // Handle ping for latency testing
  socket.on('ping', (data) => {
    const latency = Date.now() - data.timestamp;
    socket.emit('pong', {
      timestamp: Date.now(),
      latency,
      serverTime: Date.now()
    });
  });

  // Handle match events
  socket.on('match', (data) => {
    try {
      const { roomId, restaurantId, userId } = data;
      const room = rooms.get(roomId);

      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      // Broadcast match to all users in room
      io.to(roomId).emit('matchFound', {
        restaurantId,
        timestamp: Date.now(),
        matchedBy: userId
      });

      console.log(`💖 Match found in room ${roomId} for restaurant ${restaurantId}`);
    } catch (error) {
      console.error('Error handling match:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    const connection = connections.get(socket.id);

    if (connection && connection.roomId && connection.userId) {
      leaveRoom(socket, connection.roomId, connection.userId);
    }

    connections.delete(socket.id);

    console.log(`💔 Client disconnected: ${socket.id} (Reason: ${reason})`);
    console.log(`👥 Active connections: ${io.engine.clientsCount}`);
  });

  // Error handling
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// API endpoints for monitoring
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: Date.now(),
    uptime: process.uptime(),
    connections: io.engine.clientsCount,
    rooms: rooms.size
  });
});

app.get('/api/metrics', (req, res) => {
  const roomsData = Array.from(rooms.entries()).map(([id, room]) => ({
    id,
    usersCount: room.users.filter(u => u.status === 'connected').length,
    messageCount: room.messageCount,
    latencyStats: room.latencyStats,
    lastActivity: room.lastActivity,
    uptime: Date.now() - room.createdAt
  }));

  res.json({
    global: {
      ...metrics,
      activeConnections: io.engine.clientsCount,
      uptime: process.uptime()
    },
    rooms: roomsData
  });
});

app.get('/api/rooms/:roomId', (req, res) => {
  const room = rooms.get(req.params.roomId);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  res.json({
    id: room.id,
    users: room.users,
    messageCount: room.messageCount,
    latencyStats: room.latencyStats,
    createdAt: room.createdAt,
    lastActivity: room.lastActivity
  });
});

// Cleanup function for inactive rooms
setInterval(() => {
  const now = Date.now();
  const INACTIVE_THRESHOLD = 30 * 60 * 1000; // 30 minutes

  for (const [roomId, room] of rooms.entries()) {
    if (now - room.lastActivity > INACTIVE_THRESHOLD) {
      rooms.delete(roomId);
      console.log(`🗑️  Room ${roomId} cleaned up (inactive)`);
    }
  }

  metrics.activeRooms = rooms.size;
}, 5 * 60 * 1000); // Check every 5 minutes

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log('🚀 DinnerMatch WebSocket Server started');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🌐 Socket.io endpoint: ws://localhost:${PORT}`);
  console.log('📊 Metrics available at: /api/metrics');
  console.log('❤️  Health check at: /api/health');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});