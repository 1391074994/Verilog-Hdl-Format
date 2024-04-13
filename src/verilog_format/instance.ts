

import * as vscode from 'vscode';

export function instance() {
  // 获取当前打开的文档
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    // 获取当前文档的所有内容
    const document = activeEditor.document;
    const code = document.getText();

    // 调用转换函数进行代码转换
    const convertedCode = convertCode(code);

    // 将转换后的代码写入剪贴板
    vscode.env.clipboard.writeText(convertedCode).then(() => {
      vscode.window.showInformationMessage('Verilog代码已成功复制到剪贴板！');
    });
  }
}

function convertCode(code: string): string {
  // 识别模块名称
  const moduleNameMatch = code.match(/module\s+\s*(\w+)/);
  const moduleName = moduleNameMatch ? moduleNameMatch[1] : '';

  // 预处理，将注释内容替换为空格或空字符串
  const preprocessedCode = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');

  // 识别每一行的变量名
  const variableMatches = preprocessedCode.matchAll(/\s*(input|output|inout)\s*(wire|reg|)?\s*(signed)?\s*((?:\[[^\]]+\])?)\s*(\w+)/g);
  const variableNames = Array.from(variableMatches, match => match[5]);

  // 认识到模块名称后的参数
  // const parameterMatches = preprocessedCode.matchAll(/parameter\s+(\w+)\s*=\s*(\w+),?/g);
  const parameterMatches = preprocessedCode.matchAll(/parameter\s+(\S+)\s*=\s*(\S+?)(?=(?:,|\s|$))/g);

  const parameterPairs = Array.from(parameterMatches, match => ({param1: match[1], param2: match[2]}));

  // 转换成目标格式
  let convertedCode2 = `${moduleName} `;
  if (parameterPairs.length > 0) {
    convertedCode2 += "#(\n";
    for (const pair of parameterPairs) {
      convertedCode2 += `   .${pair.param1.padEnd(15)}(${pair.param2.padEnd(15)}),\n`;
    }
    // 去掉最后一行的","
    convertedCode2 = convertedCode2.replace(/,\n$/, '\n');
    convertedCode2 += ")\n";
  }
  convertedCode2 += `u_${moduleName}(\n`;
  for (const variableName of variableNames) {
    convertedCode2 += `    .${variableName.padEnd(35)}(${variableName.padEnd(26)}),\n`;
  }
  // 去掉最后一行的","
  convertedCode2 = convertedCode2.replace(/,\n$/, '\n');
  convertedCode2 += ');';
  console.log(convertedCode2);
  const preprocessedCode2 = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
  const variableMatches2 = preprocessedCode2.matchAll(/\s*(input|output|inout)\s*(wire|reg|)?\s*(signed)?\s*((?:\[[^\]]+\])?)?\s*(\w+)/g);
  const convertedCode = Array.from(variableMatches2, match => {
    // let type = '';
    // let size = '';
    // if (match[1] === 'output' || match[1] === 'inout') {
    //   type = 'wire';
    //   size = match[4] !== undefined ? match[4] : '';
    // } else if (match[1] === 'input') {
    //   type = 'reg';
    //   size = match[4] !== undefined ? match[4] : '';
    // }
    // return `${''.padEnd(4)}${type.padEnd(19)}${size.padEnd(17)}${match[5].padEnd(27)};`;


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

  return convertedCode + '\n\n' + convertedCode2;
}

export function deactivate() {}
