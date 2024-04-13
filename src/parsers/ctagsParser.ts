import * as child_process from 'child_process';
import { ExecException } from 'child_process';
import * as vscode from 'vscode';
import { Logger } from '../logger';

export class Symbol {
  name: string;
  type: string;
  line: number;
  // range of identifier
  idRange: vscode.Range | undefined;
  startPosition: vscode.Position;
  // range of whole object (type, begin/end, etc.)
  fullRange: vscode.Range | undefined;
  parentScope: string;
  parentType: string;
  isValid: boolean;
  typeRef: string | null;
  doc: vscode.TextDocument;
  constructor(
    doc: vscode.TextDocument,
    name: string,
    type: string,
    startLine: number,
    parentScope: string,
    parentType: string,
    typeRef: string | null,
    isValid?: boolean
  ) {
    this.doc = doc;
    this.name = name;
    this.type = type;
    this.line = startLine;
    this.startPosition = new vscode.Position(startLine, 0);
    this.parentScope = parentScope;
    this.parentType = parentType;
    this.isValid = Boolean(isValid);
    this.typeRef = typeRef;
  }

  prettyPrint(): string {
    let ret = `${this.name}(${this.type}):${this.line}`;
    if (this.parentScope !== '') {
      ret += ` parent=${this.parentScope}(${this.parentType})`;
    }
    if (this.typeRef !== null) {
      ret += ` typeref=${this.typeRef}`;
    }
    return ret;
  }

  getIdRange(): vscode.Range {
    if (this.idRange === undefined) {
      this.idRange = this.doc.getWordRangeAtPosition(
        new vscode.Position(this.line, this.doc.lineAt(this.line).text.indexOf(this.name))
      );
      if (this.idRange === undefined) {
        this.idRange = new vscode.Range(this.line, 0, this.line, Number.MAX_VALUE);
      }
    }
    return this.idRange;
  }

  setEndPosition(endLine: number) {
    this.fullRange = new vscode.Range(this.line, 0, endLine, Number.MAX_VALUE);
    this.isValid = true;
  }

  getDocumentSymbol(): vscode.DocumentSymbol {
    return new vscode.DocumentSymbol(
      this.name,
      this.type,
      Symbol.getSymbolKind(this.type),
      this.fullRange ?? this.getIdRange(),
      this.getIdRange()
    );
  }

  getHoverText(): string {
    let code = this.doc
      .lineAt(this.line)
      .text.trim()
      .replace(/\s{2,}/g, ' ') // trim long whitespace from formatting
      .replace(/,$/, '') // remove trailing commas
      .replace(/#\($/, '') // remove trailing #(
      .trim();
    return code;
  }

  getDefinitionLink(): vscode.DefinitionLink {
    return {
      targetUri: this.doc.uri,
      targetRange: this.getIdRange(),
      targetSelectionRange: this.fullRange,
    };
  }

  static isContainer(type: string): boolean {
    switch (type) {
      case 'constant':
      case 'parameter':
      case 'event':
      case 'net':
      case 'port':
      case 'register':
      case 'modport':
      case 'prototype':
      case 'typedef':
      case 'property':
      case 'assert':
        return false;
      case 'function':
      case 'module':
      case 'task':
      case 'block':
      case 'class':
      case 'covergroup':
      case 'enum':
      case 'interface':
      case 'package':
      case 'program':
      case 'struct':
        return true;
    }
    return false;
  }

  // types used by ctags
  // taken from https://github.com/universal-ctags/ctags/blob/master/parsers/verilog.c
  static getSymbolKind(name: String): vscode.SymbolKind {
    switch (name) {
      case 'constant':
        return vscode.SymbolKind.Constant;
      case 'parameter':
        return vscode.SymbolKind.Constant;
      case 'event':
        return vscode.SymbolKind.Event;
      case 'function':
        return vscode.SymbolKind.Function;
      case 'module':
        return vscode.SymbolKind.Module;
      case 'net':
        return vscode.SymbolKind.Variable;
      // Boolean uses a double headed arrow as symbol (kinda looks like a port)
      case 'port':
        return vscode.SymbolKind.Boolean;
      case 'register':
        return vscode.SymbolKind.Variable;
      case 'task':
        return vscode.SymbolKind.Function;
      case 'block':
        return vscode.SymbolKind.Module;
      case 'assert':
        return vscode.SymbolKind.Variable; // No idea what to use
      case 'class':
        return vscode.SymbolKind.Class;
      case 'covergroup':
        return vscode.SymbolKind.Class; // No idea what to use
      case 'enum':
        return vscode.SymbolKind.Enum;
      case 'interface':
        return vscode.SymbolKind.Interface;
      case 'modport':
        return vscode.SymbolKind.Boolean; // same as ports
      case 'package':
        return vscode.SymbolKind.Package;
      case 'program':
        return vscode.SymbolKind.Module;
      case 'prototype':
        return vscode.SymbolKind.Function;
      case 'property':
        return vscode.SymbolKind.Property;
      case 'struct':
        return vscode.SymbolKind.Struct;
      case 'typedef':
        return vscode.SymbolKind.TypeParameter;
      default:
        return vscode.SymbolKind.Variable;
    }
  }
}

// TODO: add a user setting to enable/disable all ctags based operations
export class CtagsParser {
  /// Symbol definitions (no rhs)
  symbols: Symbol[];
  doc: vscode.TextDocument;
  isDirty: boolean;
  private logger: Logger;
  binPath: string;

  constructor(logger: Logger, document: vscode.TextDocument) {
    this.symbols = [];
    this.isDirty = true;
    this.logger = logger;
    this.doc = document;

    let binPath: string = <string>(
      vscode.workspace.getConfiguration().get('verilog.ctags.path', 'ctags')
    );
    if (binPath === 'none') {
      binPath = 'ctags';
    }
    this.binPath = binPath;
  }

  clearSymbols() {
    this.isDirty = true;
    this.symbols = [];
  }

  async getSymbols({ name, type }: { name?: string; type?: string } = {}): Promise<Symbol[]> {
    if (this.isDirty) {
      await this.index();
    }
    if (type !== undefined) {
      return this.symbols.filter((sym) => sym.type === type);
    }
    if (name !== undefined) {
      return this.symbols.filter((sym) => sym.name === name);
    }
    return this.symbols;
  }

  async execCtags(filepath: string): Promise<string> {
    let command: string =
      this.binPath +
      ' -f - --fields=+K --sort=no --excmd=n --fields-SystemVerilog=+{parameter} "' +
      filepath +
      '"';
    this.logger.info('Executing Command: ' + command);
    return new Promise((resolve, _reject) => {
      child_process.exec(
        command,
        (_error: ExecException | null, stdout: string, _stderr: string) => {
          resolve(stdout);
        }
      );
    });
  }

  parseTagLine(line: string): Symbol | undefined {
    try {
      let name, type, pattern, lineNoStr, parentScope, parentType: string;
      let typeref: string | null = null;
      let scope: string[];
      let lineNo: number;
      let parts: string[] = line.split('\t');
      name = parts[0];
      type = parts[3];
      // override "type" for parameters (See #102)
      if (parts.length === 6) {
        if (parts[5] === 'parameter:') {
          type = 'parameter';
        }

        if (parts[5].startsWith('typeref')) {
          typeref = parts[5].split(':')[2];
        }
      }
      if (parts.length >= 5) {
        scope = parts[4].split(':');
        parentType = scope[0];
        parentScope = scope[1];
      } else {
        parentScope = '';
        parentType = '';
      }
      lineNoStr = parts[2];
      lineNo = Number(lineNoStr.slice(0, -2)) - 1;
      // pretty print symbol
      return new Symbol(
        this.doc,
        name,
        type,
        lineNo,
        parentScope,
        parentType,
        typeref,
        false
      );
    } catch (e) {
      this.logger.error('Line Parser: ' + e);
      this.logger.error('Line: ' + line);
    }
    return undefined;
  }

  async buildSymbolsList(tags: string): Promise<void> {
    try {
      if (this.isDirty) {
        this.logger.info('building symbols');
        if (tags === '') {
          this.logger.error('No output from ctags');
          return;
        }
        // Parse ctags output
        let lines: string[] = tags.split(/\r?\n/);
        lines.forEach((line) => {
          if (line !== '') {
            let sym = this.parseTagLine(line);
            if (sym !== undefined) {
              this.symbols.push(sym);
            }
          }
        });

        // end tags are not supported yet in ctags. So, using regex
        let match: RegExpExecArray | null = null;
        let endPosition: vscode.Position;
        let text = this.doc.getText();
        let eRegex: RegExp = /^(?![\r\n])\s*end(\w*)*[\s:]?/gm;
        while ((match = eRegex.exec(text))) {
          if (match === null) {
            break;
          }
          if (typeof match[1] === 'undefined') {
            continue;
          }

          endPosition = this.doc.positionAt(match.index + match[0].length - 1);
          let m_type: string = match[1];
          // get the starting symbols of the same type
          // doesn't check for begin...end blocks
          let s = this.symbols.filter((sym) => {
            return sym.type === m_type && sym.startPosition.isBefore(endPosition) && !sym.isValid;
          });
          if (s.length === 0) {
            continue;
          }
          // get the symbol nearest to the end tag
          let max: Symbol = s.reduce(
            (max, current) =>
              current.getIdRange().start.isAfter(max.startPosition) ? current : max,
            s[0]
          );
          max.setEndPosition(endPosition.line);
        }
        this.isDirty = false;
      }
    } catch (e) {
      this.logger.error((e as Error).toString());
    }
    // print all syms
    // this.symbols.forEach((sym) => {
    //   this.logger.info(sym.prettyPrint());
    // });
  }

  async index(): Promise<void> {
    this.logger.info('indexing ', this.doc.uri.fsPath);
    let output = await this.execCtags(this.doc.uri.fsPath);
    await this.buildSymbolsList(output);
  }
}
