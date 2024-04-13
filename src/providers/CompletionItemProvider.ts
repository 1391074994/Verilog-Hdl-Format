// SPDX-License-Identifier: MIT
import * as vscode from 'vscode';
import { moduleFromFile } from '../commands/ModuleInstantiation';
import { CtagsManager } from '../ctags';
import { Logger } from '../logger';
import { Symbol } from '../parsers/ctagsParser';

export class VerilogCompletionItemProvider implements vscode.CompletionItemProvider {
  private logger: Logger;
  private ctagsManager: CtagsManager;
  constructor(logger: Logger, ctagsManager: CtagsManager) {
    this.logger = logger;
    this.ctagsManager = ctagsManager;
  }

  async provideModuleCompletion(
    document: vscode.TextDocument,
    _position: vscode.Position, // module_name #(
    _token: vscode.CancellationToken,
    _context: vscode.CompletionContext
  ): Promise<vscode.CompletionItem[]> {
    this.logger.info('Module Completion requested');
    let items: vscode.CompletionItem[] = [];

    let newItem: vscode.CompletionItem = new vscode.CompletionItem(
      'module label',
      vscode.CompletionItemKind.Module
    );

    let moduleRange = document.getWordRangeAtPosition(_position.translate(0, -3));
    let moduleName = document.getText(moduleRange);

    let moduleDoc = await this.ctagsManager.findModule(moduleName);
    if (moduleDoc === undefined) {
      return [];
    }
    let snippet = await moduleFromFile(moduleDoc.fileName);
    newItem.insertText = snippet;
    items.push(newItem);

    return items;
  }

  //TODO: Better context based completion items
  async provideCompletionItems(
    document: vscode.TextDocument,
    _position: vscode.Position,
    _token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): Promise<vscode.CompletionItem[]> {
    this.logger.info('providing completion ' + context.triggerCharacter);
    if (context.triggerCharacter === '(') {
      // if the prev char is #
      let textBeforePosition = document.getText(
        new vscode.Range(new vscode.Position(_position.line, 0), _position.translate(0, -1))
      );
      this.logger.info('text before ' + textBeforePosition);
      // Check if the last character is #f
      if (textBeforePosition.endsWith('#')) {
        this.logger.info('trigging module inst');

        return await this.provideModuleCompletion(document, _position, _token, context);
      }
    }
    this.logger.info('Completion items requested');
    let items: vscode.CompletionItem[] = [];

    let symbols: Symbol[] = await this.ctagsManager.getCtags(document).getSymbols();
    symbols.forEach((symbol) => {
      let newItem: vscode.CompletionItem = new vscode.CompletionItem(
        symbol.name,
        this.getCompletionItemKind(symbol.type)
      );
      let codeRange = new vscode.Range(
        symbol.startPosition,
        new vscode.Position(symbol.startPosition.line, Number.MAX_VALUE)
      );
      let code = document.getText(codeRange).trim();
      newItem.detail = symbol.type;
      let doc: string = '```systemverilog\n' + code + '\n```';
      if (symbol.parentScope !== undefined && symbol.parentScope !== '') {
        doc += '\nHeirarchial Scope: ' + symbol.parentScope;
      }
      newItem.documentation = new vscode.MarkdownString(doc);
      items.push(newItem);
    });
    this.logger.info(items.length + ' items requested');
    return items;
  }

  private getCompletionItemKind(type: string): vscode.CompletionItemKind {
    switch (type) {
      case 'constant':
        return vscode.CompletionItemKind.Constant;
      case 'event':
        return vscode.CompletionItemKind.Event;
      case 'function':
        return vscode.CompletionItemKind.Function;
      case 'module':
        return vscode.CompletionItemKind.Module;
      case 'net':
        return vscode.CompletionItemKind.Variable;
      case 'port':
        return vscode.CompletionItemKind.Variable;
      case 'register':
        return vscode.CompletionItemKind.Variable;
      case 'task':
        return vscode.CompletionItemKind.Function;
      case 'block':
        return vscode.CompletionItemKind.Module;
      case 'assert':
        return vscode.CompletionItemKind.Variable; // No idea what to use
      case 'class':
        return vscode.CompletionItemKind.Class;
      case 'covergroup':
        return vscode.CompletionItemKind.Class; // No idea what to use
      case 'enum':
        return vscode.CompletionItemKind.Enum;
      case 'interface':
        return vscode.CompletionItemKind.Interface;
      case 'modport':
        return vscode.CompletionItemKind.Variable; // same as ports
      case 'package':
        return vscode.CompletionItemKind.Module;
      case 'program':
        return vscode.CompletionItemKind.Module;
      case 'prototype':
        return vscode.CompletionItemKind.Function;
      case 'property':
        return vscode.CompletionItemKind.Property;
      case 'struct':
        return vscode.CompletionItemKind.Struct;
      case 'typedef':
        return vscode.CompletionItemKind.TypeParameter;
      default:
        return vscode.CompletionItemKind.Variable;
    }
  }
}
