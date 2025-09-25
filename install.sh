#!/bin/bash
set -euo pipefail

# Install reef unified command to user's local bin directory
INSTALL_DIR="$HOME/.local/bin"

# Ensure install directory exists
mkdir -p "$INSTALL_DIR"

# Copy the unified reef command
cp reef "$INSTALL_DIR/"

# Make it executable
chmod +x "$INSTALL_DIR/reef"

echo "Reef command installed to $INSTALL_DIR/reef"
echo "Make sure $INSTALL_DIR is in your PATH"
echo ""
echo "Usage: reef <subcommand> [args...]"
echo "Run 'reef --help' for available commands"