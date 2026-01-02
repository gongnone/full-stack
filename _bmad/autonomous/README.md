# BMAD Autonomous Development System

An autonomous AI development system that follows the [BMAD methodology](https://github.com/bmadcode/BMAD-METHOD), tests your application, finds gaps, and continues development—all while letting you watch and intervene when needed.

## Quick Start

```bash
# 1. Copy to your project
cp -r bmad-autonomous/* ~/your-project/

# 2. Make scripts executable
chmod +x *.sh

# 3. Start autonomous development
./bmad-visual.sh --goal "Build a user authentication system with login, register, and password reset"
```

## What It Does

```
┌─────────────────────────────────────────────────────────────────┐
│                    BMAD Development Loop                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐  │
│   │ Analyze │ ──▶ │  Plan   │ ──▶ │  Code   │ ──▶ │  Test   │  │
│   └─────────┘     └─────────┘     └─────────┘     └─────────┘  │
│        ▲                                               │        │
│        │                                               │        │
│        └───────────────── Gaps ◀──────────────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Each cycle:
1. **Analyzes** the current state and identifies gaps
2. **Plans** the next piece of work (highest priority gap)
3. **Implements** real code changes via Claude Code
4. **Tests** the application (browser tests if URL provided)
5. **Commits** changes to git
6. **Repeats** until goal is complete or you intervene

## Scripts

### `bmad-visual.sh` (Recommended)
Visual tmux-based runner with multiple panes:
- Main pane: Claude Code working
- Right pane: Real-time status monitor
- Bottom pane: Gap analyzer

```bash
./bmad-visual.sh --goal "your goal" [options]

Options:
  --goal, -g      Development goal (required)
  --url, -u       App URL for testing (default: http://localhost:3000)
  --max-cycles    Max development cycles (default: 50)
  --timeout       Timeout per cycle in seconds (default: 300)
```

### `bmad-orchestrator.sh`
Full-featured orchestrator with browser testing:

```bash
./bmad-orchestrator.sh --goal "your goal" [options]

Options:
  --goal          Development goal (required)
  --url           App URL (default: http://localhost:3000)
  --mode          autonomous | supervised (default: supervised)
  --max-cycles    Max cycles (default: 50)
  --cycle-timeout Timeout per cycle (default: 600)
```

### `bmad-ctl.sh`
Control CLI for intervention:

```bash
./bmad-ctl.sh status      # Show current status
./bmad-ctl.sh pause       # Pause development
./bmad-ctl.sh resume      # Resume development
./bmad-ctl.sh stop        # Stop development
./bmad-ctl.sh skip        # Skip current task
./bmad-ctl.sh gaps        # Show current gaps
./bmad-ctl.sh logs        # Tail the logs
./bmad-ctl.sh intervene   # Drop into Claude Code manually
```

## Intervention

You can intervene at any time:

```bash
# Pause (from any terminal)
echo 'pause' > .bmad/control

# Resume
echo 'resume' > .bmad/control

# Stop completely
echo 'stop' > .bmad/control

# Skip current task
echo 'skip' > .bmad/control
```

Or just press `Ctrl+C` in the main pane and use Claude Code directly.

## Directory Structure

```
your-project/
├── .bmad/
│   ├── state/
│   │   ├── current.json    # Current state
│   │   ├── gaps.json       # Identified gaps
│   │   └── cycle           # Current cycle number
│   ├── logs/
│   │   └── ...             # Cycle logs, screenshots
│   ├── control             # Control commands
│   ├── dev-loop.sh         # Main development loop
│   ├── gap-analyzer.sh     # Gap analysis
│   └── status-monitor.sh   # Status display
├── bmad-visual.sh
├── bmad-orchestrator.sh
└── bmad-ctl.sh
```

## Example Session

```bash
# Start your app in one terminal
npm run dev

# Start BMAD in another
./bmad-visual.sh --goal "Add a dark mode toggle that persists user preference"

# Watch it work...
# When you want to step in:
echo 'pause' > .bmad/control

# Make your changes manually, then:
echo 'resume' > .bmad/control

# Or stop and review
echo 'stop' > .bmad/control
git log --oneline  # See what it did
```

## Requirements

- **Claude Code** (`claude` CLI) with Chrome DevTools MCP configured
- **tmux**
- **jq**
- **git**

Browser testing uses your existing Chrome DevTools MCP—no Playwright or Puppeteer needed.

## Tips

1. **Start small**: Test with a simple goal first
2. **Watch the first few cycles**: Get a feel for how it works
3. **Intervene early**: If it's going wrong, pause and redirect
4. **Use git branches**: Run on a feature branch so you can easily reset
5. **Provide good goals**: Specific, clear goals work best

## Safety

- All changes are git committed (easy rollback)
- `--dangerously-skip-permissions` is used (be aware of this)
- Set reasonable `--max-cycles` and `--timeout` limits
- Monitor via the status pane or `bmad-ctl.sh status`

## BMAD Methodology

This system implements the BMAD (Build More, Architect Dreams) methodology:

1. **Analysis** - Understand current state, identify gaps
2. **Planning** - Prioritize and plan next steps  
3. **Solutioning** - Design the approach
4. **Implementation** - Write code, test, commit

Each cycle tackles one gap/issue, commits, and moves on—true agile development.

## License

MIT
