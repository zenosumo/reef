### MVP Plan: Reef Mini-Extension for VSCode

#### 1. Goals
- Provide direct access to `reef` commands inside VSCode.
- Allow developers to run common subcommands (`status`, `kick`, `recall`, `plug`, `unplug`) without leaving the editor.
- Keep it lightweight: no custom views or webviews, just palette commands + optional context menu.

---

#### 2. Scope (MVP Features)
- **Commands in Command Palette**:
  - Reef: Status
  - Reef: Kick Current File
  - Reef: Recall Current File
  - Reef: Plug All
  - Reef: Unplug All

- **Editor Context Menu (optional in MVP)**:
  - Kick Current File
  - Recall Current File

- **Notifications**:
  - Success → show `InformationMessage`
  - Failure → show `ErrorMessage`

- **Configurable Settings**:
  - `reef.suffix` (string, default "-reef")
  - `reef.executablePath` (string, default "reef")

- **Distribution**:
  - Packaged into a `.vsix` for internal sharing.

---

#### 3. Out of Scope (for MVP)
- No custom tree views or panels.
- No automatic detection of twin state.
- No problem matchers or diagnostics.
- No Marketplace publishing (internal `.vsix` only).

---

#### 4. Architecture
- **Extension manifest (`package.json`)**:
  - Declare commands and keybindings.
  - Register settings schema for suffix + executable path.
- **Extension entry (`extension.ts`)**:
  - Use `child_process.execFile` to call CLI.
  - Pass relative file paths where relevant.
  - Show VSCode notifications for results.

---

#### 5. Development Steps
1. **Bootstrap**:
   - Scaffold with `yo code` (TypeScript).
   - Setup npm scripts (`npm run compile`, `npm run package`).

2. **Implement Commands**:
   - `reef.status`: run in workspace root.
   - `reef.kickCurrent`: target active file relative to workspace.
   - `reef.recallCurrent`: same as kick but opposite.
   - `reef.plugAll` / `reef.unplugAll`: run in workspace root.

3. **Wire Config Settings**:
   - Read suffix + executable path from VSCode settings.
   - Append suffix flag if non-empty.

4. **Testing**:
   - Run via VSCode “Extension Development Host”.
   - Verify outputs and error handling.

5. **Packaging**:
   - Use `vsce package` → produce `.vsix`.
   - Test local install via `code --install-extension reef-x.y.z.vsix`.

---

#### 6. Success Criteria
- Commands run reliably across common OSes (Linux, macOS, WSL).
- Developer can:
  - Kick/recall a file from the editor.
  - Check twin status from palette.
  - Plug/unplug all without opening a terminal.
- Easy internal distribution of `.vsix` file.

---

#### 7. Future Enhancements (Post-MVP)
- Add a custom tree view showing BASE ↔ TWIN relationships.
- Status bar item showing twin state.
- Multi-root workspace support.
- Auto-update mechanism or private registry integration.
- ProblemMatcher-like integration highlighting missing/broken symlinks in editor.
- Extension Pack that includes Reef + other internal tooling.