#!/bin/bash
set -euo pipefail

GOAL="${1:?Usage: $0 \"goal\" [url]}"
APP_URL="${2:-http://localhost:3000}"
PROJECT_DIR="$(pwd)"
BMAD_DIR="$PROJECT_DIR/.bmad"
MAX_CYCLES=50
TIMEOUT=300

mkdir -p "$BMAD_DIR"/{logs,state}
echo "[]" > "$BMAD_DIR/state/gaps.json"

log() { echo "[$(date '+%H:%M:%S')] $*"; }

log "🚀 BMAD Simple Runner"
log "   Goal: $GOAL"
log "   URL: $APP_URL"
log "   Ctrl+C to stop"
echo ""

for cycle in $(seq 1 "$MAX_CYCLES"); do
    log "═══════════════════════════════════════════"
    log "🔄 CYCLE $cycle"
    log "═══════════════════════════════════════════"
    
    prompt="You are an autonomous developer following BMAD methodology.

PROJECT GOAL: $GOAL
APP URL: $APP_URL
CYCLE: $cycle

You have Chrome DevTools MCP available for browser testing.

INSTRUCTIONS:
1. If first cycle: Navigate to $APP_URL and explore the app
2. Test the functionality related to the goal
3. Identify bugs, issues, or missing features
4. Make real code changes to fix/implement
5. Briefly describe what you did

Focus on making actual progress. Write real code."

    log "🤖 Running Claude..."
    
    if timeout "$TIMEOUT" claude -p "$prompt" --dangerously-skip-permissions 2>&1; then
        log "✅ Claude completed"
    else
        log "⚠️  Claude timed out or failed"
    fi
    
    # Git commit if changes
    if ! git diff --quiet 2>/dev/null; then
        git add -A
        git commit -m "BMAD Cycle $cycle" 2>/dev/null || true
        log "📝 Committed changes"
    fi
    
    log ""
    read -t 5 -p "Continue? [Y/n/goal:new goal] " response || response="y"
    
    case "$response" in
        n|N) break ;;
        goal:*) GOAL="${response#goal:}"; log "🎯 New goal: $GOAL" ;;
    esac
    
    sleep 2
done

log "🏁 Done. Completed $cycle cycles."
