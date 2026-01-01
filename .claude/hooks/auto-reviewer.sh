#!/bin/bash
# Auto-reviewer for Claude Code prompts
# Instead of blindly responding, calls a reviewer Claude to analyze and decide

TMUX_SESSION="${CLAUDE_TMUX_SESSION:-claude}"
TIMEOUT_SECONDS="${CLAUDE_AUTO_TIMEOUT:-30}"
CONTEXT_LINES="${CLAUDE_CONTEXT_LINES:-100}"

# Patterns that indicate Claude is waiting for input
WAITING_PATTERNS=(
    "Allow"
    "Proceed?"
    "(y/n)"
    "[Y/n]"
    "Continue?"
    "permission"
    "Do you want"
)

log() {
    echo "[$(date '+%H:%M:%S')] $1"
}

check_for_prompt() {
    local content=$(tmux capture-pane -t "$TMUX_SESSION" -p -S -20 2>/dev/null)

    for pattern in "${WAITING_PATTERNS[@]}"; do
        if echo "$content" | grep -qi "$pattern"; then
            return 0
        fi
    done
    return 1
}

get_context() {
    # Capture more context for the reviewer
    tmux capture-pane -t "$TMUX_SESSION" -p -S -"$CONTEXT_LINES" 2>/dev/null
}

call_reviewer() {
    local context="$1"

    # Build the reviewer prompt
    local prompt=$(cat <<'PROMPT_EOF'
You are a code review agent monitoring another Claude Code session.

TASK: Analyze the conversation below and decide how to respond to the pending prompt.

RULES:
1. If the action is safe and aligns with the user's goals → respond "y"
2. If the action is dangerous, destructive, or unclear → respond "n"
3. If the prompt needs specific input (not y/n), provide that input
4. Only output the exact response to send - no explanation

DANGEROUS ACTIONS (respond "n"):
- Deleting files outside the project
- Force pushing to main/master
- Running commands with sudo
- Modifying system files
- Exposing secrets or credentials
- Any destructive irreversible action

SAFE ACTIONS (respond "y"):
- Reading files
- Running tests
- Installing dependencies
- Git operations on feature branches
- Creating/editing project files
- Running build commands

CONVERSATION CONTEXT:
---
PROMPT_EOF
)

    prompt="${prompt}
${context}
---

Your response (just the input to send, nothing else):"

    # Call Claude CLI in non-interactive print mode
    local response=$(echo "$prompt" | claude -p 2>/dev/null)

    # Clean up response - take first line, trim whitespace
    response=$(echo "$response" | head -1 | tr -d '\n\r' | xargs)

    # Default to "n" if empty or error
    if [ -z "$response" ]; then
        log "Reviewer returned empty response, defaulting to 'n'"
        response="n"
    fi

    echo "$response"
}

send_response() {
    local response="$1"
    log "Sending reviewed response: $response"

    # Send the response text
    tmux send-keys -t "$TMUX_SESSION" "$response"

    # Small delay to ensure text is registered
    sleep 0.2

    # Send Enter using C-m (Ctrl+M = Enter/Return)
    tmux send-keys -t "$TMUX_SESSION" C-m
}

main() {
    log "╔════════════════════════════════════════════╗"
    log "║  Claude Auto-Reviewer Started              ║"
    log "╠════════════════════════════════════════════╣"
    log "║  Session: $TMUX_SESSION"
    log "║  Timeout: ${TIMEOUT_SECONDS}s before review"
    log "║  Context: ${CONTEXT_LINES} lines"
    log "╚════════════════════════════════════════════╝"

    local waiting_since=0

    while true; do
        if check_for_prompt; then
            if [ $waiting_since -eq 0 ]; then
                waiting_since=$(date +%s)
                log "Prompt detected, waiting ${TIMEOUT_SECONDS}s for manual response..."
            else
                local elapsed=$(($(date +%s) - waiting_since))
                if [ $elapsed -ge $TIMEOUT_SECONDS ]; then
                    log "Timeout reached, calling reviewer agent..."

                    # Get full context
                    local context=$(get_context)

                    # Call reviewer
                    local response=$(call_reviewer "$context")

                    # Send the reviewed response
                    send_response "$response"

                    waiting_since=0
                    sleep 3  # Longer pause after reviewed response
                fi
            fi
        else
            if [ $waiting_since -ne 0 ]; then
                log "Prompt cleared (manual response or dismissed)"
            fi
            waiting_since=0
        fi

        sleep 1
    done
}

trap 'log "Stopping auto-reviewer"; exit 0' INT TERM

main
