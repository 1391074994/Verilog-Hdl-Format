// SPDX-License-Identifier: MIT
import * as vscode from 'vscode';
import { CtagsManager } from '../ctags';
import { Logger } from '../logger';
import { Symbol } from '../parsers/ctagsParser';

export class VerilogDefinitionProvider implements vscode.DefinitionProvider {
  private logger: Logger;
  private ctagsManager: CtagsManager;
  constructor(logger: Logger, ctagsManager: CtagsManager) {
    this.logger = logger;
    this.ctagsManager = ctagsManager;
  }

  async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken
  ): Promise<vscode.DefinitionLink[] | undefined> {
    this.logger.info('Definitions Requested: ' + document.uri);
    // find all matching symbols
    let syms: Symbol[] = await this.ctagsManager.findSymbol(document, position);
    this.logger.info(syms.length + ' definitions returned');
    return syms.map((sym) => sym.getDefinitionLink());
  }
}
