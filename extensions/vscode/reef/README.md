# Reef VSCode Extension

A unified workspace management system that creates and manages "twin" workspaces for project development. The Reef extension provides direct access to `reef` commands inside VSCode.

## Features

- **Reef: Status** - Display relationships between BASE and TWIN files
- **Reef: Kick Current File** - Move file/dir from BASE to TWIN, replace with symlink
- **Reef: Recall Current File** - Move file back from TWIN to BASE, remove symlink
- **Reef: Plug All** - Create symlinks in BASE for all TWIN contents
- **Reef: Unplug All** - Remove all symlinks in BASE pointing to TWIN

All commands are available via:
- Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
- Editor context menu (right-click) for Kick/Recall operations

## Requirements

- **reef CLI** must be installed and accessible in your PATH
- Install reef from the main reef project (see project repository)
- Tested on Linux, macOS, and WSL

## Extension Settings

This extension contributes the following settings:

- `reef.suffix`: Suffix for twin workspace directories (default: `-reef`)
- `reef.executablePath`: Path to reef executable (default: `reef` from PATH)

## Usage

### Check Twin Status
1. Open Command Palette
2. Run "Reef: Status"
3. View the output showing BASE ↔ TWIN relationships

### Kick a File to Twin
1. Open a file in the editor
2. Right-click in editor → "Reef: Kick Current File"
   OR use Command Palette → "Reef: Kick Current File"
3. File moves to twin workspace and is replaced with a symlink

### Recall a File from Twin
1. Open a file (symlink) in the editor
2. Right-click in editor → "Reef: Recall Current File"
   OR use Command Palette → "Reef: Recall Current File"
3. File moves back from twin to base workspace

### Plug All Twin Files
1. Open Command Palette
2. Run "Reef: Plug All"
3. All twin files are linked into the base workspace

### Unplug All Twin Symlinks
1. Open Command Palette
2. Run "Reef: Unplug All"
3. All symlinks pointing to twin are removed

## Key Concepts

- **BASE**: Main project directory (e.g., `myproject/`)
- **TWIN**: Parallel directory with suffix (e.g., `myproject-reef/`)
- Files can be moved between BASE and TWIN with automatic symlinking
- Allows experimentation in TWIN while maintaining clean BASE

## Known Issues

- Multi-root workspace support is not yet implemented
- Custom suffix must match across all reef operations

## Release Notes

### 0.0.1

Initial MVP release:
- Five core reef commands integrated
- Configuration for suffix and executable path
- Context menu integration for file operations
- Progress notifications for all operations
