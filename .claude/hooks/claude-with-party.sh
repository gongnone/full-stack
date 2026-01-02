#!/bin/bash
# Launch Claude Code with BMAD Party Mode reviewer
# Usage: ./claude-with-party.sh [timeout_seconds] [context_lines] [max_responses] [max_hours]

set -euo pipefail

TIMEOUT="${1:-45}"          # Default 45 seconds (party mode needs more time)
CONTEXT="${2:-150}"         # Default 150 lines for richer context
MAX_RESPONSES="${3:-100}"   # Default 100 responses max
MAX_HOURS="${4:-8}"         # Default 8 hours max runtime
CHECKPOINT_INTERVAL="${5:-10}"  # Default checkpoint every 10 responses
MAX_STUCK="${6:-5}"         # Default 5 attempts before stuck detection
SESSION="claude"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PARTY_REVIEWER="$SCRIPT_DIR/party-reviewer.sh"

# Validate party reviewer exists
if [[ ! -x "$PARTY_REVIEWER" ]]; then
    echo "ERROR: Party reviewer script not found or not executable: $PARTY_REVIEWER"
    exit 1
fi

echo "================================================================="
echo "  Claude Code with BMAD Party Mode"
echo "================================================================="
echo ""
echo "  Review Team:"
echo "    Architect  - Structure & patterns"
echo "    Senior Dev - Code quality & best practices"
echo "    Security   - Vulnerabilities & risks"
echo "    PM         - Goal alignment & requirements"
echo ""
echo "  Safety Limits:"
echo "    Timeout: ${TIMEOUT}s before auto-response"
echo "    Max responses: ${MAX_RESPONSES}"
echo "    Max runtime: ${MAX_HOURS}h"
echo "    Stuck threshold: ${MAX_STUCK} attempts"
echo ""
echo "  Logs & Checkpoints:"
echo "    Progress: ~/.claude-party-progress.log"
echo "    Checkpoints: ~/.claude-party-checkpoints/"
echo "    Health: ~/.claude-party-health"
echo ""
echo "  Your manual responses always take priority!"
echo ""
echo "================================================================="
echo ""

# Kill existing session if any
tmux kill-session -t "$SESSION" 2>/dev/null || true

# Kill stale reviewer processes
pkill -f "party-reviewer.sh" 2>/dev/null || true

# Create new tmux session
tmux new-session -d -s "$SESSION" -x 200 -y 50

# Bind 'e' key to run the Prompt Enhancer
if [[ -x "$SCRIPT_DIR/prompt-enhancer.sh" ]]; then
    tmux bind-key e run-shell "$SCRIPT_DIR/prompt-enhancer.sh"
fi

# Enable mouse support (clickable selection, scrolling)
tmux set-option -t "$SESSION" mouse on

# Enable Vi-style keybindings
tmux set-window-option -g mode-keys vi
tmux set-option -g status-keys vi

# Clear previous log
: > /tmp/claude-party-reviewer.log

# Start party reviewer in background
CLAUDE_TMUX_SESSION="$SESSION" \
CLAUDE_AUTO_TIMEOUT="$TIMEOUT" \
CLAUDE_CONTEXT_LINES="$CONTEXT" \
CLAUDE_MAX_RESPONSES="$MAX_RESPONSES" \
CLAUDE_MAX_RUNTIME="$MAX_HOURS" \
CLAUDE_CHECKPOINT_INTERVAL="$CHECKPOINT_INTERVAL" \
CLAUDE_MAX_STUCK="$MAX_STUCK" \
nohup "$PARTY_REVIEWER" > /tmp/claude-party-reviewer.log 2>&1 &

AUTO_PID=$!
echo "Party reviewer PID: $AUTO_PID"
echo "Log: /tmp/claude-party-reviewer.log"
echo "Health: ~/.claude-party-health"
echo ""

# Start Claude in the tmux session
tmux send-keys -t "$SESSION" "claude" Enter

# Attach to session
echo "Attaching to tmux session... (Ctrl+B, D to detach)"
tmux attach -t "$SESSION"

# Cleanup when detached/exited
kill "$AUTO_PID" 2>/dev/null || true
echo ""
echo "Party mode reviewer stopped"
