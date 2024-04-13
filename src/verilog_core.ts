// // verilog_core.ts

////////////////////////////////////////////////////////////////////////////
// verilog 文件数显示逻辑
////////////////////////////////////////////////////////////////////////////

// verilog_core.ts

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface ModuleData {
    fileName: string;
    filePath: string;
    moduleNames: string[];
    submoduleNames: string[];
    instanceNames: string[];
}

interface MatchedModuleData {
    moduleName: string;
    moduleFilePaths: string[];
    submoduleNames: string[];
    submoduleFilePaths: string[];
    instanceNames: string[];
    instanceFilePaths: string[];
}

export function findVerilogModules() {
    console.log('Verilog Module Finder is now active!');

    let disposable = vscode.commands.registerCommand('extension.findVerilogModules', () => {
        // 获取当前打开的文件夹
        let folderPath = vscode.workspace.rootPath;
        if (!folderPath) {
            return;
        }

        // 递归搜索Verilog文件
        const folderData: ModuleData[] = [];
        searchVerilogFiles(folderPath, folderData);

        // 对比并记录匹配的数据
        const matchedData: MatchedModuleData[] = [];
        folderData.forEach((folder, index) => {
            for (let i = index + 1; i < folderData.length; i++) {
                const otherFolder = folderData[i];

                folder.moduleNames.forEach((moduleName, moduleIndex) => {
                    otherFolder.submoduleNames.forEach((submoduleName, submoduleIndex) => {
                        if (moduleName === submoduleName) {
                            const matchedModuleData: MatchedModuleData = {
                                moduleName: moduleName,
                                moduleFilePaths: [folder.filePath],
                                submoduleNames: [submoduleName],
                                submoduleFilePaths: [otherFolder.filePath],
                                instanceNames: [otherFolder.instanceNames[submoduleIndex]],
                                instanceFilePaths: [otherFolder.filePath]
                            };
                            matchedData.push(matchedModuleData);
                        }
                    });
                });
            }
        });

        // 找到根节点文件
        let rootNodeFiles: string[] = [];
        folderData.forEach((folder) => {
            let isRootNodeFile = true;
            folderData.forEach((otherFolder) => {
                if (folder !== otherFolder) {
                    otherFolder.submoduleNames.forEach((submoduleName) => {
                        if (folder.moduleNames.includes(submoduleName)) {
                            isRootNodeFile = false;
                        }
                    });
                }
            });
            if (isRootNodeFile) {
                rootNodeFiles.push(folder.filePath);
            }
        });

        // 创建文件树
        const treeDataProvider = new VerilogModuleTreeDataProvider(folderData, matchedData, rootNodeFiles);
        vscode.window.registerTreeDataProvider('verilogModuleTree', treeDataProvider);
    });

    return disposable;
}

function searchVerilogFiles(folderPath: string, folderData: ModuleData[]) {
    let excludeFolders = vscode.workspace.getConfiguration().get('verilogModuleFinder.excludeFolders');  // 获取配置值
    // 读取文件夹中的所有文件
    let files = fs.readdirSync(folderPath);

    // 遍历每个文件
    files.forEach((file) => {
        let filePath = path.join(folderPath, file);

        // 判断是否为文件
        if (fs.statSync(filePath).isFile()) {
            // 判断文件是否为Verilog文件
            if (path.extname(filePath) === '.v') {
                // 读取文件内容
                let text = fs.readFileSync(filePath, 'utf8');
                
                //--2024.3.22
                // 删除行注释
                text = text.replace(/\/\/.*/g, '');

                //--2024.4.12
                // 删除多行注释 /* ... */
                text = text.replace(/\/\*[\s\S]*?\*\//g, '');

                // 正则表达式匹配模块名、子模块名和实例名
                let moduleRegex = /module\s+(\w+)\s*\#?\s*\(/g;
                let submoduleRegex = /(\w+)\s+\#\s*\(\s*\.\s*(\w+)\s*\((.*?)\)\s*|(\w+)\s+(\w+)\s*\(\s*\.\s*(\w+)/g;
                let instanceRegex = /(.+?)\s*\)\s*\)\s*(\w+)\s*\(\s*|(\w+)\s+(\w+)\s*\(\s*\.\s*(\w+)/g;
                // let submoduleRegex = /(\w+)\s+\#\s*\(\s*\.\s*(\w+)\s*\(\s*(\w+)\s*\)\s*|(\w+)\s+(\w+)\s*\(\s*(\/{2}.*\n)*\s*\.(\w+)/g;//处理了可能有在“.”前面有换行注释的情况
                // let instanceRegex = /(\w+)\s*\)\s*\)\s*(\w+)\s*\(\s*|(\w+)\s+(\w+)\s*\(\s*(\/{2}.*\n)*\s*\.(\w+)/g;

                // 查找模块名
                let match;
                const moduleNames: string[] = [];
                while ((match = moduleRegex.exec(text)) !== null) {
                    moduleNames.push(match[1]);
                }

                // 查找子模块名
                const submoduleNames: string[] = [];
                while ((match = submoduleRegex.exec(text)) !== null) {
                    if (match[1]) {
                        submoduleNames.push(match[1]);
                    } else if (match[4]) {
                        submoduleNames.push(match[4]);
                        // console.log("a="+match[4]);
                    }
                }

                // 查找实例名
                const instanceNames: string[] = [];
                while ((match = instanceRegex.exec(text)) !== null) {
                    if (match[2]) {
                        instanceNames.push(match[2]);
                    } else if (match[4]) {
                        instanceNames.push(match[4]);
                    }
                }

                // 将数据存储到数组中
                const fileName = path.basename(filePath);
                const folderIndex = folderData.findIndex((folder) => folder.filePath === folderPath);
                if (folderIndex === -1) {
                    folderData.push({ fileName, filePath, moduleNames, submoduleNames, instanceNames });
                } else {
                    folderData[folderIndex].moduleNames.push(...moduleNames);
                    folderData[folderIndex].submoduleNames.push(...submoduleNames);
                    folderData[folderIndex].instanceNames.push(...instanceNames);
                }
            }
        } 
        
        
        // else if (fs.statSync(filePath).isDirectory()) {
        //     // 递归搜索子文件夹
        //     searchVerilogFiles(filePath, folderData);
        // }

        // else if (fs.statSync(filePath).isDirectory()) {
        //     if (excludeFolders) { // 根据配置判断是否排除文件夹
        //       if (file.toLowerCase().includes("ip") || file.toLowerCase().includes("core")) {
        //         return; // 跳过该文件夹的搜索
        //       }
        //     }
        //     // 递归搜索子文件夹
        //     searchVerilogFiles(filePath, folderData);
        // }

        else if (fs.statSync(filePath).isDirectory()) {
            if (Array.isArray(excludeFolders) && excludeFolders.includes(file.toLowerCase())) { // 根据配置判断是否排除文件夹
                return; // 跳过该文件夹的搜索
            }
            // 递归搜索子文件夹
            searchVerilogFiles(filePath, folderData);
        }

    });
}


class VerilogModuleTreeDataProvider implements vscode.TreeDataProvider<VerilogModuleNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<VerilogModuleNode | undefined | null | void> = new vscode.EventEmitter<VerilogModuleNode | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<VerilogModuleNode | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private folderData: ModuleData[], private matchedData: MatchedModuleData[], private rootNodeFiles: string[]) {}


    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: VerilogModuleNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: VerilogModuleNode): Thenable<VerilogModuleNode[] | undefined> {
        if (!element) {
            // 根节点，显示根节点文件
            const rootNodes: VerilogModuleNode[] = [];
            this.folderData.forEach((folder) => {
                const isRootNode = !this.folderData.some((otherFolder) => otherFolder.submoduleNames.includes(folder.moduleNames[0]));
                if (isRootNode) {
                    const hasChildren = folder.submoduleNames.length > 0;  // 判断是否存在子节点
                    const rootNode = new VerilogModuleNode(
                        `${folder.moduleNames.join(', ')}`,  // 使用模块名作为标签
                        [folder.filePath],
                        folder.fileName,  // 添加文件名属性
                        hasChildren ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None  // 根据是否存在子节点设置展开状态
                    );
                    rootNodes.push(rootNode);
                }
            });
            return Promise.resolve(rootNodes);
        } else if (element instanceof VerilogModuleNode) {
            // 子节点，显示submoduleNames和instanceNames
            const submoduleNodes: VerilogModuleNode[] = [];
            const folder = this.folderData.find((folder) => folder.filePath === element.filePaths[0]);
            if (folder) {
                folder.submoduleNames.forEach((submoduleName, index) => {
                    const instanceName = folder.instanceNames[index];
                    const matchingFilePath = this.folderData.find((folder) => folder.moduleNames.includes(submoduleName))?.filePath;
                    if (matchingFilePath) {
                        const hasChildren = this.folderData.some((folder) => folder.filePath === matchingFilePath && folder.submoduleNames.length > 0);  // 判断子节点的子节点是否存在
                        const submoduleNode = new VerilogModuleNode(
                            `${instanceName} (${submoduleName})`,
                            [matchingFilePath],
                            this.folderData.find((folder) => folder.filePath === matchingFilePath)?.fileName ?? '',  // 使用文件名作为标签
                            hasChildren ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None  // 根据子节点的子节点是否存在设置展开状态
                        );
                        submoduleNodes.push(submoduleNode);
                    } else {
                        const submoduleNode = new VerilogModuleNode(
                            `${instanceName} (${submoduleName})`,
                            [],
                            this.folderData.find((folder) => folder.moduleNames.includes(submoduleName))?.fileName ?? '',  // 使用文件名作为标签
                            vscode.TreeItemCollapsibleState.None  // 设置为None，表示没有子节点
                        );
                        submoduleNodes.push(submoduleNode);
                    }
                });
            }
            return Promise.resolve(submoduleNodes);
        }

        return Promise.resolve(undefined);
    }

}

class VerilogModuleNode extends vscode.TreeItem {
    constructor(
      public readonly label: string,
      public filePaths: string[],
      public readonly fileName: string,
      public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
      super(label, collapsibleState);
      this.tooltip = this.filePaths.join('\n');
      this.description = this.fileName;
      if (fs.existsSync(this.filePaths[0])) {
        this.command = {
          command: 'verilogModuleTree.openFile',
          title: 'Open in Editor',
          arguments: [this.filePaths[0]]
        };
  
        const iconPath = {
          light: path.join(__filename, '..', '..', 'resources', 'verilog_tre.png'),
          dark: path.join(__filename, '..', '..', 'resources', 'verilog_tre.png')
        };
        this.iconPath = iconPath;
      } else {
        this.command = {
          title: '',
          command: ''
        };
  
        const iconPath = {
          light: path.join(__filename, '..', '..', 'resources', 'verilog_tre_missing.png'),
          dark: path.join(__filename, '..', '..', 'resources', 'verilog_tre_missing.png')
        };
        this.iconPath = iconPath;
      }
      this.contextValue = 'verilogModuleNode';
    }
  }


export { VerilogModuleTreeDataProvider, VerilogModuleNode };




