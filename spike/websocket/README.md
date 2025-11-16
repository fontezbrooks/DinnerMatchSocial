# DinnerMatch WebSocket POC

A proof of concept WebSocket server for real-time synchronization between mobile devices in the DinnerMatch app. This implementation validates the technical feasibility of synchronized swiping between couples.

## Overview

This POC implements a Socket.io-based real-time communication system that enables:
- **Room-based connections** for couples to sync their restaurant browsing
- **Low-latency message delivery** for instant swipe synchronization
- **Robust reconnection handling** for mobile network reliability
- **Performance monitoring** with comprehensive metrics and testing

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
# Navigate to the websocket POC directory
cd spike/websocket

# Install dependencies
npm install

# Start the server
npm start
```

The server will start on `http://localhost:3001`

### Development Mode

```bash
# Start with auto-reload
npm run dev
```

### Testing

```bash
# Run performance test suite
npm test

# Run stress tests
npm run stress
```

## 🏗️ Architecture

### Server Components

**`server.js`** - Main Socket.io server with:
- Room management for couple sessions
- Latency tracking and metrics collection
- RESTful monitoring endpoints
- Graceful reconnection handling

**Key Features:**
- **Room Lifecycle**: Automatic cleanup of inactive rooms
- **Metrics Collection**: Real-time latency, message counts, connection stats
- **Error Handling**: Robust error recovery and logging
- **API Endpoints**: Health checks and metrics exposure

### Client Components

**`client.html`** - Interactive test client with:
- WebSocket connection management
- Real-time swipe simulation
- Performance monitoring dashboard
- Auto-testing capabilities

**Key Features:**
- **Connection Management**: Connect, disconnect, room creation/joining
- **Swipe Testing**: Manual and automated swipe simulation
- **Metrics Display**: Real-time latency and delivery rate monitoring
- **Partner Sync**: Visual display of partner's swipes

## 📡 API Reference

### WebSocket Events

#### Client → Server

**`createRoom`**
```javascript
socket.emit('createRoom', {
  coupleId: 'optional-couple-id',
  userId: 'user-123'
}, (response) => {
  // response: { success: true, roomId: 'room-uuid', message: '...' }
});
```

**`joinRoom`**
```javascript
socket.emit('joinRoom', {
  roomId: 'room-uuid',
  userId: 'user-456'
}, (response) => {
  // response: { success: true, roomId: 'room-uuid', usersCount: 2 }
});
```

**`swipe`**
```javascript
socket.emit('swipe', {
  roomId: 'room-uuid',
  direction: 'left|right|up',
  timestamp: Date.now(),
  restaurantId: 'restaurant-123'
});
```

**`ping`**
```javascript
socket.emit('ping', {
  timestamp: Date.now()
});
```

#### Server → Client

**`userJoined`**
```javascript
socket.on('userJoined', (data) => {
  // data: { roomId, userId, usersCount, users: [...] }
});
```

**`partnerSwipe`**
```javascript
socket.on('partnerSwipe', (data) => {
  // data: { direction, timestamp, restaurantId, latency, userId }
});
```

**`swipeAck`**
```javascript
socket.on('swipeAck', (data) => {
  // data: { timestamp, latency, messageId }
});
```

**`pong`**
```javascript
socket.on('pong', (data) => {
  // data: { timestamp, latency, serverTime }
});
```

### REST API Endpoints

**Health Check**
```
GET /api/health

Response:
{
  "status": "healthy",
  "timestamp": 1637123456789,
  "uptime": 3600,
  "connections": 42,
  "rooms": 21
}
```

**Metrics**
```
GET /api/metrics

Response:
{
  "global": {
    "totalConnections": 156,
    "activeRooms": 21,
    "messagesProcessed": 5847,
    "averageLatency": 45,
    "activeConnections": 42,
    "uptime": 3600
  },
  "rooms": [
    {
      "id": "room-uuid",
      "usersCount": 2,
      "messageCount": 47,
      "latencyStats": { "average": 32, "min": 15, "max": 89 },
      "lastActivity": 1637123456789,
      "uptime": 1200
    }
  ]
}
```

**Room Details**
```
GET /api/rooms/:roomId

Response:
{
  "id": "room-uuid",
  "users": [
    { "id": "user-123", "socketId": "socket-abc", "status": "connected" }
  ],
  "messageCount": 47,
  "latencyStats": { "total": 1504, "count": 47, "average": 32 },
  "createdAt": 1637122256789,
  "lastActivity": 1637123456789
}
```

## 🧪 Testing Guide

### Interactive Testing

1. **Start the server**:
   ```bash
   npm start
   ```

2. **Open test clients**:
   - Open `http://localhost:3001/client.html` in two browser tabs
   - Simulate different devices by using different browsers or incognito modes

3. **Create a session**:
   - In Tab 1: Click "Connect to Server" → "Create New Room"
   - Copy the Room ID
   - In Tab 2: Click "Connect to Server" → Enter Room ID → "Join Existing Room"

4. **Test synchronization**:
   - Use swipe buttons in either tab
   - Observe real-time sync in the "Partner's Swipes" section
   - Monitor latency in the metrics panel

### Automated Testing

**Performance Test Suite**
```bash
# Run comprehensive performance tests
npm test

# Test specific server URL
node test-performance.js http://your-server-url:3001

# Results saved to test-results.md
```

**Stress Testing**
```bash
# Full stress test suite
npm run stress

# Specific stress tests
node stress-test.js http://localhost:3001 connections 200
node stress-test.js http://localhost:3001 flood 100 30
node stress-test.js http://localhost:3001 memory 10 20
```

### Test Scenarios

#### Two Devices, Same WiFi
1. Connect both devices to the same WiFi network
2. Run the server on one device or a local network server
3. Access client from both devices using the server's local IP
4. Expected: <100ms latency, >99% delivery rate

#### Different Networks (WiFi vs 4G)
1. Connect one device to WiFi, another to 4G
2. Use a publicly accessible server (deploy to cloud)
3. Test swipe synchronization
4. Expected: <500ms latency, >95% delivery rate

#### Network Interruption Recovery
1. Establish connection and room
2. Disable network on one device for 10 seconds
3. Re-enable network
4. Expected: Automatic reconnection within 2 seconds

#### Concurrent Sessions Stress Test
1. Run stress test: `npm run stress`
2. Monitor server resources
3. Expected: Handle 100+ concurrent sessions with <500ms latency

## 📊 Performance Metrics

### Target KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Sync Latency (95th percentile) | <500ms | Round-trip time for swipe events |
| Reconnection Time | <2000ms | Time to restore connection after drop |
| Message Delivery Rate | >95% | Successfully delivered swipe events |
| Concurrent Sessions | >100 | Simultaneous couple sessions |
| Server Uptime | >99.9% | Continuous operation |

### Monitoring

**Real-time Metrics** (via `/api/metrics`):
- Active connections count
- Average/min/max latency
- Messages processed per second
- Room creation/cleanup rates
- Memory usage and uptime

**Performance Testing** generates detailed reports including:
- Latency distribution histograms
- Message delivery success rates
- Reconnection time analysis
- Stress test results with recommendations

## 🏢 Production Considerations

### Scaling
- **Horizontal scaling**: Use Redis adapter for multi-server deployments
- **Load balancing**: Session affinity required for WebSocket connections
- **Resource limits**: Monitor memory usage and connection limits

### Security
- **Authentication**: Integrate with existing user auth system
- **Rate limiting**: Prevent message flooding and abuse
- **Input validation**: Sanitize all client inputs
- **CORS**: Configure for production domains

### Monitoring
- **APM Integration**: NewRelic, DataDog, or similar
- **Error tracking**: Sentry or Bugsnag
- **Custom metrics**: Business-specific KPIs and alerts
- **Health checks**: Kubernetes-style readiness/liveness probes

### Deployment
- **Docker containerization** for consistent deployments
- **Environment configuration** for different stages
- **Graceful shutdown** handling for zero-downtime updates
- **Database persistence** for room and session data

## 🛠️ Development

### File Structure
```
spike/websocket/
├── server.js              # Main Socket.io server
├── client.html            # Interactive test client
├── test-performance.js    # Performance test suite
├── stress-test.js         # Stress testing utilities
├── package.json           # Dependencies and scripts
└── README.md              # This documentation
```

### Adding Features

**New Event Types**:
1. Define event handler in `server.js`
2. Add client-side handling in `client.html`
3. Update this documentation
4. Add tests to `test-performance.js`

**New Metrics**:
1. Add to metrics object in `server.js`
2. Expose via `/api/metrics` endpoint
3. Update test client dashboard
4. Document in this README

### Debugging

**Enable debug logging**:
```bash
DEBUG=socket.io:* npm start
```

**Server-side logging**:
- All events logged with timestamps
- Error tracking with stack traces
- Performance metrics logged every 5 minutes

**Client-side debugging**:
- Browser console for WebSocket events
- Test client activity log
- Real-time metrics display

## 🚨 Troubleshooting

### Common Issues

**"Connection timeout"**
- Check if server is running on correct port
- Verify firewall settings allow WebSocket connections
- Ensure client URL matches server URL

**"Room not found"**
- Verify room ID is correct
- Check if room expired (30 minutes inactive)
- Ensure server wasn't restarted (rooms are in-memory)

**High latency**
- Check network connection quality
- Monitor server resource usage
- Verify geographic distance to server
- Consider CDN or edge deployment

**Failed stress tests**
- Increase server resource limits
- Check for memory leaks in long-running tests
- Verify network bandwidth for high-load tests
- Tune operating system socket limits

### Performance Optimization

**Server-side**:
- Enable gzip compression
- Use Redis for session storage
- Implement connection pooling
- Add message queuing for burst traffic

**Client-side**:
- Implement exponential backoff for reconnection
- Buffer messages during disconnection
- Use WebSocket-only transport in production
- Add local message deduplication

### Known Limitations

- **In-memory storage**: Rooms lost on server restart
- **Single-server**: No load balancing without Redis adapter
- **No persistence**: Messages not stored in database
- **Basic auth**: No integration with user authentication

## 📈 Next Steps

### Production Readiness
1. **Database integration** for persistent room storage
2. **User authentication** integration with main app
3. **Redis adapter** for multi-server deployment
4. **Message persistence** for offline sync
5. **Push notifications** for offline users

### Performance Optimization
1. **Edge deployment** for global latency reduction
2. **Message compression** for bandwidth optimization
3. **Connection pooling** for resource efficiency
4. **Adaptive quality** based on network conditions

### Feature Extensions
1. **Voice/video calling** for enhanced couple experience
2. **Location-based matching** for nearby restaurants
3. **Group sessions** for double dates
4. **Analytics integration** for usage insights

## 📝 Test Results Template

When running tests, results are saved to `test-results.md` with this structure:

```markdown
# DinnerMatch WebSocket Performance Test Results

**Overall Result:** ✅ PASS
**Test Date:** 2023-11-16T10:30:00.000Z

## Key Performance Indicators
| Metric | Value | Target | Status |
|--------|-------|---------|--------|
| Average Latency | 45ms | <500ms | ✅ |
| 95th Percentile Latency | 89ms | <500ms | ✅ |
| Reconnection Time | 1250ms | <2000ms | ✅ |
| Message Delivery Rate | 98.7% | >95% | ✅ |
| Max Concurrent Sessions | 127 | >100 | ✅ |

## Recommendations
- ✅ All performance targets met
- System ready for production deployment
- Consider edge deployment for global users
```

---

## 🤝 Contributing

This POC serves as the foundation for production WebSocket implementation. When extending:

1. **Maintain test coverage** for all new features
2. **Update performance benchmarks** with new targets
3. **Document API changes** in this README
4. **Ensure backward compatibility** with mobile clients

## 📄 License

MIT License - See LICENSE file for details