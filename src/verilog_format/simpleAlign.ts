////////////////////////////////////////////////////////////////////////////////
//verilog 代码格式化																				 
////////////////////////////////////////////////////////////////////////////////


import * as vscode from 'vscode';
const upboundWidth = vscode.workspace.getConfiguration().get('simpleAlign.upbound') as number;//default :4
const lowboundWidth = vscode.workspace.getConfiguration().get('simpleAlign.lowbound') as number;;//default :2
const up_low_increment= upboundWidth + lowboundWidth + 3;//3 = [:] 占了三个字符
function parseBound(bound: string): string {
  // [7:0] => [   7:0]
  const match = /\[\s*(\S+)\s*:\s*(\S+)\s*\]/.exec(bound);
  if (match) {
    const upbound = match[1].padStart(upboundWidth);
    const lowbound = match[2].padStart(lowboundWidth);
    return `[${upbound}:${lowbound}]`;
  }
  return bound;
}

  // 解析每一行代码
  function parseLine(line: string): string {
    let types = ['port', 'declaration', 'instance', 'assign'];
    // 正则表达式判断类型
    let regPort = /^\s*(input|output|inout)/;
    let defineReg = /^\s*(reg|wire|integer|logic)/;
    let regInstance = /^\s*\./;
    let regAssign = /^\s*assign/;
    let regLocalparam = /^\s*(localparam|parameter)/;

//******************************************************
//******************************************************
    let newLine = line;
    const width1 = vscode.workspace.getConfiguration().get('simpleAlign.num1') as number;//input/output/reg/assign/---等前面的空格数 //default :4
    const width2 = vscode.workspace.getConfiguration().get('simpleAlign.num2') as number;//signed 位置附件的空格数 //default :6
    const width3 = vscode.workspace.getConfiguration().get('simpleAlign.num3') as number;//default :17
    const width4 = vscode.workspace.getConfiguration().get('simpleAlign.num4') as number;//default :27
    
    const width5 = vscode.workspace.getConfiguration().get('simpleAlign.num5') as number;
    const width6 = vscode.workspace.getConfiguration().get('simpleAlign.num6') as number;
    const width7 = vscode.workspace.getConfiguration().get('simpleAlign.num7') as number;
    const width8 = vscode.workspace.getConfiguration().get('simpleAlign.num8') as number;
    
    const width9 = vscode.workspace.getConfiguration().get('simpleAlign.num9') as number;
    const width10 = vscode.workspace.getConfiguration().get('simpleAlign.num10') as number;
    const width11 = vscode.workspace.getConfiguration().get('simpleAlign.num11') as number;
    
    const width12 = vscode.workspace.getConfiguration().get('simpleAlign.num12') as number;
    const width13 = vscode.workspace.getConfiguration().get('simpleAlign.num13') as number;
    const width14 = vscode.workspace.getConfiguration().get('simpleAlign.num14') as number;
    
    const width15 = vscode.workspace.getConfiguration().get('simpleAlign.num15') as number;
    const width16 = vscode.workspace.getConfiguration().get('simpleAlign.num16') as number;
    const width17 = vscode.workspace.getConfiguration().get('simpleAlign.num17') as number;
    let spacewidth = 1;
// 提取注释
    let comments = /(\/\/.*)?$/.exec(line);
    if (comments) {
      var lineNoComments = line.replace(comments[0], "");
      var comment = comments[0];
    } else {
      var lineNoComments = line;
      var comment = "";
    }


    if (regPort.test(line)) {
      newLine = lineNoComments.replace(/^\s*(input|output|inout)\s*(reg|wire|logic)?\s*(signed)?\s*(\[.*\])?\s*([^;]*\b)\s*(,|;|\)\s*;)?.*$/, (_, output, reg, signed, bound, name, comma) => {


        output = output.padEnd(7);

        if (reg !== undefined)
            {reg = reg.padEnd(5 + spacewidth );}
        else
            {reg = "".padEnd( 5 + spacewidth);}


        if (signed !== undefined)
            {signed = signed.padEnd(6 + spacewidth + width2);}
        else
            {signed = "".padEnd( 6 + spacewidth + width2 );}

        if (bound !== undefined) {
            let parseBoundOut   = parseBound(bound);
            let parsedBoundWith = parseBoundOut.length;//获取【：】所占的空格数；
            bound = parseBoundOut.padEnd(parsedBoundWith + spacewidth + width3 );
            name = name.trim().padEnd(width4);
        }
        else {
            bound = "".padEnd( up_low_increment + width3 + spacewidth);
            name = name.trim().padEnd(width4);
        }

        if (comma === undefined)
          {comma = " ";}
        if (comment === undefined)
          {comment = "";}
        return "".padEnd(width1) + output + reg + signed + bound + name + comma + comment;
      });
    }



else if (defineReg.test(line)) {
  newLine = lineNoComments.replace(
    /^\s*(reg|wire|integer|logic)\s*(signed)?\s*(\[.*\])?\s*(\S+)\s*(\[.*\])?\s*(\S+)?\s*(?:\s+(.*))?;.*$/,
    (_, reg, signed, bound, name, shuzu, dengyu, varsOptional) => {
      reg = reg.padEnd(7+spacewidth);
      signed = signed ? signed.padEnd( 6 + width6 +spacewidth) : "".padEnd(6 + width6+spacewidth);

      bound = bound ? parseBound(bound).padEnd(parseBound(bound).length + width7 + spacewidth) : "".padEnd(up_low_increment + width7 + spacewidth);//第一个[ : ]
        if (shuzu != undefined)//第二个[ : ]存在
            {
            shuzu = shuzu.padEnd(0); //字符的数量
            name = name.trim().padEnd(20  - Math.max(0, parseBound(shuzu).length));
        }//字符的数量
          else//第二个[ : ]不存在
            {
            name = name.trim().padEnd(width8  + spacewidth  );//字符的数量
            shuzu = "".padEnd(0);
        }
      
      dengyu = dengyu ? dengyu.padEnd(0) : "".padEnd(2); //dengyu

      // 处理可能存在的多个变量
      let vars = varsOptional ? varsOptional.split(/\s+/).map((varItem: string) => varItem.padEnd(0)).join(' ') : "";
      
      if (comment === undefined) {
        comment = "";
      }

      return "".padEnd(width5) + reg + signed + bound + name + shuzu + dengyu + vars + ";" + comment;
    }
  );
}


    // localparam|parameter
    else if (regLocalparam.test(lineNoComments)) {
        newLine = lineNoComments.replace(/^\s*(localparam|parameter)\s*(\[.*\])?\s*(\w+)\s*=\s*([^,;]+)\s*(,|;)?/, (_, declaration, range, signalName, expression,endingSymbol) => {
            // localparam 的长度为10
          declaration = declaration.padEnd(10+width10+spacewidth);
          const rangePart = range ? parseBound(range).padEnd(9 + spacewidth) : "";
          signalName = signalName.trim().padEnd(width11+spacewidth);
          let assignOperator = "=".padEnd(2);
          expression = expression.trim().padEnd(6);
          if (endingSymbol === undefined) {
            endingSymbol = "";
          }
          return "".padEnd(width9) + declaration + rangePart + signalName + assignOperator + expression +endingSymbol ;
        });
        newLine = newLine + comment;  
      }


    
// assign
    else if (regAssign.test(line)) {
      newLine = lineNoComments.replace(/^\s*assign\s*(.*?)\s*=\s*(.*?);\s*.?$/, (_, signalName, expression) => {
        let assignOperator = "=".padEnd(1+spacewidth);  
        signalName = signalName.trim().padEnd(width14+spacewidth);//这个决定了signal_name这个变量的最大字符个数
        expression = expression.trim().padEnd(0); // ";"前的空格
        if (comment === undefined)
          {comment = "";}
        return "".padEnd(width12) + "assign".padEnd(width13+6+spacewidth)  + signalName + assignOperator + expression + ";" + comment;
      });
    } 



    // 是实例化
    else if (regInstance.test(line)) {
        newLine = lineNoComments.replace(/^\s*\.\s*(\w*)\s*\((.*)\)\s*(,|;)?.*$/, (_, portName, signalName, comma) => {
        portName = portName.padEnd(width16 + 18);
        if (signalName)
            {signalName = signalName.trim().padEnd(width17-1);}
        else
            {signalName = "".padEnd(width17-1);}
        if (comma == undefined)
            {comma = " ";}
        if (comment == undefined)
            {comment = "";}
        return "".padEnd(width15) + "." + portName + "(" + signalName + ")" + comma + comment;
        });
    } 


    else if (lineNoComments.trim().length > 0) {
      // 对齐注释
      lineNoComments = lineNoComments.replace(/\t/g, "".padEnd(4));
      lineNoComments = lineNoComments.trimEnd();
      if (comment.length > 0)
        {lineNoComments = lineNoComments.padEnd(68);}
      newLine = lineNoComments + comment;
    }

    return newLine;
}

    // 简单对齐函数
  export function simpleAlign() {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {return;}
      const fileName = editor.document.fileName;
      if (!(fileName.endsWith(".v") || fileName.endsWith(".sv"))) {return;}
      const sel = editor.selection; // 只处理一个选择区域
      editor.edit((builder) => {
        for (let i = sel.start.line; i <= sel.end.line; i++) {
          if (!editor) {continue;}
          let line = editor.document.lineAt(i);
          let newLine = parseLine(line.text);
          if (newLine.localeCompare(line.text) !== 0) {
            let lineRange = new vscode.Range(line.range.start, line.range.end);
            builder.replace(lineRange, newLine);
          }
        }
      });
    }




//************************************************************************************************* */
// always 格式化--单独成行的格式
    // 在always_valuation_func 下面的 console.log(alwaysBlocks); 下面 加上函数  直接修改编辑器内容
    // 这里加一个格式化 函数识别 begin / end / if / else / else if  关键字和他们所在的行- 
    // 定义 ： begin / end / if / else / else if  关键字所在的行叫关键字行，其他行 叫 代码行
    // always 下面的第一个的行是关键字行：则 关键字行 的行前空格是为 always行前空格数 +4 
    // 如果 关键字行 的下一行是 关键字行 或者 其他行，则也是在上一个关键字行行数的基础上+4
    // 如果 其他行 的下一行是 关键字行，则关键字行的行前空格是为上一行行数-4
    // 如果 其他行 的下一行是 其他行，则两个其他行的行前空格相同


    // 当前行是 关键字行(非end) ，上一行为关键字行(非end) ，则当前行 == 上一行 + 4 
    // 当前行是 非关键字行 ，上一行为关键字行 ，则当前行 == 上一行 + 4 

    // 当前行是 关键字行 ，上一行为非关键字行 ，则当前行 == 上一行 - 4 
    // 当前行是 非关键字行 ，上一行为非关键字行 ，则当前行 == 上一行  

    // 当前行是 关键字行end  ， 上一行是非关键字行 ，则当前行 == 上一行 - 8
    // 当前行是 关键字行end  ， 上一行是关键字行end，则当前行 == 上一行 - 8
// c的格式逻辑不一样
    //----
// ************************************************************************************************* */
    
    
const widthAlways = vscode.workspace.getConfiguration().get('simpleAlign.width_always') as number;//always 位置附件的空格数 //default :4
export function always_valuation_func() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {return;}
  const fileName = editor.document.fileName;
  // 确保文件是Verilog或SystemVerilog类型
  if (!(fileName.endsWith(".v") || fileName.endsWith(".sv"))) {return;}

  // 获取所有选区的文本
  const selectedTexts = editor.selections.map(selection => editor.document.getText(selection));

  selectedTexts.forEach(async (selectedText, index) => {
    //selectedText 是选择的文本 ， widthAlways外部传递进去的空格数，
    const alwaysBlocksInfo  = findAllAlwaysBlocksWithSpacing(selectedText, widthAlways);
    // console.log(`Always Blocks with ${widthAlways} spaces prepended:`);
    // 调用新增的格式化控制结构缩进的函数
    
    
    console.log("always块提取成功" );
    console.log("alwaysBlocks",alwaysBlocksInfo );
    console.log("alwaysBlocks0",alwaysBlocksInfo.blocks[0] );
    // 对于每个always块调用formatControlStructureSpacing函数
    let formattedText = '';
    for (let i = 0; i < alwaysBlocksInfo.count; i++) {
      const formattedBlock = formatControlStructureSpacing(alwaysBlocksInfo.blocks[i], widthAlways,alwaysBlocksInfo.hasBeginOrEndInAlways[i]);
      console.log("Formatted Block:");
      console.log(formattedBlock);
      // formattedText +=  formattedBlock;
        if( i === alwaysBlocksInfo.count -1  )
          {formattedText += formattedBlock ;}
        else 
          // {formattedText += formattedBlock + '\n';}
          {formattedText += formattedBlock + '\n';}

      
      console.log("formattedText:",formattedText);
    }
    console.log("Formatted Text:",formattedText);
    // 将格式化后的内容写回编辑器
    await editor.edit(editBuilder => {
      // 使用editor.selections[index]来正确引用selection
      editBuilder.replace(editor.selections[index], formattedText);
    });

});
};

/**
 * 查找所有always块，并在每个块前添加指定数量的空格。
 * 同时返回找到的always块的数量。
 * @param {string} text - 用户选择的文本区域。
 * @param {number} spaceCount - 在每个always块前添加的空格数。
 * @returns {{blocks: string[], count: number}} - 包含所有找到的always块的文本数组及其数量的对象，每个块前带有指定数量的空格。
 */



// function findAllAlwaysBlocksWithSpacing(text: string, spaceCount: number): { blocks: string[], count: number, hasBeginOrEndInAlways: boolean[] } {
//   const blocks: string[] = [];
//   const hasBeginOrEndInAlways: boolean[] = []; // 新增标记位数组
//   let currentBlock: string = '';
//   let n: number = 0;
//   let inAlwaysBlock: boolean = false;

//   // 分割代码为行数组
//   const lines = text.split('\n');

//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i];
//     const trimmedLine = line.trim();

//     if (trimmedLine.startsWith('always')) {
//       // 遇到always关键字，开始新的块
//       if (inAlwaysBlock) {
//         // 如果已经在always块中，则结束当前块并重置状态
//         blocks.push(' '.repeat(spaceCount) + currentBlock);
//         currentBlock = '';
//         n = 0;
//       }
//       inAlwaysBlock = true;
//       currentBlock += line + '\n';

//       // 检查always行内是否有begin或end关键字
//       const hasBeginOrEnd = /^.*\b(begin|end)\b.*$/.test(trimmedLine);
//       hasBeginOrEndInAlways.push(hasBeginOrEnd); // 添加标记位

//       if (hasBeginOrEnd) {
//         n++;
//       } else if (/^.*\b(end)\b.*$/.test(trimmedLine)) {
//         n--;
//         if (n === 0) {
//           // 计数器归零，结束当前块
//           // 不再添加换行符到块的末尾
//           blocks.push(currentBlock.trimStart());
//           currentBlock = '';
//           inAlwaysBlock = false;
//         }
//       }
//     } else if (inAlwaysBlock) {
//       // 使用正则表达式来检查行内是否有begin或end关键字
//       if (/^.*\b(begin)\b.*$/.test(trimmedLine)) {
//         n++;
//         currentBlock += line + '\n';
//         //n >1 的时候加回车 否则就是最后一个 不需要回车
//       } else if (/^.*\b(end)\b.*$/.test(trimmedLine) && n > 1) {
//         n--;
//         currentBlock += line + '\n';
//         if (n === 0 ) {
//           inAlwaysBlock = false;
//         }
//         if (n === 0 && i === lines.length -1 ) {
//           // 计数器归零，结束当前块
//           // 不再添加换行符到块的末尾
//           blocks.push(currentBlock.trimStart());
//           currentBlock = '';
//           // inAlwaysBlock = false;
//         }

//       //最后一个 不需要回车
//       } else if (/^.*\b(end)\b.*$/.test(trimmedLine) && n === 1 && i === lines.length -1) {
//         n--;
//         currentBlock += line ;
//         if (n === 0 && i === lines.length -1 ) {
//           // 计数器归零，结束当前块
//           // 不再添加换行符到块的末尾
//           blocks.push(currentBlock.trimStart());
//           currentBlock = '';
//           inAlwaysBlock = false;
//         }
//       }
//       else {
//         currentBlock += line + '\n';
//         // blocks.push(currentBlock);
//         // currentBlock = '';
//         // inAlwaysBlock = false;
//       }
//     } else {//不是always块内容
//       hasBeginOrEndInAlways.push(false); // 添加标记位
//         currentBlock += line + '\n';
//         // blocks.push(currentBlock.trimStart());
//         blocks.push(currentBlock);
//         currentBlock = '';
//         // inAlwaysBlock = false;
//       // }

//     }
//   }


//   return { blocks, count: blocks.length, hasBeginOrEndInAlways };
// }



function findAllAlwaysBlocksWithSpacing(text: string, spaceCount: number): { blocks: string[], count: number, hasBeginOrEndInAlways: boolean[] } {
  const blocks: string[] = [];
  const hasBeginOrEndInAlways: boolean[] = []; // 新增标记位数组
  let currentBlock: string = '';
  let n: number = 0;
  let inAlwaysBlock: boolean = false;

  // 分割代码为行数组
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('always')) 
        {
        // 遇到always关键字，开始新的块
        if (inAlwaysBlock) {
          // 如果已经在always块中，则结束当前块并重置状态
          blocks.push(' '.repeat(spaceCount) + currentBlock);
          currentBlock = '';
          n = 0;
        }
        inAlwaysBlock = true;
        currentBlock += line + '\n';

        // 检查always行内是否有begin或end关键字
        const hasBeginOrEnd = /^.*\b(begin|end)\b.*$/.test(trimmedLine);
        hasBeginOrEndInAlways.push(hasBeginOrEnd); // 添加标记位

        if (hasBeginOrEnd) {
          n++;
        } else if (/^.*\b(end)\b.*$/.test(trimmedLine)) {
          n--;
          if (n === 0) {
            // 计数器归零，结束当前块
            // 不再添加换行符到块的末尾
            blocks.push(currentBlock.trimStart());
            currentBlock = '';
            inAlwaysBlock = false;
          }
        }
      } 
    
    else if (inAlwaysBlock) {
      // 使用正则表达式来检查行内是否有begin或end关键字
      if (/^.*\b(begin)\b.*$/.test(trimmedLine)) {
        n++;
        currentBlock += line + '\n';
        //n >1 的时候加回车 否则就是最后一个 不需要回车
      } else if (/^.*\b(end)\b.*$/.test(trimmedLine) && n > 1) {
        n--;
        currentBlock += line + '\n';
      //最后一个 不需要回车
      } else if (/^.*\b(end)\b.*$/.test(trimmedLine) && n === 1) {//这个块的最后一个end

        if( i === lines.length -1){//这个块的最后一个end 并且也是最后一行
          n--;
          currentBlock += line ;
          blocks.push(currentBlock.trimStart());
          currentBlock = '';
          inAlwaysBlock = false;
        }
        else{//不是最后一行
          n--;
          currentBlock += line ;
          blocks.push(currentBlock.trimStart());
          currentBlock = '';
          inAlwaysBlock = false;
        }
      

      }
      else {
        currentBlock += line + '\n';
        // blocks.push(currentBlock);
        // currentBlock = '';
        // inAlwaysBlock = false;
      }
    } 
    
    else {//不是always块内容
        hasBeginOrEndInAlways.push(false); // 添加标记位
        currentBlock += line + '\n';
        // blocks.push(currentBlock.trimStart());
        blocks.push(currentBlock);
        currentBlock = '';
        // inAlwaysBlock = false;
      // }

    }
  }

  return { blocks, count: blocks.length, hasBeginOrEndInAlways };
}







function  formatControlStructureSpacing(text: string, baseIndent: number, hasBeginOrEndInAlways: boolean): string {
  console.log("text",text);
  // const lines = text.split('\n');
// // 分割并过滤空字符串
//   const lines = text.split('\n').filter(line => line.trim() !== '');

// 分割并过滤空字符串
  const lines = text.split('\n').filter(line => line !== '');


  // const lines = text;
  const keywordRegex = /\b(always|if|else|else if)\b/;
  const beginRegex = /\bbegin\b/;
  const endRegex = /\bend\b/;

  //识别lines里面有多少个begin和end 当begin 和end 相等时候输出 begin和end的有多少对的数量
  // 计算 begin 和 end 的配对数量
    let pairCo = 0;
    let beginCount = 0;
    let endCount = 0;
    let pairs = 0;
    let chazhi ;
    let prevchazhi;
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (beginRegex.test(trimmedLine)) {
        beginCount++;
      } else if (endRegex.test(trimmedLine)) {
        endCount++;
      }
    }

    
    if(beginCount === endCount){
      pairs = beginCount;
    }
    else {
      vscode.window.showErrorMessage('begin 和 end 的配对数量不匹配');
    }
    console.log("Pairs of begin and end:", pairs);





  let prevIsKeyword = false;
  let prevInBeginSta = false;
  let prevIsEnd = false;
  let prevIndent = baseIndent;
  const newLines: string[] = [];
//创建一个装数字的数组
  const cntArr: number[] = [];

  let cntBeginLinter=0;
  let cntEndLinter=0;

  let lastChazhi = 0 ; // 存储最近计算的 chazhi 值
  let getData    = 0 ; 
  let lastAdd: number | undefined; // 存储最近计算的 Add 值
  let resultFloor:number | undefined;
  if(!hasBeginOrEndInAlways){
    // 其他情况按照常规格式化
    // 第二种格式  always/if/else/else if/begin/ end单独成行的情况
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const isKeywordLine = keywordRegex.test(line);
            const isBeginLine = beginRegex.test(line);
            const isEndLine = endRegex.test(line);
            let currentIndent;
            let prevInBegindent;
            let currentBegindent;
 
        
            if(isBeginLine){//begin 行
              if(prevIsKeyword){//上一行是关键字行
                currentIndent = prevIndent + 4;
                // cntBeginLinter = cntBeginLinter + 1;
                cntArr[cntBeginLinter] = currentIndent;
                cntBeginLinter++;
              }
              else //上一行是非关键字行--好像没有这样情况 --暂定
              {
                currentIndent = prevIndent;
              }
            }

            else if (isEndLine) { // 当前行是end关键字行
              //寻找存储的begin 的行前空格数
              cntEndLinter = cntEndLinter + 1;

            if(cntBeginLinter < pairs){
                currentIndent = cntArr[cntBeginLinter-1 ];
            }
            // else {
            //   for(let j= 0; j < pairs; j++){
            //     if(cntEndLinter === j + 1 && cntArr[pairs -1 -j] !== undefined ){
            //       currentIndent = cntArr[pairs -1 -j] ;
            //       // currentIndent = 5 ;
            //       break; // 找到对应的值后，退出循环
            //     }
            //   }
            // }
            else {
              if(cntEndLinter <= pairs){
                //只存一次这个值
                if (lastChazhi === 0) {
                  currentIndent = cntArr[cntBeginLinter - lastChazhi - 1];
                  lastChazhi  = pairs - cntEndLinter;
                  getData = cntBeginLinter;
                  // lastAdd     = cntBeginLinter + cntEndLinter;
                  // currentIndent = cntArr[lastChazhi - cntEndLinter-1];

                  // 使用 Math.floor() 方法进行除法取整
                  if(lastChazhi === 1 ){
                    resultFloor = pairs - lastChazhi;
                  }else {
                    resultFloor = Math.floor(pairs / lastChazhi);
                  }

                }
                else {
                  getData= getData - resultFloor ;
                  
                  // currentIndent = cntArr[lastChazhi - cntEndLinter - 1];
                  currentIndent = cntArr[ getData - 1];
                }
              }
            }

          }




            else if (isKeywordLine) {//always|if|else|else if)行 --简称 关键字AA行
              if (prevIsKeyword || prevInBeginSta) {//上一行为也是 关键字AA行
                currentIndent = prevIndent + 4;
              }
              else if(prevIsEnd){//上一行是end行
                currentIndent = prevIndent - 4;
              } else {//上一行为非关键字行，减小缩进（确保至少为baseIndent）
                currentIndent = Math.max(prevIndent - 4, baseIndent);
              }
            } 
   
            else {
              // 当前行是非关键字行
              if (prevIsKeyword || prevInBeginSta) {// 上一行为关键字行，增加缩进
                currentIndent = prevIndent + 4;
              } else {
                // 上一行为非关键字行，保持当前缩进
                currentIndent = prevIndent;
              }
            }


            // 更新状态
            prevIsKeyword = isKeywordLine ;
            prevIsEnd = isEndLine;
            prevInBeginSta = isBeginLine;

            // prevchazhi = lastChazhi;
            prevIndent = currentIndent;
            newLines.push(' '.repeat(currentIndent) + line);

        }
        return newLines.join('\n');
      }
// 根据标记位调整格式化
// 第一种格式  always/if/else/else if 后面有begin/ end -(c的写法)

  else if (hasBeginOrEndInAlways) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const isKeywordLine = keywordRegex.test(line);
      const isEndLine = endRegex.test(line);
      let currentIndent;


      if (isKeywordLine) {
        if (prevIsKeyword) {
          // 当前行是关键字行（非end），上一行为关键字行，增加缩进
          currentIndent = prevIndent + 4;
        } 
        else if(prevIsEnd){
          currentIndent = prevIndent;
        }
        else {
          // 当前行是关键字行（非end），上一行为非关键字行，减小缩进（确保至少为baseIndent）
          currentIndent = Math.max(prevIndent - 4, baseIndent);
        }
      } else if (isEndLine) {// 当前行是end关键字行
          

        
        if (prevIsKeyword || (i > 0 && endRegex.test(lines[i - 1].trim()))) {// 上一行为关键字行或也是end，缩进减4
          
          currentIndent = Math.max(prevIndent - 4, baseIndent); // 修改这里，缩进不变
        } else if(prevIsEnd){
          currentIndent = Math.max(prevIndent - 4, baseIndent);
        } else {
          // 其他情况
          currentIndent = Math.max(prevIndent - 4, baseIndent);
        }
      } else {
        // 当前行是非关键字行
        if (prevIsKeyword) {
          // 上一行为关键字行，增加缩进
          currentIndent = prevIndent + 4;
        } else {
          // 上一行为非关键字行，保持当前缩进
          currentIndent = prevIndent;
        }
      }

      // 更新状态
      prevIsKeyword = isKeywordLine ;
      prevIsEnd = isEndLine;
      prevIndent = currentIndent;
      newLines.push(' '.repeat(currentIndent) + line);
    }
  } 
return newLines.join('\n');
  
}






