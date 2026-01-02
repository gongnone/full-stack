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
