

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



// 模块例化转换函数
export function converModuleRoutine(code: string): string {
  // 提取变量名及其对应的行内注释，同时识别全行注释及其位置
  const extractedData = extractVariablesAndFullLineComments(code);
  console.log("extractedData",extractedData);
  // 识别模块名称
  const moduleNameMatch = code.match(/module\s+\s*(\w+)/);
  const moduleName = moduleNameMatch ? moduleNameMatch[1] : '';

  // 识别每一行的变量名
  const variableNames = extractedData.variables.map(item => item.name);

  // 认识到模块名称后的参数
  // const parameterMatches = code.matchAll(/parameter\s+(\S+)\s*=\s*(\S+?)(?=(?:,|\s|$))/g);
     const parameterMatches = code.matchAll(/parameter\s+(\S+)\s*=\s*(\S+?)(?=(?:,|\s|\$))/g);//只能匹配 parameter 开头的格式  ，另外一种只些一个parameter的暂时不支持。
  const parameterPairs = Array.from(parameterMatches, match => ({param1: match[1], param2: match[2]}));

  // 转换成目标格式
  let convertedCode2 = `${moduleName}`;



  if (parameterPairs.length > 0) {
    convertedCode2 += "#(\n";
    for (const pair of parameterPairs) {
      convertedCode2 += `   .${pair.param1.padEnd(15)}(${pair.param2.padEnd(15)}),\n`;
    }
    convertedCode2 = convertedCode2.replace(/,\n$/, '\n');
    convertedCode2 += ")\n";
  }

  convertedCode2 += ` u_${moduleName}(\n`;

  // 处理首行全行注释，放在moduleName后面
  if (extractedData.fullLineComments.length > 0 && extractedData.fullLineCommentPositions[0] === -1) {
    convertedCode2 += `${extractedData.fullLineComments.shift()}\n`;
    extractedData.fullLineCommentPositions.shift();
  }

  // 迭代处理变量及注释，先处理逗号，最后处理注释
  let lastVariableIndex = 0;
  for (let i = 0; i < extractedData.variables.length; i++) {
    const { name } = extractedData.variables[i];
    convertedCode2 += `    .${name.padEnd(35)}(${name.padEnd(26)})`;

    // 添加逗号，除了最后一个变量
    if (i !== variableNames.length - 1) {
      convertedCode2 += ',';
    }

    // 添加行尾注释
    const comment = extractedData.variables[i].comment;
    console.log("comment",comment);
    if (comment) {
      convertedCode2 += ` // ${comment}`;
    }

    convertedCode2 += '\n';

    // 检查是否有全行注释需要插入
    while (lastVariableIndex < extractedData.fullLineCommentPositions.length && 
           extractedData.fullLineCommentPositions[lastVariableIndex] === i) {
      convertedCode2 += `${extractedData.fullLineComments[lastVariableIndex]}\n`;
      lastVariableIndex++;
    }
  }

  convertedCode2 += ");\n";

  return convertedCode2;


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




// 提取变量名及其行内注释，同时识别全行注释及其位置


// function extractVariablesAndFullLineComments(code: string): {variables: {name: string, comment?: string}[], fullLineComments: string[], fullLineCommentPositions: number[]} {
//   const lines = code.split('\n');
//   const variables: {name: string, comment?: string}[] = [];
//   const fullLineComments: string[] = [];
//   const fullLineCommentPositions: number[] = []; // 记录全行注释对应变量的位置
//   let variableIndex = 0; // 当前处理到的变量索引

//   // 特殊处理首行全行注释
//   if (lines[0].trim().startsWith('//')) {
//     fullLineComments.push(lines[0]);
//     fullLineCommentPositions.push(-1); // 表示首行全行注释
//   }

//   lines.forEach((line, index) => {
//     const variableMatch = line.match(/\s*(input|output|inout)\s*(wire|reg|)?\s*(signed)?\s*((?:\[[^\]]+\])?)\s*(\w+)/);
//     if (variableMatch) {
//       const name = variableMatch[5];
//       const commentMatch = line.match(/\/\/(.*)$/);
//       const comment = commentMatch ? commentMatch[1].trim() : undefined;
//       variables.push({name, comment});
//       variableIndex++;
//     } else if (line.trim().startsWith("//")) {
//       // Adjusting to correctly place comments before the first variable or after any other variable
//       fullLineCommentPositions.push(variableIndex > 0 ? variableIndex - 1 : -1); // Ensure -1 is only for the first comment
//       fullLineComments.push(line);
//     }
//   });

//   return { variables, fullLineComments, fullLineCommentPositions };
// }


function extractVariablesAndFullLineComments(code: string): {variables: {name: string, comment?: string}[], fullLineComments: string[], fullLineCommentPositions: number[]} {
  const lines = code.split(/\r?\n/);
  const variables: {name: string, comment?: string}[] = [];
  const fullLineComments: string[] = [];
  const fullLineCommentPositions: number[] = []; // 记录全行注释对应变量的位置
  let variableIndex = 0; // 当前处理到的变量索引

  // 特殊处理首行全行注释
  if (lines[0].trim().startsWith('//')) {
    fullLineComments.push(lines[0]);
    fullLineCommentPositions.push(-1); // 表示首行全行注释
  }

  lines.forEach((line, index) => {
    const variableMatch = line.match(/\s*(input|output|inout)\s*(wire|reg|)?\s*(signed)?\s*((?:\[[^\]]+\])?)\s*(\w+)/);
    if (variableMatch) {
      const name = variableMatch[5];
      const commentMatch = line.match(/\/\/(.*)$/);
      const comment = commentMatch ? commentMatch[1].trim() : undefined;
      variables.push({name, comment});
      variableIndex++;
    } else if (line.trim().startsWith("//")) {
      // Adjusting to correctly place comments before the first variable or after any other variable
      fullLineCommentPositions.push(variableIndex > 0 ? variableIndex - 1 : -1); // Ensure -1 is only for the first comment
      fullLineComments.push(line);
    }
  });

  return { variables, fullLineComments, fullLineCommentPositions };
}











// export function deactivate() {}







