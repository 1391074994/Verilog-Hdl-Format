

  
// // export { findIpFolder, processLatestVeoFile };

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 递归搜索指定路径，寻找IP文件夹。
 * 搜索过程基于找到XPR文件，然后在`.ip_user_files`目录结构中定位对应的IP文件夹。
 *
 * @param startPath - 起始搜索路径。
 * @returns IP文件夹的路径或`undefined`（未找到）。
 */
async function findIpFolder(startPath: string): Promise<string | undefined> {
  let currentPath = startPath;

  while (true) {
    const xprFilePath = await findXprFile(currentPath);

    if (xprFilePath) {
      const ipUserFilesFilePath = await findIpUserFilesFile(path.dirname(xprFilePath));
      if (ipUserFilesFilePath) {
        const ipFolderPath = await extractIpFolderFromIpUserFiles(ipUserFilesFilePath);
        if (ipFolderPath) {
          return ipFolderPath;
        }
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
 * 在指定目录中查找`.ip_user_files`文件。
 *
 * @param dirPath - 需要搜索的目录路径。
 * @returns `.ip_user_files`文件的路径或`undefined`（未找到）。
 */
async function findIpUserFilesFile(dirPath: string): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, async (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      const matchingFile = files.find((file) => path.extname(file) === `.ip_user_files`);
      resolve(matchingFile ? path.join(dirPath, matchingFile) : undefined);
    });
  });
}

/**
 * 从`.ip_user_files`目录结构中提取IP文件夹路径。
 *
 * @param ipUserFilesDirectoryPath - `.ip_user_files`目录的路径。
 * @returns IP文件夹的路径或`undefined`（无法访问）。
 */
async function extractIpFolderFromIpUserFiles(ipUserFilesDirectoryPath: string): Promise<string | undefined> {
  try {
    const ipFolderPath = path.join(ipUserFilesDirectoryPath, 'ip');

    await fs.promises.access(ipFolderPath);
    return ipFolderPath;
  } catch (err) {
    return undefined;
  }
}

/**
 * 在指定目录中查找XPR文件。
 *
 * @param dirPath - 需要搜索的目录路径。
 * @returns 第一个找到的XPR文件的路径或`undefined`（未找到）。
 */
async function findXprFile(dirPath: string): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, async (err, files) => {
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
 * 递归搜索指定目录及其子目录，查找`.veo`文件。
 *
 * @param dirPath - 需要搜索的目录路径。
 * @returns 第一个找到的`.veo`文件的路径。
 * @throws {Error} 如果在指定目录及其子目录中未找到`.veo`文件。
 */
async function findVeoFile(dirPath: string): Promise<string> {
  let veoFile: string | undefined;

  for await (const entry of await fs.promises.readdir(dirPath, { withFileTypes: true })) {
    const entryPath = path.join(dirPath, entry.name);

    if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.veo') {
      veoFile = entryPath;
      break;
    } else if (entry.isDirectory()) {
      veoFile = await findVeoFile(entryPath);
      if (veoFile) {
        break;
      }
    }
  }

  if (!veoFile) {
    throw new Error(`在目录 "${dirPath}" 中未找到 .veo 文件`);
  }

  return veoFile;
}

/**
 * 处理IP文件夹中最新的`.veo`文件，提取其非注释内容，复制到剪贴板，并显示在webview面板中。
 *
 * @param ipFolderPath - IP文件夹的路径。
 */
async function processLatestVeoFile(ipFolderPath: string): Promise<void> {
  try {
    // 获取IP文件夹下所有子目录及其详细信息
    const subdirectories = await Promise.all(
      (await fs.promises.readdir(ipFolderPath, { withFileTypes: true }))
        .filter((entry) => entry.isDirectory())
        .map(async (entry) => ({
          name: entry.name,
          stats: await fs.promises.stat(path.join(ipFolderPath, entry.name)),
        }))
    );

    // 找到最近修改时间的子目录
    const latestSubdirectory = subdirectories.reduce((latest: { name: string, stats: fs.Stats } | null, current) => {
      const latestTime = latest?.stats.mtimeMs ?? 0;
      const currentTime = current.stats.mtimeMs;

      return currentTime > latestTime ? current : latest;
    }, null)?.name;

    if (!latestSubdirectory) {
      throw new Error('IP文件夹中未找到子目录');
    }

    // 在最新子目录及其子目录中查找 .veo 文件
    const veoFilePath = await findVeoFile(path.join(ipFolderPath, latestSubdirectory));

    const content = await fs.promises.readFile(veoFilePath, 'utf8');
    const nonCommentLines = content.split('\n')
      .filter((line) => !line.startsWith('//')); // 去除注释行

    // 将无注释内容复制到剪切板
    vscode.env.clipboard.writeText(nonCommentLines.join('\n'));

    vscode.window.showInformationMessage('成功将最新IP的.veo内容写入剪切板');

    // 显示无注释内容
    const panel = vscode.window.createWebviewPanel(
      'latestVeoContent',
      '最新 .veo 内容',
      vscode.ViewColumn.One,
      {}
    );
    panel.webview.html = `<pre>${nonCommentLines.join('\n')}</pre>`;
  } catch (err) {
    console.error('处理最新 .veo 文件时出错:', err);
  }
}
/**
 * 导出一个封装好的函数，用于在VS Code插件中执行整个流程：
 * 1. 从当前工作区中查找IP文件夹。
 * 2. 在找到的IP文件夹中处理最新的`.veo`文件。
 * 3. 提取其非注释内容，复制到剪贴板，并显示在webview面板中。
 *
 * @param context - VS Code ExtensionContext对象。
 */
export async function runExtensionWorkflow(context: vscode.ExtensionContext, ipFolderPath?: string): Promise<void> {
  if (!ipFolderPath) {
    const currentWorkspaceFolder = vscode.workspace.workspaceFolders?.[0];

    if (!currentWorkspaceFolder) {
      vscode.window.showErrorMessage('未找到工作区文件夹');
      return;
    }

    const foundIpFolderPath = await findIpFolder(currentWorkspaceFolder.uri.fsPath);
    if (!foundIpFolderPath) {
      vscode.window.showWarningMessage('在工作区层次结构中未找到IP文件夹');
      return;
    }

    ipFolderPath = foundIpFolderPath;
  }

  await processLatestVeoFile(ipFolderPath);
}
  
async function extractUncommentedContent(filePath: string): Promise<string> {
  const content = await fs.promises.readFile(filePath, 'utf8');
  return content.split('\n')
    .filter((line) => !line.startsWith('//')) // 去除注释行
    .join('\n');
}
//  手动选择需要的IP文件夹 - 例化文件
export async function selectAndProcessIpFolder(context: vscode.ExtensionContext): Promise<void> {
  const currentWorkspaceFolder = vscode.workspace.workspaceFolders?.[0];

  if (!currentWorkspaceFolder) {
    vscode.window.showErrorMessage('未找到工作区文件夹');
    return;
  }

  const ipFolderPath = await findIpFolder(currentWorkspaceFolder.uri.fsPath);

  if (!ipFolderPath) {
    vscode.window.showWarningMessage('在工作区层次结构中未找到IP文件夹');
    return;
  }

  const subfolders = await (await fs.promises.readdir(ipFolderPath, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  const selectedSubfolder = await vscode.window.showQuickPick(subfolders, {
    placeHolder: '选择要处理的子文件夹',
  });

  if (selectedSubfolder) {
    const selectedFolderPath = path.join(ipFolderPath, selectedSubfolder);

    try {
      const veoFilePath = await findVeoFile(selectedFolderPath);
      if (veoFilePath) {
        const uncommentedContent = await extractUncommentedContent(veoFilePath);
        vscode.env.clipboard.writeText(uncommentedContent);
        vscode.window.showInformationMessage('成功提取未注释内容并复制到剪贴板');

        // 显示无注释内容
        const panel = vscode.window.createWebviewPanel(
          'latestVeoContent',
          '最新 .veo 内容',
          vscode.ViewColumn.One,
          {}
        );
        panel.webview.html = `<pre>${uncommentedContent}</pre>`; // 修正此处，直接使用 uncommentedContent 变量

      } else {
        vscode.window.showWarningMessage('未在子文件夹中找到 .veo 文件');
      }
    } catch (err) {
      if (err instanceof vscode.FileSystemError) {
        vscode.window.showErrorMessage(`处理子文件夹时出错: ${err.message}`);
      } else {
        console.error('Unexpected error occurred:', err);
        vscode.window.showErrorMessage('处理子文件夹时发生意外错误，请查看输出面板了解详情');
      }
    }
  }
}
// export { findIpFolder, processLatestVeoFile };