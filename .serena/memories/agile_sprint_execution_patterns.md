# Agile Sprint Execution Patterns

## Successful Sprint Structure

### Sprint 0: Technical Validation (2 weeks)
**Purpose**: De-risk technical unknowns
**Pattern**: Parallel technical spikes
```
- Independent POCs by domain experts
- Clear success criteria per spike
- Go/No-Go decision gates
- Documentation during execution
```

### Sprint 1: Foundation (2 weeks)
**Purpose**: Establish infrastructure
**Pattern**: 3-track parallel execution
```
Track A: Backend (database, API, auth)
Track B: Frontend (UI, navigation, components)
Track C: DevOps (Docker, CI/CD, deployment)
```

### Sprint 2+: Features (2 weeks each)
**Purpose**: Incremental feature delivery
**Pattern**: Vertical slices with integration
```
- User story driven
- End-to-end implementation
- Integration testing
- Continuous deployment
```

## Task Delegation Success Factors

### Clear Agent Briefs
```yaml
Structure:
  mission: Specific objective
  requirements: Detailed deliverables
  success_criteria: Measurable outcomes
  location: File paths
  integration: Connection points
```

### Parallel Execution Rules
1. No inter-agent dependencies within sprint
2. Clear interfaces between components
3. Integration checkpoints defined
4. Daily progress tracking

### Quality Gates
- Each agent validates deliverables
- Integration testing at checkpoints
- Sprint review with demos
- Retrospective for improvements

## Sprint Planning Template

```yaml
sprint_x:
  goals: [3-5 clear objectives]
  tracks:
    - name: Track identifier
      lead: Agent type
      tasks: [Numbered deliverables]
      duration: Days/weeks
  
  integration_points:
    week_1: Basic validation
    week_2: Full integration
  
  success_criteria:
    must_have: P0 requirements
    should_have: P1 features
    nice_to_have: P2 enhancements
```

## Velocity Patterns

### Sprint 0
- Focus: Risk reduction
- Points: 15-25
- Delivery: POCs and decisions

### Sprint 1
- Focus: Foundation
- Points: 30-40
- Delivery: Infrastructure

### Sprint 2+
- Focus: Features
- Points: 25-35
- Delivery: User value

## Communication Patterns

### Daily Standups
```
- What: Progress update
- When: Fixed time daily
- Who: All agents
- Format: Status, blockers, needs
```

### Weekly Checkpoints
```
Monday: Sprint planning
Wednesday: Integration check
Friday: Review and retro
```

## Documentation Strategy

### During Execution
- Real-time updates to planning docs
- Results captured immediately
- Metrics tracked continuously
- Decisions documented

### Sprint Completion
- Comprehensive results document
- Metrics summary
- Lessons learned
- Next sprint readiness

## Risk Management

### Mitigation Strategies
1. Technical spikes first
2. Parallel tracks reduce dependencies
3. Early integration testing
4. Continuous monitoring
5. Flexible scope management

### Escalation Path
```
Technical blocker → Tech lead → Pivot strategy
Resource issue → Reallocation → Scope adjustment
Quality issue → Additional testing → Delay if needed
```

## Success Metrics

### Sprint Level
- Velocity achieved
- Tasks completed %
- Quality standards met
- Integration successful
- Team satisfaction

### Project Level
- Cumulative velocity
- Risk reduction
- Technical debt
- Feature completion
- User readiness

## Anti-Patterns to Avoid

❌ Sequential task execution
❌ Unclear success criteria
❌ Missing integration points
❌ Late documentation
❌ Skipping retrospectives
❌ Ignoring technical debt
❌ Over-committing scope

## Reusable Sprint Framework

```bash
# Sprint initialization
./scripts/orchestrate.sh start

# Daily execution
npm run sprint:status
npm run sprint:test

# Sprint completion
npm run sprint:review
npm run sprint:retro
```

This pattern has proven successful for:
- Rapid development (2x velocity)
- High quality (>70% coverage)
- Low risk (validation first)
- Team efficiency (100% delivery)