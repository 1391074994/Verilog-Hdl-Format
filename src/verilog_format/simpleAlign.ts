////////////////////////////////////////////////////////////////////////////////
//verilog 代码格式化																				 
////////////////////////////////////////////////////////////////////////////////


import * as vscode from 'vscode';
const upbound_width = vscode.workspace.getConfiguration().get('simpleAlign.num5.upbound') as number;//default :4
const lowbound_width = vscode.workspace.getConfiguration().get('simpleAlign.num6.lowbound') as number;;//default :2
function parseBound(bound: string): string {
  // [7:0] => [   7:0]
  const match = /\[\s*(\S+)\s*:\s*(\S+)\s*\]/.exec(bound);
  if (match) {
    const upbound = match[1].padStart(upbound_width);
    const lowbound = match[2].padStart(lowbound_width);
    return `[${upbound}:${lowbound}]`;
  }
  return bound;
}

  // 解析每一行代码
  function parseLine(line: string): string {
    let types = ['port', 'declaration', 'instance', 'assign'];
    // 正则表达式判断类型
    let reg_port = /^\s*(input|output|inout)/;
    let reg_declaration = /^\s*(wire|integer)/;
    let define_reg = /^\s*(reg|wire|integer)/;
    let reg_instance = /^\s*\./;
    let reg_assign = /^\s*assign/;
    // let reg_localparam = /^\s*localparam|parameter/;
    // let reg_localparam = /^\s*(localparam|parameter)\b/;
    let reg_localparam = /^\s*(localparam|parameter)\s+(\w+)\s*=\s*([^,;]+)\s*(,|;)?/;


//******************************************************
//******************************************************



    // let reg_parameter = /^\s*parameter/;
    let new_line = line;
    // const width1 = 4;//input/output/reg/assign/---等前面的空格数 //default :4
    // const width2 = 6;//signed 位置附件的空格数 //default :6
    // const width3 = vscode.workspace.getConfiguration().get('simpleAlign.num3') as number;//default :17
    // const width4 = 27;//default :27
    const width1 = vscode.workspace.getConfiguration().get('simpleAlign.num1') as number;//input/output/reg/assign/---等前面的空格数 //default :4
    const width2 = vscode.workspace.getConfiguration().get('simpleAlign.num2') as number;//signed 位置附件的空格数 //default :6
    const width3 = vscode.workspace.getConfiguration().get('simpleAlign.num3') as number;//default :17
    const width4 = vscode.workspace.getConfiguration().get('simpleAlign.num4') as number;//default :27
    
    
    const width_always = vscode.workspace.getConfiguration().get('simpleAlign.width_always') as number;//always 位置附件的空格数 //default :4
    const width_begin_end = vscode.workspace.getConfiguration().get('simpleAlign.width_begin_end') as number;//begin/end 位置附件的空格数 //default :8
    const width_if = vscode.workspace.getConfiguration().get('simpleAlign.width_if') as number;//if 位置附件的空格数 //default :12
    const width_else = vscode.workspace.getConfiguration().get('simpleAlign.width_else') as number;//else 位置附件的空格数 //default :12
    const width_else_if = vscode.workspace.getConfiguration().get('simpleAlign.width_else_if') as number;//else if 位置附件的空格数 //default :12
    // const width_always_valuation = vscode.workspace.getConfiguration().get('simpleAlign.width_always_valuation') as number;//always_valuation 位置附件的空格数 //default :16

    // const width_always = 4;//always 位置附件的空格数 //default :4
    // const width_begin_end = 8;//begin/end 位置附件的空格数 //default :4
    // const width_if = 12;//if 位置附件的空格数 //default :4
    // const width_else = 12;//else 位置附件的空格数 //default :4
    // const width_else_if = 12;//else if 位置附件的空格数 //default :4
    // const width_always_valuation = 16;//always_valuation 位置附件的空格数 //default :16

    
// 提取注释
    let comments = /(\/\/.*)?$/.exec(line);
    if (comments) {
      var line_no_comments = line.replace(comments[0], "");
      var comment = comments[0];
    } else {
      var line_no_comments = line;
      var comment = "";
    }

//=++++++++++++++++++++++++++++++++
//方案1
//=++++++++++++++++++++++++++++++++
//如果 parseBound 的结果长度超过了 width3(17)，则会计算超出的字符数，并将其从 name 的空格数中减去，确保整行的长度不会超过规定的范围。
    if (reg_port.test(line)) {
      new_line = line_no_comments.replace(/^\s*(input|output|inout)\s*(reg|wire)?\s*(signed)?\s*(\[.*\])?\s*([^;]*\b)\s*(,|;)?.*$/, (_, output, reg, signed, bound, name, comma) => {
        let output_width = 7;
        let reg_width = 5;
        output = output.padEnd(output_width);
        if (reg != undefined)
          reg = reg.padEnd(reg_width);
        else
          reg = "".padEnd(reg_width);
        if (signed != undefined)
          signed = signed.padEnd(width2+1);
        else
          signed = "".padEnd(width2+1);
        if (bound != undefined) {
          let parsedBound = parseBound(bound).padEnd(width3);
          let excessLength = Math.max(parsedBound.length - width3, 0);
          name = name.trim().padEnd(width4 - excessLength);
          bound = parsedBound;
        }
        else {
          bound = "".padEnd(width3);
          name = name.trim().padEnd(width4);
        }
        if (comma == undefined)
          comma = " ";
        if (comment == undefined)
          comment = "";
        return "".padEnd(width1) + output + reg + signed + bound + name + comma + comment;
      });
    }

// // wire
//     else if (reg_declaration.test(line)) {
//       new_line = line_no_comments.replace(/^\s*(wire)\s*(signed)?\s*(\[.*\])?\s*(.*)\s*;.*$/, (_, wire, signed, bound, name) => {
//         wire = wire.padEnd(9);
//         if (signed != undefined)
//           signed = signed.padEnd(width2+4);
//         else
//           signed = "".padEnd(width2+4);
//         if (bound != undefined) {
//           let parsedBound = parseBound(bound).padEnd(width3);
//           let excessLength = Math.max(parsedBound.length - width3, 0);
//           name = name.trim().padEnd(width4 - excessLength);
//           bound = parsedBound;
//         }
//         else {
//           bound = "".padEnd(width3);
//           name = name.trim().padEnd(width4);
//         }
//         if (comment == undefined)
//           comment = "";
//         return "".padEnd(width1) + wire + signed + bound + name + ";" + comment;
//       });
//     }
    
// reg
    else if (define_reg.test(line)) {
      new_line = line_no_comments.replace(/^\s*(reg|wire|integer)\s*(signed)?\s*(\[.*\])?\s*(\S+)\s*(\[.*\])?\s*(\S+)?\s*(\S+)?\s*;.*$/, (_, reg, signed, bound, name, shuzu,dengyu,num) => {
        reg = reg.padEnd(9);
        if (signed != undefined)
          signed = signed.padEnd(width2+4);
        else
          signed = "".padEnd(width2+4);
        
        if (bound != undefined) //第一个[ : ]
        bound = parseBound(bound).padEnd(width3);
        else
        bound = "".padEnd(width3);

        if (bound != undefined )  
            name = name.trim().padEnd(width4 - Math.max(0, parseBound(bound).length - width3)); //字符的数量
        else
            name = name.trim().padEnd(width4); //字符的数量
    
        if (shuzu != undefined)//第二个[ : ]
            name = name.trim().padEnd(20 - Math.max(0, parseBound(shuzu).length - width3));//字符的数量
          else
            name = name.trim().padEnd(width4 - Math.max(0, parseBound(bound).length - width3) - 2);//字符的数量

        if (shuzu != undefined) //第二个[ : ]
            shuzu = shuzu.padEnd(0); //字符的数量
            // shuzu = shuzu.padEnd(width4 - Math.max(0, parseBound(bound).length - width3)); //字符的数量
        else
            shuzu = "".padEnd(0);

        if (dengyu != undefined) //dengyu
          dengyu = dengyu.padEnd(0);
        else
          dengyu = "".padEnd(2);//补的上面减2的值

          if (num != undefined) //
            num = num.padEnd(0);
          else
            num = "".padEnd(0);
    
        if (comment == undefined)//注释
          comment = "";
        return "".padEnd(width1) + reg + signed + bound + name + shuzu + dengyu +  num + ";" + comment;
      });
    }

// 是实例化
    else if (reg_instance.test(line)) {
      new_line = line_no_comments.replace(/^\s*\.\s*(\w*)\s*\((.*)\)\s*(,|;)?.*$/, (_, port_name, signal_name, comma) => {
        port_name = port_name.padEnd(width3 + 18);
        if (signal_name)
          signal_name = signal_name.trim().padEnd(width4-1);
        else
          signal_name = "".padEnd(width4-1);
        if (comma == undefined)
          comma = " ";
        if (comment == undefined)
          comment = "";
        return "".padEnd(width1) + "." + port_name + "(" + signal_name + ")" + comma + comment;
      });
    } 
    
// assign
    else if (reg_assign.test(line)) {
      new_line = line_no_comments.replace(/^\s*assign\s*(.*?)\s*=\s*(.*?);\s*.?$/, (_, signal_name, expression) => {
        let assign_operator = "=".padEnd(2);//2的话 空格是1  值需要-1
        signal_name = signal_name.trim().padEnd(width4-1);//这个决定了signal_name这个变量的最大字符个数
        expression = expression.trim().padEnd(0); // ";"前的空格
        if (comment == undefined)
          comment = "";
        return "".padEnd(width1) + "assign".padEnd(width3+19)  + signal_name /*+ "".padEnd(4) */+ assign_operator + "".padEnd(0) + expression + ";" + comment;
      });
    } 

// // localparam|parameter
// else if (reg_localparam.test(line)) {
//     new_line = line_no_comments.replace(/^\s*(localparam|parameter)\s+(\w+)\s*=\s*([^,;]+)\s*(,|;)?\s*(\/\/.*)?$/, (_, declaration, signal_name, expression, ending_symbol, comment) => {
//     declaration = declaration.padEnd(width3+19);
//     let assign_operator = "=".padEnd(2);//2的话 空格是1  值需要-1
//     signal_name = signal_name.trim().padEnd(width4-1);//这个决定了signal_name这个变量的最大字符个数
//     expression = expression.trim().padEnd(0);// ";"前的空格
//     if (ending_symbol == undefined) {
//       ending_symbol = "";
//     }
//     if (comment == undefined) {
//       comment = "";
//     }
//     console.log("new_line",new_line);
//     console.log("comment",comment);
//     console.log("ending_symbol",ending_symbol);
//     return "".padEnd(width1) + declaration + signal_name  + assign_operator  + expression + ending_symbol + comment;
//   });
// }


// // localparam|parameter
// else if (reg_localparam.test(line_no_comments)) {
//   new_line = line_no_comments.replace(/^\s*(localparam|parameter)\s+(\w+)\s*=\s*([^,;]+)\s*(,|;)?/, (_, declaration, signal_name, expression, ending_symbol) => {
//       declaration = declaration.padEnd(width3+19);
//       let assign_operator = "=".padEnd(2);//2的话 空格是1  值需要-1
//       signal_name = signal_name.trim().padEnd(width4-1);//这个决定了signal_name这个变量的最大字符个数
//       expression = expression.trim().padEnd(0);// ";"前的空格
//       if (ending_symbol == undefined) {
//           ending_symbol = "";
//       }
//       return "".padEnd(width1) + declaration + signal_name + assign_operator + expression + ending_symbol;
//   });
//   new_line = new_line + comment; // 将注释添加回行的末尾
// }

// localparam|parameter
else if (reg_localparam.test(line_no_comments)) {
  new_line = line_no_comments.replace(/^\s*(localparam|parameter)\s+(\w+)\s*=\s*([^,;]+)\s*(,|;)?/, (_, declaration, signal_name, expression, ending_symbol) => {
      declaration = declaration.padEnd(width3+19);
      let assign_operator = "=".padEnd(2);//2的话 空格是1  值需要-1
      signal_name = signal_name.trim().padEnd(width4-1);//这个决定了signal_name这个变量的最大字符个数
      expression = expression.trim().padEnd(6);// ";"前的空格
      if (ending_symbol == undefined) {
          ending_symbol = "";
      }
      return "".padEnd(width1) + declaration + signal_name + assign_operator + expression + ending_symbol;
  });
  new_line = new_line + comment; // 将注释添加回行的末尾
}





    else if (line_no_comments.trim().length > 0) {
      // 对齐注释
      line_no_comments = line_no_comments.replace(/\t/g, "".padEnd(4));
      line_no_comments = line_no_comments.trimEnd();
      if (comment.length > 0)
        line_no_comments = line_no_comments.padEnd(68);
      new_line = line_no_comments + comment;
    }

    return new_line;
}

function always_valuation_function(line: string): string {
    let reg_always = /^\s*(always|always_comb|always_ff|always_latch)(.*)$/;
    let reg_begin_end = /^\s*(begin|end)(.*)$/;
    let reg_if = /^\s*if/;
    let reg_else = /^\s*(else)\s*(begin)?\s*(.*)$/;
    let reg_else_if = /^\s*else\s*if/;
    const always_valuation = /^\s*(\w+)\s*<=\s*(.+)\s*;.*$/;
    let new_line = line;

    const width_always = vscode.workspace.getConfiguration().get('simpleAlign.width_always') as number;//always 位置附件的空格数 //default :4
    const width_begin_end = vscode.workspace.getConfiguration().get('simpleAlign.width_begin_end') as number;//begin/end 位置附件的空格数 //default :8
    const width_if = vscode.workspace.getConfiguration().get('simpleAlign.width_if') as number;//if 位置附件的空格数 //default :12
    const width_else = vscode.workspace.getConfiguration().get('simpleAlign.width_else') as number;//else 位置附件的空格数 //default :12
    const width_else_if = vscode.workspace.getConfiguration().get('simpleAlign.width_else_if') as number;//else if 位置附件的空格数 //default :12
    const width_always_valuation = vscode.workspace.getConfiguration().get('simpleAlign.width_always_valuation') as number;//always_valuation 位置附件的空格数 //default :16

    // const width_always = 4;//always 位置附件的空格数 //default :4
    // const width_begin_end = 8;//begin/end 位置附件的空格数 //default :4
    // const width_if = 12;//if 位置附件的空格数 //default :4
    // const width_else = 12;//else 位置附件的空格数 //default :4
    // const width_else_if = 12;//else if 位置附件的空格数 //default :4
    // const width_always_valuation = 16;//always_valuation 位置附件的空格数 //default :16


    // 提取注释
    let comments = /(\/\/.*)?$/.exec(line);
    if (comments) {
    var line_no_comments = line.replace(comments[0], "");
    var comment = comments[0];
    } else {
    var line_no_comments = line;
    var comment = "";
    }


// always
    if (reg_always.test(line)) {
    new_line = line_no_comments.replace(/^\s*(always|always_comb|always_ff|always_latch)(.*)$/, (_, always_type, residue) => {
        if (residue === undefined) {
        residue = "";
        }
        return "".padEnd(width_always) + always_type + residue + comment;
    });
    }

    // begin|end
    else if (reg_begin_end.test(line)) {
    new_line = line_no_comments.replace(/^\s*(begin|end)(.*)$/, (_, variable, residue) => {
        if (residue === undefined) {
        residue = "";
        }
        return "".padEnd(width_begin_end) + variable + residue + comment;
    });
    }

    // else if
    else if (reg_else_if.test(line)) {
        new_line = line_no_comments.replace(/^\s*(else)\s*(if)\s*(.*)$/, (_, variable, num_2_else, residue) => {
        if (residue === undefined) {
            residue = "";
        }
        return "".padEnd(width_else_if) + variable + " " + num_2_else + residue + comment;
        });
    }
    // if
    else if (reg_if.test(line) && !reg_else_if.test(line)) {
        new_line = line_no_comments.replace(/^\s*(if)\s*(.*)$/, (_, variable, residue) => {
        if (residue === undefined) {
            residue = "";
        }
        return "".padEnd(width_if) + variable + residue + comment;
        });
    }
    // // else
    // else if (reg_else.test(line) && !reg_else_if.test(line)) {
    //     new_line = line_no_comments.replace(/^\s*(else)\s*(.*)$/, (_, variable, residue) => {
    //     if (residue === undefined) {
    //         residue = "";
    //     }
    //     return "".padEnd(width_else) + variable + residue + comment;
    //     });
    // }

    // else (begin)?
    else if (reg_else.test(line)) {
      new_line = line_no_comments.replace(/^\s*(else)\s*(begin)?\s*(.*)$/, (_, variable, n_begin, residue) => {
      if (n_begin === undefined) {
        n_begin = "";
      }

      if (residue === undefined) {
          residue = "";
      }
      return "".padEnd(width_else) + variable + " " + n_begin + residue + comment;
      });
    }



    else if (always_valuation.test(line)) {
        new_line = line_no_comments.replace( /^\s*(\w+)\s*<=\s*(.+)\s*;.*$/, (_, variable, residue) => {
          return "".padEnd(width_always_valuation) + variable + " <= " +  residue  + ";"+ comment;
        });
      }
    return new_line;
}


  // 简单对齐函数
 export function simpleAlign() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    const fileName = editor.document.fileName;
    if (!(fileName.endsWith(".v") || fileName.endsWith(".sv"))) return;
    const sel = editor.selection; // 只处理一个选择区域
    editor.edit((builder) => {
      for (let i = sel.start.line; i <= sel.end.line; i++) {
        if (!editor) continue;
        let line = editor.document.lineAt(i);
        let new_line = parseLine(line.text);
        if (new_line.localeCompare(line.text) != 0) {
          let line_range = new vscode.Range(line.range.start, line.range.end);
          builder.replace(line_range, new_line);
        }
      }
    });
  }
 export function always_valuation_func() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    const fileName = editor.document.fileName;
    if (!(fileName.endsWith(".v") || fileName.endsWith(".sv"))) return;
    const sel = editor.selection; // 只处理一个选择区域
    editor.edit((builder) => {
      for (let i = sel.start.line; i <= sel.end.line; i++) {
        if (!editor) continue;
        let line = editor.document.lineAt(i);
        let new_line = always_valuation_function(line.text);
        if (new_line.localeCompare(line.text) != 0) {
          let line_range = new vscode.Range(line.range.start, line.range.end);
          builder.replace(line_range, new_line);
        }
      }
    });
  }