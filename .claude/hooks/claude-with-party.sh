#!/bin/bash
#
# Launch Claude Code with BMAD Party Mode reviewer
#
# Usage: ./claude-with-party.sh [options]
#
# Options:
#   -t, --timeout SEC       Seconds before auto-response (default: 45)
#   -c, --context LINES     Context lines for reviewer (default: 150)
#   -r, --responses MAX     Maximum responses (default: 100)
#   -h, --hours MAX         Maximum runtime hours (default: 8)
#   -i, --interval NUM      Checkpoint interval (default: 10)
#   -s, --stuck NUM         Stuck detection threshold (default: 5)
#   --help                  Show this help message
#

set -euo pipefail

# ------------------------------------------------------------------------------
# Configuration
# ------------------------------------------------------------------------------

readonly SESSION="claude"
readonly LOG_DIR="${HOME}/.claude-party"
readonly LOG_FILE="/tmp/claude-party-reviewer.log"

# Defaults
TIMEOUT=45
CONTEXT=150
MAX_RESPONSES=100
MAX_HOURS=8
CHECKPOINT_INTERVAL=10
MAX_STUCK=5

# ------------------------------------------------------------------------------
# Functions
# ------------------------------------------------------------------------------

die() {
    echo "ERROR: $*" >&2
    exit 1
}

log() {
    echo "[$(date '+%H:%M:%S')] $*"
}

usage() {
    sed -n '3,14p' "$0" | sed 's/^#//' | sed 's/^ //'
    exit 0
}

cleanup() {
    local exit_code=$?
    
    log "Cleaning up..."
    
    # Kill background reviewer if running
    if [[ -n "${AUTO_PID:-}" ]] && kill -0 "$AUTO_PID" 2>/dev/null; then
        kill "$AUTO_PID" 2>/dev/null || true
        wait "$AUTO_PID" 2>/dev/null || true
        log "Party reviewer stopped (PID: $AUTO_PID)"
    fi
    
    # Kill any stale reviewer processes
    pkill -f "party-reviewer.sh" 2>/dev/null || true
    
    exit "$exit_code"
}

parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -t|--timeout)
                TIMEOUT="$2"
                shift 2
                ;;
            -c|--context)
                CONTEXT="$2"
                shift 2
                ;;
            -r|--responses)
                MAX_RESPONSES="$2"
                shift 2
                ;;
            -h|--hours)
                MAX_HOURS="$2"
                shift 2
                ;;
            -i|--interval)
                CHECKPOINT_INTERVAL="$2"
                shift 2
                ;;
            -s|--stuck)
                MAX_STUCK="$2"
                shift 2
                ;;
            --help)
                usage
                ;;
            -*)
                die "Unknown option: $1"
                ;;
            *)
                die "Unexpected argument: $1"
                ;;
        esac
    done
}

validate_dependencies() {
    command -v tmux &>/dev/null || die "tmux is not installed"
    command -v claude &>/dev/null || die "claude is not installed"
    
    [[ -x "$PARTY_REVIEWER" ]] || die "Party reviewer not found: $PARTY_REVIEWER"
}

kill_existing_session() {
    if tmux has-session -t "$SESSION" 2>/dev/null; then
        log "Killing existing session: $SESSION"
        tmux kill-session -t "$SESSION"
    fi
}

setup_directories() {
    mkdir -p "$LOG_DIR/checkpoints"
    : > "$LOG_FILE"
}

create_tmux_session() {
    # Create session
    tmux new-session -d -s "$SESSION" -x 200 -y 50
    
    # Session-specific settings
    tmux set-option -t "$SESSION" mouse on
    tmux set-option -t "$SESSION" status-keys vi
    tmux set-window-option -t "$SESSION" mode-keys vi
    
    # Optional prompt enhancer keybinding
    if [[ -x "$SCRIPT_DIR/prompt-enhancer.sh" ]]; then
        tmux bind-key -T prefix e run-shell "$SCRIPT_DIR/prompt-enhancer.sh"
    fi
}

start_reviewer() {
    export CLAUDE_TMUX_SESSION="$SESSION"
    export CLAUDE_AUTO_TIMEOUT="$TIMEOUT"
    export CLAUDE_CONTEXT_LINES="$CONTEXT"
    export CLAUDE_MAX_RESPONSES="$MAX_RESPONSES"
    export CLAUDE_MAX_RUNTIME="$MAX_HOURS"
    export CLAUDE_CHECKPOINT_INTERVAL="$CHECKPOINT_INTERVAL"
    export CLAUDE_MAX_STUCK="$MAX_STUCK"
    
    nohup "$PARTY_REVIEWER" > "$LOG_FILE" 2>&1 &
    AUTO_PID=$!
    
    # Brief pause to let reviewer initialize
    sleep 0.5
    
    # Verify it started
    if ! kill -0 "$AUTO_PID" 2>/dev/null; then
        die "Failed to start party reviewer. Check: $LOG_FILE"
    fi
    
    log "Party reviewer started (PID: $AUTO_PID)"
}

start_claude() {
    # Use TERM=linux to avoid terminal color query garbage
    tmux send-keys -t "$SESSION" "TERM=linux claude" Enter
}

print_banner() {
    cat <<'EOF'
=================================================================
  Claude Code with BMAD Party Mode
=================================================================

  Review Team:
    Architect  - Structure & patterns
    Senior Dev - Code quality & best practices
    Security   - Vulnerabilities & risks
    PM         - Goal alignment & requirements

EOF

    cat <<EOF
  Configuration:
    Timeout:       ${TIMEOUT}s
    Context:       ${CONTEXT} lines
    Max responses: ${MAX_RESPONSES}
    Max runtime:   ${MAX_HOURS}h
    Stuck limit:   ${MAX_STUCK} attempts

  Logs:
    Reviewer: $LOG_FILE
    Progress: $LOG_DIR/progress.log
    Health:   $LOG_DIR/health

  Controls:
    Ctrl+B, D     Detach (keeps running)
    Ctrl+B, E     Enhance prompt
    Your input    Always takes priority

=================================================================

EOF
}

# ------------------------------------------------------------------------------
# Main
# ------------------------------------------------------------------------------

main() {
    # Resolve script directory
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PARTY_REVIEWER="$SCRIPT_DIR/party-reviewer.sh"
    
    # Parse command-line arguments
    parse_args "$@"
    
    # Set up cleanup trap
    trap cleanup EXIT INT TERM
    
    # Validate environment
    validate_dependencies
    
    # Prepare environment
    kill_existing_session
    pkill -f "party-reviewer.sh" 2>/dev/null || true
    setup_directories
    
    # Display banner
    print_banner
    
    # Start services
    create_tmux_session
    start_reviewer
    start_claude
    
    # Attach to session (blocks until detach/exit)
    log "Attaching to tmux session..."
    echo ""
    tmux attach -t "$SESSION"
}

main "$@"