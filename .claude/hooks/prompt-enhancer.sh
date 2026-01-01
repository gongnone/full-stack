#!/bin/bash
# Enhances the current input line in tmux using Claude
# Usage: triggered via tmux keybinding

TMUX_SESSION="${CLAUDE_TMUX_SESSION:-claude}"
MODEL="${CLAUDE_MODEL:-claude-3-haiku-20240307}" # Use Haiku for speed, or default if unset

# 1. Capture the current line (the user's draft)
# We look at the very last line of the pane
CURRENT_LINE=$(tmux capture-pane -t "$TMUX_SESSION" -p -S -1 | tail -n 1)

# Remove standard prompts like "> " or "claude>"
CLEAN_INPUT=$(echo "$CURRENT_LINE" | sed 's/^.*> //')

# If empty, do nothing
if [[ -z "$CLEAN_INPUT" || "$CLEAN_INPUT" =~ ^[[:space:]]*$ ]]; then
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
NEW_PROMPT=$(echo "$SYSTEM_PROMPT" | claude -p 2>/dev/null)

# Clean up output
NEW_PROMPT=$(echo "$NEW_PROMPT" | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//' | sed 's/^"//' | sed 's/"$//')

if [[ -n "$NEW_PROMPT" && "$NEW_PROMPT" != "$CLEAN_INPUT" ]]; then
    # 4. Replace the text in tmux
    # Send Backspaces (Ctrl+U usually kills the line, but let's be safe with Backspace if Ctrl+U fails in some shells)
    # Actually, Ctrl+U (Delete Line) is standard in bash/zsh
    tmux send-keys -t "$TMUX_SESSION" C-u
    
    # Type the new prompt
    tmux send-keys -t "$TMUX_SESSION" "$NEW_PROMPT"
fi
