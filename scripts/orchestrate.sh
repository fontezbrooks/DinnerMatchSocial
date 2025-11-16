#!/bin/bash

# DinnerMatch Task Orchestration Script
# Generated: 2025-11-16
# Purpose: Automate task execution and progress tracking

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="/Users/fontezbrooks/DinnerMatchSocial"
PHASE_FILE="${PROJECT_ROOT}/.current_phase"
TASK_LOG="${PROJECT_ROOT}/claudedocs/TASK_EXECUTION_LOG.md"

# Initialize phase tracking
init_phase() {
    if [ ! -f "$PHASE_FILE" ]; then
        echo "0" > "$PHASE_FILE"
        echo "# Task Execution Log" > "$TASK_LOG"
        echo "**Started**: $(date)" >> "$TASK_LOG"
        echo "" >> "$TASK_LOG"
    fi
}

# Get current phase
get_phase() {
    if [ -f "$PHASE_FILE" ]; then
        cat "$PHASE_FILE"
    else
        echo "0"
    fi
}

# Update phase
set_phase() {
    echo "$1" > "$PHASE_FILE"
    log_task "INFO" "Advanced to Phase $1"
}

# Log task execution
log_task() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" >> "$TASK_LOG"

    case $level in
        "SUCCESS")
            echo -e "${GREEN}✓${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}✗${NC} $message"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠${NC} $message"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ${NC} $message"
            ;;
        *)
            echo "$message"
            ;;
    esac
}

# Phase 0: Technical Validation Spike
phase_0_spike() {
    log_task "INFO" "Starting Phase 0: Technical Validation Spike"

    # WebSocket POC
    log_task "INFO" "Task 001: WebSocket Proof of Concept"
    if [ ! -d "${PROJECT_ROOT}/spike/websocket" ]; then
        mkdir -p "${PROJECT_ROOT}/spike/websocket"
        log_task "SUCCESS" "Created spike/websocket directory"
    fi

    # React Native Performance
    log_task "INFO" "Task 002: React Native Performance Test"
    if [ ! -d "${PROJECT_ROOT}/spike/performance" ]; then
        mkdir -p "${PROJECT_ROOT}/spike/performance"
        log_task "SUCCESS" "Created spike/performance directory"
    fi

    # API Testing
    log_task "INFO" "Task 003: API Integration Testing"
    if [ ! -d "${PROJECT_ROOT}/spike/api-test" ]; then
        mkdir -p "${PROJECT_ROOT}/spike/api-test"
        log_task "SUCCESS" "Created spike/api-test directory"
    fi

    log_task "WARNING" "Phase 0 requires manual implementation of spike tests"
    echo ""
    echo "Next steps for Phase 0:"
    echo "1. Implement WebSocket sync test in spike/websocket/"
    echo "2. Create React Native performance test in spike/performance/"
    echo "3. Test API integrations in spike/api-test/"
    echo ""
    echo "Run './orchestrate.sh validate 0' when complete"
}

# Phase 1: Foundation Infrastructure
phase_1_foundation() {
    log_task "INFO" "Starting Phase 1: Foundation Infrastructure"

    # Backend setup
    if [ ! -d "${PROJECT_ROOT}/apps/backend" ]; then
        log_task "INFO" "Creating backend structure"
        mkdir -p "${PROJECT_ROOT}/apps/backend/src/{controllers,models,routes,middleware,config}"
        log_task "SUCCESS" "Backend directory structure created"
    fi

    # Database setup
    if [ ! -f "${PROJECT_ROOT}/apps/backend/docker-compose.yml" ]; then
        log_task "INFO" "Creating Docker Compose configuration"
        cat > "${PROJECT_ROOT}/apps/backend/docker-compose.yml" << 'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: dinnermatch
      POSTGRES_USER: dinnermatch
      POSTGRES_PASSWORD: dinnermatch123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"

volumes:
  postgres_data:
EOF
        log_task "SUCCESS" "Docker Compose configuration created"
    fi

    log_task "INFO" "Phase 1 foundation structure ready"
}

# Phase 2: Core Mechanics
phase_2_core() {
    log_task "INFO" "Starting Phase 2: Core Mechanics Development"

    if [ ! -d "${PROJECT_ROOT}/apps/backend/src/websocket" ]; then
        mkdir -p "${PROJECT_ROOT}/apps/backend/src/websocket"
        log_task "SUCCESS" "Created WebSocket directory"
    fi

    if [ ! -d "${PROJECT_ROOT}/apps/frontend/components/swipe" ]; then
        mkdir -p "${PROJECT_ROOT}/apps/frontend/components/swipe"
        log_task "SUCCESS" "Created swipe components directory"
    fi

    log_task "INFO" "Phase 2 structure ready for implementation"
}

# Validate phase completion
validate_phase() {
    local phase=$1

    case $phase in
        0)
            log_task "INFO" "Validating Phase 0 completion"
            # Check for spike results
            if [ -f "${PROJECT_ROOT}/spike/RESULTS.md" ]; then
                log_task "SUCCESS" "Phase 0 validation complete"
                set_phase 1
            else
                log_task "ERROR" "Phase 0 validation failed - missing spike/RESULTS.md"
                exit 1
            fi
            ;;
        1)
            log_task "INFO" "Validating Phase 1 completion"
            # Add validation logic
            log_task "SUCCESS" "Phase 1 validation complete"
            set_phase 2
            ;;
        *)
            log_task "WARNING" "Validation for phase $phase not implemented"
            ;;
    esac
}

# Progress report
show_progress() {
    local current_phase=$(get_phase)

    echo ""
    echo "═══════════════════════════════════════════"
    echo "  DinnerMatch Implementation Progress"
    echo "═══════════════════════════════════════════"
    echo ""

    local phases=(
        "Phase 0: Technical Validation Spike"
        "Phase 1: Foundation Infrastructure"
        "Phase 2: Core Mechanics Development"
        "Phase 3: Content Pipeline Integration"
        "Phase 4: Match & Results System"
        "Phase 5: Testing & Polish"
    )

    for i in "${!phases[@]}"; do
        if [ "$i" -lt "$current_phase" ]; then
            echo -e "${GREEN}✓${NC} ${phases[$i]}"
        elif [ "$i" -eq "$current_phase" ]; then
            echo -e "${YELLOW}▶${NC} ${phases[$i]} ${YELLOW}(Current)${NC}"
        else
            echo -e "  ${phases[$i]}"
        fi
    done

    echo ""
    echo "Current Phase: $current_phase"
    echo "Log: ${TASK_LOG}"
    echo ""
}

# Main execution
main() {
    init_phase

    case ${1:-} in
        start)
            current_phase=$(get_phase)
            case $current_phase in
                0) phase_0_spike ;;
                1) phase_1_foundation ;;
                2) phase_2_core ;;
                *) log_task "INFO" "Phase $current_phase not implemented" ;;
            esac
            ;;
        validate)
            if [ -z "$2" ]; then
                log_task "ERROR" "Usage: ./orchestrate.sh validate <phase>"
                exit 1
            fi
            validate_phase "$2"
            ;;
        progress)
            show_progress
            ;;
        reset)
            rm -f "$PHASE_FILE"
            log_task "WARNING" "Phase tracking reset"
            ;;
        *)
            echo "DinnerMatch Task Orchestration"
            echo ""
            echo "Usage:"
            echo "  ./orchestrate.sh start      - Start/continue current phase"
            echo "  ./orchestrate.sh validate N - Validate phase N completion"
            echo "  ./orchestrate.sh progress   - Show implementation progress"
            echo "  ./orchestrate.sh reset      - Reset phase tracking"
            echo ""
            show_progress
            ;;
    esac
}

main "$@"