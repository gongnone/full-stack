#!/bin/bash
# Auto-responder for Claude Code prompts
# Monitors tmux session and auto-responds after timeout

TMUX_SESSION="${CLAUDE_TMUX_SESSION:-claude}"
TIMEOUT_SECONDS="${CLAUDE_AUTO_TIMEOUT:-30}"
DEFAULT_RESPONSE="${CLAUDE_AUTO_RESPONSE:-y}"

# Patterns that indicate Claude is waiting for input
WAITING_PATTERNS=(
    "Allow"
    "Proceed?"
    "(y/n)"
    "[Y/n]"
    "Continue?"
    "permission"
)

log() {
    echo "[$(date '+%H:%M:%S')] $1"
}

check_for_prompt() {
    # Capture last 20 lines of tmux pane
    local content=$(tmux capture-pane -t "$TMUX_SESSION" -p -S -20 2>/dev/null)

    for pattern in "${WAITING_PATTERNS[@]}"; do
        if echo "$content" | grep -qi "$pattern"; then
            return 0  # Found a prompt
        fi
    done
    return 1  # No prompt found
}

send_response() {
    log "Sending auto-response: $DEFAULT_RESPONSE"
    tmux send-keys -t "$TMUX_SESSION" "$DEFAULT_RESPONSE" Enter
}

main() {
    log "Auto-responder started"
    log "Session: $TMUX_SESSION | Timeout: ${TIMEOUT_SECONDS}s | Response: $DEFAULT_RESPONSE"

    local waiting_since=0

    while true; do
        if check_for_prompt; then
            if [ $waiting_since -eq 0 ]; then
                waiting_since=$(date +%s)
                log "Prompt detected, starting ${TIMEOUT_SECONDS}s countdown..."
            else
                local elapsed=$(($(date +%s) - waiting_since))
                if [ $elapsed -ge $TIMEOUT_SECONDS ]; then
                    send_response
                    waiting_since=0
                    sleep 2  # Pause after responding
                fi
            fi
        else
            if [ $waiting_since -ne 0 ]; then
                log "Prompt cleared (user responded or dismissed)"
            fi
            waiting_since=0
        fi

        sleep 1
    done
}

# Handle ctrl+c gracefully
trap 'log "Stopping auto-responder"; exit 0' INT TERM

main
