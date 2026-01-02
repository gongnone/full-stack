#!/bin/bash
# Enhances the current input line in tmux using Claude
# Usage: triggered via tmux keybinding

exec > /tmp/enhancer.log 2>&1
echo "Enhancer triggered at $(date)"

TMUX_SESSION="${CLAUDE_TMUX_SESSION:-claude}"
MODEL="${CLAUDE_MODEL:-claude-3-haiku-20240307}" # Use Haiku for speed, or default if unset

# 1. Capture the entire pane and find the last line containing a prompt
# We look for lines with >, ❯, or 'claude'
CURRENT_LINE=$(tmux capture-pane -t "$TMUX_SESSION" -p | grep -E '>|❯|claude' | tail -n 1)
echo "Captured line (prompt-search): '$CURRENT_LINE'"

# Remove standard prompts like "> " or "claude>" or just ">"
CLEAN_INPUT=$(echo "$CURRENT_LINE" | sed 's/^[[:space:]]*>//' | sed 's/^[[:space:]]*//')
echo "Clean input: '$CLEAN_INPUT'"

# If empty, do nothing
if [[ -z "$CLEAN_INPUT" || "$CLEAN_INPUT" =~ ^[[:space:]]*$ ]]; then
    echo "Input empty, exiting"
    exit 0
fi

# 2. Define the Agent for Enhancement
SYSTEM_PROMPT="You are an expert Prompt Engineer for an AI Coding Agent.
Your goal is to rewrite the user's raw, short input into a precise, high-quality instruction.

RULES:
- Preserve the user's intent perfectly.
- Add necessary context (e.g., 'fix the bug' -> 'Analyze the stack trace, identify the root cause, and implement a fix').
- Be concise but specific.
- Do not add conversational fluff ('Here is the prompt').
- Output ONLY the new prompt text.

Input: '$CLEAN_INPUT'
Optimized Prompt:"

# 3. Call Claude to rewrite it
# We use -p for print mode
echo "Calling Claude..."
NEW_PROMPT=$(echo "$SYSTEM_PROMPT" | claude -p 2>/dev/null)
echo "Claude response: '$NEW_PROMPT'"

# Clean up output
NEW_PROMPT=$(echo "$NEW_PROMPT" | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//' | sed 's/^"//' | sed 's/"$//')

if [[ -n "$NEW_PROMPT" && "$NEW_PROMPT" != "$CLEAN_INPUT" ]]; then
    echo "Replacing prompt..."
    # 4. Replace the text in tmux
    # Claude Code doesn't respond to Ctrl+U, so we send backspaces
    INPUT_LEN=${#CLEAN_INPUT}
    echo "Clearing $INPUT_LEN characters..."

    # Send backspaces to clear the current input
    for ((i=0; i<INPUT_LEN; i++)); do
        tmux send-keys -t "$TMUX_SESSION" BSpace
    done

    # Small delay to let the UI catch up
    sleep 0.1

    # Type the new prompt
    tmux send-keys -t "$TMUX_SESSION" "$NEW_PROMPT"
    echo "Done."
else
    echo "No change needed."
fi
