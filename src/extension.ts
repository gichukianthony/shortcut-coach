import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const TIP_THRESHOLD = 5;

    // Status Bar
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = `Shortcut Coach: 0`;
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Track usage counts
    const usage = new Map<string, number>();

    // Suggested shortcuts
    const shortcuts: Record<string, string> = {
        'workbench.action.quickOpen': 'Ctrl+P',
        'editor.action.commentLine': 'Ctrl+/',
        'workbench.action.openSettings': 'Ctrl+,',
        'workbench.action.terminal.toggleTerminal': 'Ctrl+`',
        'editor.action.copyLinesDownAction': 'Shift+Alt+Down'
    };

    // Keep reference to dashboard panel (if open)
    let dashboardPanel: vscode.WebviewPanel | undefined;

    // Try to listen for all executed commands; fall back to wrapping executeCommand
    const commandsAny = vscode.commands as any;
    let disposable: vscode.Disposable;

    if (typeof commandsAny.onDidExecuteCommand === 'function') {
        // Modern VS Code: use the event (captures all commands without patching)
        disposable = commandsAny.onDidExecuteCommand((event: { command: string }) => {
            const command = event.command;
            const count = (usage.get(command) || 0) + 1;
            usage.set(command, count);

            // Update Status Bar
            const learnedCount = Array.from(usage.values()).filter(v => v >= TIP_THRESHOLD).length;
            statusBarItem.text = `Shortcut Coach: ${learnedCount}`;

            // Show tip when threshold reached
            if (count === TIP_THRESHOLD) {
                const suggestedShortcut = shortcuts[command];
                setTimeout(() => {
                    if (suggestedShortcut) {
                        vscode.window.showInformationMessage(
                            `Tip: You used "${command}" ${TIP_THRESHOLD} times. Try ${suggestedShortcut} next time!`
                        );
                    } else {
                        vscode.window.showInformationMessage(
                            `Tip: You used "${command}" ${TIP_THRESHOLD} times. Consider assigning or checking a keyboard shortcut in Keyboard Shortcuts (Ctrl+K Ctrl+S).`
                        );
                    }
                }, 200);
            }

            // Update dashboard if open
            if (dashboardPanel) {
                updateDashboard(dashboardPanel, usage, shortcuts, TIP_THRESHOLD);
            }
        });
    } else {
        // Older VS Code: wrap executeCommand as a safe fallback
        const originalExecuteCommand = vscode.commands.executeCommand;
        vscode.commands.executeCommand = function <T = unknown>(command: string, ...args: any[]): Thenable<T> {
            const count = (usage.get(command) || 0) + 1;
            usage.set(command, count);

            // Update Status Bar
            const learnedCount = Array.from(usage.values()).filter(v => v >= TIP_THRESHOLD).length;
            statusBarItem.text = `Shortcut Coach: ${learnedCount}`;

            // Show tip when threshold reached
            if (count === TIP_THRESHOLD) {
                const suggestedShortcut = shortcuts[command];
                setTimeout(() => {
                    if (suggestedShortcut) {
                        vscode.window.showInformationMessage(
                            `Tip: You used "${command}" ${TIP_THRESHOLD} times. Try ${suggestedShortcut} next time!`
                        );
                    } else {
                        vscode.window.showInformationMessage(
                            `Tip: You used "${command}" ${TIP_THRESHOLD} times. Consider assigning or checking a keyboard shortcut in Keyboard Shortcuts (Ctrl+K Ctrl+S).`
                        );
                    }
                }, 200);
            }

            // Update dashboard if open
            if (dashboardPanel) {
                updateDashboard(dashboardPanel, usage, shortcuts, TIP_THRESHOLD);
            }

            return originalExecuteCommand.call(this, command, ...args) as Thenable<T>;
        };

        // Disposable that restores original executeCommand on deactivate
        disposable = new vscode.Disposable(() => {
            vscode.commands.executeCommand = originalExecuteCommand;
        });
    }

    context.subscriptions.push(disposable);

    vscode.window.showInformationMessage('Shortcut Coach Activated!');

    // Command to show dashboard
    const dashboardCommand = vscode.commands.registerCommand('shortcut-coach.showDashboard', () => {
        if (!dashboardPanel) {
            dashboardPanel = vscode.window.createWebviewPanel(
                'shortcutCoachDashboard',
                'Shortcut Coach Dashboard',
                vscode.ViewColumn.One,
                { enableScripts: true }
            );

            // Close dashboard panel reference when disposed
            dashboardPanel.onDidDispose(() => {
                dashboardPanel = undefined;
            });

            updateDashboard(dashboardPanel, usage, shortcuts, TIP_THRESHOLD);
        } else {
            // Focus existing dashboard
            dashboardPanel.reveal();
        }
    });

    context.subscriptions.push(dashboardCommand);
}

// Update dashboard HTML
function updateDashboard(
    panel: vscode.WebviewPanel,
    usage: Map<string, number>,
    shortcuts: Record<string, string>,
    TIP_THRESHOLD: number
) {
    const entries = Array.from(usage.entries());
    const needingShortcuts = entries
        .filter(([, count]) => count < TIP_THRESHOLD)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const masteredCommands = entries
        .filter(([, count]) => count >= TIP_THRESHOLD)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    panel.webview.html = `
        <html>
        <head>
            <style>
                :root {
                    color-scheme: light dark;
                    --bg: #0f172a;
                    --bg-elevated: #020617;
                    --border-subtle: #1e293b;
                    --accent: #38bdf8;
                    --accent-soft: rgba(56, 189, 248, 0.15);
                    --text-main: #e5e7eb;
                    --text-muted: #9ca3af;
                    --badge-bg: #1f2937;
                    --badge-text: #f9fafb;
                    --shadow-soft: 0 18px 45px rgba(15, 23, 42, 0.65);
                }

                body {
                    margin: 0;
                    padding: 24px;
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    background: radial-gradient(circle at top left, #1e293b 0, #020617 45%, #020617 100%);
                    color: var(--text-main);
                }

                .shell {
                    max-width: 960px;
                    margin: 0 auto;
                }

                .header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }

                .title-group {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .logo {
                    width: 32px;
                    height: 32px;
                    border-radius: 999px;
                    background: radial-gradient(circle at 30% 20%, #f97316, #ea580c 45%, #0f172a 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 12px 35px rgba(248, 113, 22, 0.6);
                    font-size: 18px;
                }

                h1 {
                    margin: 0;
                    font-size: 20px;
                    letter-spacing: 0.02em;
                }

                .subtitle {
                    margin: 2px 0 0;
                    font-size: 12px;
                    color: var(--text-muted);
                }

                .pill {
                    font-size: 11px;
                    padding: 4px 10px;
                    border-radius: 999px;
                    border: 1px solid rgba(148, 163, 184, 0.4);
                    color: var(--text-muted);
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(15, 23, 42, 0.9);
                }

                .pill-dot {
                    width: 7px;
                    height: 7px;
                    border-radius: 999px;
                    background: #22c55e;
                    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.15);
                }

                .grid {
                    display: grid;
                    grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
                    gap: 16px;
                    margin-top: 10px;
                }

                .card {
                    background: radial-gradient(circle at top left, #0f172a 0, #020617 55%, #020617 100%);
                    border-radius: 14px;
                    border: 1px solid var(--border-subtle);
                    padding: 14px 16px 10px;
                    box-shadow: var(--shadow-soft);
                    position: relative;
                    overflow: hidden;
                }

                .card::before {
                    content: '';
                    position: absolute;
                    inset: -40%;
                    background:
                        radial-gradient(circle at 0 0, rgba(56, 189, 248, 0.06) 0, transparent 55%),
                        radial-gradient(circle at 100% 0, rgba(249, 115, 22, 0.05) 0, transparent 60%);
                    opacity: 0.85;
                    pointer-events: none;
                }

                .card-inner {
                    position: relative;
                    z-index: 1;
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }

                .card-title {
                    font-size: 13px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .chip-icon {
                    width: 18px;
                    height: 18px;
                    border-radius: 999px;
                    background: rgba(15, 23, 42, 0.85);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.35);
                }

                .card-caption {
                    font-size: 11px;
                    color: var(--text-muted);
                }

                table {
                    border-collapse: collapse;
                    width: 100%;
                    font-size: 11px;
                    margin-top: 4px;
                }

                th, td {
                    padding: 7px 8px;
                    border-bottom: 1px solid rgba(30, 64, 175, 0.28);
                    text-align: left;
                    white-space: nowrap;
                }

                th {
                    font-weight: 600;
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: var(--text-muted);
                    background: linear-gradient(to right, rgba(15, 23, 42, 0.9), rgba(17, 24, 39, 0.9));
                }

                tr:last-child td {
                    border-bottom: none;
                }

                .cmd {
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
                    font-size: 11px;
                    color: #e5e7eb;
                }

                .shortcut-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 3px 8px;
                    border-radius: 999px;
                    background: var(--badge-bg);
                    color: var(--badge-text);
                    border: 1px solid rgba(156, 163, 175, 0.4);
                    font-size: 10px;
                }

                .shortcut-pill span {
                    font-size: 10px;
                }

                .shortcut-pill--missing {
                    opacity: 0.7;
                }

                .empty {
                    font-size: 12px;
                    color: var(--text-muted);
                    padding: 6px 2px 0;
                }

                .empty-hero {
                    font-size: 13px;
                    color: var(--text-muted);
                    margin-top: 14px;
                }

                .empty-hero strong {
                    color: #e5e7eb;
                }

                .empty-hero span {
                    opacity: 0.85;
                }

                .badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 3px 8px;
                    border-radius: 999px;
                    border: 1px solid rgba(56, 189, 248, 0.6);
                    background: var(--accent-soft);
                    color: #e0f2fe;
                    font-size: 10px;
                }

                .badge-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 999px;
                    background: var(--accent);
                    box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.27);
                }

                .mastered-count {
                    font-weight: 600;
                }
            </style>
        </head>
        <body>
            <div class="shell">
                <div class="header">
                    <div class="title-group">
                        <div class="logo" title="Shortcut Coach">
                            ⌨
                        </div>
                        <div>
                            <h1>Shortcut Coach</h1>
                            <p class="subtitle">Turn repeated clicks into fast muscle memory.</p>
                        </div>
                    </div>
                    <div class="pill">
                        <span class="pill-dot"></span>
                        Live session
                    </div>
                </div>
            ${
                entries.length === 0
                    ? `<p class="empty-hero"><strong>No commands tracked yet.</strong> <span>Use VS Code commands a few times, then reopen this dashboard to see personalized suggestions.</span></p>`
                    : `
                        <div class="grid">
                            <div class="card">
                                <div class="card-inner">
                                    <div class="card-header">
                                        <div class="card-title">
                                            <div class="chip-icon" title="Commands to optimize">
                                                🎯
                                            </div>
                                            Commands to learn shortcuts for
                                        </div>
                                    </div>
                                    <p class="card-caption">Your most-used actions that are still below the learning threshold.</p>
                        ${
                            needingShortcuts.length === 0
                                ? `<p class="empty">Nice! You have no commands below the learning threshold right now.</p>`
                                : `
                                    <table>
                                        <tr><th>Command</th><th>Usage</th><th>Shortcut</th></tr>
                                        ${needingShortcuts
                                            .map(
                                                ([cmd, cnt]) => `
                                                    <tr>
                                                        <td class="cmd">${cmd}</td>
                                                        <td>${cnt}</td>
                                                        <td>
                                                            ${
                                                                shortcuts[cmd]
                                                                    ? `<span class="shortcut-pill"><span>⚡</span><span>${shortcuts[cmd]}</span></span>`
                                                                    : `<span class="shortcut-pill shortcut-pill--missing"><span>＋</span><span>Assign shortcut</span></span>`
                                                            }
                                                        </td>
                                                    </tr>
                                                `
                                            )
                                            .join('')}
                                    </table>
                                `
                        }
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-inner">
                                    <div class="card-header">
                                        <div class="card-title">
                                            <div class="chip-icon" title="Commands you've mastered">
                                                ⭐
                                            </div>
                                            Commands you've learned
                                        </div>
                                        <div class="badge">
                                            <span class="badge-dot"></span>
                                            <span class="mastered-count">${masteredCommands.length}</span>
                                            mastered
                                        </div>
                                    </div>
                                    <p class="card-caption">Commands you've triggered enough times to be considered learned.</p>
                        ${
                            masteredCommands.length === 0
                                ? `<p class="empty">Keep using your favorite commands to see them here.</p>`
                                : `
                                    <table>
                                        <tr><th>Command</th><th>Usage</th></tr>
                                        ${masteredCommands
                                            .map(
                                                ([cmd, cnt]) => `
                                                    <tr>
                                                        <td class="cmd">${cmd}</td>
                                                        <td>${cnt}</td>
                                                    </tr>
                                                `
                                            )
                                            .join('')}
                                    </table>
                                `
                        }
                                </div>
                            </div>
                        </div>
                    `
            }
            </div>
        </body>
        </html>
    `;
}

export function deactivate() {}
