#!/bin/bash
# Party Mode Auto-Approve Hook for Claude Code
# Runs party-mode review on tool calls and auto-approves safe ones

set -euo pipefail

PROGRESS_LOG="${HOME}/.claude-party-progress.log"
MAX_RESPONSES="${CLAUDE_MAX_RESPONSES:-100}"
response_count=0

# Count existing responses today
if [[ -f "$PROGRESS_LOG" ]]; then
    response_count=$(grep -c "$(date +%Y-%m-%d)" "$PROGRESS_LOG" 2>/dev/null || echo 0)
fi

log_progress() {
    mkdir -p "$(dirname "$PROGRESS_LOG")"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$PROGRESS_LOG"
}

# Check if we've hit the limit
if [[ "$response_count" -ge "$MAX_RESPONSES" ]]; then
    log_progress "BLOCKED: Max responses reached ($response_count/$MAX_RESPONSES)"
    echo '{"decision": "deny", "reason": "Max auto-responses reached for today"}'
    exit 0
fi

# Read the tool call info from stdin
INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // "unknown"')
TOOL_INPUT=$(echo "$INPUT" | jq -r '.tool_input // {}')

# Dangerous patterns to block
DANGEROUS_PATTERNS=(
    "rm -rf /"
    "rm -rf /*"
    "> /dev/sda"
    "mkfs"
    ":(){:|:&};:"
    "dd if=/dev/zero"
    "chmod -R 777 /"
    "push.*main"
    "push.*master"
    "push --force"
    "push -f"
    "--no-verify"
    "DROP DATABASE"
    "DROP TABLE"
    "DELETE FROM.*WHERE 1"
)

# Check for dangerous commands in Bash tools
if [[ "$TOOL_NAME" == "Bash" ]]; then
    COMMAND=$(echo "$TOOL_INPUT" | jq -r '.command // ""')

    for pattern in "${DANGEROUS_PATTERNS[@]}"; do
        if echo "$COMMAND" | grep -qiE "$pattern"; then
            log_progress "BLOCKED: Dangerous command detected - $pattern in: $COMMAND"
            echo "{\"decision\": \"deny\", \"reason\": \"Blocked dangerous pattern: $pattern\"}"
            exit 0
        fi
    done

    # Block pushes to main/master
    if echo "$COMMAND" | grep -qE "git push.*(main|master)"; then
        log_progress "BLOCKED: Push to main/master - $COMMAND"
        echo '{"decision": "deny", "reason": "Cannot push to main/master. Use stage branch."}'
        exit 0
    fi
fi

# Log and approve
log_progress "APPROVED: $TOOL_NAME"

echo '{"decision": "approve"}'
exit 0
