#!/bin/bash
set -euo pipefail

PROJECT_DIR="$1"
GOAL="$2"
APP_URL="$3"
MAX_CYCLES="$4"
TIMEOUT="$5"

BMAD_DIR="$PROJECT_DIR/.bmad"
GAPS_FILE="$BMAD_DIR/state/gaps.json"
CYCLE_FILE="$BMAD_DIR/state/cycle"
CONTROL_FILE="$BMAD_DIR/control"

log() {
    echo "[$(date '+%H:%M:%S')] $*"
}

check_control() {
    if [[ -f "$CONTROL_FILE" ]]; then
        local cmd=$(cat "$CONTROL_FILE")
        rm -f "$CONTROL_FILE"
        case "$cmd" in
            pause)
                log "⏸️  PAUSED - echo 'resume' > $CONTROL_FILE to continue"
                while [[ ! -f "$CONTROL_FILE" ]] || [[ "$(cat "$CONTROL_FILE")" != "resume" ]]; do
                    sleep 2
                done
                rm -f "$CONTROL_FILE"
                log "▶️  RESUMED"
                ;;
            stop)
                log "🛑 STOPPED"
                exit 0
                ;;
            skip)
                log "⏭️  SKIPPING"
                return 1
                ;;
        esac
    fi
    return 0
}

run_cycle() {
    local cycle=$1
    
    log "═══════════════════════════════════════════════════"
    log "🔄 CYCLE $cycle"
    log "═══════════════════════════════════════════════════"
    
    # Check for human intervention
    check_control || return 0
    
    # Get top gap or use goal
    local task="$GOAL"
    if [[ -f "$GAPS_FILE" ]] && [[ "$(jq 'length' "$GAPS_FILE")" -gt 0 ]]; then
        local top_gap=$(jq -r '.[0].title // .[0].type // empty' "$GAPS_FILE")
        if [[ -n "$top_gap" ]]; then
            task="Fix: $top_gap"
            log "📌 Working on: $top_gap"
        fi
    fi
    
    # Build prompt
    local prompt="You are an autonomous developer following BMAD methodology.

PROJECT GOAL: $GOAL

CURRENT TASK: $task

APP URL: $APP_URL

KNOWN GAPS:
$(cat "$GAPS_FILE" 2>/dev/null || echo "None yet")

INSTRUCTIONS:
1. Analyze what needs to be done
2. Make real code changes to fix/implement
3. If the app is running, test your changes work
4. Be thorough - complete the task fully
5. After coding, briefly describe what you did

Focus on making actual progress. Write real code."

    log "🤖 Running Claude..."
    
    # Run Claude Code
    if timeout "$TIMEOUT" claude -p "$prompt" --dangerously-skip-permissions 2>&1; then
        log "✅ Claude completed"
    else
        log "⚠️  Claude timed out or failed"
    fi
    
    check_control || return 0
    
    # Git commit if changes
    if ! git diff --quiet 2>/dev/null; then
        git add -A
        git commit -m "BMAD Cycle $cycle: $task" 2>/dev/null || true
        log "📝 Committed changes"
    else
        log "📝 No changes to commit"
    fi
    
    # Remove top gap if we worked on it
    if [[ -f "$GAPS_FILE" ]] && [[ "$(jq 'length' "$GAPS_FILE")" -gt 0 ]]; then
        jq '.[1:]' "$GAPS_FILE" > "$GAPS_FILE.tmp" && mv "$GAPS_FILE.tmp" "$GAPS_FILE"
    fi
    
    return 0
}

# Main loop
log "🚀 Starting BMAD Development Loop"
log "   Goal: $GOAL"
log "   URL: $APP_URL"
log "   Max Cycles: $MAX_CYCLES"
log ""
log "Controls:"
log "   echo 'pause' > $CONTROL_FILE"
log "   echo 'resume' > $CONTROL_FILE"
log "   echo 'stop' > $CONTROL_FILE"
log ""

for cycle in $(seq 1 "$MAX_CYCLES"); do
    echo "$cycle" > "$CYCLE_FILE"
    run_cycle "$cycle"
    
    # Check if gaps are empty (might be done)
    if [[ -f "$GAPS_FILE" ]] && [[ "$(jq 'length' "$GAPS_FILE")" -eq 0 ]]; then
        log "🎉 No more gaps! Running gap analysis..."
        
        # Quick gap check
        claude -p "Analyze if this goal is complete: $GOAL. List any remaining work as JSON array." \
            --dangerously-skip-permissions > "$GAPS_FILE.new" 2>&1 || true
        
        # Try to extract JSON
        if grep -Pzo '\[[\s\S]*\]' "$GAPS_FILE.new" > "$GAPS_FILE.parsed" 2>/dev/null; then
            if jq empty "$GAPS_FILE.parsed" 2>/dev/null; then
                mv "$GAPS_FILE.parsed" "$GAPS_FILE"
            fi
        fi
        rm -f "$GAPS_FILE.new" "$GAPS_FILE.parsed"
        
        if [[ "$(jq 'length' "$GAPS_FILE" 2>/dev/null)" -eq 0 ]]; then
            log "🎉 Goal appears complete!"
            break
        fi
    fi
    
    sleep 3
done

log "═══════════════════════════════════════════════════"
log "📊 DEVELOPMENT COMPLETE"
log "   Cycles: $cycle"
log "═══════════════════════════════════════════════════"
