
  // 4 ---------
  // VerilogParser.ts
  // ctrl +鼠标左键跳转
// 识别成功
// 同一个文件里面的定义跳转-----------
// 导入 vsCode 模块（注释掉，因为在此上下文中不需要）
// import * as vscode from 'vscode';

interface VariableDefinition {
  type: string;
  name: string;
  width?: number;
  line: number;
  column: number;
  direction?: 'input' | 'output'; // 新增字段：方向（输入或输出）
}

interface SpecialVariableDefinition extends VariableDefinition {
  value?: string; // 增加值属性以存储 localparam 和 parameter 的赋值
}

export class VerilogParser {
  parse(filePath: string, content: string): Map<string, VariableDefinition | SpecialVariableDefinition> {
    const definitions: Map<string, VariableDefinition | SpecialVariableDefinition> = new Map();

    const lines = content.split('\n');
    for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
      const line = lines[lineNumber];

      // 更新后的正则表达式，处理 [ : ] 内部可能存在的多余空格或字符
      const rangeRegex = /\[(\s*[\d]+)\s*:\s*([\d]+\s*)\]/;

      // 匹配 reg 或 wire 类型的变量
      const storageTypeMatch = /^\s*(reg|wire)\s*(?:(?=\[)[^\]]*\]\s*)?([a-zA-Z][a-zA-Z0-9_]*)\s*/i.exec(line);
      if (storageTypeMatch) {
        const [, type, name] = storageTypeMatch;
        let widthStr = '';
        let matchRange = rangeRegex.exec(storageTypeMatch[0]);
        if (matchRange) {
          widthStr = `${parseInt(matchRange[1].trim(), 10)}:${parseInt(matchRange[2].trim(), 10)}`;
        }

        const width = parseInt(widthStr || '0', 10) + 1; // Add 1 to include the MSB
        const definition: VariableDefinition = {
          type,
          name,
          width: width > 0 ? width : undefined,
          line: lineNumber + 1,
          column: storageTypeMatch.index + 1,
        };

        definitions.set(name, definition);
        continue; // 已经匹配到存储器型变量，跳过当前循环迭代
      }

      // 匹配 input 或 output 类型的变量，兼容内部可能出现的 reg | wire | signed 关键词
      const portTypeMatch = /^\s*(input|output|inout)\s+((?:reg|wire)\s+)?(signed\s+)?(?:(?=\[)[^\]]*\]\s*)?([a-zA-Z][a-zA-Z0-9_]*)\s*/i.exec(line);
      if (portTypeMatch) {
        const [, direction, internalType, isSigned, name] = portTypeMatch;
        let widthStr = '';
        let matchRange = rangeRegex.exec(portTypeMatch[0]);
        if (matchRange) {
          widthStr = `${parseInt(matchRange[1].trim(), 10)}:${parseInt(matchRange[2].trim(), 10)}`;
        }

        const width = parseInt(widthStr || '0', 10) + 1; // Add 1 to include the MSB
        const type = internalType?.toLowerCase() ?? direction.toLowerCase(); // 如果内部有 reg 或 wire，取其作为类型；否则使用方向作为类型
        const definition: VariableDefinition = {
          type,
          name,
          width: width > 0 ? width : undefined,
          direction: direction.toLowerCase() as 'input' | 'output', // 设置方向
          line: lineNumber + 1,
          column: portTypeMatch.index + 1,
        };

        // 处理 signed 关键词
        if (isSigned) {
          definition.type += ' signed';
        }

        definitions.set(name, definition);
      }

      // 匹配 assign 语句
      const assignMatch = /^\s*assign\s+(?:(?=\[)[^\]]*\]\s*)?([a-zA-Z][a-zA-Z0-9_]*(?:\[.*?\])?)\s*=\s*([^;]+)/i.exec(line);
      if (assignMatch) {
        const [, name, value] = assignMatch;

        const definition: SpecialVariableDefinition = {
          type: 'assign',
          name,
          value,
          line: lineNumber + 1,
          column: assignMatch.index + 1,
        };

        definitions.set(name, definition);
        continue; // 跳过当前循环迭代
      }

      // 匹配 localparam 和 parameter 语句
      const specialTypeMatch = /^\s*(localparam|parameter)\s+(\S+)\s*=\s*([^;]+)/i.exec(line);
      if (specialTypeMatch) {
        const [, type, name, value] = specialTypeMatch;

        const specialDefinition: SpecialVariableDefinition = {
          type: type.toLowerCase(),
          name,
          value,
          line: lineNumber + 1,
          column: specialTypeMatch.index + 1,
        };

        definitions.set(name, specialDefinition);
      }
    }

    return definitions;
  }
}

//5 -----
// 跨页面的 模块跳转


interface ModuleDefinition {
  name: string;
  line: number;
  column: number;
}

interface VariableDefinition {
  name: string;
  line: number;
  column: number;
}

interface SpecialVariableDefinition {
  name: string;
  line: number;
  column: number;
}

export class VerilogParser_module {
  parse(content: string): Map<string, VariableDefinition | SpecialVariableDefinition | ModuleDefinition> {
    const definitions: Map<string, VariableDefinition | SpecialVariableDefinition | ModuleDefinition> = new Map();

    const lines = content.split('\n');
    for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
      const line = lines[lineNumber];

      // 匹配 module 定义
      const moduleMatch =  /module\s+(\w+)\s*\#?\s*\(/i.exec(line);
      if (moduleMatch) {
        const [, moduleName] = moduleMatch;

        const moduleDefinition: ModuleDefinition = {
          name: moduleName,
          line: lineNumber + 1,
          column: moduleMatch.index + 1,
        };

        definitions.set(moduleName, moduleDefinition);
      }

      // 其他逻辑保持不变，根据您的需求继续匹配和处理其他类型的定义和语句
    }

    return definitions;
  }
}
