////////////////////////////////////////////////////////////////////////////////
// 文件格式转换 ucf → xdc 									//直接进行识别转换  ，没有进行排序											 
////////////////////////////////////////////////////////////////////////////////
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';


// export function ucf_to_xdc_normal_order() {
//     // 获取当前编辑器
//     const editor = vscode.window.activeTextEditor;
//     if (editor) {
//         // 获取当前文档的 URI
//         const uri = editor.document.uri;
//         // 获取文件路径
//         const filePath = uri.fsPath;

//         // 判断是否为 .ucf 文件
//         if (path.extname(filePath) !== '.ucf') {
//             vscode.window.showErrorMessage('请打开一个 .ucf 文件');
//             return;
//         }

//         // 读取文件内容
//         fs.readFile(filePath, 'utf-8', (err, data) => {
//             if (err) {
//                 vscode.window.showErrorMessage(`读取文件失败：${err.message}`);
//                 return;
//             }

//             // 按行分割文件内容
//             const lines = data.split('\n');

//             // 遍历每一行并进行识别与转换
//             const convertedLines: string[] = [];
//             for (let line of lines) {
//                 // 正则匹配识别 UCF 格式
//                 const regex = /NET\s*"(.*?)"\s*LOC\s*=\s*"(.*?)"\s*/;
//                 const match = line.match(regex);
//                 if (match && match.length >= 3) {
//                     const portName = match[1];
//                     const pin = match[2];
//                     const convertedLine = `set_property -dict {PACKAGE_PIN ${pin} IOSTANDARD LVCMOS33} [get_ports ${portName.padEnd(20)}]`;
//                     convertedLines.push(convertedLine);
//                 } else {
//                     convertedLines.push(line);
//                 }
//             }

//             // 输出转换结果
//             const convertedText = convertedLines.join('\n');
//             vscode.window.showInformationMessage('转换成功：\n' + convertedText);

//             // 将转换后的文本复制到剪贴板
//             vscode.env.clipboard.writeText(convertedText).then(() => {
//                 vscode.window.showInformationMessage('已复制到剪贴板');
//             });

            
//             // 写入转换后的内容到新文件 top.xdc
//             const outputPath = path.join(path.dirname(filePath), 'top.xdc');

//             fs.writeFile(outputPath, convertedText, 'utf-8', (err) => {
//               if (err) {
//                 vscode.window.showErrorMessage(`写入文件失败：${err.message}`);
//                 return;
//               }

//               vscode.window.showInformationMessage(`已成功将转换后的内容写入 ${outputPath}`);
//             });

            
//         });
//     } else {
//         vscode.window.showErrorMessage('请打开一个 .ucf 文件');
//     }
// }


////////////////////////////////////////////////////////////////////////////////
//先进行排序 再进行转换																				 
////////////////////////////////////////////////////////////////////////////////
// import * as vscode from 'vscode';
// import * as fs from 'fs';
// import * as path from 'path';

// // 定义存储行信息的数据类型
// type LineInfo = {
//   lineNumber: number; // 行号
//   variable: string; // 变量名
//   pin: string; // 引脚号
// };

// // 转换函数
// export function ucf_to_xdc_sort_order() {
//   // 获取活动的编辑器
//   const editor = vscode.window.activeTextEditor;
//   if (editor) {
//     // 获取当前文件的路径
//     const uri = editor.document.uri;
//     const filePath = uri.fsPath;

//     // 检查文件扩展名是否为 .ucf
//     if (path.extname(filePath) !== '.ucf') {
//       vscode.window.showErrorMessage('请打开一个 .ucf 文件');
//       return;
//     }

//     // 读取文件内容
//     fs.readFile(filePath, 'utf-8', (err, data) => {
//       if (err) {
//         vscode.window.showErrorMessage(`读取文件失败：${err.message}`);
//         return;
//       }

//       // 将文件内容按行拆分为数组
//       const lines = data.split('\n');

//       // 存储行信息的数组
//       const lineInfos: LineInfo[] = [];

//       // 遍历每一行，提取变量名和引脚号，并保存到 lineInfos 数组中
//       for (let i = 0; i < lines.length; i++) {
//         const line = lines[i];
//         const regex = /^NET "(.*?)" LOC = "(.*?)"/;
//         const match = line.match(regex);

//         if (match && match.length >= 3) {
//           const variable = match[1].trim(); // 提取变量名
//           const pin = match[2].trim(); // 提取引脚号

//           lineInfos.push({ lineNumber: i, variable, pin });
//         }
//       }

//       // 根据变量名和引脚号对 lineInfos 数组进行排序
//       lineInfos.sort((a, b) => {
//         const aParts = a.variable.split('<');
//         const bParts = b.variable.split('<');

//         const aName = aParts[0];
//         const bName = bParts[0];

//         const aIndex = parseInt(aParts[1]?.replace('>', ''), 10) || 0;
//         const bIndex = parseInt(bParts[1]?.replace('>', ''), 10) || 0;

//         if (aName !== bName) {
//           return aName.localeCompare(bName);
//         } else {
//           return aIndex - bIndex;
//         }
//       });

//       // 根据排序后的行信息，生成转换后的文本内容
//       const convertedLines = lineInfos.map((lineInfo) => {
//         const { variable, pin } = lineInfo;
//         return `set_property -dict {PACKAGE_PIN ${pin.padEnd(4)} IOSTANDARD LVCMOS33} [get_ports ${variable.padEnd(20)}]`;
//       });

//       // 将转换后的文本内容拼接成一个字符串
//       const convertedText = convertedLines.join('\n');

//       // 写入转换后的内容到新文件 top.xdc
//       const outputPath = path.join(path.dirname(filePath), 'top.xdc');

//       fs.writeFile(outputPath, convertedText, 'utf-8', (err) => {
//         if (err) {
//           vscode.window.showErrorMessage(`写入文件失败：${err.message}`);
//           return;
//         }

//         vscode.window.showInformationMessage(`已成功将转换后的内容写入 ${outputPath}`);
//       });
//     });
//   } else {
//     vscode.window.showErrorMessage('请打开一个 .ucf 文件');
//   }
// }



type LineInfo = {
  lineNumber: number; // 行号
  variable: string; // 变量名
  pin: string; // 引脚号
};

// 转换函数
export function ucf_to_xdc_sort_order() {
  // 获取活动的编辑器
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    // 获取当前文件的路径
    const uri = editor.document.uri;
    const filePath = uri.fsPath;

    // 检查文件扩展名是否为 .ucf
    if (path.extname(filePath) !== '.ucf') {
      vscode.window.showErrorMessage('请打开一个 .ucf 文件');
      return;
    }

    // 读取文件内容
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        vscode.window.showErrorMessage(`读取文件失败：${err.message}`);
        return;
      }

      // 将文件内容按行拆分为数组
      const lines = data.split('\n');

      // 存储行信息的数组
      const lineInfos: LineInfo[] = [];

      // 遍历每一行，提取变量名和引脚号，并保存到 lineInfos 数组中
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const regex = /^NET\s+"(.*?)"\s+LOC\s+=\s+"(.*?)"/;
        const match = line.match(regex);

        if (match && match.length >= 3) {
          const variable = match[1].trim(); // 提取变量名
          const pin = match[2].trim(); // 提取引脚号

          lineInfos.push({ lineNumber: i, variable, pin });
        }
      }

      // 根据变量名和引脚号对 lineInfos 数组进行排序
      lineInfos.sort((a, b) => {
        const aParts = a.variable.split('<');
        const bParts = b.variable.split('<');

        const aName = aParts[0] ?? '';
        const bName = bParts[0] ?? '';

        const aIndex = Number(aParts[1]?.replace('>', '') ?? '-Infinity');
        const bIndex = Number(bParts[1]?.replace('>', '') ?? '-Infinity');

        if (aName !== bName) {
          return aName.localeCompare(bName);
        } else {
          return aIndex - bIndex;
        }
      });

      // 根据排序后的行信息，生成转换后的文本内容
      const convertedLines = lineInfos.map((lineInfo) => {
        const { variable, pin } = lineInfo;
        return `set_property -dict {PACKAGE_PIN ${pin.padEnd(4)} IOSTANDARD LVCMOS33} [get_ports ${variable.padEnd(20)}]`;
      });

      // 将转换后的文本内容拼接成一个字符串
      const convertedText = convertedLines.join('\n');

      // 写入转换后的内容到新文件 top.xdc
      const outputPath = path.join(path.dirname(filePath), 'top.xdc');

      fs.writeFile(outputPath, convertedText, 'utf-8', (err) => {
        if (err) {
          vscode.window.showErrorMessage(`写入文件失败：${err.message}`);
          return;
        }

        vscode.window.showInformationMessage(`已成功将转换后的内容写入 ${outputPath}`);
      });
    });
  } else {
    vscode.window.showErrorMessage('请打开一个 .ucf 文件');
  }
}
