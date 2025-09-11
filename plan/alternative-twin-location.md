# Alternative Twin Folder Location Feature

## Overview
This document outlines the implementation of an alternative twin folder location feature for the Reef workspace management system. The feature adds support for storing twin folders in `~/.reef/` as a fallback location when they don't exist at the same level as the project.

## Feature Requirements

### Primary Goals
1. **Fallback Location**: When a twin folder doesn't exist at the same level as the project, check for it in `~/.reef/`
2. **Transparent Operation**: All reef commands should work seamlessly with twins in either location
3. **Hidden Feature**: This functionality should not be mentioned in help text or documentation
4. **Backward Compatibility**: Existing twins at the same level must continue to work as before

### Behavior Specification

#### Twin Detection Order
1. **First Check**: `<project_path>-reef` (same level as project)
2. **Second Check**: `~/.reef/<project_name>-reef` (centralized location)

#### Twin Creation Logic (reef kick)
- If twin doesn't exist at same level AND doesn't exist in `~/.reef/`:
  - Prompt user to create twin (existing behavior)
  - Create at same level when user confirms (existing behavior)
- If twin exists in `~/.reef/`:
  - Use it transparently without prompting

## Implementation Details

### 1. Modified `detect_base_twin()` Function

```bash
detect_base_twin() {
  local cwd suffix
  cwd="$(_realpath "$PWD")"
  suffix="${SUFFIX}"
  
  BASE=""
  TWIN=""
  
  # Check if current directory ends with suffix AND a non-suffix version exists
  if [[ "$cwd" == *"$suffix" ]]; then
    local potential_base="${cwd%$suffix}"
    # Only treat as twin if the base actually exists
    if [[ -d "$potential_base" ]]; then
      TWIN="$cwd"
      BASE="$(_realpath "$potential_base")"
    fi
  fi
  
  # If we haven't identified BASE/TWIN yet, assume we're in base
  if [[ -z "$BASE" ]]; then
    BASE="$cwd"
    
    # First: Check for twin at same level
    local same_level_twin="${cwd}${suffix}"
    if [[ -d "$same_level_twin" ]]; then
      TWIN="$same_level_twin"
    else
      # Second: Check for twin in ~/.reef/
      local project_name="$(basename "$cwd")"
      local reef_home="${HOME}/.reef"
      local alt_twin="${reef_home}/${project_name}${suffix}"
      
      if [[ -d "$alt_twin" ]]; then
        TWIN="$(_realpath "$alt_twin")"
      else
        # Default to same-level path (for creation)
        TWIN="$same_level_twin"
      fi
    fi
  fi
  
  # Sanity check: BASE and TWIN shouldn't be the same
  if [[ "$BASE" == "$TWIN" ]]; then
    print_error "Base and twin directories are identical. Check your suffix configuration."
    exit 1
  fi
}
```

### 2. Updated `cmd_kick()` Function

The `cmd_kick` function requires minimal changes since the twin detection is handled by `detect_base_twin()`. The only consideration is ensuring the twin creation logic remains at the same level:

```bash
# In cmd_kick(), around line 408:
# Ensure twin exists (or create)
if [[ ! -d "$TWIN" ]]; then
  # Always create at same level when prompting
  local create_path="${BASE}${SUFFIX}"
  if ask_yes_default_yes "Twin folder does not exist. Create it at: $create_path?"; then
    mkdir -p "$create_path"
    # Update TWIN to the newly created path
    TWIN="$create_path"
    if [[ $verbose -eq 1 ]]; then
      printf "Created twin: %s\n" "$TWIN"
    fi
  else
    print_error "kick: twin folder missing: $TWIN"
    exit 1
  fi
fi
```

### 3. Impact on Other Commands

All other commands (`status`, `plug`, `recall`, `unplug`) will automatically work with the new twin detection logic since they rely on the `BASE` and `TWIN` variables set by `detect_base_twin()`.

## Testing Scenarios

### Scenario 1: Twin at Same Level (Existing Behavior)
```bash
# Project: /Users/kris/Projects/myapp
# Twin exists: /Users/kris/Projects/myapp-reef
cd /Users/kris/Projects/myapp
reef status
# Should detect and use /Users/kris/Projects/myapp-reef
```

### Scenario 2: Twin in ~/.reef/
```bash
# Project: /Users/kris/Projects/myapp
# No twin at: /Users/kris/Projects/myapp-reef
# Twin exists: ~/.reef/myapp-reef
cd /Users/kris/Projects/myapp
reef status
# Should detect and use ~/.reef/myapp-reef
```

### Scenario 3: No Twin Exists
```bash
# Project: /Users/kris/Projects/myapp
# No twin at: /Users/kris/Projects/myapp-reef
# No twin at: ~/.reef/myapp-reef
cd /Users/kris/Projects/myapp
reef kick src/file.js
# Should prompt to create at /Users/kris/Projects/myapp-reef
```

### Scenario 4: Working from Within Alternative Twin
```bash
# Project: /Users/kris/Projects/myapp
# Twin at: ~/.reef/myapp-reef
cd ~/.reef/myapp-reef
reef status
# Should correctly identify as being in TWIN
# Should set BASE to /Users/kris/Projects/myapp
```

## Edge Cases and Considerations

### 1. Project Name Collisions
Multiple projects with the same name but different paths could conflict in `~/.reef/`:
- `/Users/alice/Projects/myapp`
- `/Users/bob/Work/myapp`

Both would map to `~/.reef/myapp-reef`. This is acceptable as a limitation of the hidden feature - users who need this should use unique project names or stick with same-level twins.

### 2. Symlink Resolution
When creating symlinks, the paths must be correctly resolved regardless of twin location:
- Symlinks from BASE to `~/.reef/` twins should use absolute paths
- The `_realpath` function handles this correctly

### 3. Performance Considerations
The additional directory check for `~/.reef/` has minimal performance impact:
- Only one extra `[[ -d "$alt_twin" ]]` check
- Only performed when same-level twin doesn't exist

### 4. Migration Path
Users can manually move twins between locations:
```bash
# Move from same-level to ~/.reef/
mv /path/to/project-reef ~/.reef/project-reef

# Move from ~/.reef/ to same-level
mv ~/.reef/project-reef /path/to/project-reef
```

### 5. Hidden Nature
- No changes to help text
- No mention in documentation
- Feature discovery only through:
  - Code inspection
  - Observing behavior when `~/.reef/` twins exist
  - This plan document (not user-facing)

## Implementation Checklist

- [ ] Update `detect_base_twin()` function with fallback logic
- [ ] Verify `cmd_kick()` creates twins at same level (not in ~/.reef/)
- [ ] Test all commands with twins at same level
- [ ] Test all commands with twins in ~/.reef/
- [ ] Test twin creation when no twin exists
- [ ] Verify no help text mentions the feature
- [ ] Test edge cases (name collisions, symlink paths)

## Code Locations

All changes are in the single consolidated script:
- **File**: `/Users/kris/Projects/reef/reef`
- **Function**: `detect_base_twin()` (lines 175-210)
- **Function**: `cmd_kick()` (lines 337-488, specifically around line 408)

## Rollback Plan

If issues arise, the feature can be disabled by removing the `~/.reef/` check from `detect_base_twin()`, reverting to the original logic that only checks for same-level twins.