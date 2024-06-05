
//根据ocalparam|parameter) 寄存器的列表生成markdown文件和excel文件
// 按照^\s*(localparam|parameter)\s+(\S+)\s*=\s*([^;]+)/i的正则表达式匹配出参数和后面的注释内容 包含跨行的注释内容



import * as vscode from 'vscode';
import * as fs from 'fs';
import * as XLSX from 'xlsx';
import path = require('path');

const regex = /^\s*(localparam|parameter)\s+(\S+)\s*=\s*([^;]+)/i;

function extractCommentFromLine(line: string): string {
    const commentStartIndex = line.indexOf('//');
    if (commentStartIndex > -1) {
        return line.substring(commentStartIndex).trim();
    }
    return '';
}



function createExcelFile(data: any[], fileName: string, headerTitle: string) {
    const workbook = XLSX.utils.book_new();
    const sheetName = 'SheetJS';

    // 在数据开始前插入标题行
    const headerRow = [headerTitle];
    data.unshift(headerRow);

    // 计算每列的最大宽度
    const columnWidths = data.reduce((acc, row) => 
        row.map((cell: { toString: () => { (): any; new(): any; length: number; }; }, index: string | number) => Math.max(acc[index] || 0, cell.toString().length)), []);
    console.log(columnWidths);
    // 为每列宽度加上额外空间
    const adjustedColumnWidths = columnWidths.map((width: number) => width + 5);

    // 转换数据为适合写入Excel的格式
    const worksheetData = data.map(row => row.map((cell: any) => ({ v: cell })));

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // 设置列宽
    worksheet['!cols'] = adjustedColumnWidths.map((width: any) => ({ width }));

    // 添加其他样式或操作...

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    fs.writeFileSync(fileName, excelBuffer);
}



export function proRegMarkdown(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.doc_reg_produce', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const document = editor.document;
        const workspaceFolders = vscode.workspace.workspaceFolders; // 获取工作区文件夹
        if (workspaceFolders && workspaceFolders.length > 0) {
            const workspaceRootPath = workspaceFolders[0].uri.fsPath; // 获取第一个工作区文件夹的路径
            console.log('Processing document:', document.uri.fsPath);

            // 获取整个文档内容
            const wholeDocumentContent = document.getText();
            const lines = wholeDocumentContent.split('\n');

            const data = [];
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const match = line.match(regex);
                if (match) {
                    const paramName = match[2];
                    const value = match[3];
                    let comment = extractCommentFromLine(line);

                    // 检查后续行以获取跨行注释
                    let nextLineIndex = i + 1;
                    while (nextLineIndex < lines.length) {
                        const nextLine = lines[nextLineIndex];
                        if (nextLine.trim().length === 0 || nextLine.includes(';')) {
                            break;
                        }
                        comment += nextLine.trim() + '\n';
                        nextLineIndex++;
                    }

                    data.push([paramName, value, comment.trim()]);
                }
            }

          // 确定目标文件夹路径，相对于工作区根目录
          const folderPath = path.join(workspaceRootPath, 'fpga_reg_doc');
          if (!fs.existsSync(folderPath)) {
              fs.mkdirSync(folderPath); // 如果文件夹不存在，则创建它
          }

          // 仅提取当前文档的基本文件名（无路径无扩展名），转换为小写
          const baseFileNameWithoutExt = path.basename(document.fileName, path.extname(document.fileName)).toLowerCase();
          const markdownFileName = path.join(folderPath, `${baseFileNameWithoutExt}.md`);
          const excelFileName = path.join(folderPath, `${baseFileNameWithoutExt}.xlsx`);

          const headerTitleData = `${baseFileNameWithoutExt} 寄存器表`;
          const headerTitle = `### ${headerTitleData}`;
          const headerTitleFormatted = ` ${headerTitle} `.padEnd(80, ' ');

          try {
              console.log('Creating Markdown file:', markdownFileName);
              // 添加Markdown文件的表头
              const tableHeader = '| Parameter | Value | Comment |\n| --- | --- | --- |\n';

              // 写入.md文件到指定文件夹，包括表头和居中标题
              fs.writeFileSync(
                  markdownFileName,
                  `${headerTitleFormatted}\n\n---\n${tableHeader}${data.map(row => `| ${row.join(' | ')} |\n`).join('')}`,
              );
              vscode.window.showInformationMessage(`Markdown file '${markdownFileName}' has been created in the 'fpga_reg_doc' folder.`);

            // 创建Excel文件并同样置于指定文件夹
            // 修改这里，传入headerTitle
            // console.log('Creating Excel file:', excelFileName);
            // console.log('headerTitle', headerTitleData);
            createExcelFile(data, excelFileName, headerTitleData);
              vscode.window.showInformationMessage(`Excel file '${excelFileName}' has been created in the 'fpga_reg_doc' folder.`);
          } catch (error) {
              vscode.window.showErrorMessage(`Failed to create the files: ${error}`);
          }
      } else {
          vscode.window.showWarningMessage('No workspace folders found.');
      }
  });

  context.subscriptions.push(disposable);
}