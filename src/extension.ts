import * as vscode from "vscode";
import replaceWordEn from "./common/replaceWordEn";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(replaceWordEn);
}

// this method is called when your extension is deactivated
export function deactivate() {}
