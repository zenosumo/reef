# Reef 🏝️

A unified workspace management system that creates and manages "twin" workspaces for project development.

## What is Reef?

Reef helps you organize your development workflow by creating parallel directory structures called "twins". You can seamlessly move files between your main project (BASE) and its twin workspace, with automatic symlink management.

**Key Concepts:**
- **BASE**: Your main project directory (e.g., `myproject/`)
- **TWIN**: Parallel directory with suffix (e.g., `myproject-reef/`)
- Files can be moved between BASE and TWIN with automatic symlinking

## Installation

### Quick Install
```bash
# Clone and install
git clone <repository-url> reef
cd reef
./install.sh
```

### Manual Install
```bash
# Copy to your local bin directory
cp reef ~/.local/bin/
chmod +x ~/.local/bin/reef

# Make sure ~/.local/bin is in your PATH
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

## Usage

### Core Commands

#### Move files to twin workspace
```bash
reef kick src/file.js        # Move file to twin, create symlink
reef kick -v src/directory/  # Verbose mode
```

#### Check workspace status
```bash
reef status                  # Show all BASE ↔ TWIN relationships
reef status --suffix=-exp    # Use custom suffix
```

#### Link all twin files to base
```bash
reef plug                    # Create symlinks for all twin files
```

#### Move files back from twin
```bash
reef recall src/file.js      # Move back from twin to base
```

#### Remove all twin symlinks
```bash
reef unplug                  # Remove all symlinks to twin
```

### Getting Help
```bash
reef --help              # Main help
reef kick --help         # Command-specific help
```

## How It Works

1. **Initialize**: Run `reef kick` on files you want to experiment with
2. **Work**: Files are moved to twin directory, symlinked back to base
3. **Status**: Use `reef status` to see current state
4. **Restore**: Use `reef recall` to bring files back to base
5. **Cleanup**: Use `reef unplug` to remove all twin connections

### Example Workflow

```bash
# Start with a regular project
ls myproject/
# → src/app.js  tests/  package.json

# Move experimental files to twin
cd myproject/
reef kick src/app.js

# Your project now has:
# myproject/src/app.js → symlink to myproject-reef/src/app.js
# myproject-reef/src/app.js → actual file

# Check what's linked
reef status
# → 🔗 src/app.js ←━● twin/src/app.js

# Work in either location - changes sync via symlink
# When ready, bring it back:
reef recall src/app.js
```

## Advanced Features

### Custom Twin Suffix
```bash
reef status --suffix=-experiment    # Use myproject-experiment/
reef kick --suffix=-dev file.js     # Move to myproject-dev/
```

### Batch Operations
```bash
reef kick src/              # Move entire directory
reef plug                   # Link everything in twin
reef unplug                 # Remove all twin links
```

### Output Modes
- **Default**: Clean visual symbols showing relationships
- **Verbose (`-v`)**: Detailed progress with status indicators

## Directory Structure

```
myproject/                  ← BASE directory
├── src/
│   ├── app.js → ../myproject-reef/src/app.js  ← symlink
│   └── utils.js
└── package.json

myproject-reef/            ← TWIN directory
└── src/
    └── app.js             ← actual file
```

## Requirements

- Bash 4.0+
- Unix-like system (Linux, macOS, WSL)
- Standard Unix tools (`ln`, `cp`, `mv`, `find`)

## Development

### Project Structure
- `reef` - Main unified command
- `legacy/` - Original individual scripts (for reference)
- `plan/` - Development planning documents
- `CLAUDE.md` - Development guidance for AI assistance

### Testing
```bash
# Syntax check
bash -n reef

# With shellcheck (if available)
shellcheck reef

# Manual testing
./reef --help
./reef status
```

## Migration from Legacy Scripts

If you were using the individual `reef-*` scripts:

**Old:** `reef-kick file.js` → **New:** `reef kick file.js`
**Old:** `reef-status` → **New:** `reef status`
**Old:** `reef-plug` → **New:** `reef plug`
**Old:** `reef-recall file.js` → **New:** `reef recall file.js`
**Old:** `reef-unplug` → **New:** `reef unplug`

The legacy scripts are preserved in `legacy/` directory.

## License

MIT License - See LICENSE file for details.