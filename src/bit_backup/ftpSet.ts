// //写VSCODE ts代码  使用ftp进行文件上传和下载 
import * as vscode from 'vscode';
import { Client } from 'basic-ftp';
import { exec, spawn } from 'child_process';
import * as fs from 'fs';
import path = require('path');

interface FtpConfig {
  host: string;
  user: string;
  password: string;
  remotePath: string;
  localPath: string;
}

// 处理FTP连接，显示连接成功信息
async function handleFtpConnection(client: Client, ftpConfig: FtpConfig): Promise<void> {
  try {
    await client.access({
      host: ftpConfig.host,
      user: ftpConfig.user,
      password: ftpConfig.password
    });
    // 设置为主动模式
    vscode.window.showInformationMessage('Connected to FTP successfully.');
  } catch (error) {
    throw error;
  }
}
// 上传文件到FTP服务器
export async function uploadFile(ftpConfig: FtpConfig): Promise<void> {
  const client = new Client();

  try {
    await handleFtpConnection(client, ftpConfig);
    // 清理路径前后的空格
    ftpConfig.localPath = ftpConfig.localPath.trim();
    ftpConfig.remotePath = ftpConfig.remotePath.trim();
    // 检查本地文件是否存在
    if (!fs.existsSync(ftpConfig.localPath)) {
      vscode.window.showErrorMessage(`Local file not found: ${ftpConfig.localPath}`);
      throw new Error(`Local file not found: ${ftpConfig.localPath}`);
    }
    console.log("uploadFile-localPath", ftpConfig.localPath);
    console.log("uploadFile-remotePath", ftpConfig.remotePath);
    await client.uploadFrom(ftpConfig.localPath, ftpConfig.remotePath);
    vscode.window.showInformationMessage('File uploaded successfully.');

  } catch (error) {
    vscode.window.showErrorMessage('Error during FTP connection or upload.');
    throw error;
  } finally {
    client.close();
  }
}




// 从FTP服务器下载文件
async function downloadFile(ftpConfig: FtpConfig): Promise<void> {
  const client = new Client();

  try {
    await handleFtpConnection(client, ftpConfig);

    console.log("downloadFile-localPath", ftpConfig.localPath);
    console.log("downloadFile-remotePath", ftpConfig.remotePath);
    // 交换参数顺序：远程路径 -> 本地路径
    await client.downloadTo(ftpConfig.localPath, ftpConfig.remotePath);
    vscode.window.showInformationMessage('File downloaded successfully.');

  } catch (error) {
    vscode.window.showErrorMessage('Error during FTP connection or download.');
    throw error;
  } finally {
    client.close();
  }
}


// 上传整个文件夹到FTP服务器
// WIN 10 之间互相传输OK 但是WIN11之间传输会存在异常
// export async function uploadFolder(ftpConfig: FtpConfig, folderPath: string): Promise<void> {
//   const client = new Client();

//   try {
//     await handleFtpConnection(client, ftpConfig);
//     // 提取最后一个文件夹名称
//     const lastFolderName = path.basename(folderPath);
//     const remotePathWithFolderName = path.join(ftpConfig.remotePath, lastFolderName);
//     // const remotePathWithFolderName = (ftpConfig.remotePath+'/'+lastFolderName);

//     await uploadDirectory(client, ftpConfig, folderPath, remotePathWithFolderName);
//     vscode.window.showInformationMessage('Folder uploaded successfully.');
//   } catch (error) {
//     vscode.window.showErrorMessage('Error during FTP connection or folder upload.');
//     throw error;
//   } finally {
//     client.close();
//   }
// }


// async function uploadDirectory(client: Client, ftpConfig: FtpConfig, localDir: string, remoteDir: string): Promise<void> {
//   // 确保远程目录存在--不存在则创建子文件夹
//   await client.ensureDir(remoteDir);

//   const files = fs.readdirSync(localDir);

//   for (const file of files) {
//     const localFilePath = path.join(localDir, file);
//     const remoteFilePath = path.join(remoteDir, file);

//     if (fs.statSync(localFilePath).isDirectory()) {
//       // 如果是目录，则创建远程目录并递归上传
//       await uploadDirectory(client, ftpConfig, localFilePath, remoteFilePath);
//     } else {
//       // 如果是文件，则上传文件
//       try {
//         await handleFtpConnection(client, ftpConfig);
//         await client.uploadFrom(localFilePath,remoteFilePath);
//       } catch (error:any) {
//         vscode.window.showErrorMessage(`Error uploading file: ${localFilePath}. Error: ${error.message}`);
//         throw error;
//       }
//     }
//   }
// }


// 采用CMD命令进行文件夹传输
export async function uploadFolder(ftpConfig: FtpConfig, folderPath: string): Promise<void> {
  try {
    // 提取最后一个文件夹名称
    const lastFolderName = path.basename(folderPath);
    const remotePathWithFolderName = path.join(ftpConfig.remotePath, lastFolderName);
    const shart_ip="\\"+"\\"+ftpConfig.host;
    const sharepath=path.join(shart_ip,remotePathWithFolderName);
    let command = `
      chcp 65001
      net use ${shart_ip}
      xcopy /e /i /y ${folderPath} "${sharepath}"
      exit
      `;

      const tempFilePath = path.join(folderPath ?? '', 'copy_to_share_path.bat');
      await fs.promises.writeFile(tempFilePath, command);
      const { stdout, stderr } = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
        exec(`cmd /c ${tempFilePath}`, { cwd: folderPath }, (error: any, stdout: any, stderr: any) => {
          if (error) {
            reject(error);
          } else {
            vscode.window.showInformationMessage(`Successfully copied folder: ${folderPath} to ${sharepath}`);
            vscode.window.showInformationMessage(`Command output: ${stdout}`);
            // console.log(`Command errors: ${stderr}`);
            resolve({ stdout, stderr });
          }
        });
      });

    // 生成验证脚本
    let verifyCommand = `
      chcp 65001
      net use ${shart_ip}
      dir "${sharepath}"
      exit
      `;

    const tempVerifyFilePath = path.join(folderPath ?? '', 'verify_copy.bat');
    await fs.promises.writeFile(tempVerifyFilePath, verifyCommand);

    const { verifyStdout, verifyStderr } = await new Promise<{ verifyStdout: string; verifyStderr: string }>((resolve, reject) => {
      exec(`cmd /c ${tempVerifyFilePath}`, { cwd: folderPath }, (error: any, verifyStdout: any, verifyStderr: any) => {
        if (error) {
          reject(error);
        } else {
          vscode.window.showInformationMessage(`Verification output: ${verifyStdout}`);
          resolve({ verifyStdout, verifyStderr });
        }
      });
    });


    } catch (error) {
      vscode.window.showErrorMessage('{Error cmd copy.}');
      throw error;
    }
  }



// 获取当前工作区的根目录
function getWorkspaceRoot(): string | undefined {
  return vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
}

// 确保配置文件夹存在
async function ensureConfigFolderExists(): Promise<void> {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    throw new Error("No workspace folder is open.");
  }
  const configFolderPath = path.join(workspaceRoot, '.vscode');
  try {
    await fs.promises.mkdir(configFolderPath, { recursive: true });
  } catch (err:any) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
}

// 获取或创建配置文件路径
let configCreated = false;

async function getConfigFilePath(): Promise<string> {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    throw new Error("No workspace folder is open.");
  }
  const configFilePath = path.join(workspaceRoot, '.vscode', 'ftp-config.json');
  await ensureConfigFolderExists(); // 确保config文件夹存在
  return configFilePath;
}



export async function getFtpConfig(customConfig?: FtpConfig): Promise<FtpConfig> {
  const configFile = await getConfigFilePath();

  let ftpConfig: FtpConfig;

  if (customConfig) {
    // 如果有自定义配置，先使用它
    ftpConfig = customConfig;
    await fs.promises.writeFile(configFile, JSON.stringify(customConfig, null, 2));
    vscode.window.showInformationMessage('Custom FTP configuration saved to file.');

  } else {
    try {
      const data = await fs.promises.readFile(configFile, 'utf-8');
      ftpConfig = JSON.parse(data);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        const defaultConfig = {
          host: '192.168.1.200',
          user: 'your-ftp-user',
          password: 'your_ftp_password',
          remotePath: '/sdcard',
          localPath: 'D:/Desktop/led/vivado.log',
        };
        await fs.promises.writeFile(configFile, JSON.stringify(defaultConfig, null, 2));
        ftpConfig = defaultConfig;
        configCreated = true;
      } else {
        vscode.window.showErrorMessage('Error reading FTP configuration file.');
        throw error;
      }
    }
  }

  return ftpConfig;
}

// 注册命令
export const uploadFileCommand = vscode.commands.registerCommand('ftp-extension.upload', async () => {
  const ftpConfig = await getFtpConfig();
  await uploadFile(ftpConfig);
});

const downloadFileCommand = vscode.commands.registerCommand('ftp-extension.download', async () => {
  const ftpConfig = await getFtpConfig();
  await downloadFile(ftpConfig);
});

const awaitGetFtpConfig = vscode.commands.registerCommand('ftp-extension.getFtpConfig', async () => {
  await getFtpConfig();
});
// 注册上传文件夹的命令
export const uploadFolderCommand = vscode.commands.registerCommand('ftp-extension.uploadFolder', async () => {
  const folderPath = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    title: 'Select Folder to Upload'
  });

  if (folderPath && folderPath.length > 0) {
    const ftpConfig = await getFtpConfig();
    await uploadFolder(ftpConfig, folderPath[0].fsPath);
  }
});

export function ftpSet(context: vscode.ExtensionContext) {
  context.subscriptions.push(uploadFileCommand, downloadFileCommand, awaitGetFtpConfig,uploadFolderCommand);
}
export function deactivate() {}












// // 成功了 有些报错信息 需要优化
// // 多个可以传递上去 但是单个不行 --上面那个时单个可以 多个不行
// import * as vscode from 'vscode';
// import * as ftp from 'ftp';
// import * as fs from 'fs';
// import * as path from 'path';

// interface FtpConfig {
//   host: string;
//   user: string;
//   password: string;
//   remotePath: string;
//   localPath: string;
// }

// // 处理FTP连接，显示连接成功信息
// async function handleFtpConnection(client: ftp, ftpConfig: FtpConfig): Promise<void> {
//   return new Promise((resolve, reject) => {
//     client.on('ready', () => {
//       console.log('FTP connection ready');
//       vscode.window.showInformationMessage('Connected to FTP successfully.');
//       resolve();
//     });

//     client.on('error', (err: any) => {
//       console.error('FTP connection error:', err);
//       vscode.window.showErrorMessage(`FTP connection error: ${err.message}`);
//       reject(err);
//     });

//     client.on('end', () => {
//       console.log('FTP connection ended');
//     });

//     client.on('close', (hadError: boolean) => {
//       console.log('FTP connection closed', hadError ? 'with error' : 'without error');
//     });

//     console.log('Connecting to FTP server...');
//     client.connect({
//       host: ftpConfig.host,
//       user: ftpConfig.user,
//       password: ftpConfig.password,
//     });
//   });
// }

// // 上传文件到FTP服务器
// export async function uploadFile(ftpConfig: FtpConfig): Promise<void> {
//   const client = new ftp();

//   try {
//     await handleFtpConnection(client, ftpConfig);

//     // 清理路径前后的空格
//     ftpConfig.localPath = ftpConfig.localPath.trim();
//     ftpConfig.remotePath = ftpConfig.remotePath.trim();

//     // 检查本地文件是否存在
//     if (!fs.existsSync(ftpConfig.localPath)) {
//       vscode.window.showErrorMessage(`Local file not found: ${ftpConfig.localPath}`);
//       throw new Error(`Local file not found: ${ftpConfig.localPath}`);
//     }

//     console.log("uploadFile-localPath", ftpConfig.localPath);
//     console.log("uploadFile-remotePath", ftpConfig.remotePath);

//     return new Promise((resolve, reject) => {
//       client.put(ftpConfig.localPath, ftpConfig.remotePath, (err) => {
//         if (err) {
//           vscode.window.showErrorMessage('Error during FTP upload.');
//           reject(err);
//         } else {
//           vscode.window.showInformationMessage('File uploaded successfully.');
//           resolve();
//         }
//       });
//     });
//   } catch (error) {
//     vscode.window.showErrorMessage('Error during FTP connection or upload.');
//     throw error;
//   } finally {
//     client.end();
//   }
// }

// // 从FTP服务器下载文件
// async function downloadFile(ftpConfig: FtpConfig): Promise<void> {
//   const client = new ftp();

//   try {
//     await handleFtpConnection(client, ftpConfig);

//     console.log("downloadFile-localPath", ftpConfig.localPath);
//     console.log("downloadFile-remotePath", ftpConfig.remotePath);

//     return new Promise((resolve, reject) => {
//       client.get(ftpConfig.remotePath, (err, stream) => {
//         if (err) {
//           vscode.window.showErrorMessage('Error during FTP download.');
//           reject(err);
//         } else {
//           stream.once('close', () => {
//             vscode.window.showInformationMessage('File downloaded successfully.');
//             resolve();
//           });
//           stream.pipe(fs.createWriteStream(ftpConfig.localPath));
//         }
//       });
//     });
//   } catch (error) {
//     vscode.window.showErrorMessage('Error during FTP connection or download.');
//     throw error;
//   } finally {
//     client.end();
//   }
// }

// // 上传整个文件夹到FTP服务器
// export async function uploadFolder(ftpConfig: FtpConfig, folderPath: string): Promise<void> {
//   const client = new ftp();

//   try {
//     await handleFtpConnection(client, ftpConfig);

//     // 提取最后一个文件夹名称
//     const lastFolderName = path.basename(folderPath);
//     const remotePathWithFolderName = path.join(ftpConfig.remotePath, lastFolderName);

//     await uploadDirectory(client, ftpConfig, folderPath, remotePathWithFolderName);
//     vscode.window.showInformationMessage('Folder uploaded successfully.');
//   } catch (error) {
//     vscode.window.showErrorMessage('Error during FTP connection or folder upload.');
//     throw error;
//   } finally {
//     client.end();
//   }
// }

// // 递归上传目录
// async function uploadDirectory(client: ftp, ftpConfig: FtpConfig, localDir: string, remoteDir: string): Promise<void> {
//   return new Promise((resolve, reject) => {
//     client.mkdir(remoteDir, true, (err) => {
//       if (err) {
//         vscode.window.showErrorMessage(`Error creating directory: ${remoteDir}. Error: ${err.message}`);
//         reject(err);
//         return;
//       }

//       fs.readdir(localDir, (err, files) => {
//         if (err) {
//           vscode.window.showErrorMessage(`Error reading directory: ${localDir}. Error: ${err.message}`);
//           reject(err);
//           return;
//         }

//         let fileCount = 0;

//         files.forEach(async (file) => {
//           const localFilePath = path.join(localDir, file);
//           const remoteFilePath = path.join(remoteDir, file);

//           if (fs.statSync(localFilePath).isDirectory()) {
//             // 如果是目录，则创建远程目录并递归上传
//             try {
//               await uploadDirectory(client, ftpConfig, localFilePath, remoteFilePath);
//             } catch (error) {
//               vscode.window.showErrorMessage(`Error uploading directory: ${localFilePath}. Error: ${error.message}`);
//               reject(error);
//               return;
//             }
//           } else {
//             // 如果是文件，则上传文件
//             try {
//               await new Promise(resolve => setTimeout(resolve, 500));
//               client.put(localFilePath, remoteFilePath, (err) => {
//                 if (err) {
//                   vscode.window.showErrorMessage(`Error uploading file: ${localFilePath}. Error: ${err.message}`);
//                   reject(err);
//                 } else {
//                   // 延迟
//                   setTimeout(() => {
//                     fileCount++; // 计数器加1
//                     if (fileCount >= files.length) resolve();
//                   }, 500);
//                 }
//               });
//             } catch (error) {
//               vscode.window.showErrorMessage(`Error uploading file: ${localFilePath}. Error: ${error.message}`);
//               reject(error);
//             }
//           }
//         });
//       });
//     });
//   });
// }

// // 获取当前工作区的根目录
// function getWorkspaceRoot(): string | undefined {
//   return vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
// }

// // 确保配置文件夹存在
// async function ensureConfigFolderExists(): Promise<void> {
//   const workspaceRoot = getWorkspaceRoot();
//   if (!workspaceRoot) {
//     throw new Error("No workspace folder is open.");
//   }
//   const configFolderPath = path.join(workspaceRoot, '.vscode');
//   try {
//     await fs.promises.mkdir(configFolderPath, { recursive: true });
//   } catch (err: any) {
//     if (err.code !== 'EEXIST') {
//       throw err;
//     }
//   }
// }

// // 获取或创建配置文件路径
// let configCreated = false;

// async function getConfigFilePath(): Promise<string> {
//   const workspaceRoot = getWorkspaceRoot();
//   if (!workspaceRoot) {
//     throw new Error("No workspace folder is open.");
//   }
//   const configFilePath = path.join(workspaceRoot, '.vscode', 'ftp-config.json');
//   await ensureConfigFolderExists(); // 确保config文件夹存在
//   return configFilePath;
// }

// export async function getFtpConfig(customConfig?: FtpConfig): Promise<FtpConfig> {
//   const configFile = await getConfigFilePath();

//   let ftpConfig: FtpConfig;

//   if (customConfig) {
//     // 如果有自定义配置，先使用它
//     ftpConfig = customConfig;
//     await fs.promises.writeFile(configFile, JSON.stringify(customConfig, null, 2));
//     vscode.window.showInformationMessage('Custom FTP configuration saved to file.');
//   } else {
//     try {
//       const data = await fs.promises.readFile(configFile, 'utf-8');
//       ftpConfig = JSON.parse(data);
//     } catch (error: any) {
//       if (error.code === 'ENOENT') {
//         const defaultConfig = {
//           host: '192.168.1.200',
//           user: 'your-ftp-user',
//           password: 'your_ftp_password',
//           remotePath: '/sdcard',
//           localPath: 'D:/Desktop/led/vivado.log',
//         };
//         await fs.promises.writeFile(configFile, JSON.stringify(defaultConfig, null, 2));
//         ftpConfig = defaultConfig;
//         configCreated = true;
//       } else {
//         vscode.window.showErrorMessage('Error reading FTP configuration file.');
//         throw error;
//       }
//     }
//   }

//   return ftpConfig;
// }

// // 注册命令
// export const uploadFileCommand = vscode.commands.registerCommand('ftp-extension.upload', async () => {
//   const ftpConfig = await getFtpConfig();
//   await uploadFile(ftpConfig);
// });

// const downloadFileCommand = vscode.commands.registerCommand('ftp-extension.download', async () => {
//   const ftpConfig = await getFtpConfig();
//   await downloadFile(ftpConfig);
// });

// const awaitGetFtpConfig = vscode.commands.registerCommand('ftp-extension.getFtpConfig', async () => {
//   await getFtpConfig();
// });

// // 注册上传文件夹的命令
// export const uploadFolderCommand = vscode.commands.registerCommand('ftp-extension.uploadFolder', async () => {
//   const folderPath = await vscode.window.showOpenDialog({
//     canSelectFiles: false,
//     canSelectFolders: true,
//     canSelectMany: false,
//     title: 'Select Folder to Upload'
//   });

//   if (folderPath && folderPath.length > 0) {
//     const ftpConfig = await getFtpConfig();
//     await uploadFolder(ftpConfig, folderPath[0].fsPath);
//   }
// });

// export function ftpSet(context: vscode.ExtensionContext) {
//   context.subscriptions.push(uploadFileCommand, downloadFileCommand, awaitGetFtpConfig, uploadFolderCommand);
// }

// export function deactivate() {}