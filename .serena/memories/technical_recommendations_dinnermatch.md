# DinnerMatch Technical Recommendations

## Critical Technical Decisions

### Real-time Architecture
**Recommendation**: Socket.io over native WebSockets
- Mature reconnection handling
- Fallback transport mechanisms
- Room/namespace support for groups
- Better mobile network handling

### State Management
**Recommendation**: Zustand over Redux
- Simpler learning curve
- Less boilerplate
- TypeScript-first design
- Better React Native performance

### Backend Infrastructure
**Recommendation**: Start simple, scale later
- Heroku for initial deployment (not AWS)
- PostgreSQL + Redis (proven combo)
- Vertical scaling first, horizontal later
- Managed services over self-hosted

### Mobile Development
**Recommendation**: Expo managed workflow
- Faster iteration cycles
- OTA updates capability
- Simplified build process
- Easy beta distribution

## Performance Targets

### Critical Metrics
- Swipe latency: <100ms (local)
- Sync latency: <500ms (network)
- App launch: <2 seconds
- Session join: <1 second
- Memory usage: <150MB

### Monitoring Required
- WebSocket connection stability
- Session state synchronization
- API response times
- Crash rates by device
- Network retry patterns

## Technical Validation Requirements

### Week 1 Spike Must Prove
1. 2-device sync works reliably
2. Swipe gestures feel native
3. Timer synchronization accurate
4. Disconnect/reconnect handled
5. State recovery functional

### Failure Conditions
- Sync latency >1 second
- Connection drops >5%
- State conflicts unresolvable
- Battery drain excessive
- Memory leaks detected

## Implementation Shortcuts

### Use Existing Solutions
- Auth: Firebase Auth or Supabase
- Payments: Stripe (when needed)
- Analytics: Mixpanel free tier
- Error tracking: Sentry free tier
- Push notifications: Expo Push

### Defer Complexity
- Start with HTTP polling if WebSocket fails
- Manual content curation initially
- Basic matching algorithm first
- Skip reservation integration
- Delay gamification features

## Database Schema Essentials

### Core Tables
```sql
users (id, email, name, dietary_restrictions)
groups (id, name, created_by)
group_members (group_id, user_id, role)
sessions (id, group_id, status, energy_level)
session_votes (session_id, user_id, item_id, vote)
restaurants (id, name, cuisine, price, location)
recipes (id, name, prep_time, difficulty)
matches (id, session_id, item_id, matched_at)
```

### Redis Keys
```
session:{id}:state - Current session state
session:{id}:users - Connected users
user:{id}:active_session - User's current session
swipe_deck:{session_id} - Current card deck
```

## API Design Principles

### RESTful + WebSocket Hybrid
- REST for CRUD operations
- WebSocket for real-time events
- GraphQL consideration for v2
- Versioning from day 1

### Critical Endpoints
```
POST /auth/login
POST /groups
POST /groups/:id/sessions
GET /sessions/:id/deck
WS /sessions/:id/connect
POST /sessions/:id/swipe
GET /matches/:id
```

## Testing Strategy

### Unit Test Priorities
1. Matching algorithm logic
2. Dietary filter accuracy
3. Session state transitions
4. Timer countdown logic
5. Authentication flows

### E2E Test Scenarios
1. Complete swipe session
2. Network interruption recovery
3. Multi-round progression
4. Match result display
5. Cross-platform sync

## Security Considerations

### Must Have
- HTTPS everywhere
- JWT with refresh tokens
- Rate limiting on APIs
- Input sanitization
- SQL injection prevention

### Nice to Have
- OAuth2 scopes
- API key rotation
- Audit logging
- GDPR compliance
- PII encryption