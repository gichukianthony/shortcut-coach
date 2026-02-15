# Shortcut Coach

**Shortcut Coach** tracks your VS Code command usage and suggests keyboard shortcuts so you can work faster. It shows tips after you repeat an action and a live dashboard of commands worth learning shortcuts for.

---

## Features

- **Track commands** – Every command you run (via mouse, menu, Command Palette, or keybinding) is counted.
- **Status bar** – Bottom-right shows how many commands you’ve “learned” (used at least 5 times).
- **Tips** – After using a command 5 times, you get a message with the shortcut (or a nudge to assign one in Keyboard Shortcuts).
- **Dashboard** – Run **Shortcut Coach: Show Dashboard** to see:
  - **Commands to learn shortcuts for** – Top commands below the threshold, with suggested shortcuts where known.
  - **Commands you've learned** – Commands you’ve used 5+ times.
- **Compatibility** – Works on VS Code versions with or without `onDidExecuteCommand` (automatic fallback).

---

## Commands

| Command | Description |
|--------|-------------|
| **Shortcut Coach: Show Dashboard** | Opens the dashboard panel with your top commands and shortcut suggestions. |

---

## Usage

1. Install the extension.
2. Use VS Code as usual (menus, Command Palette, keybindings).
3. After you use a command **5 times**, a tip appears with the keyboard shortcut (or a hint to set one).
4. Check the **status bar** (bottom right) for the number of commands you’ve “mastered.”
5. Run **Command Palette** → **Shortcut Coach: Show Dashboard** to see the full list and suggested shortcuts.

---

## Status Bar

The status bar shows: **Shortcut Coach: N**  
where **N** is the number of commands you’ve used at least 5 times in this session.

---

## Dashboard

- **Commands to learn shortcuts for** – Most-used commands that haven’t reached the threshold yet, with usage count and suggested shortcut (or “Assign shortcut”).
- **Commands you've learned** – Commands you’ve used 5+ times.
- Updates **live** as you run commands.

---

## Built-in shortcut suggestions

These commands have predefined shortcut tips:

| Command | Shortcut |
|--------|----------|
| `workbench.action.quickOpen` | `Ctrl+P` |
| `editor.action.commentLine` | `Ctrl+/` |
| `workbench.action.openSettings` | `Ctrl+,` |
| `workbench.action.terminal.toggleTerminal` | `` Ctrl+` `` |
| `editor.action.copyLinesDownAction` | `Shift+Alt+Down` |

For any other command, the extension still counts usage and suggests opening **Keyboard Shortcuts** (`Ctrl+K Ctrl+S`) to assign or look up a shortcut.

---

## Extension settings

_No configurable settings yet._

---

## Release notes

See [CHANGELOG.md](CHANGELOG.md) for version history.

### 1.0.0

- First stable release.
- Reliable command tracking (with fallback when `onDidExecuteCommand` is unavailable).
- Status bar and dashboard that update as you use commands.
- Tips for all commands (known shortcuts or “assign shortcut”).
- Redesigned dashboard with cards and clear sections.

---

## Publishing

### Prerequisites

- [Node.js](https://nodejs.org/) (e.g. LTS).
- [vsce](https://code.visualstudio.com/api/working-with-extensions/publishing-extension):  
  `npm install -g @vscode/vsce`

### Package (create .vsix)

```bash
cd shortcut-coach
pnpm install
pnpm run package
vsce package
```

This produces `shortcut-coach-1.0.0.vsix`.

### Publish to Marketplace

1. Create a [Visual Studio Marketplace](https://marketplace.visualstudio.com/) publisher account and get a [Personal Access Token](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token).
2. From the extension root:

   ```bash
   vsce login <publisher-id>
   vsce publish
   ```

   Or publish a specific version:

   ```bash
   vsce publish 1.0.0
   ```

### Bump version for a new release

1. Update `version` in `package.json` (e.g. `1.0.1` or `1.1.0`).
2. Add a new section in `CHANGELOG.md` under `[Unreleased]` or a new version heading.
3. Run `vsce package` (or `vsce publish`) again.

---

## License

MIT

---

Made for VS Code users who want to **learn shortcuts by doing**.
