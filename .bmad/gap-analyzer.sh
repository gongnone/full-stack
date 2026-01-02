#!/bin/bash
PROJECT_DIR="$1"
GOAL="$2"
APP_URL="$3"

BMAD_DIR="$PROJECT_DIR/.bmad"
GAPS_FILE="$BMAD_DIR/state/gaps.json"

while true; do
    echo "[$(date '+%H:%M:%S')] Analyzing gaps..."
    
    # Run analysis
    result=$(claude -p "
You are a QA analyst. Analyze the project and identify gaps.

GOAL: $GOAL
APP URL: $APP_URL

Check:
1. Missing features vs goal
2. Code quality issues
3. UI/UX problems
4. Bugs or errors

Output ONLY a JSON array:
[{\"type\": \"...\", \"severity\": \"critical|high|medium|low\", \"title\": \"...\"}]

If everything looks good, output: []
" --dangerously-skip-permissions 2>&1 || echo "[]")
    
    # Extract JSON
    echo "$result" | grep -Pzo '\[[\s\S]*?\]' | head -1 > "$GAPS_FILE.new" 2>/dev/null || echo "[]" > "$GAPS_FILE.new"
    
    if jq empty "$GAPS_FILE.new" 2>/dev/null; then
        mv "$GAPS_FILE.new" "$GAPS_FILE"
        echo "[$(date '+%H:%M:%S')] Found $(jq 'length' "$GAPS_FILE") gaps"
    else
        rm -f "$GAPS_FILE.new"
        echo "[$(date '+%H:%M:%S')] Analysis parse error"
    fi
    
    sleep 60
done
