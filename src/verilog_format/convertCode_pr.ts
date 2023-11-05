////////////////////////////////////////////////////////////////////////////////
//verilog 代码例化功能						----------这个代码没有使用														 
////////////////////////////////////////////////////////////////////////////////



import * as vscode from 'vscode'; 

  export  function convertCode_pr() {
    // 获取当前打开的文档
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
      // 获取当前文档的所有内容
      const document = activeEditor.document;
      const code = document.getText();
      
      // 调用转换函数进行代码转换
      const convertedCode = convertCode(code);
      
      // // 创建新的文档并将转换后的代码写入其中
      //         vscode.workspace.openTextDocument({ content: convertedCode, language: 'v' }).then(newDocument => {
      //           vscode.window.showTextDocument(newDocument);
      // });

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
    // 转换成目标格式
    let convertedCode2  = `${moduleName} u_${moduleName}(\n`;
    for (const variableName of variableNames) {
      convertedCode2  += `    .${variableName.padEnd(35)}(${variableName.padEnd(26)}),\n`;
    } 
    convertedCode2  = convertedCode2 .replace(/,\n$/, '\n');
    convertedCode2  += ');';  


    
    // const variableMatches2 = code.matchAll(/\s*(input|output)\s*(wire|reg|)?\s*(signed|)?\s*(\[\s*(\d+)\s*:\s*(\d+)\s*])?\s*(\w+)/g);
    // const convertedCode = Array.from(variableMatches2, match => {
    //   if (match[1] === 'output' && match[4] === undefined) {        //如果是output 并且[ : ]没有识别到 则只打印wire ${match[7]};
    //     return `wire ${match[7]};`;
    //   }
    //   else if (match[1] === 'output' && match[4] !== undefined) {
    //     return `wire ${match[4]} ${match[7]};`;
    //   }
    //   if (match[1] === 'input' && match[4] === undefined) {         //如果是input 并且[ : ]没有识别到 则只打印reg ${match[7]};
    //     return `reg ${match[7]};`;
    //   }
    //   else if (match[1] === 'input' && match[4] !== undefined) { 
    //     return `reg ${match[4]} ${match[7]};`;
    //   }
    // }).join('\n');
// 预处理，将注释内容替换为空格或空字符串

    const preprocessedCode2 = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
    const variableMatches2 = preprocessedCode2.matchAll(/\s*(input|output|inout)\s*(wire|reg|)?\s*(signed|)?\s*((?:\[[^\]]+\])?)?\s*(\w+)/g);
    const convertedCode = Array.from(variableMatches2, match => {
        let type = '';
        let size = '';
        if (match[1] === 'output'|| match[1] === 'inout' ) {
            type = 'wire';
            size = match[4] !== undefined ? match[4] : '';
        } else if (match[1] === 'input') {
            type = 'reg';
            size = match[4] !== undefined ? match[4] : '';
        }
        return `${''.padEnd(4)}${type.padEnd(19)}${size.padEnd(17)}${match[5].padEnd(27)};`;
    }).join('\n');



    return convertedCode + '\n\n' + convertedCode2;
  }
  export function deactivate() {}