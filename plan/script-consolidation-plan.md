# Reef Script Consolidation Plan

## Executive Summary
This plan outlines the strategy for merging all five reef scripts (`reef-kick`, `reef-status`, `reef-plug`, `reef-recall`, `reef-unplug`) into a single unified `reef` command with subcommands. This builds upon the consistency improvements already implemented in the existing refactoring plan.

## 1. Current State Analysis

### 1.1 Existing Scripts Structure
Based on analysis of the current codebase, all five scripts follow consistent patterns:

| Script | Function | Arguments | Output Modes |
|--------|----------|-----------|--------------|
| `reef-kick` | Move file to twin, create symlink | `<path>` | Concise/Verbose |
| `reef-status` | Show BASE/TWIN relationships | None | Concise/Verbose |
| `reef-plug` | Link all twin files to BASE | None | Concise/Verbose |
| `reef-recall` | Move file back from twin | `<symlink>` | Concise/Verbose |
| `reef-unplug` | Remove all twin symlinks | None | Concise/Verbose |

### 1.2 Shared Components (Already Consistent)
All scripts share these common elements:
- ✅ Shell options: `set -euo pipefail`
- ✅ TTY detection and color variables
- ✅ `_realpath()` function implementation
- ✅ BASE/TWIN detection logic
- ✅ Argument parsing patterns
- ✅ Error handling and output formatting
- ✅ Help documentation structure

## 2. Target Architecture

### 2.1 Unified Command Structure
```bash
reef [OPTIONS] <SUBCOMMAND> [SUBCOMMAND_ARGS...]

# Subcommands:
reef kick <path>              # Move file to twin, create symlink
reef status                   # Show BASE/TWIN relationships  
reef plug                     # Link all twin files to BASE
reef recall <symlink>         # Move file back from twin
reef unplug                   # Remove all twin symlinks

# Global options:
reef -h, --help              # Show main help
reef -v, --version           # Show version info
reef --suffix=SUFFIX         # Use custom twin suffix

# Subcommand options:
reef kick -v <path>          # Verbose kick
reef status -v               # Verbose status
reef plug -v                 # Verbose plug
reef recall -v <symlink>     # Verbose recall  
reef unplug -v               # Verbose unplug

# Help for subcommands:
reef kick --help             # Show kick-specific help
reef status --help           # Show status-specific help
# etc.
```

### 2.2 No-Args Behavior
When `reef` is called with no arguments, display comprehensive help:
```bash
$ reef
reef - Workspace twin management system

Usage: reef [OPTIONS] <SUBCOMMAND> [ARGS...]

SUBCOMMANDS:
  kick <path>     Move file/dir to twin and replace with symlink
  status          Show relationships between base and twin files
  plug            Create symlinks in base for all twin contents  
  recall <link>   Move file back from twin to base
  unplug          Remove all symlinks pointing to twin

GLOBAL OPTIONS:
  -h, --help           Show this help
  -v, --version        Show version information
  --suffix=SUFFIX      Use custom twin suffix (default: -reef)

EXAMPLES:
  reef kick src/index.js       # Move file to twin
  reef status --verbose        # Show detailed status
  reef plug                    # Link all twin files
  reef recall src/index.js     # Move file back
  reef unplug                  # Remove all twin links

For help with a specific subcommand: reef <subcommand> --help
```

## 3. Implementation Strategy

### 3.1 Main Script Structure
Create a new `reef` script with this structure:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Version and configuration
VERSION="2.0.0"
SUFFIX="-reef"

# [SHARED CODE SECTION]
# - TTY detection and colors
# - _realpath function  
# - BASE/TWIN detection
# - Common helper functions
# - Error handling functions

# [MAIN COMMAND DISPATCHER]
parse_global_args() { ... }
show_main_help() { ... }
show_version() { ... }

# [SUBCOMMAND IMPLEMENTATIONS]
cmd_kick() { ... }
cmd_status() { ... }  
cmd_plug() { ... }
cmd_recall() { ... }
cmd_unplug() { ... }

# [MAIN LOGIC]
main() {
  # Parse global args first
  parse_global_args "$@"
  
  # Handle no-args case
  if [[ ${#args[@]} -eq 0 ]]; then
    show_main_help
    exit 0
  fi
  
  # Dispatch to subcommand
  subcommand="${args[0]}"
  case "$subcommand" in
    kick)    cmd_kick "${args[@]:1}" ;;
    status)  cmd_status "${args[@]:1}" ;;
    plug)    cmd_plug "${args[@]:1}" ;;
    recall)  cmd_recall "${args[@]:1}" ;;
    unplug)  cmd_unplug "${args[@]:1}" ;;
    *)       error "Unknown subcommand: $subcommand"; exit 2 ;;
  esac
}

main "$@"
```

### 3.2 Shared Code Consolidation

#### Extract Common Functions
```bash
# Colors and TTY detection (from all scripts)
setup_tty_detection() { ... }

# Path resolution (identical across all scripts)  
_realpath() { ... }

# BASE/TWIN detection (identical across all scripts)
detect_base_twin() { ... }

# Common output helpers
print_success() { ... }
print_error() { ... }
print_warning() { ... }

# Common argument parsing helpers
parse_common_flags() { ... }
```

#### Preserve Individual Logic
Each subcommand function will contain the core logic from its original script:
- Input validation
- Specific argument parsing
- Core operation logic
- Specific output formatting

### 3.3 Argument Parsing Strategy

#### Two-Stage Parsing
1. **Global arguments** parsed first:
   ```bash
   # Global flags that apply to reef command itself
   --help, -h          # Main help
   --version, -v       # Version info  
   --suffix=SUFFIX     # Global suffix override
   ```

2. **Subcommand arguments** parsed by each cmd_* function:
   ```bash
   # Subcommand-specific flags
   --verbose, -v       # Verbose mode for subcommand
   --help, -h          # Subcommand help
   ```

#### Conflict Resolution
- Global `-v` means `--version`
- Subcommand `-v` means `--verbose`
- Global `--help` shows main help
- Subcommand `--help` shows subcommand help

### 3.4 Help System Architecture

#### Main Help (`reef --help` or `reef`)
- Overview of all subcommands
- Global options
- Usage examples
- Pointer to subcommand help

#### Subcommand Help (`reef <cmd> --help`)
- Detailed help for specific subcommand
- Command-specific options
- Examples for that command
- Reuse existing help text from individual scripts

## 4. Migration Strategy

### 4.1 Implementation Phases

#### Phase 1: Create Unified Script (Week 1)
1. **Create `reef` script structure**
   - Main dispatcher function
   - Global argument parsing
   - Main help system

2. **Extract shared code**
   - Consolidate common functions
   - Ensure no duplication
   - Test shared components

3. **Implement first subcommand (`status`)**
   - Prove the architecture works
   - Test argument passing
   - Verify help system

#### Phase 2: Add All Subcommands (Week 1-2)
1. **Implement remaining subcommands**
   - `kick`, `plug`, `recall`, `unplug`
   - Port logic from existing scripts
   - Maintain exact functionality

2. **Comprehensive testing**
   - Test all subcommands work identically to originals
   - Test global vs subcommand argument handling
   - Test help system thoroughly

#### Phase 3: Transition Period (Week 2-3)
1. **Keep existing scripts as wrappers** (backwards compatibility)
   ```bash
   #!/usr/bin/env bash
   # reef-kick - backwards compatibility wrapper
   exec "$(dirname "$0")/reef" kick "$@"
   ```

2. **Update documentation**
   - Recommend new unified command
   - Document migration path
   - Update examples

3. **Test in production**
   - Parallel deployment
   - Monitor for issues
   - Gather user feedback

#### Phase 4: Deprecation (Week 4+)
1. **Add deprecation warnings** to wrapper scripts
2. **Update all documentation** to use new format
3. **Eventually remove wrappers** (major version bump)

### 4.2 Backwards Compatibility Strategy

#### Short Term (3-6 months)
- Keep original scripts as wrappers calling `reef <subcommand>`
- No breaking changes to existing workflows
- Users can gradually migrate

#### Long Term (6+ months)  
- Remove wrapper scripts
- Document migration in CHANGELOG
- Major version bump (reef 2.0)

## 5. Technical Considerations

### 5.1 Code Organization

#### Function Naming Convention
```bash
# Main functions
main()
show_main_help()
show_version()

# Global helpers  
setup_tty_detection()
detect_base_twin()
parse_global_args()

# Subcommand implementations
cmd_kick()
cmd_status()
cmd_plug() 
cmd_recall()
cmd_unplug()

# Subcommand helpers
kick_parse_args()
kick_show_help()
status_parse_args()
status_show_help()
# etc.
```

#### Code Sections
```bash
# 1. Header and configuration
# 2. TTY detection and colors
# 3. Shared utility functions
# 4. BASE/TWIN detection logic
# 5. Global argument parsing
# 6. Main help system
# 7. Subcommand implementations (one per original script)
# 8. Main dispatcher
```

### 5.2 Error Handling

#### Consistent Exit Codes
```bash
# Exit codes across all subcommands
0 # Success
1 # Operation error (file not found, permission denied, etc.)
2 # Usage error (wrong arguments, unknown options, etc.)
```

#### Error Context
- Prefix all errors with subcommand context: `reef kick: Error: file not found`
- Maintain existing error messages from original scripts
- Add global error handler for unknown subcommands

### 5.3 Testing Strategy

#### Unit Testing
- Test each subcommand function independently
- Test global argument parsing
- Test help system
- Test error handling

#### Integration Testing  
- Compare output of `reef <cmd>` vs `reef-<cmd>`
- Test all argument combinations
- Test in various environments (TTY/non-TTY)

#### Regression Testing
- Existing workflows must continue working
- Output format must remain identical
- Error messages must remain consistent

## 6. File Structure Changes

### 6.1 Before Consolidation
```
reef-kick      # Individual script
reef-status    # Individual script  
reef-plug      # Individual script
reef-recall    # Individual script
reef-unplug    # Individual script
```

### 6.2 After Consolidation (Phase 1)
```
reef           # New unified script
reef-kick      # Wrapper -> reef kick
reef-status    # Wrapper -> reef status
reef-plug      # Wrapper -> reef plug  
reef-recall    # Wrapper -> reef recall
reef-unplug    # Wrapper -> reef unplug
```

### 6.3 After Deprecation (Phase 2)
```
reef           # Unified script only
```

## 7. Benefits of Consolidation

### 7.1 User Experience
- **Single command to remember**: `reef` instead of 5 different commands
- **Consistent help system**: `reef --help` and `reef <cmd> --help`
- **Discoverable subcommands**: Users can explore all functionality from main help
- **Consistent argument patterns**: Global options work across all subcommands

### 7.2 Maintenance Benefits
- **Single source of truth**: All shared code in one place
- **Easier updates**: Change common functionality once
- **Reduced code duplication**: ~70% reduction in total lines of code
- **Simpler testing**: Test one script instead of five

### 7.3 Distribution Benefits
- **Single file deployment**: Easier to install and distribute
- **Atomic updates**: All subcommands update together
- **Consistent versioning**: One version number for all functionality

## 8. Risk Analysis and Mitigation

### 8.1 Potential Risks

#### Risk: Breaking Existing Workflows
- **Probability**: Low (with wrapper scripts)
- **Impact**: High
- **Mitigation**: Maintain wrapper scripts for backwards compatibility

#### Risk: Increased Script Complexity  
- **Probability**: Medium
- **Impact**: Medium
- **Mitigation**: Clear code organization, comprehensive comments, good testing

#### Risk: Performance Impact
- **Probability**: Low
- **Impact**: Low  
- **Mitigation**: Shared code should improve performance, minimal dispatcher overhead

### 8.2 Mitigation Strategies
1. **Comprehensive testing** before deployment
2. **Gradual migration** with wrapper scripts
3. **Clear documentation** for new command structure
4. **Rollback plan** by keeping original scripts as backups

## 9. Success Metrics

### 9.1 Technical Metrics
- [ ] All existing functionality preserved exactly
- [ ] All tests pass for unified script
- [ ] Code duplication reduced by >70%
- [ ] Single script <2000 lines (vs current ~1300 total)

### 9.2 User Experience Metrics  
- [ ] Help system comprehensive and discoverable
- [ ] No breaking changes to existing workflows
- [ ] Consistent argument patterns across subcommands
- [ ] Easy transition path documented

### 9.3 Maintenance Metrics
- [ ] Shared code changes propagate to all subcommands
- [ ] New subcommands easy to add
- [ ] Single release process for all functionality
- [ ] Reduced maintenance burden

## 10. Implementation Timeline

### Week 1: Core Implementation
- **Day 1-2**: Create `reef` script structure and dispatcher
- **Day 3-4**: Extract shared code and implement `status` subcommand  
- **Day 5**: Implement `kick` and `plug` subcommands

### Week 2: Complete Implementation
- **Day 1-2**: Implement `recall` and `unplug` subcommands
- **Day 3-4**: Create wrapper scripts for backwards compatibility
- **Day 5**: Comprehensive testing and bug fixes

### Week 3: Testing and Documentation
- **Day 1-3**: Extensive testing against original scripts
- **Day 4-5**: Update documentation and create migration guide

### Week 4: Deployment and Monitoring
- **Day 1-2**: Deploy with wrapper scripts
- **Day 3-5**: Monitor for issues and gather feedback

## 11. Next Steps

1. **Review and approve** this consolidation plan
2. **Create feature branch** `feature/script-consolidation`
3. **Implement unified `reef` script** following the architecture above
4. **Test thoroughly** against existing scripts
5. **Deploy with wrapper scripts** for backwards compatibility
6. **Document migration path** for users
7. **Monitor and iterate** based on feedback

---

*This consolidation plan transforms the reef toolkit from five individual scripts into a modern, unified command-line interface while maintaining complete backwards compatibility and improving maintainability.*