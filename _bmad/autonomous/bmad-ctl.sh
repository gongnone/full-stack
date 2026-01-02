#!/bin/bash
#
# BMAD Control CLI - Intervene in autonomous development
#
# Usage: ./bmad-ctl.sh <command> [args]
#
# Commands:
#   status          Show current status
#   pause           Pause development
#   resume          Resume development
#   stop            Stop development
#   skip            Skip current task
#   goal "..."      Update the goal
#   gaps            Show current gaps
#   logs            Tail the logs
#   screenshot      Open latest screenshot
#   intervene       Drop into Claude Code manually
#   dashboard       Open web dashboard
#

set -euo pipefail

BMAD_DIR="${BMAD_DIR:-.bmad-autonomous}"
CONTROL_FILE="$BMAD_DIR/control"
STATE_FILE="$BMAD_DIR/state.json"
GAPS_FILE="$BMAD_DIR/gaps.json"
LOG_DIR="$BMAD_DIR/logs"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

cmd_status() {
    if [[ ! -f "$STATE_FILE" ]]; then
        echo -e "${RED}No active session found${NC}"
        exit 1
    fi
    
    local state
    state=$(cat "$STATE_FILE")
    
    local cycle phase goal paused
    cycle=$(echo "$state" | jq -r '.cycle')
    phase=$(echo "$state" | jq -r '.phase')
    goal=$(echo "$state" | jq -r '.goal')
    paused=$(echo "$state" | jq -r '.paused')
    
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  BMAD Autonomous Development Status${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
    echo ""
    
    if [[ "$paused" == "true" ]]; then
        echo -e "  Status:  ${YELLOW}⏸️  PAUSED${NC}"
    else
        echo -e "  Status:  ${GREEN}▶️  RUNNING${NC}"
    fi
    
    echo -e "  Cycle:   ${cycle}"
    echo -e "  Phase:   ${phase}"
    echo -e "  Goal:    ${goal}"
    echo ""
    
    local gap_count
    gap_count=$(jq 'length' "$GAPS_FILE" 2>/dev/null || echo "0")
    echo -e "  Gaps:    ${gap_count} remaining"
    echo ""
    
    if [[ "$gap_count" -gt 0 ]]; then
        echo -e "  ${YELLOW}Top 3 Gaps:${NC}"
        jq -r '.[:3][] | "    [\(.severity)] \(.title)"' "$GAPS_FILE" 2>/dev/null || true
        echo ""
    fi
    
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
    echo ""
}

cmd_pause() {
    echo "pause" > "$CONTROL_FILE"
    echo -e "${YELLOW}⏸️  Pause command sent${NC}"
}

cmd_resume() {
    echo "resume" > "$CONTROL_FILE"
    echo -e "${GREEN}▶️  Resume command sent${NC}"
}

cmd_stop() {
    echo "stop" > "$CONTROL_FILE"
    echo -e "${RED}🛑 Stop command sent${NC}"
}

cmd_skip() {
    echo "skip" > "$CONTROL_FILE"
    echo -e "${YELLOW}⏭️  Skip command sent${NC}"
}

cmd_goal() {
    local new_goal="$1"
    echo "goal:$new_goal" > "$CONTROL_FILE"
    echo -e "${GREEN}🎯 Goal update sent: $new_goal${NC}"
}

cmd_gaps() {
    if [[ ! -f "$GAPS_FILE" ]]; then
        echo "No gaps file found"
        exit 1
    fi
    
    echo ""
    echo -e "${BLUE}Current Gaps:${NC}"
    echo ""
    
    jq -r '.[] | "[\(.severity | ascii_upcase)] \(.title)\n    Type: \(.type)\n    \(.details)\n"' "$GAPS_FILE" 2>/dev/null || echo "No gaps"
}

cmd_logs() {
    if [[ ! -f "$LOG_DIR/orchestrator.log" ]]; then
        echo "No logs found"
        exit 1
    fi
    
    tail -f "$LOG_DIR/orchestrator.log"
}

cmd_screenshot() {
    local latest
    latest=$(ls -t "$LOG_DIR"/*screenshot*.png 2>/dev/null | head -1)
    
    if [[ -n "$latest" ]]; then
        echo "Opening: $latest"
        xdg-open "$latest" 2>/dev/null || open "$latest" 2>/dev/null || echo "Screenshot: $latest"
    else
        echo "No screenshots found"
    fi
}

cmd_intervene() {
    echo -e "${YELLOW}⏸️  Pausing and dropping into Claude Code...${NC}"
    echo "pause" > "$CONTROL_FILE"
    sleep 2
    
    cd "$(jq -r '.project_dir // "."' "$STATE_FILE" 2>/dev/null || echo ".")"
    
    echo ""
    echo "You are now in manual mode. The autonomous system is paused."
    echo "When done, exit Claude and run: ./bmad-ctl.sh resume"
    echo ""
    
    TERM=linux claude
}

cmd_dashboard() {
    local port
    port=$(jq -r '.dashboard_port // 8787' "$STATE_FILE" 2>/dev/null || echo "8787")
    
    echo "Opening dashboard at http://localhost:$port"
    xdg-open "http://localhost:$port" 2>/dev/null || open "http://localhost:$port" 2>/dev/null || echo "Dashboard: http://localhost:$port"
}

cmd_help() {
    sed -n '3,17p' "$0" | sed 's/^#//' | sed 's/^ //'
}

# Main
case "${1:-help}" in
    status)     cmd_status ;;
    pause)      cmd_pause ;;
    resume)     cmd_resume ;;
    stop)       cmd_stop ;;
    skip)       cmd_skip ;;
    goal)       cmd_goal "${2:-}" ;;
    gaps)       cmd_gaps ;;
    logs)       cmd_logs ;;
    screenshot) cmd_screenshot ;;
    intervene)  cmd_intervene ;;
    dashboard)  cmd_dashboard ;;
    help|--help|-h) cmd_help ;;
    *)
        echo "Unknown command: $1"
        cmd_help
        exit 1
        ;;
esac
