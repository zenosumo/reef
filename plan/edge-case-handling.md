# Edge Case Handling & Broken Link Recovery Plan

## Overview
This document outlines comprehensive enhancements to handle edge cases when twin folders are moved between same-level and `~/.reef/` locations, and provides robust broken link recovery mechanisms.

## Problem Analysis

### Current Issues
1. **Twin Migration**: When users manually move twins from same-level to `~/.reef/` (or vice versa), symlinks break
2. **Broken Link Detection**: Commands fail or behave unpredictably with broken symlinks
3. **No Recovery Mechanism**: No way to "heal" a workspace after twin migration
4. **Inconsistent Handling**: Different commands handle broken links differently

### Edge Cases to Handle
1. **Twin folder moved**: `project-reef/` → `~/.reef/project-reef/`
2. **Partial migration**: Some files in original location, some in new location
3. **Broken symlinks with existing files**: Link points to old location but file exists in new location
4. **Mixed scenarios**: Some links healthy, some broken but healable, some truly broken
5. **Permission issues**: Twin locations with different permission settings
6. **Non-existent files**: Links point to files that don't exist in either location

## Implementation Plan

### 1. Enhanced Twin Detection Functions

#### `find_twin_in_all_locations(base_path)`
```bash
# Smart twin discovery that checks all possible locations
# Returns the actual twin path where files exist, or empty if none found
find_twin_in_all_locations() {
  local base_path="$1"
  local project_name="$(basename "$base_path")"
  local suffix="${SUFFIX}"
  
  # Check same-level first (current behavior)
  local same_level="${base_path}${suffix}"
  if [[ -d "$same_level" ]]; then
    echo "$same_level"
    return 0
  fi
  
  # Check ~/.reef/ location
  local reef_home="${HOME}/.reef"
  local alt_location="${reef_home}/${project_name}${suffix}"
  if [[ -d "$alt_location" ]]; then
    echo "$(_realpath "$alt_location")"
    return 0
  fi
  
  # Return empty if not found
  return 1
}
```

#### `resolve_twin_target(broken_symlink)`
```bash
# Given a broken symlink, find where the target file actually exists
# Searches both twin locations for the file
resolve_twin_target() {
  local symlink="$1"
  local link_target="$(readlink "$symlink" 2>/dev/null || true)"
  [[ -n "$link_target" ]] || return 1
  
  # Extract relative path within twin
  local rel_path=""
  case "$link_target" in
    */.*-reef/*)
      rel_path="${link_target##*/.*-reef/}"
      ;;
    *-reef/*)
      rel_path="${link_target##*-reef/}"
      ;;
    *)
      return 1
      ;;
  esac
  
  # Search in all possible twin locations
  local project_name="$(basename "$BASE")"
  local twin_locations=(
    "${BASE}${SUFFIX}"
    "${HOME}/.reef/${project_name}${SUFFIX}"
  )
  
  for twin_path in "${twin_locations[@]}"; do
    local candidate="${twin_path}/${rel_path}"
    if [[ -e "$candidate" ]]; then
      echo "$candidate"
      return 0
    fi
  done
  
  return 1
}
```

### 2. New `heal` Command

#### Purpose
- Scan workspace for broken symlinks
- Attempt to find files in alternative twin locations  
- Unplug broken links and re-plug from correct location
- Report healing actions taken

#### Implementation
```bash
cmd_heal() {
  # Parse arguments (verbose, help)
  # Scan BASE for broken symlinks
  # For each broken symlink:
  #   - Use resolve_twin_target() to find actual file
  #   - If found: unplug broken link, plug from correct location
  #   - If not found: report as truly broken
  # Summary of actions taken
}
```

#### Output Examples
```
# Verbose mode
✓ config.json (healed: found in ~/.reef/project-reef/)
✓ src/utils.js (healed: found in ~/.reef/project-reef/)
✗ old-file.txt (broken: file not found in any twin location)

Healed 2 link(s), 1 remains broken.

# Concise mode  
🔗 config.json ●━━━▶ 📄 config.json
🔗 src/utils.js ●━━━▶ 📄 src/utils.js
💀 old-file.txt
```

### 3. Enhanced Command Behaviors

#### `status` Command Enhancements
- **Silent Detection**: Automatically detect twin location mismatches
- **Categorization**: 
  - `linked`: Healthy symlinks
  - `healable`: Broken symlinks with files in alternative location
  - `broken`: Truly broken symlinks (file doesn't exist anywhere)
  - `unlinked`: Files in twin not linked to base

```bash
# Enhanced categories
local healable_dirs=()
local healable_files=()

# Detection logic in status scanning
if [[ -L "$item" && ! -e "$abs_target" ]]; then
  # Check if file exists in alternative location
  local actual_target="$(resolve_twin_target "$item")"
  if [[ -n "$actual_target" ]]; then
    # Healable broken link
    if [[ -d "$actual_target" ]]; then
      healable_dirs+=("$name")
    else  
      healable_files+=("$name")
    fi
  else
    # Truly broken link
    if [[ -d "$item" ]] 2>/dev/null; then
      broken_dirs+=("$name")
    else
      broken_files+=("$name")
    fi
  fi
fi
```

#### `unplug` Command Enhancements
- **Smart Removal**: For broken links that have files in alternative twin location
- **Behavior**: Remove broken symlink, leave real file in place (silent recovery)
- **Maintains**: Current behavior for truly broken links

```bash
# Enhanced unplug logic
if [[ ! -e "$resolved_target" ]]; then
  # Check if file exists in alternative location
  local actual_file="$(resolve_twin_target "$dst")"
  if [[ -n "$actual_file" ]]; then
    # File exists elsewhere - this is a smart removal
    # Remove broken symlink silently, file remains in alternative location
    if [[ $verbose -eq 1 ]]; then
      printf "%s%s%s %s %s(removed broken link, file exists in alternative twin)%s\n" \
        "$GREEN" "$OK" "$RESET" "$name" "$DIM" "$RESET"
    fi
  else
    # Truly broken link - current behavior
    if [[ $verbose -eq 1 ]]; then
      printf "%s%s%s %s %s(broken link to twin - removing)%s\n" \
        "$YELLOW" "$WARN" "$RESET" "$name" "$DIM" "$RESET"  
    fi
  fi
fi
```

#### `recall` Command Enhancements
- **Alternative Search**: Look for files in all twin locations
- **Silent Recovery**: If symlink is broken but file exists elsewhere, recall from there
- **Enhanced Success Rate**: Always succeeds if file exists anywhere

```bash
# Enhanced recall target validation
if [[ ! -e "$abs_target" ]]; then
  # Try to find file in alternative location
  local actual_target="$(resolve_twin_target "$symlink")"
  if [[ -n "$actual_target" ]]; then
    abs_target="$actual_target"
    if [[ $verbose -eq 1 ]]; then
      printf "%sNote: File found in alternative twin location%s\n" "$DIM" "$RESET"
    fi
  else
    print_error "recall: Target file does not exist in any twin location: $abs_target"
    exit 1
  fi
fi
```

#### `plug` Command Enhancements
- **Enhanced Detection**: Use improved twin detection
- **No changes needed**: Already works correctly with enhanced `detect_base_twin()`

#### `kick` Command Enhancements  
- **Broken Link Validation**: Prevent kicking files that are broken links to existing files
- **Smart Detection**: Check if "source" is actually a broken link to a twin file

```bash
# Enhanced kick validation
if [[ -L "$src" ]]; then
  local actual_target="$(resolve_twin_target "$src")"
  if [[ -n "$actual_target" ]]; then
    print_warning "Source is a broken link to existing twin file: $actual_target"
    if ask_yes_default_yes "Do you want to heal this link instead of kicking?"; then
      # Remove broken link and create correct link
      rm "$src"
      ln -s "$actual_target" "$src"
      printf "%s%s%s Healed broken link: %s → %s\n" "$GREEN" "$OK" "$RESET" "$src" "$actual_target"
      exit 0
    fi
  fi
fi
```

### 4. Implementation Strategy

#### Phase 1: Helper Functions
1. Add `find_twin_in_all_locations()` after existing utility functions
2. Add `resolve_twin_target()` for broken link resolution
3. Update `detect_base_twin()` to use new smart detection

#### Phase 2: Enhanced Commands  
1. Update `cmd_status()` with healable link detection
2. Update `cmd_unplug()` with smart broken link handling
3. Update `cmd_recall()` with alternative location search
4. Update `cmd_kick()` with broken link validation

#### Phase 3: New heal Command
1. Implement `cmd_heal()` with full healing logic
2. Add heal help text and argument parsing
3. Update main dispatcher and help system

#### Phase 4: Testing & Validation
1. Test all edge cases with manual twin migration
2. Validate silent handling doesn't disrupt normal workflows  
3. Test heal command with complex scenarios

### 5. Backward Compatibility

#### Guaranteed Compatibility
- All existing workflows continue to work
- No breaking changes to command interfaces
- Enhanced behavior is additive only
- Silent handling improves user experience without disruption

#### Migration Path
- Users can manually move twin folders and run `reef heal`
- Existing broken workspaces become automatically healable
- No configuration changes required

### 6. Testing Scenarios

#### Scenario 1: Basic Twin Migration
```bash
# Setup: Project with same-level twin
mkdir -p project-reef/src
echo "test" > project-reef/src/file.js
cd project
reef kick src/file.js

# Simulate migration
mv ../project-reef ~/.reef/

# Test commands
reef status      # Should detect healable link
reef heal        # Should fix the broken link  
reef status      # Should show healthy links
```

#### Scenario 2: Mixed Migration
```bash
# Some files in old location, some in new
mkdir -p ~/.reef/project-reef/config
mv project-reef/src ~/.reef/project-reef/
# Now src/ is in ~/.reef/, other files still in project-reef/

reef heal        # Should handle mixed scenario
```

#### Scenario 3: Permission Issues
```bash
# Test with read-only twin directory
chmod -w ~/.reef/project-reef
reef recall src/file.js  # Should handle gracefully
```

### 7. Error Handling & Edge Cases

#### Graceful Degradation
- If `~/.reef/` doesn't exist or isn't writable, fall back to same-level only
- If file exists in multiple locations, prefer same-level (backwards compatibility)
- Handle permission errors with clear error messages
- Atomic operations with rollback on failure

#### Complex Scenarios
- **Circular links**: Detect and prevent infinite loops
- **Relative vs absolute paths**: Handle both correctly  
- **Nested directories**: Support deep directory structures
- **Special characters**: Handle filenames with spaces, unicode, etc.

### 8. Performance Considerations

#### Efficiency Optimizations
- Cache twin location discovery results during command execution
- Use fast existence checks before expensive path operations
- Batch operations when possible (e.g., heal multiple files)
- Early exit for obviously healthy workspaces

#### Scalability
- Handle large workspaces (1000+ files) efficiently
- Minimize filesystem operations through smart caching
- Parallel processing where safe (multiple independent heals)

### 9. User Experience

#### Silent Operation Principles
- Success cases operate silently (no unnecessary output)
- Enhanced functionality feels automatic and seamless  
- Only report issues when user action is required
- Maintain familiar output formats and patterns

#### Discoverability
- `reef status` hints when healing is available
- `reef heal --help` provides clear guidance
- Error messages suggest healing when appropriate
- Documentation explains edge case handling

### 10. Implementation Checklist

**Helper Functions:**
- [ ] `find_twin_in_all_locations()` - Smart twin discovery
- [ ] `resolve_twin_target()` - Broken link resolution  
- [ ] Enhanced `detect_base_twin()` - Use smart discovery

**Command Enhancements:**
- [ ] `cmd_status()` - Add healable link detection
- [ ] `cmd_unplug()` - Smart broken link removal
- [ ] `cmd_recall()` - Alternative location search
- [ ] `cmd_kick()` - Broken link validation

**New Command:**
- [ ] `cmd_heal()` - Full healing implementation
- [ ] `heal_show_help()` - Help text
- [ ] Main dispatcher integration

**Testing:**
- [ ] Manual twin migration scenarios
- [ ] Permission edge cases
- [ ] Mixed file location scenarios
- [ ] Performance with large workspaces
- [ ] Backward compatibility validation

**Documentation:**
- [ ] Update command help text where needed
- [ ] Internal code documentation
- [ ] Edge case handling examples

This comprehensive plan ensures Reef becomes robust and self-healing while maintaining full backward compatibility and improving the user experience through intelligent automation.