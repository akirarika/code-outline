import * as vscode from "vscode";
import { SchemaProvider } from "./code-outline";
import { join } from "path";
import { debounce } from "lodash";
import { existsSync } from "fs";

export async function activate(context: vscode.ExtensionContext) {
  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (!editor) {
      return;
    }
    schemaProvider.refresh();
  });

  const onRefresh = debounce(() => {
    schemaProvider.refresh();
  }, 640);

  vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
    onRefresh();
  });

  const schemaProvider = new SchemaProvider();
  vscode.window.registerTreeDataProvider("code-outline-schema", schemaProvider);

  const disposable = vscode.commands.registerCommand("code-outline-schema.to", async (line: number) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    editor.revealRange(editor.document.lineAt(line === 0 ? 0 : line - 1).range, 3);
    editor.selection = new vscode.Selection(editor.document.lineAt(line).range.end, editor.document.lineAt(line).range.end);
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
