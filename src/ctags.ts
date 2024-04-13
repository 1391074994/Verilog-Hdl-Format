// SPDX-License-Identifier: MIT
import * as vscode from 'vscode';
import { Logger } from './logger';
import { CtagsParser, Symbol } from './parsers/ctagsParser';
import { getParentText, getPrevChar, getWorkspaceFolder } from './utils';

// Internal representation of a symbol

export class CtagsManager {
  private filemap: Map<vscode.TextDocument, CtagsParser> = new Map();
  private logger: Logger;
  private searchPrefix: string;

  constructor(logger: Logger, hdlDir: string) {
    this.logger = logger;
    this.logger.info('ctags manager configure');
    if (hdlDir.length !== 0) {
      this.searchPrefix = `${hdlDir}/**`;
    } else {
      this.searchPrefix = '**';
    }

    vscode.workspace.onDidSaveTextDocument(this.onSave.bind(this));
    vscode.workspace.onDidCloseTextDocument(this.onClose.bind(this));
  }

  getCtags(doc: vscode.TextDocument): CtagsParser {
    let ctags: CtagsParser | undefined = this.filemap.get(doc);
    if (ctags === undefined) {
      ctags = new CtagsParser(this.logger, doc);
      this.filemap.set(doc, ctags);
    }
    return ctags;
  }
  onClose(doc: vscode.TextDocument) {
    this.filemap.delete(doc);
  }

  onSave(doc: vscode.TextDocument) {
    this.logger.info('on save');
    let ctags: CtagsParser = this.getCtags(doc);
    ctags.clearSymbols();
  }

  async findModule(moduleName: string): Promise<vscode.TextDocument | undefined> {
    let ws = getWorkspaceFolder();
    if (ws === undefined) {
      return undefined;
    }
    let searchPattern = new vscode.RelativePattern(ws, `${this.searchPrefix}/${moduleName}.{sv,v}`);
    let files = await vscode.workspace.findFiles(searchPattern);
    if (files.length === 0) {
      return undefined;
    }
    return await vscode.workspace.openTextDocument(files[0]);
  }

  async findDefinitionByName(moduleName: string, targetText: string): Promise<Symbol[]> {
    let file = await this.findModule(moduleName);
    if (file === undefined) {
      return [];
    }
    let parser = this.getCtags(file);
    return await parser.getSymbols({ name: targetText });
  }

  /// Finds a symbols definition, but also looks in targetText.sv to get module/interface defs
  async findSymbol(document: vscode.TextDocument, position: vscode.Position): Promise<Symbol[]> {
    let textRange = document.getWordRangeAtPosition(position);
    if (!textRange || textRange.isEmpty) {
      return [];
    }
    let targetText = document.getText(textRange);

    let parentScope = getParentText(document, textRange);
    // If we're at a port, .<text> plus no parent
    let parser = this.getCtags(document);
    if (getPrevChar(document, textRange) === '.' && parentScope === targetText) {
      let insts = await parser.getSymbols({ type: 'instance' });
      if (insts.length > 0) {
        let latestInst = insts.reduce((latest, inst) => {
          if (
            inst.startPosition.line < position.line &&
            inst.startPosition.line > latest.startPosition.line
          ) {
            return inst;
          } else {
            return latest;
          }
        }, insts[0]);

        if (latestInst.typeRef !== null) {
          return await this.findDefinitionByName(latestInst.typeRef, targetText);
        }
      }
    }

    const results: Symbol[][] = await Promise.all([
      // find def in current document
      parser.getSymbols({ name: targetText }),
      // search for module.sv or interface.sv
      this.findDefinitionByName(parentScope, targetText),
    ]);
    return results.reduce((acc, val) => acc.concat(val), []);
  }
}
