#!/bin/bash
# Launch Claude Code with AI-powered auto-reviewer
# Usage: ./claude-with-reviewer.sh [timeout_seconds] [context_lines]

TIMEOUT="${1:-30}"          # Default 30 seconds before calling reviewer
CONTEXT="${2:-100}"         # Default 100 lines of context for reviewer
SESSION="claude"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
AUTO_REVIEWER="$SCRIPT_DIR/auto-reviewer.sh"

echo "╔═══════════════════════════════════════════════════════╗"
echo "║  Claude Code with AI Reviewer                         ║"
echo "╠═══════════════════════════════════════════════════════╣"
echo "║                                                       ║"
echo "║  How it works:                                        ║"
echo "║  1. You interact with Claude normally                 ║"
echo "║  2. If a prompt goes unanswered for ${TIMEOUT}s              ║"
echo "║  3. A reviewer Claude analyzes the context            ║"
echo "║  4. Reviewer decides: approve, deny, or custom input  ║"
echo "║                                                       ║"
echo "║  Manual responses always take priority!               ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Kill existing session if any
tmux kill-session -t "$SESSION" 2>/dev/null

# Create new tmux session
tmux new-session -d -s "$SESSION" -x 200 -y 50

# Start auto-reviewer in background
CLAUDE_TMUX_SESSION="$SESSION" \
CLAUDE_AUTO_TIMEOUT="$TIMEOUT" \
CLAUDE_CONTEXT_LINES="$CONTEXT" \
nohup "$AUTO_REVIEWER" > /tmp/claude-auto-reviewer.log 2>&1 &

AUTO_PID=$!
echo "Reviewer agent PID: $AUTO_PID"
echo "Log: /tmp/claude-auto-reviewer.log"
echo ""

# Start Claude in the tmux session
tmux send-keys -t "$SESSION" "claude" Enter

# Attach to session
echo "Attaching to tmux session... (Ctrl+B, D to detach)"
tmux attach -t "$SESSION"

# Cleanup when detached/exited
kill $AUTO_PID 2>/dev/null
echo ""
echo "Reviewer agent stopped"
