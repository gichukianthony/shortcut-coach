# Change Log

All notable changes to the "Shortcut Coach" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.0.0] - 2025-02-13

### Added

- **Command tracking** that works across VS Code versions:
  - Uses `onDidExecuteCommand` when available (tracks every command: mouse, menu, palette, keybinding).
  - Falls back to wrapping `executeCommand` on older hosts so the extension still runs and the status bar updates.
- **Tips for all commands**: after 5 uses you get either a suggested shortcut (for known commands) or a tip to assign one in Keyboard Shortcuts (Ctrl+K Ctrl+S).
- **Redesigned dashboard** with a modern UI:
  - Two sections: "Commands to learn shortcuts for" and "Commands you've learned".
  - Card layout with icons (🎯 and ⭐), usage counts, and shortcut pills.
  - Clear empty states when no commands are tracked or no commands are below/above threshold.
  - Dark-themed styling with gradients and badges.
- **Status bar** now updates correctly as you use commands (number of commands that have reached the learning threshold).
- **Keywords and license** in `package.json` for marketplace publishing.

### Fixed

- Extension activation failure when `vscode.commands.onDidExecuteCommand` is not available (runtime check with fallback).
- Status bar always showing "Shortcut Coach: 0" by using the appropriate tracking method for the host.
- TypeScript error for `onDidExecuteCommand` via type augmentation (`vscode-augment.d.ts`).

### Changed

- Removed unimplemented "Shortcut Coach: Open File" command from contribution list.
- Bumped version to 1.0.0 for first stable release.

---

## [Unreleased]

- (none)
