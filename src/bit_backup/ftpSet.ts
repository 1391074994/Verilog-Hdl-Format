// //写VSCODE ts代码  使用ftp进行文件上传和下载 


import * as vscode from 'vscode';
import { Client } from 'basic-ftp';

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
      password: ftpConfig.password,
    });

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

// // 从FTP服务器下载文件
// async function downloadFile(ftpConfig: FtpConfig): Promise<void> {
//   const client = new Client();

//   try {
//     await handleFtpConnection(client, ftpConfig);


//     console.log("downloadFile-localPath", ftpConfig.localPath);
//     console.log("downloadFile-remotePath", ftpConfig.remotePath);
//     await client.downloadTo(ftpConfig.remotePath, ftpConfig.localPath);
//     vscode.window.showInformationMessage('File downloaded successfully.');

//   } catch (error) {
//     vscode.window.showErrorMessage('Error during FTP connection or download.');
//     throw error;
//   } finally {
//     client.close();
//   }
// }

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

// export async function getFtpConfig(): Promise<FtpConfig> {
//   const configFile = await getConfigFilePath();

//   let ftpConfig: FtpConfig;
//   try {
//     const data = await fs.promises.readFile(configFile, 'utf-8');
//     ftpConfig = JSON.parse(data);
//   } catch (error:any) {
//     if (error.code === 'ENOENT' && !configCreated) {
//       vscode.window.showInformationMessage('FTP configuration file not found. Creating a default one...');
//       const defaultConfig = {
//         host: '192.168.3.3',// ftp服务器地址
//         user: 'your-ftp-user',// ftp用户名
//         password: 'your_ftp_password',// ftp密码
//         remotePath: '/11/vivado.log',// ftp远程路径
//         localPath: 'D:/Desktop/led/vivado.log'// 本地路径
//       };
//       await fs.promises.writeFile(configFile, JSON.stringify(defaultConfig, null, 2));
//       vscode.window.showInformationMessage('FTP configuration file is created.');
//       configCreated = true; // 标记配置文件已创建
//       ftpConfig = defaultConfig; // 使用创建的默认配置
//     } else {
//       vscode.window.showErrorMessage('Error reading FTP configuration file.');
//       throw error;
//     }
//   }

//   return ftpConfig;
// }

export async function getFtpConfig(customConfig?: FtpConfig): Promise<FtpConfig> {
  const configFile = await getConfigFilePath();

  let ftpConfig: FtpConfig;

  // 如果提供了自定义配置，直接返回
  if (customConfig) {
    return customConfig;
  }

  try {
    const data = await fs.promises.readFile(configFile, 'utf-8');
    ftpConfig = JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT' && !configCreated) {
      vscode.window.showInformationMessage('FTP configuration file not found. Creating a default one...');
      const defaultConfig = {
        host: '192.168.0.100', // ftp服务器地址
        user: 'your-ftp-user', // ftp用户名
        password: 'your_ftp_password', // ftp密码
        remotePath: '/11/vivado.log', // ftp远程路径
        localPath: 'D:/Desktop/led/vivado.log', // 本地路径
      };
      await fs.promises.writeFile(configFile, JSON.stringify(defaultConfig, null, 2));
      vscode.window.showInformationMessage('FTP configuration file is created.');
      configCreated = true; // 标记配置文件已创建
      ftpConfig = defaultConfig; // 使用创建的默认配置
    } else {
      vscode.window.showErrorMessage('Error reading FTP configuration file.');
      throw error;
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

export function ftpSet(context: vscode.ExtensionContext) {
  context.subscriptions.push(uploadFileCommand, downloadFileCommand, awaitGetFtpConfig);
}
export function deactivate() {}