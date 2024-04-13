import * as vscode from 'vscode';

// export function activate(context: vscode.ExtensionContext) {
//     context.subscriptions.push(
//         vscode.commands.registerCommand('extension.createModule', async () => {
//             await insertSnippet(provideModuleSnippet);
//         }),
//         vscode.commands.registerCommand('extension.createTB', async () => {
//             await insertSnippet(provideTBSnippet);
//         })
//     );
// }
// 提供 'module' 片段的函数
async function provideModuleSnippet() {
    let userName = vscode.workspace.getConfiguration('extension').get('userName');
    let companyName = vscode.workspace.getConfiguration('extension').get('companyName');
    let extension = vscode.extensions.getExtension('Jiang-Percy.Verilog-Hdl-Format');
    let version = extension ? extension.packageJSON.version : 'unknown';

    let moduleSnippet = new vscode.CompletionItem('module', vscode.CompletionItemKind.Snippet);
    moduleSnippet.insertText = new vscode.SnippetString( 
    "`timescale 1ns / 1ps\n" +
    "//****************************************VSCODE PLUG-IN**********************************//\n" +
    "//----------------------------------------------------------------------------------------\n" +
    "// IDE :                   VSCODE     \n" +
    "// VSCODE plug-in version: Verilog-Hdl-Format-"+ version +"\n" +
    "// VSCODE plug-in author : Jiang Percy\n" +
    "//----------------------------------------------------------------------------------------\n" +
    "//****************************************Copyright (c)***********************************//\n" +
    "// Copyright(C)            "+ companyName + "\n" +
    "// All rights reserved     \n"+
    "// File name:              \n" +
    "// Last modified Date:     $CURRENT_YEAR/$CURRENT_MONTH/$CURRENT_DATE $CURRENT_HOUR:$CURRENT_MINUTE:$CURRENT_SECOND\n" +
    "// Last Version:           V1.0\n" +
    "// Descriptions:           \n" +
    "//----------------------------------------------------------------------------------------\n" +
    "// Created by:             " + userName + "\n" +
    "// Created date:           $CURRENT_YEAR/$CURRENT_MONTH/$CURRENT_DATE $CURRENT_HOUR:$CURRENT_MINUTE:$CURRENT_SECOND\n" +
    "// Version:                V1.0\n" +
    "// TEXT NAME:              $TM_FILENAME\n" +
    "// PATH:                   $TM_FILEPATH\n" +
    "// Descriptions:           \n" +
    "//                         \n" +
    "//----------------------------------------------------------------------------------------\n" +
    "//****************************************************************************************//\n" +
    "\n" +
    "module ${TM_FILENAME_BASE}(\n" +
    "    input                               clk                        ,\n" +
    "    input                               rst_n                      \n" +
    ");\n" +
    "                                                                   \n" +
    "                                                                   \n" +
    "endmodule"
    
    );

    return moduleSnippet;
}
// 提供 'tb' 片段的函数
async function provideTBSnippet() {
    let userName = vscode.workspace.getConfiguration('extension').get('userName');
    let companyName = vscode.workspace.getConfiguration('extension').get('companyName');
    let extension = vscode.extensions.getExtension('Jiang-Percy.Verilog-Hdl-Format');
    let version = extension ? extension.packageJSON.version : 'unknown';

    let tbSnippet = new vscode.CompletionItem('tb', vscode.CompletionItemKind.Snippet);
    tbSnippet.insertText = new vscode.SnippetString(
    "`timescale 1ns / 1ps\n" +
    "//****************************************VSCODE PLUG-IN**********************************//\n" +
    "//----------------------------------------------------------------------------------------\n" +
    "// IDE :                   VSCODE      \n" +
    "// VSCODE plug-in version: Verilog-Hdl-Format-"+ version +"\n" +
    "// VSCODE plug-in author : Jiang Percy\n" +
    "//----------------------------------------------------------------------------------------\n" +
    "//****************************************Copyright (c)***********************************//\n" +
    "// Copyright(C)            "+ companyName + "\n" +
    "// All rights reserved     \n"+
    "// File name:              \n" +
    "// Last modified Date:     $CURRENT_YEAR/$CURRENT_MONTH/$CURRENT_DATE $CURRENT_HOUR:$CURRENT_MINUTE:$CURRENT_SECOND\n" +
    "// Last Version:           V1.0\n" +
    "// Descriptions:           \n" +
    "//----------------------------------------------------------------------------------------\n" +
    "// Created by:             " + userName + "\n" +
    "// Created date:           $CURRENT_YEAR/$CURRENT_MONTH/$CURRENT_DATE $CURRENT_HOUR:$CURRENT_MINUTE:$CURRENT_SECOND\n" +
    "// Version:                V1.0\n" +
    "// TEXT NAME:              $TM_FILENAME\n" +
    "// PATH:                   $TM_FILEPATH\n" +
    "// Descriptions:           \n" +
    "//                         \n" +
    "//----------------------------------------------------------------------------------------\n" +
    "//****************************************************************************************//\n" +
    "\n" +
    "module tb();\n" +
    "    reg             clk                                    ;\n" +
    "    reg             rst_n                                  ;\n" +
    "    initial\n" +
    "        begin\n" +
    "            #2\n" +
    "                    rst_n = 0   ;\n" +
    "                    clk = 0     ;\n" +
    "            #10\n" +
    "                    rst_n = 1   ;\n" +
    "        end\n" +
    "\n" +
    "    parameter   CLK_FREQ = 100;//Mhz\n" +
    "    always # ( 1000/CLK_FREQ/2 ) clk = ~clk ;\n" +
    "\n" +
    "    $2\n" +
    "endmodule"
    );

    return tbSnippet;
}
// 插入片段到活动的文本编辑器
async function insertSnippet(provideSnippet: () => Promise<vscode.CompletionItem>) {
    if (!vscode.window.activeTextEditor) {
        vscode.window.showErrorMessage('No active text editor found');
        return;
    }
    const editor = vscode.window.activeTextEditor;
    const snippet = await provideSnippet();
    await editor.insertSnippet(snippet.insertText as vscode.SnippetString);
}



export function registerCommands() {
    const insertSnippet = async (provideSnippet: () => Promise<vscode.CompletionItem>) => {
        if (!vscode.window.activeTextEditor) {
           vscode.window.showErrorMessage('No active text editor found');
           return;
        }
        const editor = vscode.window.activeTextEditor;
        const snippet = await provideSnippet();
        await editor.insertSnippet(snippet.insertText as vscode.SnippetString);
    };

    const createModule = vscode.commands.registerCommand(
        'extension.createModule', 
        async () => { await insertSnippet(provideModuleSnippet); }
    );
    const createTB = vscode.commands.registerCommand(
        'extension.createTB', 
        async () => { await insertSnippet(provideTBSnippet); }
    );

    return [createModule, createTB];
}
