# Reef Scripts Refactoring Plan

## Executive Summary
This document outlines inconsistencies found across the five reef scripts and provides a comprehensive refactoring plan to achieve uniformity in programming style, design patterns, and user experience.

## 1. Inconsistencies Analysis

### 1.1 Shell Options and Error Handling ✅ COMPLETED
All scripts now use standardized strict error handling for atomic operations:

| Script | Shell Options | Status |
|--------|--------------|--------|
| reef-kick | `set -euo pipefail` | ✅ Already compliant |
| reef-status | `set -euo pipefail` | ✅ Updated |
| reef-recall | `set -euo pipefail` | ✅ Updated (also fixed vprintf bug) |
| reef-plug | `set -euo pipefail` | ✅ Updated |
| reef-unplug | `set -euo pipefail` | ✅ Updated |

**Result**: All scripts now have consistent strict error handling ensuring atomic operations - either complete success or clean failure.

### 1.2 TTY Detection and Color Variables ✅ COMPLETED
All scripts now have consistent TTY detection with proper fallback:

| Script | TTY Detection | Color Variable Style | Status |
|--------|--------------|---------------------|--------|
| reef-kick | ✅ Full TTY detection | Consistent with fallback | ✅ Already compliant |
| reef-status | ✅ Full TTY detection | Consistent with fallback | ✅ Updated |
| reef-recall | ✅ Full TTY detection | Consistent with fallback | ✅ Updated |
| reef-plug | ✅ Full TTY detection | Consistent with fallback | ✅ Already compliant |
| reef-unplug | ✅ Full TTY detection | Consistent with fallback | ✅ Updated |

**Result**: All scripts now work properly in non-interactive environments (CI/CD, pipes, redirects) with graceful fallback to plain text.

### 1.3 Icon/Symbol Variables ✅ COMPLETED
All scripts now use consistent symbol naming and complete icon sets:

| Script | Icons Used | Variable Names | Status |
|--------|-----------|----------------|--------|
| reef-kick | OK, ERR, DOT, ARROW_RX, ARROW_LX, CONNECT | Consistent naming | ✅ Already compliant |
| reef-status | OK, ERR, DOT, ARROW_RX, ARROW_LX, CONNECT, WARN, FILE_ICON, FOLDER_ICON, LINK_ICON | Consistent naming | ✅ Updated |
| reef-recall | OK, ERR, DOT, ARROW_RX, ARROW_LX, CONNECT, WARN, FILE_ICON, FOLDER_ICON, LINK_ICON | Consistent naming | ✅ Updated |
| reef-plug | OK, ERR, DOT, ARROW_RX, ARROW_LX, CONNECT, WARN | Most complete set | ✅ Already compliant |
| reef-unplug | OK, ERR, DOT, ARROW_RX, ARROW_LX, CONNECT, WARN, FILE_ICON, FOLDER_ICON, LINK_ICON | Consistent naming | ✅ Updated |

**Result**: Unified symbol naming (ERR instead of FAIL) and complete icon sets across all scripts.

### 1.4 Printf Style ✅ COMPLETED
All scripts now use secure modern printf style:

| Script | Printf Style | Status |
|--------|-------------|--------|
| reef-kick | Modern: `printf "%s%s%s" "$VAR1" "$VAR2" "$VAR3"` | ✅ Already compliant |
| reef-status | Modern: `printf "%s%s%s" "$VAR1" "$VAR2" "$VAR3"` | ✅ Updated |
| reef-recall | Modern: `printf "%s%s%s" "$VAR1" "$VAR2" "$VAR3"` | ✅ Updated |
| reef-plug | Modern: `printf "%s%s%s" "$VAR1" "$VAR2" "$VAR3"` | ✅ Already compliant |
| reef-unplug | Modern: `printf "%s%s%s" "$VAR1" "$VAR2" "$VAR3"` | ✅ Updated |

**Result**: All scripts now use secure printf format that prevents issues with special characters in filenames or paths.

### 1.5 _realpath Implementation ✅ COMPLETED
| Script | Implementation Style | Status |
|--------|---------------------|--------|
| reef-kick | Standard with cleanup | ✅ Updated |
| reef-status | Standard with cleanup | ✅ Consistent indentation |
| reef-recall | Standard with cleanup | ✅ Consistent indentation |
| reef-plug | Standard with cleanup | ✅ Already compliant |
| reef-unplug | Standard with cleanup | ✅ Already compliant |

**Result**: All scripts now use the same robust _realpath implementation with consistent indentation and error handling.

### 1.6 Verbose Mode Support ✅ COMPLETED
| Script | Verbose Flag | Helper Function | Status |
|--------|-------------|-----------------|---------|
| reef-kick | ✅ -v/--verbose | vprintf() | ✅ Already compliant |
| reef-status | ✅ -v/--verbose | vprintf() | ✅ Updated with verbose mode |
| reef-recall | ✅ -v/--verbose | vprintf() (fixed) | ✅ Fixed recursive bug |
| reef-plug | ✅ -v/--verbose | vprintf() | ✅ Updated with verbose mode |
| reef-unplug | ✅ -v/--verbose | vprintf() | ✅ Updated with verbose mode |

**Result**: All scripts now have consistent verbose mode implementation with proper vprintf helpers.

### 1.7 Help Documentation ✅ COMPLETED
| Script | --help Flag | Help Content |
|--------|------------|--------------|
| reef-kick | ✅ Complete | Examples, usage, notes |
| reef-status | ✅ Complete | Examples, usage, options |
| reef-recall | ✅ Basic | Simple usage line |
| reef-plug | ✅ Complete | Examples, usage, options |
| reef-unplug | ✅ Complete | Examples, usage, options |

**Result**: All scripts now have comprehensive help documentation with consistent format.

### 1.8 Output Formatting Consistency ✅ COMPLETED
| Script | Success Output | Error Output | Visual Style |
|--------|---------------|--------------|--------------|
| reef-kick | Concise: `🔗 file ●━━━▶ twin/file` | Consistent format | Fixed-width columns |
| reef-status | Concise: `🔗 file ●━━━● 📄 file` | Consistent format | Fixed-width columns |
| reef-recall | Mixed icons and formatting | Consistent format | Fixed-width columns |
| reef-plug | Concise: `🔗 file ●━━━● base/file` | Consistent format | Fixed-width columns |
| reef-unplug | Concise: `🔗 file ●━━━● twin/file` | Consistent format | Fixed-width columns |

**Result**: All scripts now use consistent visual language with fixed-width columns based on longest filename for proper alignment.

### 1.9 BASE/TWIN Detection Logic ✅ COMPLETED  
| Script | Detection Method | Status |
|--------|------------------|--------|
| reef-kick | Consistent _realpath usage | ✅ Updated |
| reef-status | Consistent _realpath usage | ✅ Already compliant |
| reef-recall | Consistent _realpath usage | ✅ Already compliant |
| reef-plug | Consistent _realpath usage | ✅ Already compliant |
| reef-unplug | Consistent _realpath usage | ✅ Already compliant |

**Result**: All scripts now use consistent _realpath-based detection logic for improved reliability and maintainability.

### 1.10 Argument Parsing ✅ COMPLETED
| Script | Parsing Style | Status |
|--------|--------------|--------|
| reef-kick | Array-based with explicit handling | ✅ Standardized variable names |
| reef-status | Simple for-loop with args array | ✅ Already compliant |
| reef-recall | Single clean parsing pass | ✅ Redundant parsing removed |
| reef-plug | Simple for-loop with args array | ✅ Already compliant |
| reef-unplug | Simple for-loop with args array | ✅ Already compliant |

**Result**: All scripts now use consistent argument parsing patterns with clean, single-pass logic and standardized variable naming.

## 2. Refactoring Plan

### Phase 1: Core Infrastructure (Week 1)

#### 1.1 Create Common Library
**File**: `reef-common.sh`
- Centralized color/symbol definitions
- Shared _realpath function
- TTY detection logic
- Common error handling functions
- Shared argument parsing helpers
- vprintf implementation

#### 1.2 Enhanced Error Handling (Future)
- Add trap handlers for cleanup on error
- Consistent error exit codes:
  - 0: Success
  - 1: Operation error
  - 2: Usage error
  - 3: Permission error

### Phase 2: Visual Consistency (Week 1-2)

#### 2.1 Unified Color Scheme
```bash
# Standard color variables (with TTY detection)
RED, GREEN, YELLOW, BLUE, CYAN, MAGENTA
DIM, BOLD, RESET

# Standard symbols
OK="✓" / "[OK]"
ERR="✗" / "[ERR]"  # Standardize on ERR, not FAIL
WARN="⚠️" / "[WARN]"
DOT="●" / "*"
ARROW_RX="→" / "->"
ARROW_LX="←" / "<-"
CONNECT="━" / "-"
FILE_ICON="📄" / "[F]"
FOLDER_ICON="📁" / "[D]"
LINK_ICON="🔗" / "[L]"
```

#### 2.2 Printf Style Migration
- Convert all scripts to modern printf style
- Create helper functions for common output patterns:
  - `print_success()`, `print_error()`, `print_warning()`
  - `print_status()` for consistent status lines

### Phase 3: Feature Parity (Week 2)

#### 3.1 Add Missing Features
- **All scripts**: Add --help flag with consistent format
- **reef-status, reef-plug, reef-unplug**: Add -v/--verbose mode
- **All scripts**: Add --no-color flag for CI/CD environments
- **All scripts**: Add --quiet flag for script usage

#### 3.2 Consistent Argument Parsing
```bash
# Standard argument parsing template
verbose=0
quiet=0
no_color=0
suffix="-reef"
positional_args=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    -v|--verbose) verbose=1 ;;
    -q|--quiet) quiet=1 ;;
    --no-color) no_color=1 ;;
    --suffix=*) suffix="${1#*=}" ;;
    -h|--help) show_help; exit 0 ;;
    --) shift; positional_args+=("$@"); break ;;
    -*) error "Unknown option: $1"; exit 2 ;;
    *) positional_args+=("$1") ;;
  esac
  shift
done
```

### Phase 4: Output Standardization (Week 2-3)

#### 4.1 Unified Output Formats
- **Concise mode** (default): Single-line status updates
- **Verbose mode** (-v): Detailed multi-line output
- **Quiet mode** (-q): Errors only
- **JSON mode** (--json): Machine-readable output (future)

#### 4.2 Consistent Visual Language ✅ COMPLETED
```
# Standard output patterns:
SUCCESS: ✓ <item>
ERROR:   ✗ <item> (reason)
WARNING: ⚠️ <item> (details)
LINK:    🔗 filename ●━━━● 📄 filename
UNLINK:  📄 base ○╌╌╌○ twin
STATUS:  [icon] <name> <connection> <target>

# Fixed-width columns:
- Column width determined by longest filename in current operation
- Left-aligned filename columns using printf "%-*s" format
- Connection lines scale to match column width for proper alignment
- All scripts use consistent ●━━━● connection pattern
```

### Phase 5: Error Handling (Week 3)

#### 5.1 Comprehensive Error Checking
- Add rollback functions for all destructive operations
- Implement atomic operations where possible
- Add dry-run mode (--dry-run) to all scripts
- Better permission checking before operations

#### 5.2 Improved Error Messages
```bash
# Standard error format
error() {
  printf "%s%s Error:%s %s\n" "$RED" "$ERR" "$RESET" "$1" >&2
}

# Context-aware errors
error_permission() { ... }
error_not_found() { ... }
error_already_exists() { ... }
```

### Phase 6: Testing & Documentation (Week 3-4)

#### 6.1 Test Suite
- Create `test/` directory with test cases
- Unit tests for common functions
- Integration tests for workflows
- Edge case testing

#### 6.2 Documentation
- Consistent help text format
- Man pages for each command
- Update README with examples
- Create CONTRIBUTING.md

## 3. Implementation Priority

### High Priority (Must Fix)
1. ✅ **Printf style consistency** - COMPLETED - Prevents issues with special characters
2. ✅ **TTY detection** - COMPLETED - Critical for non-interactive use
3. ✅ **ERR vs FAIL naming** - COMPLETED - User-facing inconsistency resolved
4. ✅ **reef-recall vprintf bug** - COMPLETED - Fixed recursive call bug
5. ✅ **Help documentation** - COMPLETED - User experience consistency achieved
6. ✅ **Fixed-width column alignment** - COMPLETED - Visual consistency in concise output

### Medium Priority (Should Fix)
1. ✅ **Verbose mode parity** - COMPLETED - Feature consistency achieved
2. ✅ **_realpath implementation** - COMPLETED - Code maintainability improved
3. ✅ **Argument parsing cleanup** - COMPLETED - Code clarity enhanced  
4. **Enhanced error handling** - Trap handlers and exit codes

### Low Priority (Nice to Have)
1. **JSON output mode** - Future enhancement
2. **Dry-run mode** - Safety feature
3. **Common library** - Long-term maintainability
4. **Test suite** - Quality assurance

## 4. Migration Strategy

### Step 1: Fix Critical Bugs (Day 1) ✅ COMPLETED
- ✅ Fix reef-recall vprintf recursive call - DONE
- ✅ Standardize shell options to `set -euo pipefail` - DONE  
- ✅ Fix printf security issues in reef-status, reef-recall, reef-unplug - DONE

### Step 2: Add TTY Detection (Day 2-3) ✅ COMPLETED
- ✅ Add TTY detection to reef-status, reef-recall, reef-unplug - DONE
- ✅ Ensure non-interactive compatibility - DONE

### Step 3: Standardize Symbols (Day 4-5) ✅ COMPLETED
- ✅ Replace all FAIL with ERR - DONE
- ✅ Add missing symbols to all scripts - DONE
- ✅ Ensure consistent symbol sets - DONE

### Step 4: Add Help Documentation (Day 6-7)
- Create consistent help template
- Add --help to all scripts
- Include examples and notes

### Step 5: Implement Verbose Mode (Week 2) ✅ COMPLETED
- ✅ Add -v/--verbose to remaining scripts - DONE
- ✅ Create consistent verbose output format - DONE
- ✅ Test all modes - DONE

### Step 6: Code Maintainability Improvements ✅ COMPLETED
- ✅ Standardize _realpath implementation across all scripts - DONE
- ✅ Clean up argument parsing for better code clarity - DONE
- ✅ Remove redundant parsing logic in reef-recall - DONE
- ✅ Standardize variable naming in argument parsing - DONE

## 5. Backwards Compatibility

### Breaking Changes
- FAIL → ERR variable rename (internal only)
- Stricter error handling may expose hidden failures

### Non-Breaking Changes
- Adding new flags (--verbose, --help, --no-color)
- TTY detection (fallback preserves current behavior)
- Printf style (output remains the same)

### Migration Path
1. Version 1.1: Add missing features, fix bugs (backwards compatible)
2. Version 1.2: Standardize internals (mostly compatible)
3. Version 2.0: Common library refactor (if needed)

## 6. Success Metrics

### Code Quality
- [ ] All scripts pass shellcheck
- [ ] Consistent code style across all scripts
- [ ] No duplicate code blocks
- [ ] Clear error handling paths

### User Experience
- [ ] Consistent visual output
- [ ] Help available for all commands
- [ ] Works in non-TTY environments
- [ ] Clear error messages

### Maintainability
- [ ] Single source of truth for common code
- [ ] Easy to add new scripts
- [ ] Test coverage > 80%
- [ ] Documentation complete

## 7. Timeline

### Week 1
- Day 1-2: Fix critical bugs
- Day 3-5: TTY detection and symbol standardization

### Week 2
- Day 1-3: Help documentation and verbose mode
- Day 4-5: Printf style migration

### Week 3
- Day 1-3: Error handling improvements
- Day 4-5: Output format standardization

### Week 4
- Day 1-3: Testing implementation
- Day 4-5: Documentation and review

## 8. Next Steps

1. Review and approve this plan
2. Create feature branches for each phase
3. Implement Phase 1 (Critical Fixes)
4. Test in various environments
5. Gather feedback
6. Iterate and improve

---

*This refactoring plan aims to create a consistent, maintainable, and user-friendly suite of reef tools while preserving backwards compatibility where possible.*