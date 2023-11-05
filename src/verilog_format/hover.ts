// hover.ts
////////////////////////////////////////////////////////////////////////////////
//verilog 代码悬停															 
////////////////////////////////////////////////////////////////////////////////
//----整行匹配--行数太多有BUG
// import * as vscode from 'vscode';

// export function hover(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.Hover> {
//     const wordRange = document.getWordRangeAtPosition(position);
//     if (wordRange) {
//         const variableName = document.getText(wordRange);
//         const variableDeclarationRegex = new RegExp(`\\b(?:assign|wire|reg|localparam|parameter|input|output|inout|integer|real|time|genvar|defparam|ref)\\s+([^;]+)\\s*\\b${variableName}\\b`, 'i');
//         let hoverText = '';

//         let isInsideMultilineComment = false;

//         for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
//             const line = document.lineAt(lineIndex);

//             // 检查是否在多行注释内
//             if (line.text.includes('/*')) {
//                 isInsideMultilineComment = true;
//             }

//             if (!isInsideMultilineComment && !/^\s*\/\//.test(line.text)) {
//                 const matches = line.text.match(variableDeclarationRegex);

//                 if (matches) {
//                     hoverText += `${lineIndex + 1}: ${line.text}\n`;
//                 }
//             }

//             // 检查是否离开多行注释
//             if (line.text.includes('*/')) {
//                 isInsideMultilineComment = false;
//             }
//         }

//         if (hoverText.length > 0) {
//             const codeBlock = new vscode.MarkdownString();
//             codeBlock.appendCodeblock(hoverText, 'verilog');
//             return new vscode.Hover(codeBlock);
//         }
//     }

//     return null;
// }


// 转换成字符 --进行识别 速度快
  /*              import * as vscode from 'vscode';

                export function hover(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.Hover> {
                    const text = document.getText();
                    const wordRange = document.getWordRangeAtPosition(position);
                    if (wordRange) {
                        const variableName = document.getText(wordRange);
                        const variableDeclarationRegex = new RegExp(`(?:(?<!\\/\\/)\\b(?:assign|wire|reg|localparam|parameter|input|output|inout|integer|real|time|genvar|defparam|ref)\\s+([^;]+)\\s*\\b${variableName}\\b)|(?:\\/\\*[\\s\\S]*?\\*\\/.*?\\b${variableName}\\b)`, 'gi');
                        let hoverText = [];

                        for (const match of text.matchAll(variableDeclarationRegex)) {
                            const [matchText, declarationText] = match;
                            const lineIndex = document.positionAt(match.index).line;
                            const lineText = document.lineAt(lineIndex).text;
                            hoverText.push(`${lineIndex + 1}: ${lineText}`);
                        }

                        if (hoverText.length > 0) {
                            const codeBlock = new vscode.MarkdownString();
                            codeBlock.appendCodeblock(hoverText.join('\n'), 'verilog');
                            return new vscode.Hover(codeBlock);
                        }
                    }

                    return null;
                }

*/


/*
import * as vscode from 'vscode';

export function hover(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.Hover> {
  const text = document.getText();
  const lines = text.split('\n'); // 将文本按行拆分成数组
  const wordRange = document.getWordRangeAtPosition(position);
  
  if (wordRange) {
    const variableName = document.getText(wordRange);
    const variableDeclarationRegex = new RegExp(`(?:(?<!\\/\\/)\\b(?:assign|wire|reg|localparam|parameter|input|output|inout|integer|real|time|genvar|defparam|ref)\\s+([^;]+)\\s*\\b${variableName}\\b)|(?:\\/\\*[\\s\\S]*?\\*\\/.*?\\b${variableName}\\b)`, 'gi');
    let hoverText = [];

    for (const line of lines) {
      const match = variableDeclarationRegex.exec(line); // 在每一行中匹配变量声明
      if (match) {
        const [matchText, declarationText] = match;
        const lineIndex = lines.indexOf(line);
        hoverText.push(`${lineIndex + 1}: ${line}`);
      }
    }

    if (hoverText.length > 0) {
      const codeBlock = new vscode.MarkdownString();
      codeBlock.appendCodeblock(hoverText.join('\n'), 'verilog');
      return new vscode.Hover(codeBlock);
    }
  }

  return null;
}

*/










//=============================================================================
//  没行转换成字符  再进行识别                                                                             
//=============================================================================



import * as vscode from 'vscode';
export function hover(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.Hover> {
    const wordRange = document.getWordRangeAtPosition(position);
    if (wordRange) {
        const variableName = document.getText(wordRange);
        const variableDeclarationRegex = new RegExp(`\\b(?:assign|wire|reg|localparam|parameter|input|output|inout|integer|real|time|genvar|defparam|ref)\\s+([^;]+)\\s*\\b${variableName}\\b`, 'i');
        let hoverText = '';
        let isInsideMultilineComment = false;
        const linesWithVariable = new Set<number>();
        for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
            const lineChars = document.lineAt(lineIndex).text.split(''); // 将每行转换为字符数组
            // 检查是否在多行注释内
            if (lineChars.includes('/') && lineChars[lineChars.indexOf('/') + 1] === '*') {
                isInsideMultilineComment = true;
            }
            if (!isInsideMultilineComment && !/^\s*\/\//.test(document.lineAt(lineIndex).text)) {
                const matches = lineChars.join('').match(variableDeclarationRegex); // 将字符数组转换回字符串
                if (matches) {
                    hoverText += `${lineIndex + 1}: ${document.lineAt(lineIndex).text}\n`;
                    linesWithVariable.add(lineIndex);
                }
            }
            // 检查是否离开多行注释
            if (lineChars.includes('*') && lineChars[lineChars.indexOf('*') + 1] === '/') {
                isInsideMultilineComment = false;
            }
        }
        if (hoverText.length > 0) {
            const codeBlock = new vscode.MarkdownString();
            codeBlock.appendCodeblock(hoverText, 'verilog');
            const hoverRange = new vscode.Range(
                Math.min(...linesWithVariable),
                0,
                Math.max(...linesWithVariable),
                document.lineAt(Math.max(...linesWithVariable)).text.length
            );
            return new vscode.Hover(codeBlock, hoverRange);
        }
    }
    return null;
}



                