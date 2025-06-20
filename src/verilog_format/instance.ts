

import * as vscode from 'vscode';



export function instance() {
  // 获取当前打开的文档
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    // 获取当前文档的所有内容
    const document = activeEditor.document;
    const code = document.getText();

    // 新增逻辑：提取module内的代码部分
    const moduleContent = extractModuleContent(code);
    console.log("moduleContent",moduleContent);

    // 调用转换函数进行代码转换
    const convertedCode = convertRegWIRE(moduleContent)  + converModuleRoutine(moduleContent) ;


    // 将转换后的代码写入剪贴板
    vscode.env.clipboard.writeText(convertedCode).then(() => {
      vscode.window.showInformationMessage('Verilog代码已成功复制到剪贴板！');
    });
  }
}


// function extractModuleContent(code: string): string {
//   // 使用正则表达式匹配module开始到结束的内容，包括内部的注释
//   const moduleRegex = /module\s+\w+\s*\(([\s\S]*?)\)\s*;/;
//   const match = code.match(moduleRegex);
//   return match ? match[0] : code; // 如果找不到module，则返回原始代码
// }

export function extractModuleContent(code: string): string {
  // 首先，分割代码为行数组，遍历找到以'module'开始的行
  const lines = code.split('\n');
  let startIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('module')) {
      startIndex = i;
      break;
    }
  }

  if (startIndex === -1) return '\n'; // 如果找不到module开头，返回一个换行符表示无内容

  // 从module行开始，合并后续行直到遇到';'结束的行
  let moduleContent = lines[startIndex];
  for (let i = startIndex + 1; i < lines.length; i++) {
    if (lines[i].trim().endsWith(';')) {
      moduleContent += '\n' + lines[i];
      break;
    } else {
      moduleContent += '\n' + lines[i];
    }
  }

  // 返回包含module定义的字符串，保留原始的换行格式
  return moduleContent;
}

 


//生成wire/reg
export function convertRegWIRE(code: string): string {
  
const preprocessedCode2 = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
const variableMatches2 = preprocessedCode2.matchAll(/\s*(input|output|inout)\s*(wire|reg|)?\s*(signed)?\s*((?:\[[^\]]+\])?)?\s*(\w+)/g);
const convertedCode = Array.from(variableMatches2, match => {
  let type = '';
  let size = '';
  let m_signed = '';
  if (match[1] === 'output' || match[1] === 'inout') {
    type = 'wire';
    size = match[4] !== undefined ? match[4] : '';
  } else if (match[1] === 'input') {
    type = 'reg';
    size = match[4] !== undefined ? match[4] : '';
  }
  if (match[3] === 'signed') {
    m_signed = 'signed ';
  }
  // return `${''.padEnd(4)}${type.padEnd(19)}${size.padEnd(17)}${match[5].padEnd(27)};`;
  return `${''.padEnd(4)}${type.padEnd(19)}${m_signed.padEnd(7)}${size.padEnd(17)}${match[5].padEnd(27)};`;
}).join('\n');

return convertedCode + '\n\n' ;

}



export function converModuleRoutine(code: string): string {
  if (!code) return "";

  const lines = code.split('\n');
  let convertedCode = '';
  let lineComment = '';
  let inMultilineComment = false;
  let moduleName = '';
  let parameterPairs: { param1: string, param2: string }[] = [];
  let variables: { status: number, name: string, comment?: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    if (inMultilineComment) {
      lineComment += line + '\n';
      if (line.includes('*/')) {
        inMultilineComment = false;
        variables.push({
          status: 0,
          comment: lineComment.trim(),
          name: ''
        });
        lineComment = ''; // Reset lineComment after processing
      }
      continue;
    }

    if (line.startsWith('module')) {
      moduleName = line.match(/module\s+(\w+)/)?.[1] || '';
      convertedCode += line + '\n';
      continue;
    }

    if (line.includes('/*')) {
      inMultilineComment = true;
      lineComment = line + '\n'; // Start collecting multiline comment
      continue;
    }

    if (line.startsWith('//')) {
      convertedCode += line + '\n';
      variables.push({
        status: 0,
        comment: line.trim(),
        name: ''
      });
      continue;
    }

    // if (line.includes('parameter')) {
    //   const parameterMatches = Array.from(line.matchAll(/parameter\s+(\S+)\s*=\s*(\S+?)(?=(?:,|\s|\$))/g));
    //   parameterPairs = [...parameterPairs, ...parameterMatches.map(match => ({ param1: match[1], param2: match[2] }))];
    //   continue;
    // }
    if (line.includes('parameter')) {
      // 修改正则表达式以匹配多行parameter定义
      const parameterMatches = Array.from(line.matchAll(/parameter\s+(\S+)\s*=\s*(\S+?)(?=(?:,|\s|$))/g));
      parameterPairs = [...parameterPairs, ...parameterMatches.map(match => ({ param1: match[1], param2: match[2] }))];

      // 如果当前行以逗号结尾，则继续处理下一行
      if (!line.trim().endsWith(',')) {
        continue;
      }
    }
    const variableMatch = line.match(/\s*(input|output|inout)\s*(wire|reg|)?\s*(signed)?\s*((?:\[[^\]]+\])?)?\s*(\w+)/);
    if (variableMatch) {
      const name = variableMatch[5];
      const commentMatch = line.match(/\/\/(.*)$/);
      const comment = commentMatch ? '// ' + commentMatch[1].trim() : undefined;
      variables.push({ status: 1, name, comment });
    }

    convertedCode += line + '\n';
  }

  convertedCode += `);`;

  // 转换成目标格式
  let finalConvertedCode = `${moduleName}`;

  if (parameterPairs.length > 0) {
    finalConvertedCode += "#(\n";
    for (const pair of parameterPairs) {
      finalConvertedCode += `   .${pair.param1.padEnd(15)}(${pair.param2.padEnd(15)}),\n`;
    }
    // finalConvertedCode = finalConvertedCode.replace(/,\n$/, '\n');
    finalConvertedCode = finalConvertedCode.replace(/,\n$/, '\n'); // 移除最后一个逗号
    finalConvertedCode += ")\n";
  }

  finalConvertedCode += ` u_${moduleName}(\n`;

  for (let i = 0; i < variables.length; i++) {
    const { status, name, comment } = variables[i];
    if (status === 1) {
      finalConvertedCode += `    .${name.padEnd(35)}(${name.padEnd(26)})${i !== variables.length - 1 ? ',' : ''}`;
    }
    if (comment) {
      finalConvertedCode += comment;
    }
    finalConvertedCode += '\n';
  }

  finalConvertedCode += ");\n";

  return finalConvertedCode;
}


