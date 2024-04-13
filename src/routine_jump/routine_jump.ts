// import * as vscode from 'vscode';
// import * as fs from 'fs';
// import * as path from 'path';

// export function activate(context: vscode.ExtensionContext) {
//     // 命令用于跳转到模块定义
//     let disposableModule = vscode.commands.registerCommand('extension.gotoDefinitionModule', () => {
//         const editor = vscode.window.activeTextEditor;
//         if (!editor) {
//             return;
//         }

//         const selection = editor.selection;
//         const text = editor.document.getText(selection);

//         findAndOpenVerilogFile(text, 'module');
//     });
//  // 新增命令用于跳转到变量定义
//  let disposablePin = vscode.commands.registerCommand('extension.gotoDefinitionPin', function () {
//     const editor = vscode.window.activeTextEditor;
//     if (!editor) {
//         return;
//     }

//     const selection = editor.selection;
//     const text = editor.document.getText(selection);

//     findAndOpenVerilogFile(text, 'pin');
// });

// context.subscriptions.push(disposableModule, disposablePin);
// vscode.languages.registerDefinitionProvider('verilog', {
//     provideDefinition(document: { getWordRangeAtPosition: (arg0: any) => any; getText: (arg0: any) => any; }, position: any, token: any) {
//         const wordRange = document.getWordRangeAtPosition(position);
//         const word = document.getText(wordRange);
//         // 这里假设所有的跳转都是基于变量名的搜索
//         return findVerilogFileDefinition(word, 'pin');
//     }
// });
// }
// function findAndOpenVerilogFile(identifier: string, searchType: string) {
// const folderPath = vscode.workspace.rootPath;
// if (!folderPath) {
//     return;
// }

// const verilogFiles = searchVerilogFiles(folderPath);
// let regex; // 移动到这里声明，但暂时不赋值

// for (let filePath of verilogFiles) {
//     const fileContent = fs.readFileSync(filePath, 'utf8');
    
//     if (searchType === 'module') {
//         regex = /module\s+(\w+)\s*\#?\s*\(/g;
//     } else if (searchType === 'pin') {
//         regex = /\s*(input|output|inout)\s*(wire|reg|)?\s*(signed)?\s*((?:\[[^\]]+\])?)?\s*(\w+)/g;
//     } else {
//         // 可能需要处理未定义searchType的情况或抛出错误
//         console.error('Invalid search type');
//         return;
//     }

//     // 确保regex已经被定义
//     if (!regex) {continue;}

//     let match;
//     while ((match = regex.exec(fileContent)) !== null) {
//         const matchIndex = searchType === 'module' ? 1 : 5;
//         if (match[matchIndex] === identifier) {
//             // 找到匹配项的起始位置对应的行号
//             // const startLine = fileContent.substring(0, match.index).split('\n').length - 1;
//             const startLine = fileContent.substring(0, match.index).split('\n').length ;
//             // 获取匹配项所在行的内容
//             const matchLineContent = fileContent.split('\n')[startLine];
//             // 计算匹配项在其所在行的起始列位置
//             const startColumn = matchLineContent.indexOf(match[matchIndex]);
//             // 计算匹配项在其所在行的结束列位置
//             const endColumn = startColumn + match[matchIndex].length;
    
//             vscode.workspace.openTextDocument(filePath).then((doc: any) => {
//                 vscode.window.showTextDocument(doc, {
//                     // 创建一个新的Range，起始和结束位置都设为变量名的结束位置
//                     selection: new vscode.Range(startLine, endColumn, startLine, endColumn)
//                 });
//             });
//             return; // 找到匹配的标识符，停止搜索
//         }
//     }
    
    
// }

// vscode.window.showInformationMessage(`No Verilog file found for ${searchType === 'module' ? "module" : "pin"} "${identifier}"`);
// } // 注意这里添加了分号解决Missing semicolon问题


// function searchVerilogFiles(folderPath: any) {
// let filesFound: any[] = [];
// const files = fs.readdirSync(folderPath);

// files.forEach((file: any) => {
//     const filePath = path.join(folderPath, file);
//     const stat = fs.statSync(filePath);

//     if (stat.isDirectory()) {
//         filesFound = filesFound.concat(searchVerilogFiles(filePath));
//     } else if (path.extname(file) === '.v') {
//         filesFound.push(filePath);
//     }
// });

// return filesFound;
// }

// function findVerilogFileDefinition(word: any, _searchType: string) {
// // 实现逻辑与findAndOpenVerilogFile类似，但是这里返回的是vscode.Location对象
// // 由于这个函数目前只用于变量名的搜索，我们可以省略searchType参数或者将其默认设置为'pin'
// // 如果未来需要支持模块名的搜索，则可以根据searchType调整正则表达式和匹配逻辑
// return null; // 示例中未实现，需要根据实际情况填充
// }


// export function deactivate() {}






// import * as vscode from 'vscode';
// import * as fs from 'fs';
// import * as path from 'path';

// export function activate(context: vscode.ExtensionContext) {
//     let disposableModule = vscode.commands.registerCommand('extension.gotoDefinitionModule', () => {
//         const editor = vscode.window.activeTextEditor;
//         if (!editor) {
//             return;
//         }

//         const selection = editor.selection;
//         const text = editor.document.getText(selection);

//         findAndOpenVerilogFile(text, 'module');
//     });

//     let disposablePin = vscode.commands.registerCommand('extension.gotoDefinitionPin', () => {
//         gotoDefinitionPin();
//     });

//     context.subscriptions.push(disposableModule, disposablePin);
// }

// function findAndOpenVerilogFile(identifier: string, searchType: string) {
//     const folderPath = vscode.workspace.rootPath;
//     if (!folderPath) {
//         return;
//     }

//     const verilogFiles = searchVerilogFiles(folderPath);
//     let regex;

//     for (let filePath of verilogFiles) {
//         const fileContent = fs.readFileSync(filePath, 'utf8');

//         if (searchType === 'module') {
//             regex = /module\s+(\w+)\s*\#?\s*\(/g;
//         } else if (searchType === 'pin') {
//             regex = /\s*(input|output|inout)\s*(wire|reg|)?\s*(signed)?\s*((?:\[[^\]]+\])?)?\s*(\w+)/g;
//         } else {
//             console.error('Invalid search type');
//             return;
//         }

//         if (!regex) { continue; }

//         let match;
//         while ((match = regex.exec(fileContent)) !== null) {
//             const matchIndex = searchType === 'module' ? 1 : 5;
//             if (match[matchIndex] === identifier) {
//                 const startLine = fileContent.substring(0, match.index).split('\n').length;
//                 const matchLineContent = fileContent.split('\n')[startLine];
//                 const startColumn = matchLineContent.indexOf(match[matchIndex]);
//                 const endColumn = startColumn + match[matchIndex].length;

//                 vscode.workspace.openTextDocument(filePath).then((doc: any) => {
//                     vscode.window.showTextDocument(doc, {
//                         selection: new vscode.Range(startLine, endColumn, startLine, endColumn)
//                     });
//                 });
//                 return;
//             }
//         }
//     }

//     vscode.window.showInformationMessage(`No Verilog file found for ${searchType === 'module' ? "module" : "pin"} "${identifier}"`);
// }

// function searchVerilogFiles(folderPath: any) {
//     let filesFound: any[] = [];
//     const files = fs.readdirSync(folderPath);

//     files.forEach((file: any) => {
//         const filePath = path.join(folderPath, file);
//         const stat = fs.statSync(filePath);

//         if (stat.isDirectory()) {
//             filesFound = filesFound.concat(searchVerilogFiles(filePath));
//         } else if (path.extname(file) === '.v') {
//             filesFound.push(filePath);
//         }
//     });

//     return filesFound;
// }




// function gotoDefinitionPin() {
//     const editor = vscode.window.activeTextEditor;
//     if (!editor) {
//         return;
//     }

//     const selection = editor.selection;
//     const text = editor.document.getText(selection);

//     let currentFilePath = editor.document.fileName;

//     let foundVariable: string | undefined;
//     let line = selection.start.line;
//     let previousLinesText = '';
//     for (let i = line - 1; i >= 0; i--) {
//         const lineText = editor.document.lineAt(i).text;
//         previousLinesText = lineText + ' ' + previousLinesText; // 在每次迭代中添加空格分隔符
//          // const match = previousLinesText.match(/(\w+)\s+\#\s*\(\s*\.\s*(\w+)\s*\(\s*(\w+)\s*\)\s*|(\w+)\s+(\w+)\s*\(\s*\.\s*(\w+)/);
//         const match = previousLinesText.match(/(\w+)\s+\#\s*\(\s*\.\s*(\w+)\s*\(\s*(\w+)\s*\)\s*|(\w+)\s+(\w+)\s*\(\s*/);
//         if (match) {
//             foundVariable = match[1] || match[4];
//             break;
//         }
//     }
    

//     // console.log("foundVariable=",foundVariable);
//     if (!foundVariable) {
//         vscode.window.showInformationMessage('No corresponding variable found in the previous lines.');
//         return;
//     }

//     const verilogFiles = searchVerilogFiles(vscode.workspace.rootPath);
//     for (let filePath of verilogFiles) {
//         if (filePath === currentFilePath) {continue;}

//         const fileContent = fs.readFileSync(filePath, 'utf8');
//         const moduleMatch = fileContent.match(/module\s+(\w+)\s*\#?\s*\(/);
//         if (moduleMatch && moduleMatch[1] === foundVariable) {
//             // console.log('found variable in another file');
//             const regex = /\s*(input|output|inout)\s*(wire|reg|)?\s*(signed)?\s*(\[\s*\d+\s*:\s*\d+\s*\])?\s*(\w+)/g;
//             let match;
//             while ((match = regex.exec(fileContent)) !== null) {
//                 const matchedVariable = match[5];

//                 if (matchedVariable === text) {
//                     const linesBeforeMatch = fileContent.substring(0, match.index).split('\n');
//                     const line = linesBeforeMatch.length + 1; // 获取匹配到的行数
                
//                     const linesBeforeMatchStr = linesBeforeMatch.join('\n');
//                     const lineStartIndex = linesBeforeMatchStr.length; // 获取匹配行之前的字符总数，即起始位置
                
                    
//                     const lineContent = fileContent.split('\n')[line - 1];
//                     const columnStart = lineContent.indexOf(matchedVariable); // 计算匹配变量的开始列位置
//                     const columnEnd = columnStart + matchedVariable.length; // 计算匹配变量的结束列位置

//                     // console.log("match.index=",match.index);
//                     // console.log("lineStartIndex=",lineStartIndex);
//                     // console.log("columnStart=",columnStart);
//                     // console.log("columnEnd=",columnEnd);
                    
//                     const startPosition = new vscode.Position(line - 1, columnStart);
//                     const endPosition = new vscode.Position(line - 1, columnEnd);
                
//                     vscode.workspace.openTextDocument(filePath).then((doc) => {
//                         vscode.window.showTextDocument(doc, { preview: false }).then((editor) => {
//                             editor.selection = new vscode.Selection(startPosition, endPosition);
//                             editor.revealRange(new vscode.Range(startPosition, endPosition), vscode.TextEditorRevealType.InCenter);
//                         });
//                     });

//                     return;
//                 }
//             }
//             break; // 在找到匹配变量后停止遍历文件内容
//         }
//     }

//     vscode.window.showInformationMessage(`No matching variable found in other Verilog files for "${text}".`);
// }

// export function deactivate() {}

//------------------------------
// 例化跳转和例化PIN角跳转-修改为鼠标放上去就可以选择命令进行跳转，不要双击选择变量
//------------------------------

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    let disposableModule = vscode.commands.registerCommand('extension.gotoDefinitionModule', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        
        let selection = editor.selection;
        let text = editor.document.getText(selection);
        let range = new vscode.Range(selection.start, selection.end);

        // If no text is selected, check if the cursor is on a word and use that as the identifier
        if (text === '') {
            let cursorPosition = editor.selection.active;
            let wordRange = editor.document.getWordRangeAtPosition(cursorPosition);
            if (wordRange) {
                text = editor.document.getText(wordRange);
                range = wordRange;
            }
        }

        findAndOpenVerilogFile(text, 'module');
    });

    let disposablePin = vscode.commands.registerCommand('extension.gotoDefinitionPin', () => {
        gotoDefinitionPin();
    });

    context.subscriptions.push(disposableModule, disposablePin);
}

function findAndOpenVerilogFile(identifier: string, searchType: string) {
    const folderPath = vscode.workspace.rootPath;
    if (!folderPath) {
        return;
    }

    const verilogFiles = searchVerilogFiles(folderPath);
    let regex;

    for (let filePath of verilogFiles) {
        const fileContent = fs.readFileSync(filePath, 'utf8');

        if (searchType === 'module') {
            regex = /module\s+(\w+)\s*\#?\s*\(/g;
        } else if (searchType === 'pin') {
            regex = /\s*(input|output|inout)\s*(wire|reg|)?\s*(signed)?\s*((?:\[[^\]]+\])?)?\s*(\w+)/g;
        } else {
            console.error('Invalid search type');
            return;
        }

        if (!regex) { continue; }

        let match;
        while ((match = regex.exec(fileContent)) !== null) {
            const matchIndex = searchType === 'module' ? 1 : 5;
            if (match[matchIndex] === identifier) {
                const startLine = fileContent.substring(0, match.index).split('\n').length;
                const matchLineContent = fileContent.split('\n')[startLine];
                const startColumn = matchLineContent.indexOf(match[matchIndex]);
                const endColumn = startColumn + match[matchIndex].length;

                vscode.workspace.openTextDocument(filePath).then((doc: any) => {
                    vscode.window.showTextDocument(doc, {
                        selection: new vscode.Range(startLine, endColumn, startLine, endColumn)
                    });
                });
                return;
            }
        }
    }

    vscode.window.showInformationMessage(`No Verilog file found for ${searchType === 'module' ? "module" : "pin"} "${identifier}"`);
}

function gotoDefinitionPin() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    let cursorPosition = editor.selection.active;
    let text = editor.document.getText(editor.document.getWordRangeAtPosition(cursorPosition));
    console.log("text=",text);
    let currentFilePath = editor.document.fileName;

    let foundVariable: string | undefined;
    let line = cursorPosition.line;
    let previousLinesText = '';
    for (let i = line - 1; i >= 0; i--) {
        const lineText = editor.document.lineAt(i).text;
        previousLinesText = lineText + ' ' + previousLinesText; // 在每次迭代中添加空格分隔符
         // const match = previousLinesText.match(/(\w+)\s+\#\s*\(\s*\.\s*(\w+)\s*\(\s*(\w+)\s*\)\s*|(\w+)\s+(\w+)\s*\(\s*\.\s*(\w+)/);
        const match = previousLinesText.match(/(\w+)\s+\#\s*\(\s*\.\s*(\w+)\s*\(\s*(\w+)\s*\)\s*|(\w+)\s+(\w+)\s*\(\s*/);
        if (match) {
            foundVariable = match[1] || match[4];
            console.log("foundVariable=",foundVariable);
            break;
        }
    }

    if (!foundVariable) {
        vscode.window.showInformationMessage('No corresponding variable found in the previous lines.');
        return;
    }

    const verilogFiles = searchVerilogFiles(vscode.workspace.rootPath);
    for (let filePath of verilogFiles) {
        if (filePath === currentFilePath) {continue;}

        const fileContent = fs.readFileSync(filePath, 'utf8');
        // console.log("fileContent=",fileContent);
        const moduleMatch = fileContent.match(/module\s+(\w+)\s*\#?\s*\(/);
        if (moduleMatch && moduleMatch[1] === foundVariable) {
            // const regex = /\s*(input|output|inout)\s*(wire|reg|)?\s*(signed)?\s*(\[\s*\d+\s*:\s*\d+\s*\])?\s*(\w+)/g;
            // const regex = /[^\S\n]*(input|output|inout)[^\S\n]*(wire|reg|)?[^\S\n]*(signed)?[^\S\n]*(\[\s*\d+\s*:\s*\d+\s*\])?\s*(\w+)/g;
            const regex = /[^\S\n]*(input|output|inout)[^\S\n]*(wire|reg|)?[^\S\n]*(signed)?[^\S\n]*(\[\s*.+\s*:\s*.+\s*\])?\s*(\w+)/g;
            let match;
            while ((match = regex.exec(fileContent)) !== null) {
                const matchedVariable = match[5];
                // console.log("match.index000",match.index);
                if (matchedVariable === text) {
                    // console.log('matchedVariable', matchedVariable);
                    // console.log("match.index",match.index);
                    const linesBeforeMatch = fileContent.substring(0, match.index).split(/\r?\n/);
                    // console.log('linesBeforeMatch', linesBeforeMatch);
                    // const line = linesBeforeMatch.length + 1; // 获取匹配到的行数
                    let line = linesBeforeMatch.length; // 获k取匹配到的行数
                    // console.log('line', line);
                    const linesBeforeMatchStr = linesBeforeMatch.join('\n');
                    const lineStartIndex = linesBeforeMatchStr.length; // 获取匹配行之前的字符总数，即起始位置
                
                    const lineContent = fileContent.split('\n')[line - 1];
                    const columnStart = lineContent.indexOf(matchedVariable); // 计算匹配变量的开始列位置
                    const columnEnd = columnStart + matchedVariable.length; // 计算匹配变量的结束列位置

                    const startPosition = new vscode.Position(line - 1, columnStart);
                    const endPosition = new vscode.Position(line - 1, columnEnd);
                
                    vscode.workspace.openTextDocument(filePath).then((doc) => {
                        vscode.window.showTextDocument(doc, { preview: false }).then((editor) => {
                            editor.selection = new vscode.Selection(startPosition, endPosition);
                            editor.revealRange(new vscode.Range(startPosition, endPosition), vscode.TextEditorRevealType.InCenter);
                        });
                    });

                    return;
                }
            }
            break; // 在找到匹配变量后停止遍历文件内容
        }
    }

    vscode.window.showInformationMessage(`No matching variable found in other Verilog files for "${text}".`);
}

function searchVerilogFiles(folderPath: any) {
    let filesFound: any[] = [];
    const files = fs.readdirSync(folderPath);

    files.forEach((file: any) => {
        const filePath = path.join(folderPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            filesFound = filesFound.concat(searchVerilogFiles(filePath));
        } else if (path.extname(file) === '.v') {
            filesFound.push(filePath);
        }
    });

    return filesFound;
}

export function deactivate() {}
