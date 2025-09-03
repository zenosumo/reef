# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Reef is a workspace management system that creates and manages "twin" workspaces for project development. It maintains a parallel directory structure (the "twin") alongside the main project directory (the "base"), with seamless file linking and movement between them.

Key concepts:
- **BASE**: Main project directory (e.g., `myproject/`)
- **TWIN**: Parallel directory with suffix (default: `myproject-reef/`)
- Files can be moved between BASE and TWIN with automatic symlinking

## Core Scripts

1. **reef-kick**: Move file/dir from BASE to TWIN, replace with symlink
2. **reef-status**: Display relationships between BASE and TWIN files
3. **reef-recall**: Move file back from TWIN to BASE, remove symlink
4. **reef-plug**: Create symlinks in BASE for all TWIN contents
5. **reef-unplug**: Remove all symlinks in BASE pointing to TWIN

## Development Commands

### Testing Scripts
```bash
# Test reef-kick (move file to twin)
./reef-kick src/example.js
./reef-kick -v config/  # verbose mode

# Check status
./reef-status
./reef-status --suffix=-experiment  # custom suffix

# Test reef-plug (link all twin files)
./reef-plug

# Test reef-recall (move back to base)
./reef-recall src/example.js

# Test reef-unplug (remove all twin links)
./reef-unplug
```

### Script Validation
```bash
# Check bash syntax
bash -n reef-*

# Test with shellcheck (if installed)
shellcheck reef-*
```

## Architecture & Conventions

### Shared Patterns
All scripts follow consistent patterns that must be maintained:

1. **TTY Detection**: Color/symbol output with fallback
   - Check `[ -t 1 ]` for TTY
   - Define both Unicode symbols and plain text alternatives
   - Variables: `ARROW_RX` (→), `ARROW_LX` (←), `OK` (✓), `ERR` (✗), `DOT` (●)

2. **_realpath Function**: Portable path resolution
   - Must work on macOS/BSD and Linux
   - Handle non-existent paths gracefully
   - Located in each script for independence

3. **BASE/TWIN Detection Logic**: 
   - Check if CWD ends with suffix AND base exists → we're in TWIN
   - Otherwise assume we're in BASE
   - Never allow BASE == TWIN

4. **Printf Format**: Use separate arguments, not embedded variables
   ```bash
   # Correct
   printf "%s%s%s text\n" "$RED" "$ERR" "$RESET"
   # Wrong
   printf "${RED}${ERR}${RESET} text\n"
   ```

### Error Handling
- Always check file existence and permissions before operations
- Provide rollback for move operations (reef-kick, reef-recall)
- Use clear error messages with context
- Exit codes: 0 (success), 1 (operation error), 2 (usage error)

### Output Modes
- **Verbose** (`-v`/`--verbose`): Multi-line detailed output
- **Concise** (default): Single-line status-like output
- reef-kick concise format: `🔗 <file> ◀━━━● <twin>/<file>`

## Important Implementation Details

### Shell Settings
- All scripts use `set -u` (error on undefined variables)
- reef-kick uses `set -euo pipefail` for stricter error handling
- Handle `dotglob` and `nullglob` with proper restoration

### Symlink Handling
- Always resolve symlink targets for comparison
- Handle both absolute and relative symlinks
- Check if symlinks point to correct twin before operations

### Directory Creation
- reef-kick interactively offers to create twin if missing
- Other scripts gracefully handle missing twin directories
- Always use `mkdir -p` for parent directory creation

## Common Modifications

### Adding New Variables
When adding variables like `ARROW_LX`, update both TTY and non-TTY blocks:
```bash
if [ "$is_tty" -eq 1 ]; then
  ARROW_LX="←"
else
  ARROW_LX="<-"
fi
```

### Modifying Output Format
- Maintain consistency across all scripts
- Update both verbose and concise output modes
- Keep visual alignment in reef-status output

### Adding New Scripts
New scripts should:
1. Include portable `_realpath` function
2. Implement TTY detection for colors/symbols
3. Use consistent BASE/TWIN detection logic
4. Support `--suffix=` parameter
5. Provide `--help` output
6. Follow existing error handling patterns