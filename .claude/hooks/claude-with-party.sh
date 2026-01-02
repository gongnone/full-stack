#!/bin/bash
# Launch Claude Code with BMAD Party Mode reviewer
# Usage: ./claude-with-party.sh [timeout_seconds] [context_lines]

TIMEOUT="${1:-45}"          # Default 45 seconds (party mode needs more time)
CONTEXT="${2:-150}"         # Default 150 lines for richer context
SESSION="claude"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PARTY_REVIEWER="$SCRIPT_DIR/party-reviewer.sh"

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Claude Code with BMAD Party Mode                         ║"
echo "╠═══════════════════════════════════════════════════════════╣"
echo "║                                                           ║"
echo "║  Review Team:                                             ║"
echo "║    🏗️  Architect  - Structure & patterns                   ║"
echo "║    👨‍💻 Senior Dev - Code quality & best practices          ║"
echo "║    🔒 Security   - Vulnerabilities & risks                ║"
echo "║    📋 PM         - Goal alignment & requirements          ║"
echo "║                                                           ║"
echo "║  How it works:                                            ║"
echo "║  1. You interact with Claude normally                     ║"
echo "║  2. If a prompt goes unanswered for ${TIMEOUT}s                  ║"
echo "║  3. Party mode conducts multi-agent review                ║"
echo "║  4. Sends SUBSTANTIVE response (not just y/n)             ║"
echo "║                                                           ║"
echo "║  Your manual responses always take priority!              ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Kill existing session if any
tmux kill-session -t "$SESSION" 2>/dev/null

# Kill stale reviewer processes
pkill -f "party-reviewer.sh" 2>/dev/null

# Create new tmux session
tmux new-session -d -s "$SESSION" -x 200 -y 50

# Bind 'e' key to run the Prompt Enhancer
tmux bind-key e run-shell "$SCRIPT_DIR/prompt-enhancer.sh"

# Enable mouse support (clickable selection, scrolling)
tmux set-option -t "$SESSION" mouse on

# Enable Vi-style keybindings
tmux set-window-option -g mode-keys vi
tmux set-option -g status-keys vi

# Clear previous log
echo "" > /tmp/claude-party-reviewer.log

# Start party reviewer in background
CLAUDE_TMUX_SESSION="$SESSION" \
CLAUDE_AUTO_TIMEOUT="$TIMEOUT" \
CLAUDE_CONTEXT_LINES="$CONTEXT" \
nohup "$PARTY_REVIEWER" > /tmp/claude-party-reviewer.log 2>&1 &

AUTO_PID=$!
echo "Party reviewer PID: $AUTO_PID"
echo "Log: /tmp/claude-party-reviewer.log"
echo ""

# Start Claude in the tmux session
tmux send-keys -t "$SESSION" "claude" Enter

# Attach to session
echo "Attaching to tmux session... (Ctrl+B, D to detach)"
tmux attach -t "$SESSION"

# Cleanup when detached/exited
kill $AUTO_PID 2>/dev/null
echo ""
echo "Party mode reviewer stopped"
