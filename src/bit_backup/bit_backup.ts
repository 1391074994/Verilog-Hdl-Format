
//===============================================
// 备份bit/ltx/runme.log 文件
//===============================================


import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { format as formatDate } from 'date-fns';
import { parseStringPromise } from 'xml2js';
import { glob } from 'glob';
import { exec, spawn } from 'child_process';
import { getFtpConfig, uploadFile, uploadFileCommand } from './ftpSet';


/**
 * 在指定目录中查找XPR文件。
 *
 * @param dirPath - 需要搜索的目录路径。
 * @returns 第一个找到的XPR文件的路径或`undefined`（未找到）。
 */
async function findXprFile(dirPath: string): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, async (err, files) => {
      // console.log(`dirPath: ${dirPath}`);
      if (err) {
        reject(err);
        return;
      }

      const matchingFiles = files.filter((file) => path.extname(file) === `.xpr`);
      resolve(matchingFiles.length > 0 ? path.join(dirPath, matchingFiles[0]) : undefined);
    });
  });
}

/**
 * 在指定目录中查找`.runs`文件夹。
 *
 * @param dirPath - 需要搜索的目录路径。
 * @returns `.runs`文件的路径或`undefined`（未找到）。
 */
async function findRunsHzFolder(dirPath: string): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, async (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      const matchingFile = files.find((file) => path.extname(file) === `.runs`);
      resolve(matchingFile ? path.join(dirPath, matchingFile) : undefined);
    });
  });
}



/**
 * 递归搜索指定路径，寻找 runs 文件夹 合并路径 
 *
 *
 * @param startPath - 起始搜索路径。
 * @returns `runs/impl_1`文件夹的路径或`undefined`（未找到）。
 */
async function findRunsFolder(startPath: string): Promise<string | undefined> {
  let currentPath = startPath;

  while (true) {
    const xprFilePath = await findXprFile(currentPath);
    if (xprFilePath) {
      const runsImpl1FolderPath = await findRunsHzFolder(path.dirname(xprFilePath));
      if (runsImpl1FolderPath) {
        return runsImpl1FolderPath;
      }
    }
    const parentPath = path.dirname(currentPath);
    if (parentPath === currentPath) {
      break; // 到达根目录
    }

    currentPath = parentPath;
  }

  return undefined;
}
/**
 * 递归搜索指定路径，寻找 .xpr 文件---带路径的文件信息
 *
 *
 * @param startPath - 起始搜索路径。
 * @returns `SIM`文件夹的路径或`undefined`（未找到）。
 */
async function findSIMFolder(startPath: string): Promise<string | undefined> {
  let currentPath = startPath;

  while (true) {
    const xprFilePath = await findXprFile(currentPath);
    if (xprFilePath) {
      // console.log(`xprFilePath: ${xprFilePath}`); 
      return xprFilePath;
    }
    const parentPath = path.dirname(currentPath);
    if (parentPath === currentPath) {
      break; // 到达根目录
    }

    currentPath = parentPath;
  }

  return undefined;
}

/**
 * 在指定`impl_1`文件夹中查找`.bit`和`.ltx`和特定的`runme.log`文件，并将它们复制到`impl_1`文件夹的上一级目录中的`bit`文件夹内，
 * 且以当前日期命名的新文件夹中存放备份文件。同时记录用户日志信息（包括自定义信息）到`backup_log.txt`文件中，
 * 并通过Webview面板实时更新复制进度和日志信息（注：Webview面板更新部分未实现，需补充`updateWebview`函数）。
 *
 * @param impl1FolderPath - `impl_1`文件夹的路径。
 * @param webviewPanel - 用于显示日志的Webview面板。
 */

async function copyBitAndLtxFilesToParentBitFolder(
  runsFolderPath: string,
  // webviewPanel: vscode.WebviewPanel
): Promise<void> {
  // 去到 impl_1 下
  const impl1FolderPath = path.join(runsFolderPath, 'impl_1');

  const bitFolderPath = path.join(path.dirname(impl1FolderPath), 'bit');

  // 创建`bit`文件夹（如果不存在）
  await fs.promises.mkdir(bitFolderPath, { recursive: true });

  // 创建以当前日期命名的新文件夹
  const currentDate = new Date();
  const dateFormatted = formatDate(currentDate, 'yyyy-MM-dd_HH.mm.ss');
  const currentDateFolder = path.join(bitFolderPath, "bit-" + dateFormatted);
  await fs.promises.mkdir(currentDateFolder, { recursive: true });

  // 查找`.bit`和`.ltx`文件
  const bitAndLtxFiles = await fs.promises.readdir(impl1FolderPath, { withFileTypes: true })
    .then(files => files.filter(f => f.isFile() && (f.name.endsWith('.bit') || f.name.endsWith('.ltx') ||  f.name === ('runme.log'))));

  // 弹出输入框，让用户输入自定义日志信息（仅需输入一次，且在所有文件复制成功后）
  const customLogMessage = await vscode.window.showInputBox({
    prompt: '请输入自定义日志信息（可选）',
    placeHolder: '例如：本次备份由John Doe执行',
    value: ''
  });


//           // 记录用户日志信息（包括自定义信息）
//           const logFilePath = path.join(currentDateFolder, 'backup_log.txt');
//           const logEntries: string[] = [];

//           for (const file of bitAndLtxFiles) {
//             const sourceFilePath = path.join(impl1FolderPath, file.name);
//             const destinationFilePath = path.join(currentDateFolder, file.name);

//             // 复制文件
//             await fs.promises.copyFile(sourceFilePath, destinationFilePath);

//             vscode.window.showInformationMessage(`bit/ltx/log文件备份成功: 到 ${destinationFilePath}`);

//             // 记录单个文件复制的日志条目
//             let logContent = `${dateFormatted}: Copied file ${file.name} to ${destinationFilePath}`;
//             if (customLogMessage) {
//               logContent += `\nCustom log message: ${customLogMessage}`;
//             }
//             logEntries.push(logContent);
//           }

//           // 将所有日志条目拼接成总日志内容
//           let totalLogContent = logEntries.join('\n');

//           // 更新Webview面板（仅在此处更新，避免循环中的频繁更新）
//           updateWebview(webviewPanel, totalLogContent);

//           // 将总日志内容写入文件
//           await fs.promises.writeFile(logFilePath, totalLogContent, { flag: 'w' });
// }

          for (const file of bitAndLtxFiles) {
            const sourceFilePath = path.join(impl1FolderPath, file.name);
            const destinationFilePath = path.join(currentDateFolder, file.name);

            // 复制文件
            await fs.promises.copyFile(sourceFilePath, destinationFilePath);

            vscode.window.showInformationMessage(`bit/ltx/log文件备份成功: 到 ${destinationFilePath}`);

          }

        // 记录用户日志信息（包括自定义信息）
        const logFilePath = path.join(currentDateFolder, 'backup_log.txt');
        const logContent = `${dateFormatted}: ${customLogMessage ?? 'an anonymous user'}`;


        // 将日志内容写入文件
        await fs.promises.writeFile(logFilePath, logContent, { flag: 'w' });
}





/**
 * 在指定`impl_1`文件夹中查找`.bit`和`.ltx`和特定的`runme.log`文件，并将它们复制到`impl_1`文件夹的上一级目录中的`bit/a_impl_1_back`文件夹内，
 * 并通过Webview面板实时更新复制进度和日志信息（注：Webview面板更新部分未实现，需补充`updateWebview`函数）。
 *
 * @param impl1FolderPath - `impl_1`文件夹的路径。
 * @param webviewPanel - 用于显示日志的Webview面板。
 */

async function copyBitAndLtxFilesToBitimplyFolder(
  runsFolderPath: string,
  // webviewPanel: vscode.WebviewPanel
): Promise<void> {
  // 去到 impl_1 下
  const impl1FolderPath = path.join(runsFolderPath, 'impl_1');

  const bitFolderPath = path.join(path.dirname(impl1FolderPath), 'bit');

  // 时间
  const currentDate = new Date();
  const dateFormatted = formatDate(currentDate, 'yyyy-MM-dd_HH.mm.ss');


  // 创建`bit`文件夹（如果不存在）
  await fs.promises.mkdir(bitFolderPath, { recursive: true });

  // 创建impl_1_back命名的新文件夹
  const currentDateFolder = path.join(bitFolderPath, "a_impl_1_back");
  await fs.promises.mkdir(currentDateFolder, { recursive: true });

  // 查找`.bit`和`.ltx`文件
  const bitAndLtxFiles = await fs.promises.readdir(impl1FolderPath, { withFileTypes: true })
    .then(files => files.filter(f => f.isFile() && (f.name.endsWith('.bit') || f.name.endsWith('.ltx') ||  f.name === ('runme.log'))));

          for (const file of bitAndLtxFiles) {
            const sourceFilePath = path.join(impl1FolderPath, file.name);
            const destinationFilePath = path.join(currentDateFolder, file.name);

            // 复制文件
            await fs.promises.copyFile(sourceFilePath, destinationFilePath);

            vscode.window.showInformationMessage(`bit/ltx/log文件备份成功: 到 ${destinationFilePath}`);
 
            const customLogMessage = "【临时备份最新Bit文件/创建刷新ILA脚本】→ 存放的路径";
            // 记录用户日志信息（包括自定义信息）
            const logFilePath = path.join(currentDateFolder, 'backup_log.txt');
            const logContent = `${dateFormatted}: ${customLogMessage ?? 'an anonymous user'}`;


            // 将日志内容写入文件
            await fs.promises.writeFile(logFilePath, logContent, { flag: 'w' });

          }
}








/**
 * 导出一个封装好的函数，用于在VS Code插件中执行整个流程：
 * 1. 从当前工作区中查找`runs/impl_1`文件夹。
 * 2. 在找到的文件夹中处理最新的`.veo`文件。
 * 3. 提取其非注释内容，复制到剪贴板，并显示在webview面板中。
 *
 * @param context - VS Code ExtensionContext对象。
 */

export async function runExtensionBitbackup(context: vscode.ExtensionContext): Promise<void> {
  const currentWorkspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!currentWorkspaceFolder) {
    vscode.window.showErrorMessage('未找到工作区文件夹');
    return;
  }

  const runsImpl1FolderPath = await findRunsFolder(currentWorkspaceFolder.uri.fsPath);
  if (runsImpl1FolderPath) {
    vscode.window.showInformationMessage(`找到runs文件夹: ${runsImpl1FolderPath}`);

    // 创建Webview面板
    // const webviewPanel = vscode.window.createWebviewPanel(
    //   'bitBackupLogViewer', // 修改视图类型 ID 以匹配代码2
    //   'Bit Backup Log Viewer', // 修改标题以匹配代码2
    //   vscode.ViewColumn.One, // 显示在编辑器的第一列
    //   {
    //     enableScripts: true,
    //     retainContextWhenHidden: true
    //   }
    // );

    await copyBitAndLtxFilesToParentBitFolder(runsImpl1FolderPath);

    // 直接使用refreshWebview来初始化webviewPanel的内容
    await refreshWebview(context);

    // 如果有其他逻辑需要webviewPanel，可以继续使用
  } else {
    vscode.window.showWarningMessage('在工作区层次结构中未找到runs/impl_1文件夹');
  }
}



// //备份bit到 a_impl_1_back 里面
async function runExtensionBitbackupImply(context: vscode.ExtensionContext): Promise<string> {
  const currentWorkspaceFolder = vscode.workspace.workspaceFolders?.[0];

  if (!currentWorkspaceFolder) {
    vscode.window.showErrorMessage('未找到工作区文件夹');
    return '';
  }

  const runsImpl1FolderPath = await findRunsFolder(currentWorkspaceFolder.uri.fsPath);
  if (runsImpl1FolderPath) {
    const bitFolderPath = path.join(runsImpl1FolderPath, 'bit');
    const backupLogFilePaths = await findBackupLogFilesRecursively(bitFolderPath);
    // console.log('backupLogFilePaths111:', backupLogFilePaths);

    // 提取backupLogFilePaths里面包含a_impl_1_back 的路径 - 去掉包含文件的路径名称
    const a_impl_1_backPaths = backupLogFilePaths.filter(filePath => filePath.includes('a_impl_1_back'));
    // console.log('a_impl_1_backPaths:', a_impl_1_backPaths);

    // 只需要里面包含a_impl_1_back 的路径
    const a_impl_1_backDirs = a_impl_1_backPaths.map(filePath => path.dirname(filePath));
    // console.log('a_impl_1_backDirs:', a_impl_1_backDirs);

    // 返回数组的第一个元素，如果没有元素则返回空字符串
    const firstDir = a_impl_1_backDirs[0] || '';
    
    // 创建Webview面板
    // const webviewPanel = vscode.window.createWebviewPanel(
    //   'bitBackupLogViewer', // 修改视图类型 ID 以匹配代码2
    //   'Bit Backup Log Viewer', // 修改标题以匹配代码2
    //   vscode.ViewColumn.One, // 显示在编辑器的第一列
    //   {
    //     enableScripts: true,
    //     retainContextWhenHidden: true
    //   }
    // );

    // await copyBitAndLtxFilesToBitimplyFolder(runsImpl1FolderPath, webviewPanel);
    await copyBitAndLtxFilesToBitimplyFolder(runsImpl1FolderPath);

    // 直接使用refreshWebview来初始化webviewPanel的内容
    await refreshWebview(context);

    return firstDir;
    // 如果有其他逻辑需要webviewPanel，可以继续使用
  } else {
    vscode.window.showWarningMessage('在工作区层次结构中未找到runs/impl_1文件夹');
    return '';
  }
}

//===========================================================================
// FTP 
//===========================================================================

interface FtpConfig {
  host: string;
  user: string;
  password: string;
  remotePath: string;
  localPath: string;
}

    




//============================================================================
// 下面的是 刷新WEB功能 +  每个版本的程序的.Tcl脚本的创建功能
//============================================================================
let webviewPanel: vscode.WebviewPanel | undefined;
export async function refreshWebview(context: vscode.ExtensionContext): Promise<void> {
  const currentWorkspaceFolder = vscode.workspace.workspaceFolders?.[0];

  if (!currentWorkspaceFolder) {
    vscode.window.showErrorMessage('未找到工作区文件夹');
    return;
  }

  const runsImpl1FolderPath = await findRunsFolder(currentWorkspaceFolder.uri.fsPath);
  if (runsImpl1FolderPath) {
    const bitFolderPath = path.join(runsImpl1FolderPath, 'bit');
    const backupLogFilePaths = await findBackupLogFilesRecursively(bitFolderPath);
    // console.log('backupLogFilePaths:', backupLogFilePaths);

    if (backupLogFilePaths.length > 0) {

            let htmlContent = `<!DOCTYPE html>
            <!DOCTYPE html>

            <html lang="en">

            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Bit Backup Log Viewer</title>
              

              <!-- CSS Reset -->
              <style>
                html {
                  font-size: 16px;
                  line-height: 1.5;
                }
              </style>

              <!-- Custom styles -->
              <style>
                :root {
                  --primary-color: #3498DB;
                  --secondary-color: #F1C40F;
                  --background-color: #1e1e1e;
                  --text-color: #ECF0F1;
                  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
                  --highlight-color: #65b679; /* 示例高亮颜色，可根据需要自定义 */
                }

                body {
                  font-family: var(--font-family);
                  margin: 0;
                  padding: 32px;
                  background-color: var(--background-color);
                }

                h2 {
                  color: var(--secondary-color);
                  font-size: 24px;
                  font-weight: 600;
                  margin-bottom: 1em;
                  text-align: center;
                  display: flex;
                  align-items: center;
                  gap: 0.5em;
                }

                button {  
                  width: auto; /* Default to auto width         这个两个决定按钮大小 */               
                  min-width: 120px; /* Maintain a minimum width 这个两个决定按钮大小 */      
                  display: inline-block;
                  font-size: 16px;
                  padding: 6px 10px;/*这行设置了按钮的内边距，上下的内边距是8像素，左右的是16像素，给按钮内容留出一些空间。*/
                  background-color: var(--primary-color);
                  color: white;
                  border: none;
                  cursor: pointer;
                  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.1);
                  border-radius: 14px;
                  transition: background-color 0.2s ease, box-shadow 0.2s ease;
                  position: relative;
                  overflow: hidden;
                  align-items: center;
                 /* height: 40px; /* 设置一个固定的高度 */*/
                }

                pre {
                  max-width: 100%;
                  min-width: 0; /* Remove minimum width constraint */
                  box-sizing: border-box;
                  font-family: monospace;
                  font-size: 16px;/*中间文本显示的字体大小*/
                  line-height: 1.4;
                  overflow-x: auto;
                  padding: 5px;
                  background-color: #3f3f3f;
                  border-radius: 4px;
                  color: var(--text-color);
                  word-break: break-all;
                  white-space: pre-wrap; /* Allow automatic line breaks */
                  word-wrap: break-word; /* Break long words or URLs */

                  /* Add this rule to adjust the width of backupLogContent */
                  width: 1200%;
                }



                .log-file-container {
                  display: flex;
                  grid-template-columns: 1fr 3fr 1fr; /* 左右窄，中间宽 */
                  grid-gap: 2px; /* 适当的间隙，避免重叠 */
                  margin-bottom: 1em;
                  align-items: center; 
                }

                .log-file-info {
                  display: grid;
                  grid-template-columns: max-content 1fr;
                  grid-gap: 0.5em;
                  align-items: center;
                }

                .folder-button {
                  transition: transform 0.2s ease;
                }


                .first-button:hover {
                  background-image: linear-gradient(to right, #35e857, #00cc7a); /* 偏绿色的渐变色 */
                  background-color: transparent;
                  color: white;
                  transition: background-color 0.3s, color 0.3s; /* 动画过渡时间 */
                }
                
                .second-button:hover {
                  background-image: linear-gradient(to right, #ff9a00, #ff5c00); /* 示例渐变色，可根据需要自定义 */
                  background-color: transparent;
                  color: white;
                  transition: background-color 0.3s, color 0.3s; /* 动画过渡时间 */
                }
                
                .third-button:hover {
                  background-image: linear-gradient(to right, #ff9a00, #0000FF); /* 渐变色 */
                  background-color: transparent;
                  color: white;
                  transition: background-color 0.3s, color 0.3s; /* 动画过渡时间 */
                }

                .highlighted-folder-name {
                  color: var(--highlight-color); /* 使用自定义变量，便于后续统一调整 */
                }


                @media (max-width: 768px) {
                  :root {
                    font-size: 14px; /* Reduce base font size on small screens */
                  }

                  h2 {
                    font-size: 20px; /* Reduce title font size on small screens */
                  }

                  .log-file-container {
                    grid-template-columns: 1fr; /* Make each container take up the full column on small screens */
                  }

                  button {
                    width: 10%; /* Button width to fill the container on small screens */
                    padding: 8px; /* Adjust padding */
                  }
                }
              </style>

              <script>
                const vscode = acquireVsCodeApi();

                function triggerProcessLtxFile(filePath) {
                  vscode.postMessage({
                    command: 'processLtxFile',
                    filePath: encodeURIComponent(filePath)
                  });
                }
              </script>


              <script>
              function triggerDuplicateProcessLtxFile(filePath) {
                vscode.postMessage({
                  command: 'DuplicateProcessLtxFile',
                  filePath: encodeURIComponent(filePath)
                });
              }
            </script>

            <!--ftp -->
              <script>
              function ftpUpload(filePath) {
                vscode.postMessage({
                  command: 'ftp-extension.upload',
                  filePath: encodeURIComponent(filePath)
                });
              }

              function submitFtpConfig() {
                const host = document.getElementById('ftpHost').value;
                const remotePath = document.getElementById('remotePath').value;
                const user = document.getElementById('ftpUser').value;
                const password = document.getElementById('ftpPassword').value;
                vscode.postMessage({
                  command: 'setFtpConfig',
                  config: { host,remotePath, user, password }
                });
              }
              
            </script>
            

            <script>
            function handleButtonClick() {
              vscode.postMessage({ command: 'triggerBackBitltxTcl' });
            }
            </script>

            <script>
            function printSuccessMessage() {
              vscode.postMessage({
                command: 'bit_backup'
              });
            }
          </script>



            </head>

            <body>
              <h2><i class="fas fa-file-code"></i> 程序备份 / FTP上传 / VIVADO_TCL脚本 </h2>

              <div id="fixed-buttons">
              <button class="folder-button third-button" style="display: inline-block; margin-top: 0em; margin-left: 5px;" onclick="handleButtonClick()"> 临时备份最新Bit文件/创建刷新ILA脚本</button>
              <button class="folder-button third-button" style="display: inline-block; margin-top: 0em; margin-left: 10px;" onclick="printSuccessMessage()">程序备份</button>


            </div>


            <div>
              <h3 style="margin-bottom: 0.5em;">FTP 配置</h3>
              <div style="display: flex; align-items: flex-start; padding: 0 10px;">
                <div style="margin-right: 10px;">
                  <label for="ftpHost">FTP 服务器IP地址:</label>
                  <input type="text" id="ftpHost" name="ftpHost" value="192.168.0.100">
                  </div>
                  <div>
                  <div style="margin-right: 10px;">
                    <label for="remotePath">FTP 服务器路径地址:</label>
                    <input type="text" id="remotePath" name="remotePath" value="/sdcard/app">
                  </div>
                </div>
                <div style="margin-right: 10px;">
                  <label for="ftpUser">FTP 用户名:</label>
                  <input type="text" id="ftpUser" name="ftpUser" value="default_user">
                </div>
                <div>
                  <label for="ftpPassword">FTP 密码:</label>
                  <input type="password" id="ftpPassword" name="ftpPassword" value="default_password">
                </div>
              </div>
              <br>
              <button onclick="submitFtpConfig()">保存 FTP 配置</button>
            </div>


              <!-- Generate backup log containers HTML string -->
              ${generateBackupLogContainers(backupLogFilePaths)}
            </body>

            </html>
            `;

            if (webviewPanel) {
              webviewPanel.webview.html = htmlContent; // Refresh the existing webview
            } else {
              webviewPanel = vscode.window.createWebviewPanel(
                'bitBackupLogViewer',
                'Bit Backup Log Viewer',
                vscode.ViewColumn.One,
                { enableScripts: true, retainContextWhenHidden: true }
              );


      
      // const webviewPanel = vscode.window.createWebviewPanel(
      //   'bitBackupLogViewer',
      //   'Bit Backup Log Viewer',
      //   vscode.ViewColumn.One,
      //   { enableScripts: true, retainContextWhenHidden: true }
      // );





      webviewPanel.webview.html = htmlContent;

      let ftpConfig = { host: '192.168.0.100', user: '', password: '', remotePath: '/sdcard/app', localPath: '' }; // Initialize with default values
      webviewPanel.webview.onDidReceiveMessage(
        async (message) => {
          // console.log('Received message:', message);
      
          // Double-decode if the path was double-encoded
          const filePath = decodeURIComponent(decodeURIComponent(message.filePath));
          const openfolderPath = decodeURIComponent(decodeURIComponent(message.folderPath));
          let choose = 1;

          if (message.command === 'processLtxFile') {
            choose = 1;
            console.log('Processing LTX file:', filePath);
            await processLtxFile(filePath,choose);
          }

          // 创建单独的刷新ila界面的tcl脚本
          else if(message.command === 'DuplicateProcessLtxFile'){
            choose = 2;
            console.log('Processing LTX file:', filePath);
            await processLtxFile(filePath,choose);
          }

          //备份 impl_1到 bit\a_impl_1_back 下 然后创建单独的刷新ila界面的tcl脚本
          else if(message.command === 'triggerBackBitltxTcl'){
            // console.log('Refresh Vivado Itx');
        // 等待获取a_impl_1_backDirs
            const a_impl_1_backDirs = await runExtensionBitbackupImply(context);
            console.log('Received a_impl_1_backDirs:', a_impl_1_backDirs);
            choose = 2;
            // console.log('Processing LTX file:', filePath);

              // 1. 列出 a_impl_1_backDirs 目录下的所有文件
              const filesInLogFolder = fs.readdirSync(a_impl_1_backDirs);
              
              // 2. 查找并提取第一个 .bit 文件的文件名（不含扩展名）
              let bitBaseName;
              for (const file of filesInLogFolder) {
                if (file.endsWith('.bit')) {
                  bitBaseName = file.split('.')[0];
                  break; // 假设只取第一个找到的 .bit 文件
                }
              }
            // 给a_impl_1_backDirs 加入 \top.ltx
            const ltxFilePath_a_impl_1_backDirs = path.join(a_impl_1_backDirs, `${bitBaseName}.ltx`);
            //生成tcl脚本
            await processLtxFile(ltxFilePath_a_impl_1_backDirs,choose);
            console.log('ltxFilePath_a_impl_1_backDirs:', ltxFilePath_a_impl_1_backDirs);
          }
      // FTP

      
      // else if (message.command === 'ftp-extension.upload') {
      //   const { bitFilePath, ltxFilePath, bitFileName, ltxFileName } = extractBitAndLtxFilePaths(filePath) || {};
      //   if (!bitFilePath || !ltxFilePath || !bitFileName || !ltxFileName) {
      //     return;
      //   }
      //   const customConfig = {
      //     host: '192.168.3.3',
      //     user: 'your-custom-user',
      //     password: 'your-custom-password',
      //     remotePath: "/" + bitFileName,
      //     localPath: bitFilePath,
      //   };
      //   const ftpConfig = await getFtpConfig(customConfig);
      //   await uploadFile(ftpConfig);
      // }


      //   else if (message.command === 'setFtpConfig') {
      //     const { host, user, password } = message.config;
      //     // Use the FTP configuration information entered by the user
      //     console.log('Received FTP Config:', { host, user, password });
      //     // Here you can save the configuration to the extension's global state or perform other actions
      //   } 



      else if (message.command === 'setFtpConfig') {
        const { host,remotePath, user, password } = message.config;
        ftpConfig = { ...ftpConfig, host,remotePath,user, password }; // Update the FTP configuration
        console.log('Updated FTP Config:', ftpConfig);
      }
      else if (message.command === 'ftp-extension.upload') {
        const { bitFilePath, ltxFilePath, bitFileName, ltxFileName } = extractBitAndLtxFilePaths(filePath) || {};
        if (!bitFilePath || !ltxFilePath || !bitFileName || !ltxFileName) {
          return;
        }

        const uploadConfig = {
          ...ftpConfig,
          remotePath: ftpConfig.remotePath +'/'+ bitFileName,
          localPath: bitFilePath,
        };

        console.log('Uploading files to FTP:', uploadConfig);
        await uploadFile(uploadConfig);
      }
    

          else if (message.command === 'bit_backup') {
            // console.log('');
            await runExtensionBitbackup(context);
          }

          else if (message.command === 'openFolder') {
            // console.log('Opening folder:', openfolderPath);
            await openFolderInExplorer(openfolderPath);
          }
        },
        undefined,
        context.subscriptions
      );
      
      webviewPanel.onDidDispose(() => {
        webviewPanel = undefined;
      });
    }

    } else {
      vscode.window.showWarningMessage('未在bit文件夹及其子文件夹中找到backup_log.txt');
    }
  } else {
    vscode.window.showWarningMessage('在工作区层次结构中未找到runs/impl_1文件夹');
  }
}






/**
 * 从给定的 filePath 解析出 .bit 和 .ltx 文件的路径。
 *
 * @param filePath - 包含 .ltx 文件的完整路径。
 * @returns - 如果成功，返回一个对象包含 bitFilePath 和 ltxFilePath；如果失败，返回 null。
 *          成功时的对象结构：{ bitFilePath: string, ltxFilePath: string }
 */
    export function extractBitAndLtxFilePaths(filePath: string): { bitFilePath: string, ltxFilePath: string ,bitFileName : string, ltxFileName:string} | null {
  try {
    // 1. 提取传入 filePath 中的文件名（含扩展名）
    console.log ('filePath:', filePath);
    const fileNameWithExt = path.basename(filePath);
    // 2. 从文件名（含扩展名）中解析出 .bit 文件名
    const [baseNameWithoutExt] = fileNameWithExt.split('.');

    // 检查文件名是否包含扩展名
    if (!baseNameWithoutExt) {
      throw new Error('Invalid file name: no base name found');
    }

    // 3. 根据解析出的 .bit 文件名动态构建 bitFilePath 和 ltxFilePath
    const bitFilePath = path.join(path.dirname(filePath), `${baseNameWithoutExt}.bit`);
    const ltxFilePath = path.join(path.dirname(filePath), `${baseNameWithoutExt}.ltx`);
    
    const bitFileName = path.basename(bitFilePath);
    const ltxFileName = path.basename(ltxFilePath);
    //打印上面四个变量
    console.log('bitFilePath:', bitFilePath);
    console.log('ltxFilePath:', ltxFilePath);
    console.log('bitFileName:', bitFileName);
    console.log('ltxFileName:', ltxFileName);

    

    return { bitFilePath, ltxFilePath ,bitFileName, ltxFileName};
  } catch (error:any) {
    console.error('Error extracting bit and ltx file paths:', error.message);
    return null;
  }
}




async function openFolderInExplorer(folderPath: string) {
  if (folderPath) {
    exec(`start explorer "${folderPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`执行命令时出错: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`命令标准错误输出: ${stderr}`);
        return;
      }
      // console.log(`命令标准输出: ${stdout}`);
    });
  } else {
    vscode.window.showErrorMessage('No folder opened in workspace.');
  }
}


function generateBackupLogContainers(backupLogFilePaths: string[]): string {
  return backupLogFilePaths
    .map((backupLogFilePath) => {
      const logFileFolder = path.dirname(backupLogFilePath);
      const folderName = path.basename(logFileFolder);
      // console.log(`folderName: ${folderName}`);

              // console.log(`logFileFolder: ${logFileFolder}`);

              // 1. 列出 logFileFolder 目录下的所有文件
              const filesInLogFolder = fs.readdirSync(logFileFolder);
              
              // 2. 查找并提取第一个 .bit 文件的文件名（不含扩展名）
              let bitBaseName;
              for (const file of filesInLogFolder) {
                if (file.endsWith('.bit')) {
                  bitBaseName = file.split('.')[0];
                  break; // 假设只取第一个找到的 .bit 文件
                }
              }
              
              if (!bitBaseName) {
                throw new Error('No .bit file found in the logFileFolder directory.');
              }
              
              // 3. 根据提取出的 .bit 文件名动态构建 bitFilePath 和 ltxFilePath
              const bitFilePath = path.join(logFileFolder, `${bitBaseName}.bit`);
              const ltxFilePath = path.join(logFileFolder, `${bitBaseName}.ltx`);
              
              // 4. 添加注释说明动态构建过程
              // 注释：列出 logFileFolder 目录下的所有文件，查找并提取第一个 .bit 文件的文件名（如 'top'）
              //      使用提取出的 .bit 文件名动态构建 bitFilePath 和 ltxFilePath

              // console.log(`bitFilePath: ${bitFilePath}`);

      // const ltxFilePath = path.join(logFileFolder, 'top.ltx');
      try {
        const backupLogContent = fs.readFileSync(backupLogFilePath, 'utf-8');
        
        return `
          <div class="log-file-container">
            <div class="log-file-info">
            <h3 class="highlighted-folder-name">${folderName} <i class="far fa-file-alt"></i>:</h3>
            <button class="folder-button second-button" data-tooltip="${logFileFolder}" onclick="vscode.postMessage({command: 'openFolder', folderPath: '${encodeURIComponent(logFileFolder)}'})">Open</button>
            </div>
            <pre>${backupLogContent}</pre>
            <button class="folder-button first-button" style="display: inline-block; margin-top: 0em;" onclick="triggerProcessLtxFile('${encodeURIComponent(ltxFilePath)}')">Produce bit_ltx_run.tcl</button>
            <button class="folder-button third-button" style="display: inline-block; margin-top: 0em; margin-left: 5px;" onclick="triggerDuplicateProcessLtxFile('${encodeURIComponent(ltxFilePath)}')"> Refresh Vivado Itx</button>
            <button class="folder-button third-button" style="display: inline-block; margin-top: 0em; margin-left: 5px;" onclick="ftpUpload('${encodeURIComponent(ltxFilePath)}')"> FTP Upload</button>
          </div>
        `;
        // 

        // return `
        //   <div class="log-file-container">
        //     <div class="log-file-info">
        //     <h3 class="highlighted-folder-name">${folderName}/ <i class="far fa-file-alt"></i> ${path.basename(backupLogFilePath)}:</h3>
              
        //       <button class="folder-button second-button" data-tooltip="${logFileFolder}" onclick="vscode.postMessage({command: 'openFolder', folderPath: '${encodeURIComponent(logFileFolder)}'})">Open</button>
        //     </div>
        //     <pre>${backupLogContent}</pre>
        //     <button class="folder-button first-button" style="margin-top: 0em;" onclick="triggerProcessLtxFile('${encodeURIComponent(ltxFilePath)}')">Process Vivado bit_ltx_run.tcl</button>
        //   </div>
        // `;


      } catch (error: any) {
        vscode.window.showErrorMessage(`Failed to read backup_log.txt: ${error.message}`);
        return '';
      }
    })
    .join('');
}

async function findBackupLogFilesRecursively(dirPath: string): Promise<string[]> {
  const backupLogFilePaths = [];
  const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      backupLogFilePaths.push(...await findBackupLogFilesRecursively(entryPath));
    } else if (entry.isFile() && entry.name === 'backup_log.txt') {
      backupLogFilePaths.push(entryPath);
    }
  }
  return backupLogFilePaths;
}





// 定义函数来解析.ltx文件并执行替换操作
async function processLtxFile(filePath: string, choose: number) {
  // 读取.ltx文件内容
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  // console.log('filePath:', filePath);
  // 使用正则表达式匹配 "type": "ILA_V3" 的行和对应的"name"后面的内容
  const regex = /"type": "ILA_V3",\s*"name":\s*"([^"]+)"/g;
  let match;
  const ilaNames: string[] = [];
  while (match = regex.exec(fileContent)) {
      const ilaName = match[1];
      ilaNames.push(ilaName);
      // console.log(`Found ILA name: ${ilaName}`);
  }
  


      // 提取vivado_device_name
            //==================================================================
            // 方法 1 
            // 这个取寻找xpr文件提取出来 和下载界面的简化名称 不太匹配 
            //==================================================================
                      // const vivadoDeviceName = await findVivadoDeviceName(filePath);// 这个取寻找xpr文件提取出来 和下载界面的简化名称 不太匹配 

                      // if (!vivadoDeviceName) {
                      //   vscode.window.showErrorMessage('未能在上级目录中找到.xpr文件并提取VIVADO_DEVICE_NAME。');
                      //   return;
                      // }
            //==================================================================
            // 方法 2 
            // 使用读取runme.log文件提取
            // 如果工程不是按照实际的速度等级 搭建的工程 就会出现下载失败---真的是。。。。。
            //==================================================================
                // const vivadoDeviceName = await getPartFromRunmelog(filePath); 
                // // console.log('vivadoDeviceName:', vivadoDeviceName);
                // if (!vivadoDeviceName) {
                //   vscode.window.showErrorMessage('未能在上级目录中找到.xpr文件并提取VIVADO_DEVICE_NAME。');
                //   return;
                // }
            //==================================================================
            // 方法 3 
            //这个使用vivado 无界面模式运行脚本 -但是需要上板子-感觉回读速度太慢
            //==================================================================

                // // 更新这部分代码以处理 executeVivadoCommands 返回值
                // const vivadoResult = await executeVivadoCommands(filePath);
                // const vivadoOutput = vivadoResult.stdout;
                // const vivadoError = vivadoResult.stderr;

                // if (vivadoError) {
                //   vscode.window.showErrorMessage(`执行 Vivado 命令时出错: ${vivadoError}`);
                //   return;
                // }

                // // 解析命令输出，提取芯片型号
                // const chipModel = parseChipModel(vivadoOutput);
                // console.log('chipModel:', chipModel);
                // if (chipModel) {
                //   vscode.window.showInformationMessage(`当前 FPGA 芯片型号：${chipModel}`);
                // } else {
                //   vscode.window.showWarningMessage('无法获取 FPGA 芯片型号。');
                // }
                // let vivadoDeviceName = chipModel;

            //==================================================================
            // 方法4 做chipModel的（vivado）器件名称存储-（第一次比较慢）后面可以使用存储的名称（速度快）
            //==================================================================
              // console.log('filePath:', filePath);

              // 定义变量 Vivado_Device_file，并赋值为 file（假设 file 已经被正确初始化）
              let Vivado_Device_file = filePath;
              // 获取不带文件名的目录路径
              const Vivado_Device_file_dir = path.dirname(Vivado_Device_file);
              // 上移一个文件夹，计算新路径
              const Vivado_Device_file_up_one_dir = path.join(path.dirname(Vivado_Device_file), '..');

              //写代码 检查在路径Vivado_Device_file_up_one_dir下是否存在 Vivado_Device_file.txt 文件，如果存在则读取 Vivado_Device_file.txt 里面的内容到 vivadoDeviceName
              // 如果不存在的化则提示需要板子上电并且正确连接仿真器，然后再执行下面的代码 

              // if (chipModel) {
              //   vscode.window.showInformationMessage(`当前 FPGA 芯片型号：${chipModel}`);
              //   // ... 定义并初始化 Vivado_Device_file 和 Vivado_Device_file_dir ...
              //   const Vivado_Device_file_txt_path = path.join(Vivado_Device_file_up_one_dir, 'Vivado_Device_file.txt');
              //   try {
              //     // 确保目标目录存在
              //     fs.mkdirSync(Vivado_Device_file_dir, { recursive: true });
              //     // 写入 chipModel 到文件
              //     fs.writeFileSync(Vivado_Device_file_txt_path, chipModel);
              //     console.log(`Successfully wrote chipModel to ${Vivado_Device_file_txt_path}`);
              //   } catch (error: any) {
              //     vscode.window.showErrorMessage(`Failed to write chipModel to file: ${error.message}`);
              //   }
              // } else {
              //   vscode.window.showWarningMessage('无法获取 FPGA 芯片型号。');
              // }

                      // 检查 Vivado_Device_file_up_one_dir 下是否存在 Vivado_Device_file.txt 文件
                      const Vivado_Device_file_txt_path = path.join(Vivado_Device_file_up_one_dir, 'Vivado_Device_file.txt');

                      let vivadoDeviceName: string | undefined;
                     

                      try {
                        // 使用 fs.accessSync() 检查文件是否存在
                        fs.accessSync(Vivado_Device_file_txt_path, fs.constants.F_OK);

                        // 读取文件内容到 vivadoDeviceName
                        vivadoDeviceName = fs.readFileSync(Vivado_Device_file_txt_path, 'utf-8').trim();

                        vscode.window.showInformationMessage(`成功读取 Vivado_Device_file.txt 文件，芯片型号为: ${vivadoDeviceName}`);

                      } catch (error: any) {
                        if (error.code === 'ENOENT') {
                          vscode.window.showWarningMessage(
                            `'Vivado_Device_file.txt' 不存在于指定路径: ${Vivado_Device_file_txt_path}\n`
                          );
                          vscode.window.showWarningMessage(
                            `请连接仿真器并且给硬件板上电......`,
                          );
                          vscode.window.showWarningMessage(
                            '正在执行 Vivado 命令以尝试获取芯片型号...请稍后...'
                          );
                          // 更新这部分代码以处理 executeVivadoCommands 返回值
                          const vivadoResult = await executeVivadoCommands(filePath);
                          const vivadoOutput = vivadoResult.stdout;
                          const vivadoError = vivadoResult.stderr;
                      
                          if (vivadoError) {
                            vscode.window.showErrorMessage(`执行 Vivado 命令时出错: ${vivadoError}`);
                            return;
                          }
                      
                          // 解析命令输出，提取芯片型号
                          const chipModel = parseChipModel(vivadoOutput);
                          // console.log('chipModel:', chipModel);
                      
                          // 读出芯片名称之后 删除当前文件夹下的产生的vivado.log和vivado.jou 文件,
                          // 获取当前打开文件夹工作区的路径
                          const currentWorkspaceFolder = vscode.workspace.workspaceFolders?.[0];
                          if (!currentWorkspaceFolder) {
                            vscode.window.showErrorMessage('未找到工作区文件夹');
                            return;
                          }
                          // console.log('currentWorkspaceFolder:', currentWorkspaceFolder.uri.fsPath);

                          //复制

                          if (chipModel) {
                            vivadoDeviceName = chipModel;
                            vscode.window.showInformationMessage(`当前 FPGA 芯片型号：${chipModel}`);

                            //写入 vivadoDeviceName 到 Vivado_Device_file.txt
                                  try {
                                    // 确保目标目录存在
                                    fs.mkdirSync(Vivado_Device_file_dir, { recursive: true });
                                    // 写入 chipModel 到文件
                                    fs.writeFileSync(Vivado_Device_file_txt_path, chipModel);
                                    // console.log(`Successfully wrote chipModel to ${Vivado_Device_file_txt_path}`);


                                  //   //复制工作区的vivado.log 和 vivado.jou 到Vivado_Device_file_txt_path文件夹下
                                  //   //这里需要考虑Vivado_Device_file_txt_path下的vivado.log 和 vivado.jou是否存在，如果不存在则创建 vivado.log 和 vivado.jou，
                              
                                  // 复制 vivado.log
                                  await  fs.copyFileSync(path.join(currentWorkspaceFolder.uri.fsPath, 'vivado.log'), path.join(Vivado_Device_file_up_one_dir, 'vivado.log'));
                                  // 
                                  // 删除currentWorkspaceFolder 下的产生的所有.log 和 .jou 文件
                                  fs.readdirSync(currentWorkspaceFolder.uri.fsPath).forEach(file => {
                                    if (file.endsWith('.log') || file.endsWith('.jou')) {
                                      fs.unlinkSync(path.join(currentWorkspaceFolder.uri.fsPath, file));
                                    }
                                  });

                                    // // 复制 vivado.log
                                    // const targetLogPath = path.join(Vivado_Device_file_up_one_dir, 'vivado.log');
                                    // if (!fs.existsSync(targetLogPath)) {
                                    //   fs.closeSync(fs.openSync(targetLogPath, 'w')); // 创建空文件
                                    // }
                                    // fs.copyFileSync(
                                    //   path.join(currentWorkspaceFolder.uri.fsPath, 'vivado.log'),
                                    //   targetLogPath
                                    // );

                                    // // 复制 vivado.jou
                                    // const targetJouPath = path.join(Vivado_Device_file_up_one_dir, 'vivado.jou');
                                    // if (!fs.existsSync(targetJouPath)) {
                                    //   fs.closeSync(fs.openSync(targetJouPath, 'w')); // 创建空文件
                                    // }
                                    // fs.copyFileSync(
                                    //   path.join(currentWorkspaceFolder.uri.fsPath, 'vivado.jou'),
                                    //   targetJouPath
                                    // );


                                  } catch (error: any) {
                                    vscode.window.showErrorMessage(`Failed to write chipModel to file: ${error.message}`);
                                  }

                          } else {
                            vscode.window.showWarningMessage('无法获取 FPGA 芯片型号。');
                          }
                        } else {
                          vscode.window.showErrorMessage(`检查或读取 'Vivado_Device_file.txt' 时发生错误: ${error.message}`);
                          return;
                        }
                      }
                      
                
      
//=========================================================================


              let bitBackFilePath = path.dirname(filePath);

              const runBitTclPath = path.join(bitBackFilePath, 'bit_ltx_run.tcl');  // 修改为使用传入的filePath并替换扩展名为 bit_ltx_run.tcl
              // 清空 run_bit.tcl 文件内容
              // console.log(`Clearing content of file: ${runBitTclPath}`);
              fs.writeFileSync(runBitTclPath, '', 'utf-8');
              // console.log(`Cleared content of file: ${runBitTclPath}`);


              // // let bitBackFilePath = path.dirname(filePath);
              // // 构建runme.log文件的完整路径
              // let bitFilePath = path.join(bitBackFilePath, 'top.bit');
              // let ltxFilePath = path.join(bitBackFilePath, 'top.ltx');


              // 1. 提取传入 filePath 中的文件名（含扩展名）
              const fileNameWithExt = path.basename(filePath);
                // console.log(`fileNameWithExt: ${fileNameWithExt}`);
              // 2. 从文件名（含扩展名）中解析出 .bit 文件名
              const bitBaseName = fileNameWithExt.split('.')[0]; // 假设 .bit 文件名与传入文件名相同，不含扩展名
                // console.log(`bitBaseName: ${bitBaseName}`);
              // 3. 根据解析出的 .bit 文件名动态构建 bitFilePath 和 ltxFilePath
              const bitFilePath = path.join(path.dirname(filePath), `${bitBaseName}.bit`);
              const ltxFilePath = path.join(path.dirname(filePath), `${bitBaseName}.ltx`);

              // console.log(`bitFilePath1111: ${bitFilePath}`);
              // 4. 添加注释说明动态构建过程
              // 注释：提取传入 filePath 中的文件名（如 'input_design.ext'），从中解析出 .bit 文件名（如 'input_design'）
              //      使用解析出的 .bit 文件名动态构建 bitFilePath 和 ltxFilePath

              // 生成新的.tcl文件内容
              const tclContent = generateTclContent(ilaNames);

            
            function generateTclContent(ilaNames: string[]): string {
              let content = '';
              let count = 1; // 初始化计数器为1

              // content += `close_hw\n`;
              // content += `open_hw\n`;
              // content += `connect_hw_server\n`;
              // content += `open_hw_target\n`;
              // content += `set_property PROGRAM.FILE {${bitFilePath}} [get_hw_devices ${vivadoDeviceName}]\n`;
              // content += `set_property PROBES.FILE {${ltxFilePath}} [get_hw_devices ${vivadoDeviceName}]\n`;
              // content += `set_property FULL_PROBES.FILE {${ltxFilePath}} [get_hw_devices ${vivadoDeviceName}]\n`;
              // content += `current_hw_device [get_hw_devices ${vivadoDeviceName}]\n`;
              // content += `program_hw_devices [get_hw_devices ${vivadoDeviceName}]\n`;
              // content += `refresh_hw_device\n`;

              console.log(`choose: ${choose}`);

              if(choose === 1){
              // 关闭硬件连接
              content += `close_hw\n`;
              // 打开硬件
              content += `open_hw\n`;
              // 连接硬件服务器
              content += `connect_hw_server\n`;
              // 打开目标硬件
              content += `open_hw_target\n`;
              // 设置设备${vivadoDeviceName}的PROGRAM.FILE属性，其值为${bitFilePath}
              content += `set_property PROGRAM.FILE {${bitFilePath}} [get_hw_devices ${vivadoDeviceName}]\n`;
              // 设置设备${vivadoDeviceName}的PROBES.FILE属性，其值为${ltxFilePath}
              content += `set_property PROBES.FILE {${ltxFilePath}} [get_hw_devices ${vivadoDeviceName}]\n`;
              // 设置设备${vivadoDeviceName}的FULL_PROBES.FILE属性，其值为${ltxFilePath}
              content += `set_property FULL_PROBES.FILE {${ltxFilePath}} [get_hw_devices ${vivadoDeviceName}]\n`;
              // 将当前硬件设备设置为${vivadoDeviceName}
              content += `current_hw_device [get_hw_devices ${vivadoDeviceName}]\n`;
              // 对设备${vivadoDeviceName}进行编程
              content += `program_hw_devices [get_hw_devices ${vivadoDeviceName}]\n`;
              // 等待硬件设备完成编程
              content += `after 1000\n`;
              // 刷新硬件设备状态
              content += `refresh_hw_device\n`;
              }
              else if(choose === 2){
              // 关闭硬件连接
              content += `close_hw\n`;
              // 打开硬件
              content += `open_hw\n`;
              // 连接硬件服务器
              content += `connect_hw_server\n`;
              // 打开目标硬件
              content += `open_hw_target\n`;
              // 设置设备${vivadoDeviceName}的PROGRAM.FILE属性，其值为${bitFilePath}
              content += `set_property PROGRAM.FILE {${bitFilePath}} [get_hw_devices ${vivadoDeviceName}]\n`;
              // 设置设备${vivadoDeviceName}的PROBES.FILE属性，其值为${ltxFilePath}
              content += `set_property PROBES.FILE {${ltxFilePath}} [get_hw_devices ${vivadoDeviceName}]\n`;
              // 设置设备${vivadoDeviceName}的FULL_PROBES.FILE属性，其值为${ltxFilePath}
              content += `set_property FULL_PROBES.FILE {${ltxFilePath}} [get_hw_devices ${vivadoDeviceName}]\n`;
              // 将当前硬件设备设置为${vivadoDeviceName}
              content += `current_hw_device [get_hw_devices ${vivadoDeviceName}]\n`;
                // // 对设备${vivadoDeviceName}进行编程
                // content += `program_hw_devices [get_hw_devices ${vivadoDeviceName}]\n`;
              // 等待硬件设备完成编程
              content += `after 1000\n`;
              // 刷新硬件设备状态
              content += `refresh_hw_device\n`;

              }



              ilaNames.forEach((ilaName, index) => {
                  content += `display_hw_ila_data [get_hw_ila_data hw_ila_data_${count} -of_objects [get_hw_ilas -of_objects [get_hw_devices ${vivadoDeviceName}] -filter {CELL_NAME=~"${ilaName}"}]]\n`;
                  count++; // 每次循环结束后递增计数器
              }
              
            );
              return content;
            }

            let bitBackFilePathWithForwardSlashes = runBitTclPath.replace(/\\/g, '/');
            const tcl_run = `source ${bitBackFilePathWithForwardSlashes}`;
            // 将脚本地址写入剪切板-然后用户取VIVADO的TCL栏取黏贴脚本
            vscode.env.clipboard.writeText(tcl_run);
            vscode.window.showInformationMessage('脚本地址已经写入剪切板-请用户在VIVADO的TCL栏粘贴脚本');



      /**
       * 从runme.log文件中提取包含字符串 "Implementation' and/or device 'XXX'" 后面的值（XXX代表设备标识符）。
       * 此函数会查找logFilePath指定的runme.log文件，提取其中的设备标识符以及（如果存在）加载部分的数字。
       * 
       * @param logFilePath 指定的log文件路径。
       * @returns 返回一个Promise，解析为设备标识符和加载部分数字的组合字符串，如果无法提取，则返回null。
       */
      function getPartFromRunmelog(logFilePath: string): Promise<string | null> {
        let runFilePath = path.dirname(logFilePath);
        // 构建runme.log文件的完整路径
        let runmeLogFilePath = path.join(runFilePath, 'runme.log');
        // console.log('getPartFromRunmelog-logFilePath:', runmeLogFilePath);
        return new Promise((resolve, reject) => {
            // 正则表达式用于匹配 "Implementation' and/or device '设备标识符'" 形式的字符串
            const regex = /'Implementation' and\/or device '([^']*)'/;
            // 正则表达式用于匹配 "Loading part [a-zA-Z0-9-]+-(数字)" 形式的字符串，以提取加载部分的数字
            const loadingPartRegex = /Loading part [a-zA-Z0-9-]+-(\d+)/;

            // 读取runme.log文件内容
            fs.readFile(runmeLogFilePath, 'utf-8', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                // 使用正则表达式提取设备标识符
                const matchDevice = regex.exec(data);
                // 使用正则表达式提取加载部分的数字
                const matchLoadingPart = loadingPartRegex.exec(data);

                if (matchDevice) {
                    const deviceIdentifier = matchDevice[1]; // 提取的设备标识符
                    if (matchLoadingPart) {
                        const loadingPartNumber = matchLoadingPart[1]; // 提取的加载部分数字
                        // 解析结果为设备标识符和加载部分数字的组合
                        resolve(`${deviceIdentifier}_${loadingPartNumber}`);
                    } else {
                        // 如果没有匹配到加载部分，则只返回设备标识符
                        resolve(deviceIdentifier);
                    }
                } else {
                    // 如果无法提取设备标识符，则返回null
                    resolve(null);
                }
            });
        });
    }
      

//下面的没有对应芯片的简称----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // async function findVivadoDeviceName(filePath: string): Promise<string | undefined> {
    //   let currentPath = path.dirname(filePath);
    //   console.log('findVivadoDeviceName-currentPath:', currentPath);
    
    //   for (let i = 0; i < 4; i++) {
    //     // const xprFilePath = path.join(currentPath, '*.xpr');
    //     const xprFile = await findXprFile(currentPath);
    //     console.log('findVivadoDeviceName-xprFilePath:', xprFile);
    //     // const xprFiles = glob.sync(xprFilePath);
    
    //     if (xprFile) {
    //       console.log('findVivadoDeviceName-xprFile:', xprFile);
    //       const part = await getPartFromXprFile(xprFile);
    //       console.log('findVivadoDeviceName-part:', part);
    //       return part;
    //     }
    
    //     currentPath = path.dirname(currentPath);
    //   }
    
    //   return undefined;
    // }



    // /**
    //  * 从.xpr文件中提取Part的值。
    //  * @param xprFilePath .xpr文件的路径。
    //  * @returns 返回一个Promise，解析为Part的字符串值，如果无法提取则拒绝。
    //  */
    // function getPartFromXprFile(xprFilePath: string): Promise<string> {
    //   return new Promise((resolve, reject) => {
    //     const regex = /"Part"\s+Val\s*=\s*"([^"]*)"/;
    //     console.log('getPartFromXprFile-xprFilePath:', xprFilePath);
    //     fs.readFile(xprFilePath, 'utf-8', (err, data) => {
    //       if (err) {
    //         reject(err);
    //         return;
    //       }
    //       console.log('getPartFromXprFile-data:', data);
    //       const match = regex.exec(data);
    //       console.log('getPartFromXprFile-match:', match);
    //       if (match) {
    //         resolve(match[1]);
    //       } else {
    //         reject(new Error('Failed to extract Part value from .xpr file.'));
    //       }
    //     });
    //   });
    // }

      // 将替换后的内容写入 run_bit.tcl 文件
      fs.writeFileSync(runBitTclPath, tclContent, 'utf-8');
      // console.log(`Updated content of file: ${runBitTclPath}`);
      vscode.window.showInformationMessage( runBitTclPath +'脚本已经生成');
  } 


  

//这个连接需要上板-exec速度很慢识别
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
      // 获取当前打开文件夹的路径
      const currentFolderPath = vscode.workspace.rootPath;
  async function executeVivadoCommands(filePath: string): Promise<{ stdout: string; stderr: string }> {
    try {
      // 获取当前打开文件夹的路径
      // const currentFolderPath = vscode.workspace.rootPath;
  
            // current_hw_device 获取或设置当前硬件器件。
            // get_hw_devices 获取目标的硬件器件列表。
            // program_hw_device 对 AMD FPGA 器件进行编程。
            // refresh_hw_device 刷新硬件器件。

            // open_hw 打开硬件管理器
            // connect_hw_server 打开硬件目标-打开JTAG
            // open_hw_target 打开到硬件服务器上的硬件目标的连接。
            // refresh_hw_device 刷新硬件器件 -获取目标的硬件器件列表。
            // puts [current_hw_device [lindex [get_hw_devices] 1]]


            // const command = `
            // open_hw
            // connect_hw_server
            // open_hw_target
            // puts [get_hw_devices]
            // puts [current_hw_device]
            // exit
            // `;

            const command = `
            set errorCode 0
            
            open_hw
            catch {connect_hw_server} errorMessage
            if {[string match "*Error*" $errorMessage]} {
                puts "Error connecting to hardware server: $errorMessage"
                exit 
            }
            
            catch {open_hw_target} errorMessage
            if {[string match "*Error*" $errorMessage]} {
                puts "Error opening hardware target: $errorMessage"
                exit 
            }
            
            puts [get_hw_devices]
            puts [current_hw_device]
            
            exit 
            `;



            
  //         // 创建临时文件存储命令序列
  //         // const tempFilePath = path.join(currentFolderPath, 'temp.tcl');
  //         const tempFilePath = path.join(currentFolderPath ?? '', 'temp.tcl');
  //         await fs.promises.writeFile(tempFilePath, command);

            
      const tempFilePath = path.join(currentFolderPath ?? '', 'temp.tcl');
      await fs.promises.writeFile(tempFilePath, command);
      // 在当前打开文件夹路径下执行命令
      const { stdout, stderr } = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
        exec(`vivado -mode tcl -source ${tempFilePath}`, { cwd: currentFolderPath }, (error: any, stdout: any, stderr: any) => {
          // 指令一样的
          // exec(`vivado -mode batch -source ${tempFilePath}`, { cwd: currentFolderPath }, (error, stdout, stderr) => {
            // console.log('stdout:', stdout);
          if (error) {
            reject(error);
          } else {
            resolve({ stdout, stderr });
          }
        });
      });
  
      await fs.promises.unlink(tempFilePath);
  
      return { stdout, stderr };
    } catch (error: any) {
      const errorMessage = `无法获取 FPGA 芯片信息：${error.message}`;
      vscode.window.showErrorMessage(errorMessage);
      console.error('执行命令时出错:', error);
  
      return { stdout: '', stderr: errorMessage };
    }
  }

  function parseChipModel(output: string) {
    // console.log('output:', output);
    // 在命令输出中查找芯片型号
    const regex = /# puts \[current_hw_device\]\s*(\S+)/;
    const match = regex.exec(output);
    // console.log('match:', match);
    if (match && match[1]) {
        return match[1];
    }
    return null;
  }
//--------------------------------------------------------------------------------------









//========================================================================================
//VIVAOD 联合仿真 questasim / modelsim 
// C:/Xilinx/vivado_2018_3_lib
//========================================================================================

/**
 * 定义 Vivado Tcl 执行器函数
 * @param {string} projectPath Vivado 项目路径
 * @param {string} questasimInstallPath QuestaSim 安装路径
 */



  async function executeVivadoTcl(projectPath: any, questasimInstallPath: any) {
    const vivadoLibraryPath =   vscode.workspace.getConfiguration().get('vivadoLibrary.path') as string;
    const vivadoSimtype =   vscode.workspace.getConfiguration().get('vivadoSim.type') as string;
    console.log('vivadoSimtype:', vivadoSimtype); 
    // 把vivadoLibraryPath里面的反斜杠转换成正斜杠
    const vivadoLibraryPathconverted = vivadoLibraryPath.replace(/\\/g, '/');
    //把questasimInstallPath里面的反斜杠转换成正斜杠
    const questasimInstallPathconverted = questasimInstallPath.replace(/\\/g, '/');

  try {
    let command = "";
    // vivadoSimtype = questasim 选择第一个cmd , = modelsim 选择第二个cmd
    if (vivadoSimtype === 'questasim') {
      console.log('vivadoSimtype === questasim');
      command = `
          open_project ${projectPath}
          update_compile_order -fileset sources_1
          set_property target_simulator Questa [current_project]
          set_property compxlib.questa_compiled_library_dir ${vivadoLibraryPathconverted} [current_project]
          launch_simulation -install_path ${questasimInstallPathconverted}
          exit
          `;
    }
    else {
      command = `
      open_project ${projectPath}
      update_compile_order -fileset sources_1
      set_property target_simulator ModelSim [current_project]
      set_property compxlib.modelsim_compiled_library_dir  ${vivadoLibraryPathconverted} [current_project]
      launch_simulation -install_path ${questasimInstallPathconverted}
      exit
      `;

    };

    // console.log('command:', command);
    // const command = `
    //       open_project ${projectPath}
    //       update_compile_order -fileset sources_1
    //       set_property target_simulator Questa [current_project]
    //       set_property compxlib.questa_compiled_library_dir ${vivadoLibraryPathconverted} [current_project]
    //       launch_simulation -install_path ${questasimInstallPathconverted}
    //       exit
    //       `;
    // const command = `
    //       open_project ${projectPath}
    //       update_compile_order -fileset sources_1
    //       set_property target_simulator ModelSim [current_project]
    //       set_property compxlib.modelsim_compiled_library_dir  ${vivadoLibraryPathconverted} [current_project]
    //       launch_simulation -install_path ${questasimInstallPathconverted}
    //       exit
    //       `;

      const tempFilePath = path.join(currentFolderPath ?? '', 'temp.tcl');
      await fs.promises.writeFile(tempFilePath, command);

      const { stdout, stderr } = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
        exec(`vivado -mode tcl -source ${tempFilePath}`, { cwd: currentFolderPath }, (error: any, stdout: any, stderr: any) => {
          // console.log('stdout:', stdout);
          if (error) {
            reject(error);
          } else {
            resolve({ stdout, stderr });
            // console.log('stderr:', stderr);
          }
        });
      });

      // 解析并提取 "Launching behavioral simulation in" 后面的路径信息
      let simulationPath: string | undefined;
      //这个也能识别
      // const simulationLaunchPattern = /\bINFO: \[Vivado .+?]\s+Launching behavioral simulation in\s+'(.*)'/;
      //修改短一点
      const simulationLaunchPattern = /Launching behavioral simulation in\s+'(.*)'/;

      const matchResult = stdout.match(simulationLaunchPattern);
      // console.log('matchResult:', matchResult);
      if (matchResult && matchResult.length > 1) {
        simulationPath = matchResult[1]; // 匹配到的路径位于第1个捕获组
        console.log('simulationPath:', simulationPath);
      }


      // 删除临时文件
      await fs.promises.unlink(tempFilePath);

      return { stdout, stderr, simulationPath };
    } catch (error: any) {
      const errorMessage = `运行仿真报错：${error.message}`;
      vscode.window.showErrorMessage(errorMessage);
      console.error('运行仿真报错：:', error);

      return { stdout: '', stderr: errorMessage, simulationPath: undefined };
    }
  }



//======================================================================================
// 下面的方法会 把cmd窗口停留在界面上 -如果把cmd 窗口关闭了，会把questasim/modelsim 窗口也关闭了
//======================================================================================


// async function executeVivadoTcl(projectPath: any, questasimInstallPath: any) {
//   try {
//     // console.log(`环境变量PATH: ${process.env.PATH}`);
//     // console.log(`Questasim路径: ${questasimInstallPath}`);

//     const command = `
//         open_project ${projectPath}
//         update_compile_order -fileset sources_1
//         set_property target_simulator Questa [current_project]
//         set_property compxlib.questa_compiled_library_dir C:/Xilinx/vivado_2018_3_lib [current_project]
//         launch_simulation -install_path ${questasimInstallPath}
//         `;

//     const tempFilePath = path.join(currentFolderPath ?? '', 'temp.tcl');
//     await fs.promises.writeFile(tempFilePath, command);

//     const { stdout, stderr } = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
//       // 更新启动Vivado的命令，添加/wait参数使CMD窗口等待子进程结束后自动关闭
//       exec(`powershell -Command "& {Start-Process vivado -ArgumentList '-mode tcl -source ${tempFilePath}' -Verb RunAs -Wait}"`, { cwd: currentFolderPath }, (error: any, stdout: any, stderr: any) => {
//         console.log('stdout:', stdout);
//         if (error) {
//           console.error('Error:', error);
//           reject(error);
//         } else {
//           resolve({ stdout, stderr });
//         }
//       });
//     });

//     // 取消注释，删除temp.tcl文件
//     await fs.promises.unlink(tempFilePath);

//     return { stdout, stderr };
//   } catch (error: any) {
//     const errorMessage = `运行仿真报错：${error.message}`;
//     vscode.window.showErrorMessage(errorMessage);
//     console.error('运行仿真报错：:', error);

//     return { stdout: '', stderr: errorMessage };
//   }

//   // 添加异步任务，使用taskkill命令关闭Vivado进程
//   setTimeout(async () => {
//     try {
//       await exec(`taskkill /IM vivado.exe /F`);
//       console.log('Vivado进程已关闭');
//     } catch (error) {
//       console.error('关闭Vivado进程时出错:', error);
//     }
//   }, 5000); // 延迟5秒执行，确保Vivado有足够时间启动并执行命令
// }




//======================================================================================
//======================================================================================
/**
 * 注册命令并关联执行函数
 * @param {ExtensionContext} context 插件上下文
 */



import { extractData } from './utils';


export async function vivadoQuestsimModelsim(context: { subscriptions: any[]; }) {
  
  //获取不带文件名的目录路径
  const currentWorkspaceFolder = vscode.workspace.workspaceFolders?.[0];
  console.log('currentWorkspaceFolder:', currentWorkspaceFolder);
  const questasimInstallPath =   vscode.workspace.getConfiguration().get('VivadoSimPath.path') as string;
  // console.log(`questasimInstallPath: ${questasimInstallPath}`);

  // const runsImpl1FolderPath = await findRunsFolder(currentWorkspaceFolder!.uri.fsPath);
  const currentPath= currentWorkspaceFolder!.uri.fsPath;
  const xprPath = await findSIMFolder(currentWorkspaceFolder!.uri.fsPath);
  // console.log('currentPath:', currentPath);
  // console.log('xprPath:', xprPath);

//把projectPath 里面的\转换成/
  const projectPath = xprPath?.replace(/\\/g, '/');

  console.log(`projectPath: ${projectPath}`);
  

  try {
    // const projectPath = 'D:/Desktop/led/led.xpr'; // 获取项目路径
    // const questasimInstallPath = 'C:/questasim64_10.6c/win64'; // QuestaSim 安装路径


    // 假设 executeVivadoTcl 是一个异步函数，用于执行 Vivado TCL 脚本并返回仿真路径
    const { stdout, stderr, simulationPath } = await executeVivadoTcl(projectPath, questasimInstallPath);

    if (simulationPath) {
      console.log(`Extracted simulation path: ${simulationPath}`);
      // const vsimCommand = `vsim -c -do ${simulationPath}/\\tb.do`; // 构造执行 tb.do 文件的命令
      // exec(`questasim "  `, { cwd: simulationPath }, (error, stdout, stderr) => {

      const vivadoSimtype =   vscode.workspace.getConfiguration().get('vivadoSim.type') as string;
      console.log('vivadoSimtype:', vivadoSimtype); 

      exec(`${vivadoSimtype} "  `, { cwd: simulationPath }, (error, stdout, stderr) => {

        if (error) {
          console.error(`Error: ${error}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
      });
    } else {
      console.warn('Failed to extract simulation path from Vivado output.');
    }



    
    //产生tb.do文件
    if (simulationPath) {
      extractData(simulationPath);
    } else {
      vscode.window.showErrorMessage('simulationPath is no open.');
    }


    //复制 do tb.do 到剪切板
    const doTbDo = `do tb.do`;
    // 将脚本地址写入剪切板-然后用户取VIVADO的TCL栏取黏贴脚本
    vscode.env.clipboard.writeText(doTbDo);
    vscode.window.showInformationMessage('脚本地址已经写入剪切板-请用户在仿真软件的TCL栏粘贴脚本');

    // simulationPath往上一级路径-注意 undefined 情况
    // const simulationPath_up_one_dir = path.join(simulationPath, '..');

    if (typeof simulationPath === 'string') {
      const simulationPath_up_one_dir = path.join(simulationPath, '..');

      // 复制 vivado.log
      if (!currentWorkspaceFolder) {
        vscode.window.showErrorMessage('未找到工作区文件夹');
        return;
      }
      await  fs.copyFileSync(path.join(currentWorkspaceFolder.uri.fsPath, 'vivado.log'), path.join(simulationPath_up_one_dir, 'vivado.log'));
      
    } else {
      console.warn('Failed to extract simulation path from Vivado output.');
      return; // 或者处理缺失 simulationPath 的情况
    }

    // 删除currentWorkspaceFolder 下的产生的所有.log 和 .jou 文件
    fs.readdirSync(currentWorkspaceFolder.uri.fsPath).forEach(file => {
      if (file.endsWith('.log') || file.endsWith('.jou')) {
        fs.unlinkSync(path.join(currentWorkspaceFolder.uri.fsPath, file));
      }
    });


  } catch (error:any) {
    vscode.window.showErrorMessage(`Error executing Vivado commands: ${error.message}`);
  }
};
