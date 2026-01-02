#!/bin/bash
# Party-mode reviewer for Claude Code
# Uses multi-agent discussion to provide substantive responses

TMUX_SESSION="${CLAUDE_TMUX_SESSION:-claude}"
TIMEOUT_SECONDS="${CLAUDE_AUTO_TIMEOUT:-45}"
CONTEXT_LINES="${CLAUDE_CONTEXT_LINES:-150}"

# Patterns that indicate Claude is waiting for input
WAITING_PATTERNS=(
    "Allow"
    "Proceed?"
    "(y/n)"
    "[Y/n]"
    "Continue?"
    "permission"
    "Do you want"
    "Should I"
    "Would you like"
    "?"
)

log() {
    echo "[$(date '+%H:%M:%S')] $1"
}

check_for_prompt() {
    local content=$(tmux capture-pane -t "$TMUX_SESSION" -p -S -30 2>/dev/null)

    # Check if the last few lines contain a question/prompt
    local last_lines=$(echo "$content" | tail -10)

    for pattern in "${WAITING_PATTERNS[@]}"; do
        if echo "$last_lines" | grep -qi "$pattern"; then
            return 0
        fi
    done
    return 1
}

get_context() {
    tmux capture-pane -t "$TMUX_SESSION" -p -S -"$CONTEXT_LINES" 2>/dev/null
}

call_party_reviewer() {
    local context="$1"

    local prompt=$(cat <<'PROMPT_EOF'
You are a BMAD Party Mode session - an ADVERSARIAL review team focused on REACHING THE MVP GOAL.

YOUR MINDSET:
- We are building an MVP - progress over perfection
- Challenge anything that BLOCKS forward momentum
- Find ways to UNBLOCK, not create new blockers
- Manual testers will find issues later - that's their job
- Ship it, learn, iterate

YOUR AGENTS:
1. **Architect** - "Can we simplify this to move faster?"
2. **Senior Dev** - "What's the minimum viable solution?"
3. **Unlocker** - "How do we get past this blocker NOW?"
4. **PM** - "Does this get us closer to MVP? Then do it."

TASK: The worker Claude is waiting for a response. Keep the work MOVING FORWARD.

RULES:
1. BIAS TOWARD ACTION - approve unless truly dangerous
2. NEVER push to 'main' - we work on 'staging' branch only
3. Target environment for testing and deployment is 'staging'
4. Don't suggest "verify first" or "check status" - just proceed
5. If there's a choice, pick the faster path to MVP
6. Only block for: security vulnerabilities, data loss, breaking production
7. Output ONLY the final response - no meta-commentary

ANTI-PATTERNS TO AVOID:
- "Merge to main" - NO, use staging
- "First verify..." - NO, just do it
- "Check the CI status..." - NO, proceed and fix if broken

GOOD RESPONSES:
- "Yes, proceed. Merge to staging and deploy - we'll fix issues as testers find them"
- "Yes, run it. If tests fail on staging, we'll address specific failures"
- "Deploy to staging now. Faster feedback than more verification"
- "Use the simpler approach for staging - we can refactor post-MVP"
- "Skip that check, proceed with the implementation on staging"

CONVERSATION CONTEXT:
---
PROMPT_EOF
)

    prompt="${prompt}
${context}
---

PARTY MODE DISCUSSION (brief):
<architect>
How do we simplify and move forward?
</architect>
<senior_dev>
What's the minimum to get this done?
</senior_dev>
<unblocker>
What's stopping us? Remove it.
</unblocker>
<pm>
Does this ship the MVP? Then go.
</pm>

FINAL RESPONSE TO SEND (action-oriented, unblocking, no meta-text):"

    # Call Claude CLI
    local response=$(echo "$prompt" | claude -p 2>/dev/null)

    # Clean up - remove any leading/trailing whitespace and quotes
    response=$(echo "$response" | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')

    # Remove surrounding quotes if present
    response=$(echo "$response" | sed 's/^"//' | sed 's/"$//')

    # If response is empty or just whitespace, provide a default
    if [ -z "$response" ] || [ "$response" = '""' ]; then
        log "Empty response from party mode, using default"
        response="I need more context to provide a helpful response. Could you clarify what you're trying to accomplish?"
    fi

    echo "$response"
}

send_response() {
    local response="$1"
    log "Sending party-reviewed response:"
    log ">>> $response"

    # Send each character with tiny delay for reliability
    tmux send-keys -t "$TMUX_SESSION" -l "$response"

    sleep 0.3

    # Send Enter
    tmux send-keys -t "$TMUX_SESSION" C-m
}

main() {
    log "╔═══════════════════════════════════════════════════════╗"
    log "║  BMAD Party Mode Reviewer                             ║"
    log "╠═══════════════════════════════════════════════════════╣"
    log "║  Agents: Architect, Senior Dev, Security, PM          ║"
    log "║  Session: $TMUX_SESSION"
    log "║  Timeout: ${TIMEOUT_SECONDS}s before party review"
    log "║  Context: ${CONTEXT_LINES} lines"
    log "╚═══════════════════════════════════════════════════════╝"

    local waiting_since=0
    local last_prompt_hash=""

    while true; do
        if check_for_prompt; then
            # Get current prompt to check if it's the same one
            local current_context=$(get_context)
            local current_hash=$(echo "$current_context" | tail -20 | md5sum | cut -d' ' -f1)

            if [ "$current_hash" != "$last_prompt_hash" ]; then
                # New prompt detected
                waiting_since=$(date +%s)
                last_prompt_hash="$current_hash"
                log "New prompt detected, waiting ${TIMEOUT_SECONDS}s for manual response..."
            else
                local elapsed=$(($(date +%s) - waiting_since))
                if [ $elapsed -ge $TIMEOUT_SECONDS ]; then
                    log "Timeout reached, initiating party mode review..."

                    # Call party reviewer
                    local response=$(call_party_reviewer "$current_context")

                    # Send the substantive response
                    send_response "$response"

                    # Reset and update hash to avoid re-triggering on same prompt
                    waiting_since=0
                    last_prompt_hash=""
                    sleep 5  # Longer pause after party response
                fi
            fi
        else
            if [ $waiting_since -ne 0 ]; then
                log "Prompt cleared (manual response detected)"
            fi
            waiting_since=0
        fi

        sleep 1
    done
}

trap 'log "Party mode reviewer stopped"; exit 0' INT TERM

main
