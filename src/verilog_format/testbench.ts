////////////////////////////////////////////////////////////////////////////////
//verilog 代码tb														 
////////////////////////////////////////////////////////////////////////////////


import * as vscode from 'vscode';
import  {convertRegWIRE}  from './instance';
import  {converModuleRoutine}  from './instance';
import  {extractModuleContent}  from './instance';

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
    
    convertRegWIRE(code) + "\n\n" +

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
    converModuleRoutine(code) + "\n\n\n\n" +                                       
    "endmodule                                                  ";
    
  return finalCode;
}
// 在你的脚本中获取用户自定义配置

const userName = vscode.workspace.getConfiguration().get('extension.userName') as string[];
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


    // 新增逻辑：提取module内的代码部分
    const moduleContent = extractModuleContent(code);
    console.log(moduleContent);

    // 调用转换函数进行代码转换
    const convertedCode = convertCode(moduleContent);

    // 将转换后的代码写入剪贴板
    const finalCode = convertedCode;

    vscode.env.clipboard.writeText(finalCode).then(() => {
      vscode.window.showInformationMessage('Verilog代码已成功复制到剪贴板！');
    });
  }
}
