////////////////////////////////////////////////////////////////////////////////
//verilog 代码tb														 
////////////////////////////////////////////////////////////////////////////////


import * as vscode from 'vscode';

/**
 * 获取当前日期时间
 * @returns {string} 当前日期时间字符串，格式为yyyy/MM/dd HH:mm:ss
 */
function getCurrentDateTime(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');

  return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
}

/**
 * 转换代码
 * @param {string} code 待转换的代码
 * @returns {string} 转换后的代码
 */
function convertCode(code: string): string {
  // 识别模块名称
  const moduleNameMatch = code.match(/module\s+\s*(\w+)/);
  const moduleName = moduleNameMatch ? moduleNameMatch[1] : '';

  // 预处理，将注释内容替换为空格或空字符串
  const preprocessedCode = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');

  // 识别每一行的变量名
  const variableMatches = preprocessedCode.matchAll(/\s*(input|output|inout)\s*(wire|reg|)?\s*(signed)?\s*((?:\[[^\]]+\])?)\s*(\w+)/g);
  const variableNames = Array.from(variableMatches, match => match[5]);

  // 识别到模块名称后的参数
  // const parameterMatches = preprocessedCode.matchAll(/parameter\s+(\w+)\s*=\s*([\w+\-()]+)/g);
  // const parameterMatches = preprocessedCode.matchAll(/parameter\s+(\w+)\s*=\s*(\w+),?/g);
  const parameterMatches = preprocessedCode.matchAll(/parameter\s+(\S+)\s*=\s*(\S+?)(?=(?:,|\s|$))/g);
  const parameterPairs = Array.from(parameterMatches, match => ({param1: match[1], param2: match[2]}));

  // 构建参数字符串
  let parametersStr = '';
  if (parameterPairs.length > 0) {
    parametersStr += "#(\n";
    for (const pair of parameterPairs) {
      parametersStr += `   .${pair.param1.padEnd(15)}(${pair.param2.padEnd(15)}),\n`;
    }
    // 去掉最后一行的","
    parametersStr = parametersStr.replace(/,\n$/, '\n');
    parametersStr += ")\n";
  }

  // 转换成目标格式
  let convertedCodeModule = `${moduleName}${parametersStr} u_${moduleName}(\n`;
  for (const variableName of variableNames) {
    convertedCodeModule += `    .${variableName.padEnd(35)}(${variableName.padEnd(26)}),\n`;
  } 
  convertedCodeModule = convertedCodeModule.replace(/,\n$/, '\n');
  convertedCodeModule += ');';

  const preprocessedCodeModule = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
  const variableMatchesModule = preprocessedCodeModule.matchAll(/\s*(input|output|inout)\s*(wire|reg|)?\s*(signed|)?\s*((?:\[[^\]]+\])?)?\s*(\w+)/g);
  const convertedCodePort = Array.from(variableMatchesModule, match => {
    // let type = '';
    // let size = '';
    // if (match[1] === 'output'|| match[1] === 'inout' ) {
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

  const finalCode = 
    "`timescale 1ns / 1ps\n" +
    "//****************************************VSCODE PLUG-IN**********************************//\n" +
    "//----------------------------------------------------------------------------------------\n" +
    "// IDE :                   VSCODE plug-in \n" +
    "// VSCODE plug-in version: Verilog-Hdl-Format-"+ version +"\n" +
    "// VSCODE plug-in author : Jiang Percy\n" +
    "//----------------------------------------------------------------------------------------\n" +
    "//****************************************Copyright (c)***********************************//\n" +
    "// Copyright(C)            "+ companyName + "\n" +
    "// All rights reserved     \n"+
    "// File name:              " + moduleName + "_tb.v\n" +
    "// Last modified Date:     " + getCurrentDateTime() + "\n" +
    "// Last Version:           V1.0\n" +
    "// Descriptions:           \n" +
    "//----------------------------------------------------------------------------------------\n" +
    "// Created by:             " + userName + "\n" +
    "// Created date:           " + getCurrentDateTime() + "\n" +
    "// Version:                V1.0\n" +
    "// Descriptions:           \n" +
    "//                         \n" +
    "//----------------------------------------------------------------------------------------\n" +
    "//****************************************************************************************//\n\n" +
    "module    " + moduleName+ "_tb();" + "\n" + 
    
    convertedCodePort + "\n\n" +

    "    initial"      + "\n" +                                             
    "        begin"    + "\n" +                                             
    "            #2                                             " + "\n" +
    "                    rst_n = 0   ;                          " + "\n" +
    "                    clk = 0     ;                          " + "\n" +
    "            #10                                            " + "\n" +
    "                    rst_n = 1   ;                          " + "\n" +
    "        end                                                " + "\n" +
    "                                                           " + "\n" +
    "    parameter   CLK_FREQ = 100;//Mhz                       " + "\n" +
    "    always # ( 1000/CLK_FREQ/2 ) clk = ~clk ;              " + "\n" +
    "                                                           " + "\n" +
    "                                                           " + "\n" +
    convertedCodeModule + "\n\n\n\n" +                                       
    "endmodule                                                  ";
    
  return finalCode;
}
// 在你的脚本中获取用户自定义配置
// const vscode = require('vscode');
const userName = vscode.workspace.getConfiguration().get('extension.userName') as string[];
// let userName = vscode.workspace.getConfiguration('extension').get('userName');
let companyName = vscode.workspace.getConfiguration('extension').get('companyName');
let extension = vscode.extensions.getExtension('Jiang-Percy.Verilog-Hdl-Format');
let version = extension ? extension.packageJSON.version : 'unknown';
// 调用函数并输出结果
// console.log(convertCode("your-code-here", userName));


export function testbench() {
  // 获取当前打开的文档
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    // 获取当前文档的所有内容
    const document = activeEditor.document;
    const code = document.getText();

    // 调用转换函数进行代码转换
    const convertedCode = convertCode(code);

    // 将转换后的代码写入剪贴板
    const finalCode = convertedCode;

    vscode.env.clipboard.writeText(finalCode).then(() => {
      vscode.window.showInformationMessage('Verilog代码已成功复制到剪贴板！');
    });
  }
}

export function deactivate() {}
