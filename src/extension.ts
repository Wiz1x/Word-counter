import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    // Status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.tooltip = 'Word count (selection / total)';
    context.subscriptions.push(statusBarItem);

    // Command: show word count in information message
    let disposable = vscode.commands.registerCommand('myplugin.countWords', () => {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showErrorMessage("Нет открытого файла.");
            return;
        }

        const text = editor.document.getText();
        const words = countWords(text);

        vscode.window.showInformationMessage(`В файле ${words} слов`);
    });
    context.subscriptions.push(disposable);

    // Update status bar when editor or document changes
    const updateStatusBar = () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            statusBarItem.hide();
            return;
        }

        const doc = editor.document;
        const total = countWords(doc.getText());

        const selection = editor.selection;
        let textToCount = '';
        let selCount = 0;
        if (selection && !selection.isEmpty) {
            textToCount = doc.getText(selection);
            selCount = countWords(textToCount);
        }

        if (selCount > 0) {
            statusBarItem.text = `$(pencil) ${selCount}/${total} слов`;
        } else {
            statusBarItem.text = `$(pencil) ${total} слов`;
        }
        statusBarItem.show();
    };

    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBar));
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((e) => {
        // Only update if the changed document is the active one
        if (vscode.window.activeTextEditor && e.document === vscode.window.activeTextEditor.document) {
            updateStatusBar();
        }
    }));
    context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection((e) => {
        if (e.textEditor === vscode.window.activeTextEditor) {
            updateStatusBar();
        }
    }));

    // Initial update
    updateStatusBar();
}

export function countWords(text: string): number {
    if (text == null) return 0;

    const cleaned = text.trim();
    if (cleaned.length === 0) return 0;

    // Split on any whitespace sequence
    const words = cleaned.split(/\s+/);
    return words.filter(w => w.length > 0).length;
}

export function deactivate() {}
