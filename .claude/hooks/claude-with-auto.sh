#!/bin/bash
# Launch Claude Code with auto-responder
# Usage: ./claude-with-auto.sh [timeout_seconds] [auto_response]

TIMEOUT="${1:-30}"      # Default 30 seconds
RESPONSE="${2:-y}"      # Default 'y' for yes
SESSION="claude"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
AUTO_RESPONDER="$SCRIPT_DIR/auto-responder.sh"

echo "╔════════════════════════════════════════════╗"
echo "║  Claude Code with Auto-Responder           ║"
echo "╠════════════════════════════════════════════╣"
echo "║  Timeout: ${TIMEOUT}s                              ║"
echo "║  Auto-response: ${RESPONSE}                           ║"
echo "║                                            ║"
echo "║  Respond manually to override auto-reply   ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Kill existing session if any
tmux kill-session -t "$SESSION" 2>/dev/null

# Create new tmux session with Claude Code
tmux new-session -d -s "$SESSION" -x 200 -y 50

# Start auto-responder in background
CLAUDE_TMUX_SESSION="$SESSION" \
CLAUDE_AUTO_TIMEOUT="$TIMEOUT" \
CLAUDE_AUTO_RESPONSE="$RESPONSE" \
nohup "$AUTO_RESPONDER" > /tmp/claude-auto-responder.log 2>&1 &

AUTO_PID=$!
echo "Auto-responder PID: $AUTO_PID (log: /tmp/claude-auto-responder.log)"

# Start Claude in the tmux session
tmux send-keys -t "$SESSION" "claude" Enter

# Attach to session
echo "Attaching to tmux session..."
tmux attach -t "$SESSION"

# Cleanup when detached/exited
kill $AUTO_PID 2>/dev/null
echo "Auto-responder stopped"
