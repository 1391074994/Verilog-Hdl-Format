////////////////////////////////////////////////////////////////////////////////
//verilog 代码格式化																				 
////////////////////////////////////////////////////////////////////////////////


import * as vscode from 'vscode';
function parseBound(bound: string): string {
  // [7:0] => [   7:0]
  const match = /\[\s*(\S+)\s*:\s*(\S+)\s*\]/.exec(bound);
  if (match) {
    const upbound = match[1].padStart(5);
    const lowbound = match[2].padStart(2);
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
    let define_reg = /^\s*(reg)/;
    let reg_instance = /^\s*\./;
    let reg_assign = /^\s*assign/;
    let reg_localparam = /^\s*localparam|parameter/;
    // let reg_parameter = /^\s*parameter/;
    let new_line = line;
// 提取注释
    let comments = /(\/\/.*)?$/.exec(line);
    if (comments) {
      var line_no_comments = line.replace(comments[0], "");
      var comment = comments[0];
    } else {
      var line_no_comments = line;
      var comment = "";
    }
// input|output|inout
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
          signed = signed.padEnd(7);
        else
          signed = "       ";
        if (bound != undefined)
          bound = parseBound(bound).padEnd(17);
        else
          bound = "".padEnd(17);
        name = name.trim().padEnd(27);
        if (comma == undefined)
          comma = " ";
        if (comment == undefined)
          comment = "";
        return "".padEnd(4) + output + reg + signed + bound + name + comma + comment;
      });
    }
    
//wire
    else if (reg_declaration.test(line)) {
      new_line = line_no_comments.replace(/^\s*(wire)\s*(signed)?\s*(\[.*\])?\s*(.*)\s*;.*$/, (_, wire, signed, bound, name) => {
        wire = wire.padEnd(9);
        if (signed != undefined)
          signed = signed.padEnd(10);
        else
          signed = "".padEnd(10);
        if (bound != undefined)
          bound = parseBound(bound).padEnd(17);
        else
          bound = "".padEnd(17);
        name = name.trim().padEnd(27);
        if (comment == undefined)
          comment = "";
        return "".padEnd(4) + wire + signed + bound + name + ";" + comment;
      });
    }
    
    
// reg
    else if (define_reg.test(line)) {
      new_line = line_no_comments.replace(/^\s*(reg)\s*(signed)?\s*(\[.*\])?\s*(\S+)\s*(\[.*\])?\s*;.*$/, (_, reg, signed, bound, name,shuzu) => {
        reg = reg.padEnd(9);
        if (signed != undefined)
          signed = signed.padEnd(10);
        else
          signed = "".padEnd(10);
        if (bound != undefined)//第一个[ : ]
          bound = parseBound(bound).padEnd(12);
        else
          bound = "".padEnd(12);
          // name = name.trim().padEnd(20);//字符的数量
        if (shuzu != undefined)//第二个[ : ]
            name = name.trim().padEnd(0);//字符的数量
        else
            name = name.trim().padEnd(27);//字符的数量

        if (shuzu != undefined)//第二个[ : ]
            shuzu = shuzu.padEnd(0);
        else
            shuzu = "".padEnd(0);
  
        if (comment == undefined)
          comment = "";
        return "".padEnd(4) + reg + signed + bound + "".padEnd(5) + name + shuzu + ";" + comment;
      });
    }
// 是实例化
    else if (reg_instance.test(line)) {
      new_line = line_no_comments.replace(/^\s*\.\s*(\w*)\s*\((.*)\)\s*(,)?.*$/, (_, port_name, signal_name, comma) => {
        port_name = port_name.padEnd(34);
        if (signal_name)
          signal_name = signal_name.trim().padEnd(26);
        else
          signal_name = "".padEnd(26);
        if (comma == undefined)
          comma = " ";
        if (comment == undefined)
          comment = "";
        return "    ." + port_name + "(" + signal_name + ")" + comma + comment;
      });
    } 
    
// assign
    else if (reg_assign.test(line)) {
      new_line = line_no_comments.replace(/^\s*assign\s*(.*?)\s*=\s*(.*?);\s*.?$/, (_, signal_name, expression) => {
        let assign_operator = "=".padEnd(2);//2的话 空格是1  值需要-1
        signal_name = signal_name.trim().padEnd(24);//这个决定了signal_name这个变量的最大字符个数
        expression = expression.trim().padEnd(0); // ";"前的空格
        if (comment == undefined)
          comment = "";
        return "".padEnd(4) + "assign" + "".padEnd(30) + signal_name /*+ "".padEnd(4) */+ assign_operator + "".padEnd(0) + expression + ";" + comment;
      });
    } 




// localparam|parameter
    else if (reg_localparam.test(line)) {
      
      new_line = line_no_comments.replace(/^\s*(localparam|parameter )\s*(.*)\s*=\s*(.*);\s*(\/\/.*)?$/, (_, declaration, signal_name, expression) => {
        let assign_operator = "=".padEnd(2);//2的话 空格是1  值需要-1
        signal_name = signal_name.trim().padEnd(20);//这个决定了signal_name这个变量的最大字符个数
        expression = expression.trim().padEnd(0);// ";"前的空格
        if (comment == undefined)
          comment = "";
        return "".padEnd(4) + declaration + "".padEnd(26) + signal_name + "".padEnd(4) + assign_operator + "".padEnd(0) + expression + ";" + comment;
      });
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