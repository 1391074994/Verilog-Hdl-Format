import * as vscode from 'vscode';
import { VerilogParser,VerilogParser_module } from './VerilogParser';
// 4 ---
// 同一个文件里面的定义跳转-----------
export async function provideVerilogDefinition(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.Location | null> {
  const parser = new VerilogParser();

  const wordRange = document.getWordRangeAtPosition(position);
  const symbol = document.getText(wordRange);

  const filePath = document.uri.fsPath;
  const content = await vscode.workspace.openTextDocument(filePath).then(doc => doc.getText());

  const definitions = parser.parse(filePath, content);
  const definition = definitions.get(symbol);

  if (definition) {
    return new vscode.Location(document.uri, new vscode.Position(definition.line - 1, definition.column - 1));
  } else {
    return null;
  }
}


// //5 -----
// 跨页面的 模块跳转
export async function provideVerilogDefinition2(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.Location | null> {
  const parser = new VerilogParser_module();

  const wordRange = document.getWordRangeAtPosition(position);
  const symbol = document.getText(wordRange);

  const workspacePath = vscode.workspace.rootPath;
  if (!workspacePath) {
    return null;
  }

  const files = await vscode.workspace.findFiles('**/*.v'); // Assuming Verilog files have .v extension
  for (const file of files) {
    const content = await vscode.workspace.openTextDocument(file).then(doc => doc.getText());
    const definitions = parser.parse(content);

    const definition = definitions.get(symbol);
    if (definition) {
      const uri = vscode.Uri.file(file.path);
      return new vscode.Location(uri, new vscode.Position(definition.line - 1, definition.column - 1));
    }
  }

  return null;
}
