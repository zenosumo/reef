# Installation Guide - Reef VSCode Extension

## Prerequisites

1. **Install the reef CLI** (if not already installed)
   ```bash
   cd ../../  # Go to reef root directory
   ./install.sh
   ```

2. **Verify reef is in PATH**
   ```bash
   reef --help
   ```

## Development & Testing

### 1. Compile the Extension
```bash
cd extensions/vscode/reef
npm install
npm run compile
```

### 2. Test in VSCode
1. Open this extension folder in VSCode
2. Press `F5` to launch "Extension Development Host"
3. In the new VSCode window:
   - Open a workspace/folder
   - Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
   - Type "Reef" to see all available commands
   - Test the commands

## Creating a .vsix Package

### 1. Install vsce (VSCode Extension CLI)
```bash
npm install -g @vscode/vsce
```

### 2. Package the Extension
```bash
vsce package
```

This creates a `.vsix` file (e.g., `reef-0.0.1.vsix`)

## Installing the .vsix

### Method 1: Command Line
```bash
code --install-extension reef-0.0.1.vsix
```

### Method 2: VSCode UI
1. Open VSCode
2. Go to Extensions view (`Cmd+Shift+X` / `Ctrl+Shift+X`)
3. Click "..." (Views and More Actions) → "Install from VSIX..."
4. Select the `reef-0.0.1.vsix` file

## Uninstalling

```bash
code --uninstall-extension reef
```

Or via VSCode Extensions view → right-click "Reef" → Uninstall

## Configuration

After installation, configure the extension:

1. Open VSCode Settings (`Cmd+,` / `Ctrl+,`)
2. Search for "reef"
3. Configure:
   - **Reef: Suffix** (default: `-reef`)
   - **Reef: Executable Path** (default: `reef`)

## Troubleshooting

### "reef command not found"
- Ensure reef CLI is installed: `which reef`
- If using custom path, set `reef.executablePath` in settings

### "No workspace folder is open"
- Reef commands require an open workspace
- Use File → Open Folder to open a project

### Commands not appearing
- Reload VSCode window: `Cmd+Shift+P` → "Developer: Reload Window"
- Check extension is enabled in Extensions view

## Next Steps

Try the commands:
1. **Reef: Status** - Check current twin relationships
2. **Reef: Kick Current File** - Move a file to twin workspace
3. **Reef: Recall Current File** - Move a file back
4. **Reef: Plug All** - Link all twin files
5. **Reef: Unplug All** - Remove all twin symlinks
