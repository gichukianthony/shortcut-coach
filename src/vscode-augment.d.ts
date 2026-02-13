import type { Event } from 'vscode';

declare module 'vscode' {
    export namespace commands {
        /**
         * Event that fires whenever a command is executed.
         * This may not be present in older versions of the VS Code
         * typings, so we augment the type here.
         */
        const onDidExecuteCommand: Event<{
            command: string;
            arguments?: readonly any[];
        }>;
    }
}

