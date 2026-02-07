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

    // Override executeCommand to track usage
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
            if (suggestedShortcut) {
                setTimeout(() => {
                    vscode.window.showInformationMessage(
                        `Tip: You used "${command}" ${TIP_THRESHOLD} times. Try ${suggestedShortcut} next time!`
                    );
                }, 200);
            }
        }

        // Update dashboard if open
        if (dashboardPanel) {
            updateDashboard(dashboardPanel, usage, shortcuts, TIP_THRESHOLD);
        }

        return originalExecuteCommand.call(this, command, ...args) as Thenable<T>;
    };

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
    const topCommands = Array.from(usage.entries())
        .filter(([_, count]) => count < TIP_THRESHOLD)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    panel.webview.html = `
        <html>
        <head>
            <style>
                body { font-family: sans-serif; padding: 20px; }
                h1 { color: #007acc; }
                table { border-collapse: collapse; width: 100%; }
                th, td { padding: 8px 12px; border: 1px solid #ddd; text-align: left; }
                th { background-color: #f3f3f3; }
            </style>
        </head>
        <body>
            <h1>Shortcut Coach Dashboard</h1>
            <p>Top 5 commands to learn shortcuts for:</p>
            <table>
                <tr><th>Command</th><th>Usage Count</th><th>Shortcut</th></tr>
                ${topCommands.map(([cmd, cnt]) => `
                    <tr>
                        <td>${cmd}</td>
                        <td>${cnt}</td>
                        <td>${shortcuts[cmd] || '—'}</td>
                    </tr>
                `).join('')}
            </table>
        </body>
        </html>
    `;
}

export function deactivate() {}
