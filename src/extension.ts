// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { simpleAlign } from './verilog_format/simpleAlign';  
import { instance } from './verilog_format/instance';  
import { testbench } from './verilog_format/testbench';  
import { ucf_to_xdc_normal_order,ucf_to_xdc_sort_order } from './verilog_format/UcfConvertXdc';  
import { hover } from './verilog_format/hover';
import LintManager from './linter/LintManager';
import { createLogger, Logger } from './logger';
import { extractData } from './verilog_format/utils';


export var logger: Logger; // Global logger
let extensionID: string = 'mshr-h.veriloghdl';
let lintManager: LintManager; 
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "verilog-hdl-format" is now active!');



	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	logger = createLogger('Verilog');
	logger.info(extensionID + ' is now active.');
  // Register command for manual linting
  lintManager = new LintManager(logger.getChild('LintManager'));
  vscode.commands.registerCommand('verilog.lint', lintManager.runLintTool, lintManager);

	//格式化 
	let disposable = vscode.commands.registerCommand('verilog-simplealign.simple_align', simpleAlign);

	//例化---代码转换
	let disposable2 = vscode.commands.registerCommand('extension.convertCode', () => {
		instance();// 调用转换函数进行代码转换
	});
	let disposable5 = vscode.commands.registerCommand('extension.testbench', () => {
		testbench();// 调用转换函数进行代码转换
	});

	// 转换ucf → xdc
	let disposable3 = vscode.commands.registerCommand('extension.ucf_to_xdc_normal_order', () => {
        ucf_to_xdc_normal_order(); // 调用函数
    });
	let disposable6 = vscode.commands.registerCommand('extension.ucf_to_xdc_sort_order', () => {
        ucf_to_xdc_sort_order(); // 调用函数
    });

	//代码悬停
		let disposable4 = vscode.languages.registerHoverProvider('verilog', {
			provideHover(document: vscode.TextDocument, position: vscode.Position) {
				return hover(document, position);
			}
		});
	//modelsim-do 文件转换
			// let disposable7 = vscode.commands.registerCommand('extension.extractData', () => {
			// 	const folderPath = vscode.workspace.rootPath;
			// 	if (!folderPath) {
			// 		vscode.window.showErrorMessage('No folder opened in VSCode.');
			// 		return;
			// 	}
		
			// 	extractData(folderPath);
			// });
			let disposable7 = vscode.commands.registerCommand('extension.extractData', () => {
				const folderPath = vscode.workspace.rootPath;
				if (folderPath) {
					extractData(folderPath);
				} else {
					vscode.window.showErrorMessage('No workspace folder is open.');
				}
			});


		context.subscriptions.push(disposable4);
}

// This method is called when your extension is deactivated
export function deactivate() {}
