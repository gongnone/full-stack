#!/bin/bash
# Party Mode Auto-Approve Hook for Claude Code
# Auto-approves safe tool calls, blocks dangerous ones

set -euo pipefail

# Read the tool call info from stdin
INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // "unknown"')
TOOL_INPUT=$(echo "$INPUT" | jq -r '.tool_input // {}')

# Dangerous patterns to block
DANGEROUS_PATTERNS=(
    "rm -rf /"
    "rm -rf /\*"
    "> /dev/sda"
    "mkfs"
    ":\(\)\{:\|:&\};\:"
    "dd if=/dev/zero"
    "chmod -R 777 /"
    "DROP DATABASE"
    "DROP TABLE"
)

# Check for dangerous commands in Bash tools
if [[ "$TOOL_NAME" == "Bash" ]]; then
    COMMAND=$(echo "$TOOL_INPUT" | jq -r '.command // ""')

    # Block truly dangerous patterns
    for pattern in "${DANGEROUS_PATTERNS[@]}"; do
        if echo "$COMMAND" | grep -qF "$pattern"; then
            echo "{\"decision\": \"deny\", \"reason\": \"Blocked dangerous pattern: $pattern\"}"
            exit 0
        fi
    done

    # Block pushes to main/master
    if echo "$COMMAND" | grep -qE "git push.*(main|master)"; then
        echo '{"decision": "deny", "reason": "Cannot push to main/master. Use stage branch."}'
        exit 0
    fi

    # Block force push
    if echo "$COMMAND" | grep -qE "push.*(--force|-f)"; then
        echo '{"decision": "deny", "reason": "Force push blocked."}'
        exit 0
    fi
fi

# Approve everything else
echo '{"decision": "approve"}'
exit 0
