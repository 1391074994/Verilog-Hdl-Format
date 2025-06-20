
// 动态代码片段会影响 VSCODE的IntelliSense 的功能，所以改成命令触发

import * as vscode from 'vscode';

export function registerDynamicSnippet(context: vscode.ExtensionContext) {
    let disposable = vscode.languages.registerCompletionItemProvider('verilog', {
        provideCompletionItems(document, position, token, context) {
            let userName = vscode.workspace.getConfiguration('extension').get('userName');
            let companyName = vscode.workspace.getConfiguration('extension').get('companyName');
            let mail = vscode.workspace.getConfiguration('extension').get('mail');
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
                "// mail      :             " + mail     +"\n" +
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
                "// mail      :             " + mail     +"\n" +
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

            let logSnippet = new vscode.CompletionItem('log', vscode.CompletionItemKind.Snippet);
            logSnippet.insertText = new vscode.SnippetString(
                "/*****************************************************************\n" +
                " * 文件名  : $TM_FILENAME \n" +
                " * 日期    : $CURRENT_YEAR/$CURRENT_MONTH/$CURRENT_DATE $CURRENT_HOUR:$CURRENT_MINUTE:$CURRENT_SECOND \n" +
                " * 作者    :  " + userName + "\n" +
                " * 修改日志  $1        \n" +
                " *****************************************************************/\n" 
            );


            return [moduleSnippet, tbSnippet,logSnippet];
        }
    });
    context.subscriptions.push(disposable);
}



