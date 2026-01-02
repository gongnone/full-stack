#!/bin/bash
#
# BMAD Autonomous Development Orchestrator
#
# An autonomous development system that:
# - Follows BMAD methodology (Analysis → Planning → Solutioning → Implementation)
# - Tests the application in a real browser
# - Finds gaps and continues development
# - Allows human intervention at any time
#
# Usage: ./bmad-orchestrator.sh [options]
#
# Options:
#   --goal "..."           Development goal/objective
#   --url URL              Application URL to test (default: http://localhost:3000)
#   --mode MODE            autonomous | supervised (default: supervised)
#   --max-cycles N         Maximum development cycles (default: 50)
#   --cycle-timeout SEC    Timeout per cycle (default: 600)
#   --help                 Show this help
#

set -euo pipefail

# ==============================================================================
# Configuration
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(pwd)"
BMAD_DIR="$PROJECT_DIR/.bmad-autonomous"
LOG_DIR="$BMAD_DIR/logs"
STATE_FILE="$BMAD_DIR/state.json"
GAPS_FILE="$BMAD_DIR/gaps.json"
CONTROL_FILE="$BMAD_DIR/control"
DASHBOARD_PORT=8787

# Defaults
GOAL=""
APP_URL="http://localhost:3000"
MODE="supervised"
MAX_CYCLES=50
CYCLE_TIMEOUT=600

# Runtime state
CYCLE=0
PHASE="init"
PAUSED=false

# ==============================================================================
# Utility Functions
# ==============================================================================

log() {
    local level="$1"
    shift
    local timestamp
    timestamp="$(date '+%Y-%m-%d %H:%M:%S')"
    echo "[$timestamp] [$level] $*" | tee -a "$LOG_DIR/orchestrator.log"
}

info() { log "INFO" "$@"; }
warn() { log "WARN" "$@"; }
error() { log "ERROR" "$@"; }

die() {
    error "$@"
    cleanup
    exit 1
}

# JSON helpers
json_get() {
    local file="$1" key="$2"
    jq -r ".$key // empty" "$file" 2>/dev/null || echo ""
}

json_set() {
    local file="$1" key="$2" value="$3"
    local tmp
    tmp=$(mktemp)
    jq ".$key = $value" "$file" > "$tmp" && mv "$tmp" "$file"
}

save_state() {
    cat > "$STATE_FILE" <<EOF
{
    "cycle": $CYCLE,
    "phase": "$PHASE",
    "goal": $(echo "$GOAL" | jq -R .),
    "mode": "$MODE",
    "paused": $PAUSED,
    "timestamp": "$(date -Iseconds)",
    "app_url": "$APP_URL"
}
EOF
}

load_state() {
    if [[ -f "$STATE_FILE" ]]; then
        CYCLE=$(json_get "$STATE_FILE" "cycle")
        PHASE=$(json_get "$STATE_FILE" "phase")
        PAUSED=$(json_get "$STATE_FILE" "paused")
        info "Resumed from cycle $CYCLE, phase $PHASE"
    fi
}

# ==============================================================================
# Control Interface (for intervention)
# ==============================================================================

check_control() {
    # Check for human intervention commands
    if [[ -f "$CONTROL_FILE" ]]; then
        local cmd
        cmd=$(cat "$CONTROL_FILE")
        rm -f "$CONTROL_FILE"
        
        case "$cmd" in
            pause)
                PAUSED=true
                info "⏸️  Paused by user"
                save_state
                ;;
            resume)
                PAUSED=false
                info "▶️  Resumed by user"
                save_state
                ;;
            stop)
                info "🛑 Stopped by user"
                cleanup
                exit 0
                ;;
            skip)
                info "⏭️  Skipping current task"
                return 1
                ;;
            *)
                if [[ "$cmd" == goal:* ]]; then
                    GOAL="${cmd#goal:}"
                    info "🎯 Goal updated: $GOAL"
                    save_state
                fi
                ;;
        esac
    fi
    
    # Wait while paused
    while $PAUSED; do
        sleep 2
        check_control
    done
    
    return 0
}

# ==============================================================================
# BMAD Agents (via Claude Code)
# ==============================================================================

run_agent() {
    local agent="$1"
    local prompt="$2"
    local output_file="$LOG_DIR/cycle-${CYCLE}-${agent}.md"
    
    info "🤖 Running $agent agent..."
    
    # Build the agent prompt with BMAD context
    local full_prompt
    full_prompt=$(cat <<EOF
You are the BMAD $agent agent. Follow BMAD methodology strictly.

PROJECT CONTEXT:
- Goal: $GOAL
- Current Phase: $PHASE
- Cycle: $CYCLE
- App URL: $APP_URL

CURRENT GAPS/ISSUES:
$(cat "$GAPS_FILE" 2>/dev/null || echo "None identified yet")

YOUR TASK:
$prompt

INSTRUCTIONS:
1. Analyze the current state
2. Plan your approach
3. Execute changes
4. Verify your work
5. Document what you did

Be thorough but focused. Make real, working changes.
EOF
)
    
    # Run Claude Code
    if timeout "$CYCLE_TIMEOUT" claude -p "$full_prompt" \
        --dangerously-skip-permissions \
        2>&1 | tee "$output_file"; then
        info "✅ $agent agent completed"
        return 0
    else
        warn "⚠️  $agent agent failed or timed out"
        return 1
    fi
}

# ==============================================================================
# Browser Testing (via Chrome DevTools MCP)
# ==============================================================================

run_browser_tests() {
    info "🌐 Running browser tests via Chrome DevTools MCP..."
    
    local results_file="$LOG_DIR/cycle-${CYCLE}-browser-results.json"
    
    # Use Claude with Chrome DevTools MCP to test the app
    local test_prompt
    test_prompt=$(cat <<EOF
You have Chrome DevTools MCP available. Test the application at: $APP_URL

TESTING INSTRUCTIONS:
1. Navigate to $APP_URL
2. Take a screenshot
3. Check for console errors
4. Look for broken UI elements
5. Test any interactive elements (buttons, forms, links)
6. Check for accessibility issues (missing alt text, labels, etc.)

After testing, output a JSON summary:
{
    "url": "$APP_URL",
    "status": "pass|fail",
    "screenshot_taken": true|false,
    "console_errors": [...],
    "gaps": [
        {
            "type": "bug|ux|accessibility|performance",
            "severity": "critical|high|medium|low",
            "title": "Short description",
            "details": "What you observed"
        }
    ]
}

Be thorough but concise. Only report real issues you observed.
EOF
)

    # Run Claude with MCP access
    local output
    if output=$(timeout "$CYCLE_TIMEOUT" claude -p "$test_prompt" 2>&1); then
        info "✅ Browser test completed"
        
        # Extract JSON from output
        echo "$output" | grep -Pzo '\{[\s\S]*"gaps"[\s\S]*\}' | head -1 > "$results_file" 2>/dev/null || true
        
        # Parse and merge gaps
        if [[ -f "$results_file" ]] && jq empty "$results_file" 2>/dev/null; then
            local new_gaps
            new_gaps=$(jq '.gaps // []' "$results_file")
            
            if [[ -f "$GAPS_FILE" ]]; then
                local existing
                existing=$(cat "$GAPS_FILE")
                echo "$existing" "$new_gaps" | jq -s 'add | unique_by(.type + (.title // .details | tostring))' > "$GAPS_FILE"
            else
                echo "$new_gaps" > "$GAPS_FILE"
            fi
            
            local gap_count
            gap_count=$(jq 'length' "$GAPS_FILE")
            info "📊 Total gaps: $gap_count"
        fi
    else
        warn "⚠️  Browser test timed out or failed"
    fi
}

# ==============================================================================
# Gap Analysis
# ==============================================================================

analyze_gaps() {
    info "🔍 Analyzing gaps..."
    
    local analysis_prompt
    analysis_prompt=$(cat <<EOF
Analyze the application and identify gaps between current state and the goal.

GOAL: $GOAL

BROWSER TEST RESULTS:
$(cat "$GAPS_FILE" 2>/dev/null || echo "No browser tests run yet")

CURRENT CODE STATE:
$(find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | head -20 | xargs wc -l 2>/dev/null || echo "No code files found")

INSTRUCTIONS:
1. List all missing features based on the goal
2. Identify bugs or issues from test results
3. Note UX/UI improvements needed
4. Prioritize by impact (critical > high > medium > low)

Output a JSON array of gaps:
[
  {
    "id": "gap-001",
    "type": "feature|bug|ux|performance",
    "severity": "critical|high|medium|low",
    "title": "Short description",
    "details": "Full details",
    "suggested_fix": "How to address this"
  }
]
EOF
)

    local output
    output=$(claude -p "$analysis_prompt" --dangerously-skip-permissions 2>&1)
    
    # Extract JSON from output
    echo "$output" | grep -Pzo '\[[\s\S]*\]' | head -1 > "$GAPS_FILE.new" 2>/dev/null || true
    
    if [[ -s "$GAPS_FILE.new" ]] && jq empty "$GAPS_FILE.new" 2>/dev/null; then
        mv "$GAPS_FILE.new" "$GAPS_FILE"
        info "✅ Gap analysis complete"
    else
        rm -f "$GAPS_FILE.new"
        warn "⚠️  Could not parse gap analysis"
    fi
}

# ==============================================================================
# Development Cycle
# ==============================================================================

run_cycle() {
    ((CYCLE++))
    save_state
    
    info "═══════════════════════════════════════════════════════════════"
    info "🔄 CYCLE $CYCLE"
    info "═══════════════════════════════════════════════════════════════"
    
    # Check for intervention
    check_control || return 0
    
    # Phase 1: Test current state
    PHASE="testing"
    save_state
    run_browser_tests
    check_control || return 0
    
    # Phase 2: Analyze gaps
    PHASE="analysis"
    save_state
    analyze_gaps
    check_control || return 0
    
    # Check if we have gaps to fix
    local gap_count
    gap_count=$(jq 'length' "$GAPS_FILE" 2>/dev/null || echo "0")
    
    if [[ "$gap_count" == "0" ]]; then
        info "🎉 No gaps found! Goal may be complete."
        return 1  # Signal completion
    fi
    
    # Get highest priority gap
    local top_gap
    top_gap=$(jq '.[0]' "$GAPS_FILE")
    local gap_title
    gap_title=$(echo "$top_gap" | jq -r '.title')
    local gap_type
    gap_type=$(echo "$top_gap" | jq -r '.type')
    
    info "📌 Working on: $gap_title ($gap_type)"
    
    # Phase 3: Plan (PM agent)
    PHASE="planning"
    save_state
    run_agent "PM" "Create a brief plan to address: $gap_title. Details: $top_gap"
    check_control || return 0
    
    # Phase 4: Implement (Developer agent)
    PHASE="implementation"
    save_state
    run_agent "Developer" "Implement the fix for: $gap_title. Details: $top_gap. Make real code changes."
    check_control || return 0
    
    # Phase 5: Verify
    PHASE="verification"
    save_state
    run_browser_tests
    
    # Remove fixed gap
    jq '.[1:]' "$GAPS_FILE" > "$GAPS_FILE.tmp" && mv "$GAPS_FILE.tmp" "$GAPS_FILE"
    
    # Git commit
    if ! git diff --quiet 2>/dev/null; then
        git add -A
        git commit -m "BMAD Cycle $CYCLE: $gap_title" || true
        info "📝 Committed changes"
    fi
    
    return 0
}

# ==============================================================================
# Dashboard Server
# ==============================================================================

start_dashboard() {
    info "🖥️  Starting dashboard on port $DASHBOARD_PORT..."
    
    # Simple status endpoint using netcat
    while true; do
        {
            echo "HTTP/1.1 200 OK"
            echo "Content-Type: application/json"
            echo "Access-Control-Allow-Origin: *"
            echo ""
            cat <<EOF
{
    "status": "$(if $PAUSED; then echo "paused"; else echo "running"; fi)",
    "cycle": $CYCLE,
    "phase": "$PHASE",
    "goal": $(echo "$GOAL" | jq -R .),
    "gaps": $(cat "$GAPS_FILE" 2>/dev/null || echo "[]"),
    "logs": $(tail -50 "$LOG_DIR/orchestrator.log" 2>/dev/null | jq -R . | jq -s .)
}
EOF
        } | nc -l -p "$DASHBOARD_PORT" -q 1 2>/dev/null || true
    done &
    
    DASHBOARD_PID=$!
}

# ==============================================================================
# CLI & Help
# ==============================================================================

usage() {
    sed -n '3,15p' "$0" | sed 's/^#//' | sed 's/^ //'
    exit 0
}

parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --goal)
                GOAL="$2"
                shift 2
                ;;
            --url)
                APP_URL="$2"
                shift 2
                ;;
            --mode)
                MODE="$2"
                shift 2
                ;;
            --max-cycles)
                MAX_CYCLES="$2"
                shift 2
                ;;
            --cycle-timeout)
                CYCLE_TIMEOUT="$2"
                shift 2
                ;;
            --help|-h)
                usage
                ;;
            *)
                die "Unknown option: $1"
                ;;
        esac
    done
    
    [[ -n "$GOAL" ]] || die "Goal is required. Use --goal \"your goal\""
}

# ==============================================================================
# Setup & Cleanup
# ==============================================================================

setup() {
    mkdir -p "$BMAD_DIR" "$LOG_DIR"
    
    # Initialize gaps file
    [[ -f "$GAPS_FILE" ]] || echo "[]" > "$GAPS_FILE"
    
    # Check dependencies
    command -v claude &>/dev/null || die "Claude Code is not installed"
    command -v jq &>/dev/null || die "jq is not installed (apt install jq)"
    command -v tmux &>/dev/null || die "tmux is not installed"
    
    # Load previous state if exists
    load_state
    
    info "🚀 BMAD Autonomous Development System"
    info "   Goal: $GOAL"
    info "   Mode: $MODE"
    info "   URL: $APP_URL"
    info "   Max Cycles: $MAX_CYCLES"
    info ""
    info "   Controls:"
    info "     echo 'pause' > $CONTROL_FILE    # Pause"
    info "     echo 'resume' > $CONTROL_FILE   # Resume"
    info "     echo 'stop' > $CONTROL_FILE     # Stop"
    info "     echo 'skip' > $CONTROL_FILE     # Skip current task"
    info ""
}

cleanup() {
    info "🧹 Cleaning up..."
    
    # Kill dashboard
    [[ -n "${DASHBOARD_PID:-}" ]] && kill "$DASHBOARD_PID" 2>/dev/null || true
    
    # Save final state
    save_state
    
    info "Final state saved to $STATE_FILE"
}

# ==============================================================================
# Main Loop
# ==============================================================================

main() {
    parse_args "$@"
    
    trap cleanup EXIT INT TERM
    
    setup
    start_dashboard
    
    info "Starting development cycles..."
    
    while [[ $CYCLE -lt $MAX_CYCLES ]]; do
        if ! run_cycle; then
            info "🎉 Development complete or stopped"
            break
        fi
        
        # Brief pause between cycles
        sleep 5
    done
    
    if [[ $CYCLE -ge $MAX_CYCLES ]]; then
        warn "⚠️  Reached maximum cycles ($MAX_CYCLES)"
    fi
    
    info "═══════════════════════════════════════════════════════════════"
    info "📊 SUMMARY"
    info "   Cycles completed: $CYCLE"
    info "   Final phase: $PHASE"
    info "   Remaining gaps: $(jq 'length' "$GAPS_FILE" 2>/dev/null || echo "unknown")"
    info "═══════════════════════════════════════════════════════════════"
}

main "$@"
