# DinnerMatch Technical Decisions Log

## Architecture Decisions (Post-PRD Analysis)

### Core Technology Stack
**Frontend**: React Native with Expo (existing)
**Authentication**: Consider alternatives to Clerk (complexity)
**Real-Time**: Start with polling, upgrade to WebSocket if validated
**Backend**: Consider simpler alternatives to Hono
**Database**: Start with PostgreSQL (simpler than MongoDB)

### Implementation Approach
1. **Progressive Enhancement Strategy**
   - Basic async voting → Real-time sync
   - Web app → PWA → Native apps
   - Single player → Couples → Groups

2. **API Architecture**
   - Abstract all third-party services
   - Implement aggressive caching layer
   - Design for API provider switching

3. **State Management**
   - Start with simple client-side state
   - Add server-side session management incrementally
   - Design for disconnection resilience

### Performance Targets (Adjusted)
- Swipe response: <100ms (local handling)
- Sync latency: <1000ms (relaxed from 500ms)
- Session recovery: <2 seconds
- Initial load: <3 seconds

### Testing Strategy
- A/B test all timing mechanics
- Prototype with 20 couples minimum
- Measure actual decision times
- Validate energy level concept

### Risk Mitigation Technical Decisions
- No WebSockets in MVP (use polling)
- Cache all restaurant data locally
- Implement offline mode early
- Design for graceful degradation
- Abstract all external dependencies

## Key Technical Pivots from PRD
1. ❌ Don't start with real-time sync
2. ❌ Don't build native apps first
3. ❌ Don't implement all 88 requirements
4. ✅ Do build throwaway prototype
5. ✅ Do start with web/PWA
6. ✅ Do implement progressive enhancement