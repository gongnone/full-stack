#!/bin/bash
# Party-mode reviewer for Claude Code
# Uses multi-agent discussion to provide substantive responses

set -euo pipefail

# =============================================================================
# Configuration
# =============================================================================

TMUX_SESSION="${CLAUDE_TMUX_SESSION:-claude}"
TIMEOUT_SECONDS="${CLAUDE_AUTO_TIMEOUT:-45}"
CONTEXT_LINES="${CLAUDE_CONTEXT_LINES:-150}"

# Cost/runtime controls
MAX_RESPONSES="${CLAUDE_MAX_RESPONSES:-100}"
MAX_RUNTIME_HOURS="${CLAUDE_MAX_RUNTIME:-8}"
CHECKPOINT_INTERVAL="${CLAUDE_CHECKPOINT_INTERVAL:-10}"
MAX_SAME_PROMPT_ATTEMPTS="${CLAUDE_MAX_STUCK:-5}"

# Paths
CHECKPOINT_DIR="${HOME}/.claude-party-checkpoints"
PROGRESS_LOG="${HOME}/.claude-party-progress.log"
HEALTH_FILE="${HOME}/.claude-party-health"
MAX_LOG_SIZE=$((10 * 1024 * 1024))  # 10MB

# State (global for access in save_checkpoint)
response_count=0
start_time=$(date +%s)
current_prompt_hash=""
same_prompt_count=0

# Patterns that indicate Claude is waiting for input (literal strings)
WAITING_PATTERNS=(
    "Allow"
    "Proceed?"
    "(y/n)"
    "[Y/n]"
    "[y/N]"
    "Continue?"
    "permission"
    "Do you want"
    "Should I"
    "Would you like"
    "May I"
    "Can I"
    "Want me to"
    "Ready to"
    "Approve"
)

# =============================================================================
# Utility Functions
# =============================================================================

log() {
    echo "[$(date '+%H:%M:%S')] $1"
}

log_progress() {
    local message="$1"
    mkdir -p "$(dirname "$PROGRESS_LOG")"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $message" >> "$PROGRESS_LOG"
}

rotate_log_if_needed() {
    if [[ -f "$PROGRESS_LOG" ]]; then
        local size
        size=$(stat -f%z "$PROGRESS_LOG" 2>/dev/null || stat -c%s "$PROGRESS_LOG" 2>/dev/null || echo 0)
        if [[ "$size" -gt "$MAX_LOG_SIZE" ]]; then
            mv "$PROGRESS_LOG" "${PROGRESS_LOG}.$(date +%Y%m%d%H%M%S).bak"
            log "Log rotated (was ${size} bytes)"
        fi
    fi
}

update_health() {
    cat > "$HEALTH_FILE" << EOF
{
    "pid": $$,
    "status": "running",
    "last_heartbeat": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "response_count": $response_count,
    "runtime_seconds": $(($(date +%s) - start_time)),
    "current_prompt_hash": "$current_prompt_hash"
}
EOF
}

save_checkpoint() {
    mkdir -p "$CHECKPOINT_DIR"
    local checkpoint_file="$CHECKPOINT_DIR/session-$(date +%Y%m%d).json"
    cat > "$checkpoint_file" << EOF
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "response_count": $response_count,
    "runtime_seconds": $(($(date +%s) - start_time)),
    "last_context_hash": "$current_prompt_hash"
}
EOF
    log "Checkpoint saved: $checkpoint_file"
}

auto_commit_wip() {
    # Only commit if there are changes and we're in a git repo
    if command -v git &>/dev/null && git rev-parse --git-dir &>/dev/null; then
        if ! git diff --quiet 2>/dev/null || ! git diff --cached --quiet 2>/dev/null; then
            local branch
            branch=$(git branch --show-current 2>/dev/null || echo "unknown")
            if [[ "$branch" == "stage" || "$branch" == "staging" ]]; then
                git add -A 2>/dev/null || true
                git commit -m "[WIP] Auto-checkpoint by party-mode (#$response_count responses)" 2>/dev/null || true
                log "Auto-committed WIP changes"
                log_progress "GIT: Auto-committed WIP at response #$response_count"
            fi
        fi
    fi
}

# =============================================================================
# Validation
# =============================================================================

validate_tmux_session() {
    if ! tmux has-session -t "$TMUX_SESSION" 2>/dev/null; then
        log "ERROR: tmux session '$TMUX_SESSION' does not exist"
        log_progress "ERROR: tmux session not found"
        exit 1
    fi
}

check_limits() {
    # Check response limit
    if [[ "$response_count" -ge "$MAX_RESPONSES" ]]; then
        log "MAX RESPONSES REACHED ($MAX_RESPONSES). Stopping."
        log_progress "STOPPED: Max responses limit reached ($response_count/$MAX_RESPONSES)"
        save_checkpoint
        exit 0
    fi

    # Check runtime limit
    local runtime_hours=$(( ($(date +%s) - start_time) / 3600 ))
    if [[ "$runtime_hours" -ge "$MAX_RUNTIME_HOURS" ]]; then
        log "MAX RUNTIME REACHED (${MAX_RUNTIME_HOURS}h). Stopping."
        log_progress "STOPPED: Max runtime limit reached (${runtime_hours}h/${MAX_RUNTIME_HOURS}h)"
        save_checkpoint
        exit 0
    fi
}

check_stuck() {
    if [[ "$same_prompt_count" -ge "$MAX_SAME_PROMPT_ATTEMPTS" ]]; then
        log "STUCK DETECTED: Same prompt $same_prompt_count times. Stopping."
        log_progress "STOPPED: Stuck on same prompt ($same_prompt_count attempts)"
        save_checkpoint
        exit 1
    fi
}

# =============================================================================
# Prompt Detection
# =============================================================================

check_for_prompt() {
    local content
    content=$(tmux capture-pane -t "$TMUX_SESSION" -p -S -30 2>/dev/null) || return 1

    # Check if the last few lines contain a question/prompt
    local last_lines
    last_lines=$(echo "$content" | tail -10)

    for pattern in "${WAITING_PATTERNS[@]}"; do
        # Use grep -F for literal string matching (no regex interpretation)
        if echo "$last_lines" | grep -qiF "$pattern"; then
            return 0
        fi
    done
    return 1
}

get_context() {
    tmux capture-pane -t "$TMUX_SESSION" -p -S -"$CONTEXT_LINES" 2>/dev/null || echo ""
}

# =============================================================================
# Party Mode Review
# =============================================================================

call_party_reviewer() {
    local context="$1"

    local prompt
    prompt=$(cat <<'PROMPT_EOF'
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
3. **Security** - "Any critical vulnerabilities? If not, proceed."
4. **PM** - "Does this get us closer to MVP? Then do it."

TASK: The worker Claude is waiting for a response. Keep the work MOVING FORWARD.

RULES:
1. BIAS TOWARD ACTION - approve unless truly dangerous
2. NEVER push to 'main' - we work on 'stage' branch only
3. Target environment for testing and deployment is 'stage'
4. Don't suggest "verify first" or "check status" - just proceed
5. If there's a choice, pick the faster path to MVP
6. Only block for: security vulnerabilities, data loss, breaking production
7. Output ONLY the final response - no meta-commentary
8. NEVER output the literal words "SKIP_RESPONSE" or "RETRY_RESPONSE"

ANTI-PATTERNS TO AVOID:
- "Merge to main" - NO, use stage
- "First verify..." - NO, just do it
- "Check the CI status..." - NO, proceed and fix if broken

GOOD RESPONSES:
- "Yes, proceed. Merge to stage and deploy - we'll fix issues as testers find them"
- "Yes, run it. If tests fail on stage, we'll address specific failures"
- "Deploy to stage now. Faster feedback than more verification"
- "Use the simpler approach for stage - we can refactor post-MVP"
- "Skip that check, proceed with the implementation on stage"

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
<security>
Any critical security risks? If not, proceed.
</security>
<pm>
Does this ship the MVP? Then go.
</pm>

FINAL RESPONSE TO SEND (action-oriented, unblocking, no meta-text):"

    # Create temp file with cleanup trap
    local error_file
    error_file=$(mktemp)
    trap 'rm -f "$error_file"' RETURN

    local response exit_code
    response=$(echo "$prompt" | claude -p 2>"$error_file") || exit_code=$?
    exit_code=${exit_code:-0}

    # Check for CLI errors
    if [[ "$exit_code" -ne 0 ]]; then
        local error_msg
        error_msg=$(cat "$error_file")
        log "Claude CLI failed (exit $exit_code): $error_msg"
        log_progress "ERROR: Claude CLI failed - $error_msg"

        # Check for specific error types
        if echo "$error_msg" | grep -qiE "rate.?limit|429"; then
            log "Rate limited. Waiting 60s before retry..."
            sleep 60
            echo "RETRY_RESPONSE"
            return
        elif echo "$error_msg" | grep -qiE "auth|unauthorized|401"; then
            log "Authentication error. Stopping."
            log_progress "STOPPED: Authentication error"
            save_checkpoint
            exit 1
        fi

        # Generic error - skip this prompt
        echo "SKIP_RESPONSE"
        return
    fi

    # Clean up - remove any leading/trailing whitespace and quotes
    response=$(echo "$response" | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')

    # Remove surrounding quotes if present
    response=$(echo "$response" | sed 's/^"//' | sed 's/"$//')

    # If response is empty or just whitespace, skip
    if [[ -z "$response" || "$response" == '""' ]]; then
        log "Empty response from party mode, skipping"
        echo "SKIP_RESPONSE"
        return
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

# =============================================================================
# Main Loop
# =============================================================================

main() {
    log "================================================================="
    log "  BMAD Party Mode Reviewer"
    log "================================================================="
    log "  Agents: Architect, Senior Dev, Security, PM"
    log "  Session: $TMUX_SESSION"
    log "  Timeout: ${TIMEOUT_SECONDS}s before party review"
    log "  Context: ${CONTEXT_LINES} lines"
    log "  Max responses: $MAX_RESPONSES"
    log "  Max runtime: ${MAX_RUNTIME_HOURS}h"
    log "  Stuck threshold: $MAX_SAME_PROMPT_ATTEMPTS attempts"
    log "================================================================="

    # Validate session exists
    validate_tmux_session

    # Rotate log if needed
    rotate_log_if_needed

    log_progress "STARTED: Party mode session"
    log_progress "Config: timeout=${TIMEOUT_SECONDS}s, max_responses=$MAX_RESPONSES, max_runtime=${MAX_RUNTIME_HOURS}h"

    local waiting_since=0
    local last_prompt_hash=""

    while true; do
        # Check limits before each iteration
        check_limits
        check_stuck

        # Update health file
        update_health

        if check_for_prompt; then
            # Get current prompt to check if it's the same one
            local current_context
            current_context=$(get_context)
            local new_hash
            new_hash=$(echo "$current_context" | tail -20 | md5sum | cut -d' ' -f1)

            if [[ "$new_hash" != "$last_prompt_hash" ]]; then
                # New prompt detected
                waiting_since=$(date +%s)
                last_prompt_hash="$new_hash"
                current_prompt_hash="$new_hash"
                same_prompt_count=0
                log "New prompt detected, waiting ${TIMEOUT_SECONDS}s for manual response..."
            else
                local elapsed=$(($(date +%s) - waiting_since))
                if [[ "$elapsed" -ge "$TIMEOUT_SECONDS" ]]; then
                    log "Timeout reached, initiating party mode review..."

                    # Call party reviewer
                    local response
                    response=$(call_party_reviewer "$current_context")

                    # Handle special responses (use unique strings unlikely to be real responses)
                    if [[ "$response" == "SKIP_RESPONSE" ]]; then
                        log "Skipping this prompt due to error"
                        ((same_prompt_count++))
                        # DON'T reset hash - we want to detect we're stuck on same prompt
                        waiting_since=$(date +%s)  # Reset timer to retry after timeout
                        sleep 5
                        continue
                    elif [[ "$response" == "RETRY_RESPONSE" ]]; then
                        log "Retrying after rate limit..."
                        # Don't increment same_prompt_count for rate limits
                        waiting_since=$(date +%s)
                        continue
                    fi

                    # Send the substantive response
                    send_response "$response"

                    # Increment counter and log
                    ((response_count++))
                    same_prompt_count=0  # Reset stuck counter on successful response
                    log "Response count: $response_count / $MAX_RESPONSES"
                    log_progress "RESPONSE #$response_count: ${response:0:100}..."

                    # Periodic checkpoint
                    if [[ $((response_count % CHECKPOINT_INTERVAL)) -eq 0 ]]; then
                        save_checkpoint
                        auto_commit_wip
                    fi

                    # Reset for next prompt
                    waiting_since=0
                    last_prompt_hash=""
                    current_prompt_hash=""
                    sleep 5  # Longer pause after party response
                fi
            fi
        else
            if [[ "$waiting_since" -ne 0 ]]; then
                log "Prompt cleared (manual response detected)"
            fi
            waiting_since=0
            same_prompt_count=0
        fi

        sleep 1
    done
}

# =============================================================================
# Cleanup & Entry
# =============================================================================

cleanup() {
    log "Party mode reviewer stopping..."
    log_progress "STOPPED: Manual interrupt or signal"
    save_checkpoint
    rm -f "$HEALTH_FILE"
    exit 0
}

trap cleanup INT TERM

main
