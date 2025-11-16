# Workflow Generation Patterns & Learnings

## Systematic Workflow Generation Pattern

### 1. Document Analysis Phase
- Parse PRD/specification thoroughly (1500+ lines)
- Extract functional requirements systematically
- Identify hidden complexity and unrealistic assumptions
- Challenge metrics and timelines

### 2. Deep Analysis Phase
- Use Sequential MCP for multi-stage thinking (10+ stages)
- Break down into: Foundation → Core → Content → Integration
- Identify critical path vs parallelizable work
- Map technical dependencies explicitly

### 3. Risk Assessment Pattern
- Categorize: Critical → High → Medium risks
- For each risk: Impact assessment + Mitigation strategy
- Identify make-or-break technical challenges early
- Plan pivot strategies before starting

### 4. Parallel Execution Design
- Identify independent work streams
- Map convergence points clearly
- Resource allocation per track
- Define synchronization requirements

### 5. Documentation Structure
- IMPLEMENTATION-WORKFLOW: Timeline and phases
- DEPENDENCY-MAPPING: Task orchestration
- IMPLEMENTATION-STRATEGY: Executive guidance
- Each doc serves different audience/purpose

## Key Insights for Future Workflows

### Technical Validation First
- Always start with 2-week spike for critical unknowns
- Define clear go/no-go criteria
- Don't commit resources until validated
- Have pivot strategy ready

### Realistic Adjustments
- PRD metrics often 3-5x optimistic
- Add 20-30% timeline buffer
- Reduce scope aggressively for MVP
- Focus on core value proposition only

### Team Optimization
- 5-person team optimal for parallel execution
- 3-person minimum viable team
- Clear role separation crucial
- DevOps/QA from day 1, not afterthought

### Success Metrics
- Define quantifiable targets upfront
- Monitor against metrics weekly
- Adjust strategy based on data
- Kill switches prevent sunk cost fallacy

## Workflow Generation Checklist

✅ Analyze source document completely
✅ Perform deep sequential analysis
✅ Identify all dependencies
✅ Design parallel execution tracks
✅ Create risk mitigation plans
✅ Define success/failure criteria
✅ Document for multiple audiences
✅ Include pivot strategies
✅ Set realistic timelines
✅ Plan resource allocation

## Anti-Patterns to Avoid

❌ Taking PRD at face value
❌ Sequential-only execution
❌ Ignoring technical risks
❌ No validation phase
❌ Overly optimistic timelines
❌ Missing pivot strategies
❌ Unclear dependencies
❌ No success metrics
❌ Single point of failure
❌ Insufficient documentation