// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { simpleAlign,always_valuation_func } from './verilog_format/simpleAlign';  
import { instance } from './verilog_format/instance';  
import { testbench } from './verilog_format/testbench';  
import { /*ucf_to_xdc_normal_order,*/ucf_to_xdc_sort_order } from './verilog_format/UcfConvertXdc';  
import {   registerHoverProvider, registerGotoDefinition  } from './routine_jump/hover';
import LintManager from './linter/LintManager';
import { createLogger, Logger } from './logger';
import { extractData } from './bit_backup/utils';
import { doSelection,reverse } from './verilog_format/Increment_Selection';
import { findVerilogModules, setFileAsTopLevel, VerilogModuleNode, VerilogModuleTreeDataProvider } from './FPGA_tree/FPGA_tree';
import { activate as activateRoutineJump, deactivate as deactivateRoutineJump } from './routine_jump/routine_jump';
import { registerDynamicSnippet} from './verilog_Dynamic_code_snippet/verilog_Dynamic_code_snippet';	
import { registerCommands} from './verilog_Dynamic_code_snippet/snippets';	
import { provideVerilogDefinition, provideVerilogDefinition2 } from './routine_jump/top';
import * as DocumentSymbolProvider from './providers/DocumentSymbolProvider';

import { CtagsManager } from './ctags';
import * as DefinitionProvider from './providers/DefinitionProvider';
import * as CompletionItemProvider from './providers/CompletionItemProvider';
import * as HoverProvider from './providers/HoverProvider';
// import path = require('path');
const path = require('path');
import { runExtensionWorkflow, selectAndProcessIpFolder } from './readVeo.ts/readVeo';
import { runExtensionBitbackup,refreshWebview,vivadoQuestsimModelsim} from './bit_backup/bit_backup'; 
import { ftpSet } from './bit_backup/ftpSet'; 
import{proRegMarkdown} from './md_doc/md_doc';

import{findXprFileAndSave, processXprFile} from './united_simulation/vivado_xpr';
import { modelsimUnited } from './united_simulation/modelsim_united';
import { findXprAndRunSimulation, runTbDoFile } from './united_simulation/vivado_united_modelsim';
import { registerCmdModuleTree } from './united_simulation/VERILOG_SIM_CMD';

var ctagsManager: CtagsManager;
export var logger: Logger; // Global logger
let lintManager: LintManager; 


export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "verilog-hdl-format" is now active!');

	logger = createLogger('Verilog');

//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
// verilog 代码检测
  // Register command for manual linting
  lintManager = new LintManager(logger.getChild('LintManager'));
  vscode.commands.registerCommand('FPGA_verilog.lint', lintManager.runLintTool, lintManager);

//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
	//格式化 
	let disposable = vscode.commands.registerCommand('verilog-simplealign.simple_align', simpleAlign);
	let always_valuation = vscode.commands.registerCommand('verilog-simplealign.always_valuation_func', always_valuation_func);
//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
	//例化---代码转换
	let disposable2 = vscode.commands.registerCommand('extension.convertCode', () => {
		instance();// 调用转换函数进行代码转换
	});
	let disposable5 = vscode.commands.registerCommand('extension.testbench', () => {
		testbench();// 调用转换函数进行代码转换
	});
//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
	// 转换ucf → xdc
	let disposable6 = vscode.commands.registerCommand('extension.ucf_to_xdc_sort_order', () => {
        ucf_to_xdc_sort_order(); // 调用函数
    });

	// 获取配置中的 Hover.switch 值
	const hoverSwitchValue = vscode.workspace.getConfiguration().get('Hover.switch');
	
	// 根据配置值决定是否调用 registerHoverProvider
	// if (hoverSwitchValue === 'open') {
	// 	registerHoverProvider(context);
	// }
	//代码悬停
    // 调用悬停提供者注册函数
    // registerHoverProvider(context);
//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
	// 定义跳转-------（ctrl + 鼠标左键）定义跳转方式
		// （ctrl + 鼠标左键）定义跳转 → 本页面定义跳转 
		// context.subscriptions.push(vscode.languages.registerDefinitionProvider('verilog', {
		// 	provideDefinition: async (document, position) => {
		// 		return await provideVerilogDefinition(document, position);
		// 	}
		// 	}));
		// // （ctrl + 鼠标左键）定义跳转 → 例化定义跳转
		// context.subscriptions.push(vscode.languages.registerDefinitionProvider('verilog', {
		// 	provideDefinition: async (document, position) => {
		// 		return await provideVerilogDefinition2(document, position);
		// 	}
		// 	}));

	//定义跳转 -- 抄的- vscode-system-verilog - author : Andrew Nolte
		ctagsManager = new CtagsManager(
			logger,
			vscode.workspace.getConfiguration().get('verilog.subdir', '')
		  );

		/////////////////////////////////////////////
		// Configure Providers
		/////////////////////////////////////////////


		// 提供文档符号解析功能。 提供文档符号树，即在编辑器中显示的结构大纲。
		let verilogDocumentSymbolProvider = new DocumentSymbolProvider.VerilogDocumentSymbolProvider(
			logger.getChild('VerilogDocumentSymbolProvider'),
			ctagsManager
		);
		// // 提供代码补全建议。如关键字、变量、函数等
		let verilogCompletionItemProvider = new CompletionItemProvider.VerilogCompletionItemProvider(
			logger.getChild('VerilogCompletionItemProvider'),
			ctagsManager
		);
		// 在鼠标悬停时显示额外的信息，如符号定义、注释等。
		let verilogHoverProvider = new HoverProvider.VerilogHoverProvider(
			logger.getChild('VerilogHoverProvider'),
			ctagsManager
		);
		// 允许用户跳转到符号的定义位置。
		let verilogDefinitionProvider = new DefinitionProvider.VerilogDefinitionProvider(
			logger.getChild('VerilogDefinitionProvider'),
			ctagsManager
		);

		// push provider subs to .v and .sv files
		const selectors = [
			{ scheme: 'file', language: 'verilog' },
			{ scheme: 'file', language: 'systemverilog' },
		];


		selectors.forEach((selector) => {
			context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(selector, verilogDocumentSymbolProvider));

			context.subscriptions.push(vscode.languages.registerCompletionItemProvider(
				selector,
				verilogCompletionItemProvider,
				'.','(','=')
			);

			if (hoverSwitchValue === 'open') {
				context.subscriptions.push(vscode.languages.registerHoverProvider(selector, verilogHoverProvider));
			}

			context.subscriptions.push(vscode.languages.registerDefinitionProvider(selector, verilogDefinitionProvider));
		});
		


	// 定义跳转--------命令跳转方式
		// 调用 gotoDefinition 命令注册函数
		registerGotoDefinition(context);
		//例化跳转和例化PIN角跳转
		activateRoutineJump(context);
//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
	//modelsim-do 文件转换
			let disposable7 = vscode.commands.registerCommand('extension.extractData', () => {
				const folderPath = vscode.workspace.rootPath;
				if (folderPath) {
					extractData(folderPath);
				} else {
					vscode.window.showErrorMessage('No workspace folder is open.');
				}
			});
//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
		// incrementSelection

			let incrementSelection = vscode.commands.registerCommand('extension.incrementSelection', function () {
				doSelection('increment');
			});

			let decrementSelection = vscode.commands.registerCommand('extension.decrementSelection', function () {
				doSelection('decrement');

			});

			let reverseSelection = vscode.commands.registerCommand('extension.reverseSelection', function () {
				reverse();
			});

		context.subscriptions.push(incrementSelection, decrementSelection, reverseSelection);
//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
		// 文件树
		context.subscriptions.push(findVerilogModules());
		// 注册命令，打开文件-一个编辑器里面打开
		context.subscriptions.push(vscode.commands.registerCommand('verilogModuleTree.openFile', (filePath: string) => {
			vscode.workspace.openTextDocument(filePath).then((doc) => {
				vscode.window.showTextDocument(doc);
			});
		}));

		// 打开windows资源管理器
		vscode.commands.registerCommand('verilogModuleTree.openFileInExplorer', (node: VerilogModuleNode) => {
			if (node && node.filePaths.length > 0) {
			  const filePath = node.filePaths[0];
			  const folderPath = vscode.Uri.file(filePath);
			  vscode.commands.executeCommand('revealFileInOS', folderPath);
			}
		  });
		  //打开VSCODE资源管理器
		vscode.commands.registerCommand('verilogModuleTree.openFileInVSCodeExplorer', (node: VerilogModuleNode) => {
		if (node && node.filePaths.length > 0) {
			const filePath = node.filePaths[0];
			const folderPath = vscode.Uri.file(path.dirname(filePath));
			vscode.commands.executeCommand('revealInExplorer', folderPath);
		}
		});

		// 侧边栏打开
		vscode.commands.registerCommand('verilogModuleTree.openFileInNewEditor', (node: VerilogModuleNode) => {
			if (node && node.filePaths.length > 0) {
			  const filePath = node.filePaths[0];
			  vscode.workspace.openTextDocument(vscode.Uri.file(filePath)).then((doc) => {
				vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
			  });
			}
		  });
		//主界面新的编辑器打开
		vscode.commands.registerCommand('verilogModuleTree.openFileInMainEditor', (node: VerilogModuleNode) => {
			if (node && node.filePaths.length > 0) {
			  const filePath = node.filePaths[0];
			  vscode.workspace.openTextDocument(vscode.Uri.file(filePath)).then((doc) => {
				vscode.window.showTextDocument(doc, { preview: false }); // 使用 preview: false 参数以在新编辑器中打开文件
			  });
			}
		  });

		// //设置为顶级时的图标-当作仿真顶层	
		// context.subscriptions.push(vscode.commands.registerCommand('verilogModuleTree.setAsTopLevel', (args) => {
		// 	setFileAsTopLevel(args.filePaths, args.fileName);
		// 	const filePath = args.filePaths[0];
		// 	const config = vscode.workspace.getConfiguration();
		// 	config.update('vivadoSim.simTopFile', filePath, vscode.ConfigurationTarget.Workspace);
		// 	vscode.window.showInformationMessage(`已设置 ${args.fileName} 为仿真顶层文件`);
		// 	findXprAndRunSimulation(false); // 设置为false表示不是第一次启动
		// }));


		//设置为顶级时的图标-当作仿真顶层	
		context.subscriptions.push(vscode.commands.registerCommand('verilogModuleTree.setAsTopLevel', (args) => {
			setFileAsTopLevel(args.filePaths, args.fileName);
			const filePath = args.filePaths[0];
			const config = vscode.workspace.getConfiguration();
			// 使用正确的配置键名vivadoSim.setAsTopLevel更新仿真顶层文件路径
			config.update('verilogModuleTree.setAsTopLevel', filePath, vscode.ConfigurationTarget.Workspace);
			vscode.window.showInformationMessage(`已设置 ${args.fileName} 为仿真顶层文件`);
			// 修改此处：使用path.basename去除文件后缀
			const fileNameWithoutExt = path.basename(args.fileName, path.extname(args.fileName));
			// 将去除后缀的文件名传递给仿真流程
			findXprAndRunSimulation(false, fileNameWithoutExt); // 设置为false表示不是第一次启动
		}));	

		//新增：设置仿真顶层文件并传递给联合仿真
		// context.subscriptions.push(vscode.commands.registerCommand('verilogModuleTree.setAsTopLevel', (args) => {
		// 	const filePath = args.filePaths[0];
		// 	const config = vscode.workspace.getConfiguration();
		// 	config.update('vivadoSim.simTopFile', filePath, vscode.ConfigurationTarget.Workspace);
		// 	vscode.window.showInformationMessage(`已设置 ${args.fileName} 为仿真顶层文件`);
		// }));

//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
		// // //动态代码片段-可以加入作者名称
		registerDynamicSnippet(context);
//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
		//命令创建modelsim / tb 
		context.subscriptions.push(...registerCommands());

		// // 读取VIVAD 的最新ip的Veo文件 ：就是IP的例化文件
		context.subscriptions.push(
			vscode.commands.registerCommand('extension.Vivado_FindIP', async () => {
			await runExtensionWorkflow(context);
			})
		);
		  
		// 读取VIVAD 的Veo文件 手动选择需要的IP文件夹
		context.subscriptions.push(
			vscode.commands.registerCommand('extension.Vivado_FindIP_hand', async () => {
			await selectAndProcessIpFolder(context);
			})
		);

		//bit文件备份

		context.subscriptions.push(
			vscode.commands.registerCommand('extension.Vivado_Bitbackup', async () => {
			await runExtensionBitbackup(context);
			})
		);

		// 显示备份的bit的日志web
		context.subscriptions.push(
			vscode.commands.registerCommand('bitBackup.Vivado_WebShowLog', async () => {
			await refreshWebview(context);
			})
		);
		// VIVADO 联合仿真
		//vivadoQuestsimModelsim 
		context.subscriptions.push(
			vscode.commands.registerCommand('extension.Vivado_Questsim_Modelsim', async () => {
			await vivadoQuestsimModelsim(context);
			})
		);
//----------------------------------------------------------------------------------------------------------		
//	寄存器文档生成
//----------------------------------------------------------------------------------------------------------		
proRegMarkdown(context);

//----------------------------------------------------------------------------------------------------------		
//	FTP
//----------------------------------------------------------------------------------------------------------		
ftpSet(context);


//----------------------------------------------------------------------------------------------------------		
//	VIVADO 独立 SIM（modelsim/questasim） 
//----------------------------------------------------------------------------------------------------------		

// context.subscriptions.push(
// 	vscode.commands.registerCommand('extension.Vivado_Independent_modelsim_questasim', async () => {
// 		console.log("开始独立仿真");
// 		const result = await findXprFileAndSave();
// 		if (result.xprFilePath) {
// 			console.log(`找到的XPR文件路径: ${result.xprFilePath}`);
// 		} else {
// 			vscode.window.showInformationMessage('未找到XPR文件');
// 		}
// 	})
// );

// context.subscriptions.push(
//   vscode.commands.registerCommand('extension.Vivado_Independent_modelsim_questasim', async () => {
//     const result = await findXprFileAndSave();
//     if (result.xprFilePath) {
//       await processXprFile(result.xprFilePath);
//     } else {
//       vscode.window.showInformationMessage('未找到XPR文件');
//     }
//   })
// );


// context.subscriptions.push(
//   vscode.commands.registerCommand('extension.Vivado_Independent_modelsim_questasim', async () => {
// 	modelsimUnited();
//   })
// );


// context.subscriptions.push(
//   vscode.commands.registerCommand('extension.Vivado_Independent_modelsim_questasim', async () => {
// 	findXprAndRunSimulation();
//   })
// );


context.subscriptions.push(
	vscode.commands.registerCommand('extension.Vivado_Independent_modelsim_questasim', async () => {
	  findXprAndRunSimulation();
	})
  );
  






// ... existing code ...

// 联合仿真相关命令
//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------

// // 注册联合仿真相关命令
// context.subscriptions.push(
// 	vscode.commands.registerCommand('verilog.startVivadoSim', async () => {
// 		findXprAndRunSimulation();
// 	})
// );

// context.subscriptions.push(
// 	vscode.commands.registerCommand('verilog.runDoFile', async () => {
// 		runTbDoFile();
// 	})
// );


   // 注册命令视图
   registerCmdModuleTree(context);
   
// ... existing code ...
context.subscriptions.push(disposable);
}
// This method is called when your extension is deactivated
export function deactivate() {}
