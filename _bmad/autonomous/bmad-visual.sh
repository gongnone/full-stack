#!/bin/bash
#
# BMAD Visual Runner - Watch autonomous development in tmux
#
# This creates a tmux session with multiple panes so you can watch:
# - Claude Code working
# - Live logs
# - Browser test results
# - Gap analysis
#
# Usage: ./bmad-visual.sh --goal "your goal" [options]
#

set -euo pipefail

# ==============================================================================
# Configuration
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(pwd)"
SESSION="bmad"
GOAL=""
APP_URL="http://localhost:3000"
MAX_CYCLES=50
TIMEOUT=300

# ==============================================================================
# Parse Arguments
# ==============================================================================

while [[ $# -gt 0 ]]; do
    case "$1" in
        --goal|-g)
            GOAL="$2"
            shift 2
            ;;
        --url|-u)
            APP_URL="$2"
            shift 2
            ;;
        --max-cycles|-m)
            MAX_CYCLES="$2"
            shift 2
            ;;
        --timeout|-t)
            TIMEOUT="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 --goal \"your goal\" [--url URL] [--max-cycles N] [--timeout SEC]"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

[[ -n "$GOAL" ]] || { echo "Error: --goal is required"; exit 1; }

# ==============================================================================
# Setup
# ==============================================================================

BMAD_DIR="$PROJECT_DIR/.bmad"
mkdir -p "$BMAD_DIR"/{logs,state}

# State files
STATE_FILE="$BMAD_DIR/state/current.json"
GAPS_FILE="$BMAD_DIR/state/gaps.json"
CYCLE_FILE="$BMAD_DIR/state/cycle"
CONTROL_FILE="$BMAD_DIR/control"

# Initialize
echo "[]" > "$GAPS_FILE"
echo "0" > "$CYCLE_FILE"
rm -f "$CONTROL_FILE"

# Kill existing session
tmux kill-session -t "$SESSION" 2>/dev/null || true

# ==============================================================================
# Create Development Loop Script
# ==============================================================================

cat > "$BMAD_DIR/dev-loop.sh" <<'DEVLOOP'
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
DEVLOOP

chmod +x "$BMAD_DIR/dev-loop.sh"

# ==============================================================================
# Create Gap Analyzer Script
# ==============================================================================

cat > "$BMAD_DIR/gap-analyzer.sh" <<'GAPANALYZER'
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
GAPANALYZER

chmod +x "$BMAD_DIR/gap-analyzer.sh"

# ==============================================================================
# Create Status Monitor Script  
# ==============================================================================

cat > "$BMAD_DIR/status-monitor.sh" <<'STATUSMONITOR'
#!/bin/bash
PROJECT_DIR="$1"
GOAL="$2"

BMAD_DIR="$PROJECT_DIR/.bmad"
GAPS_FILE="$BMAD_DIR/state/gaps.json"
CYCLE_FILE="$BMAD_DIR/state/cycle"
CONTROL_FILE="$BMAD_DIR/control"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

while true; do
    clear
    
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}           ${BLUE}BMAD Autonomous Development${NC}                    ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Cycle
    local cycle=$(cat "$CYCLE_FILE" 2>/dev/null || echo "0")
    echo -e "  ${GREEN}Cycle:${NC} $cycle"
    echo ""
    
    # Goal
    echo -e "  ${GREEN}Goal:${NC}"
    echo -e "  ${YELLOW}$GOAL${NC}"
    echo ""
    
    # Gaps
    echo -e "  ${GREEN}Gaps:${NC}"
    if [[ -f "$GAPS_FILE" ]]; then
        local gap_count=$(jq 'length' "$GAPS_FILE" 2>/dev/null || echo "0")
        if [[ "$gap_count" -eq 0 ]]; then
            echo -e "    ${GREEN}✓ None remaining${NC}"
        else
            jq -r '.[:5][] | "    [\(.severity)] \(.title // .type)"' "$GAPS_FILE" 2>/dev/null || echo "    Error reading gaps"
            if [[ "$gap_count" -gt 5 ]]; then
                echo -e "    ${YELLOW}... and $((gap_count - 5)) more${NC}"
            fi
        fi
    else
        echo "    Not analyzed yet"
    fi
    echo ""
    
    # Controls
    echo -e "  ${GREEN}Controls:${NC}"
    echo -e "    ${YELLOW}echo 'pause' > $CONTROL_FILE${NC}"
    echo -e "    ${YELLOW}echo 'stop' > $CONTROL_FILE${NC}"
    echo ""
    
    # Recent git commits
    echo -e "  ${GREEN}Recent Commits:${NC}"
    git log --oneline -5 2>/dev/null | sed 's/^/    /' || echo "    No commits yet"
    echo ""
    
    echo -e "${CYAN}────────────────────────────────────────────────────────────${NC}"
    echo -e "  Updated: $(date '+%H:%M:%S')  │  Ctrl+C to exit monitor"
    
    sleep 5
done
STATUSMONITOR

chmod +x "$BMAD_DIR/status-monitor.sh"

# ==============================================================================
# Create Tmux Session
# ==============================================================================

echo "🚀 Starting BMAD Visual Runner..."
echo ""
echo "Creating tmux session with:"
echo "  • Main pane: Claude Code development loop"
echo "  • Right pane: Status monitor"
echo "  • Bottom: Gap analyzer"
echo ""

# Create session with main dev loop
tmux new-session -d -s "$SESSION"

# Set TERM to avoid color issues
tmux send-keys -t "$SESSION" "export TERM=linux" Enter
tmux send-keys -t "$SESSION" "cd '$PROJECT_DIR'" Enter
tmux send-keys -t "$SESSION" "'$BMAD_DIR/dev-loop.sh' '$PROJECT_DIR' '$GOAL' '$APP_URL' '$MAX_CYCLES' '$TIMEOUT'" Enter

# Split right for status
tmux split-window -h -t "$SESSION"
tmux send-keys -t "$SESSION" "export TERM=linux" Enter
tmux send-keys -t "$SESSION" "'$BMAD_DIR/status-monitor.sh' '$PROJECT_DIR' '$GOAL'" Enter

# Split bottom for gap analyzer
tmux select-pane -t "$SESSION:0.0"
tmux split-window -v -t "$SESSION" -p 25
tmux send-keys -t "$SESSION" "export TERM=linux" Enter
tmux send-keys -t "$SESSION" "sleep 30 && '$BMAD_DIR/gap-analyzer.sh' '$PROJECT_DIR' '$GOAL' '$APP_URL'" Enter

# Set layout
tmux select-layout -t "$SESSION" main-vertical

# Select main pane
tmux select-pane -t "$SESSION:0.0"

echo "═══════════════════════════════════════════════════"
echo "  BMAD Visual Runner Started!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "  Controls (from any terminal):"
echo "    echo 'pause' > $CONTROL_FILE"
echo "    echo 'resume' > $CONTROL_FILE"
echo "    echo 'stop' > $CONTROL_FILE"
echo ""
echo "  Attach: tmux attach -t $SESSION"
echo "  Detach: Ctrl+B, D (keeps running)"
echo ""
echo "═══════════════════════════════════════════════════"
echo ""

# Attach
tmux attach -t "$SESSION"
