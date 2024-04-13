// SPDX-License-Identifier: MIT
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { logger } from '../extension';
import { CtagsParser, Symbol } from '../parsers/ctagsParser';
import { getWorkspaceFolder } from '../utils';

export async function instantiateModuleInteract() {
  if (vscode.window.activeTextEditor === undefined) {
    return;
  }
  let filePath = path.dirname(vscode.window.activeTextEditor.document.fileName);
  let srcPath = await selectFile(filePath);
  if (srcPath === undefined) {
    return;
  }
  let snippet = await instantiateModule(srcPath);
  if (snippet === undefined) {
    return;
  }
  vscode.window.activeTextEditor?.insertSnippet(snippet);
}

export async function instantiateModule(
  srcpath: string
): Promise<vscode.SnippetString | undefined> {
  // Using Ctags to get all the modules in the file
  let moduleName: string | undefined = undefined;

  let file: vscode.TextDocument | undefined = vscode.window.activeTextEditor?.document;
  if (file === undefined) {
    logger.warn('file undefined... returning');
    return;
  }
  let ctags: ModuleTags = new ModuleTags(logger, file);
  logger.info('Executing ctags for module instantiation');
  let output = await ctags.execCtags(srcpath);
  await ctags.buildSymbolsList(output);

  let modules: Symbol[] = ctags.symbols.filter((tag) => tag.type === 'module' || tag.type === 'interface');
  // No modules found
  if (modules.length <= 0) {
    vscode.window.showErrorMessage('Verilog-HDL/SystemVerilog: No modules found in the file');
    return undefined;
  }
  let module: Symbol = modules[0];
  if (modules.length > 1) {
    // many modules found
    moduleName = await vscode.window.showQuickPick(
      ctags.symbols.filter((tag) => tag.type === 'module').map((tag) => tag.name),
      {
        placeHolder: 'Choose a module to instantiate',
      }
    );
    if (moduleName === undefined) {
      return undefined;
    }
    module = modules.filter((tag) => tag.name === moduleName)[0];
  }

  return moduleSnippet(ctags, module, true);
}

export async function moduleFromFile(srcpath: string): Promise<vscode.SnippetString | undefined> {
  let file: vscode.TextDocument | undefined = vscode.window.activeTextEditor?.document;
  if (file === undefined) {
    logger.warn('file undefined... returning');
    return;
  }
  let ctags: ModuleTags = new ModuleTags(logger, file);
  logger.info('Executing ctags for module instantiation');
  let output = await ctags.execCtags(srcpath);
  await ctags.buildSymbolsList(output);

  let modules: Symbol[] = ctags.symbols.filter((tag) => tag.type === 'module' ||  tag.type === 'interface');
  // No modules found
  if (modules.length <= 0) {
    vscode.window.showErrorMessage('Verilog-HDL/SystemVerilog: No modules found in the file');
    return undefined;
  }

  return moduleSnippet(ctags, modules[0], false);
}

export async function moduleSnippet(ctags: CtagsParser, module: Symbol, fullModule: boolean) {
  let portsName: string[] = [];
  let parametersName: string[] = [];

  let scope = module.parentScope !== '' ? module.parentScope + '.' + module.name : module.name;
  let ports: Symbol[] = ctags.symbols.filter(
    (tag) => tag.type === 'port' && tag.parentScope === scope
  );
  portsName = ports.map((tag) => tag.name);
  let params: Symbol[] = ctags.symbols.filter(
    (tag) => tag.type === 'parameter' && tag.parentScope === scope
  );
  parametersName = params.map((tag) => tag.name);
  logger.info('Module name: ' + module.name);
  let paramString = ``;
  if (parametersName.length > 0) {
    paramString = `\n${instantiatePort(parametersName)}`;
  }
  logger.info('portsName: ' + portsName.toString());

  if (fullModule) {
    return new vscode.SnippetString()
      .appendText(module.name + ' ')
      .appendText('#(')
      .appendText(paramString)
      .appendText(') ')
      .appendPlaceholder('u_')
      .appendPlaceholder(`${module.name} (\n`)
      .appendText(instantiatePort(portsName))
      .appendText(');\n');
  }
  return (
    new vscode.SnippetString()
      // .appendText('#(')
      .appendText(paramString)
      .appendText(') ')
      .appendPlaceholder('u_')
      .appendPlaceholder(`${module.name} (\n`)
      .appendText(instantiatePort(portsName))
  );
}

function instantiatePort(ports: string[]): string {
  let port = '';
  let maxLen = 0;
  for (let i = 0; i < ports.length; i++) {
    if (ports[i].length > maxLen) {
      maxLen = ports[i].length;
    }
  }
  // .NAME(NAME)
  for (let i = 0; i < ports.length; i++) {
    let element = ports[i];
    let padding = maxLen - element.length;
    element = element + ' '.repeat(padding);
    port += `\t.${element}(${ports[i]})`;
    if (i !== ports.length - 1) {
      port += ',';
    }
    port += '\n';
  }
  return port;
}

async function selectFile(currentDir?: string): Promise<string | undefined> {
  currentDir = currentDir || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (currentDir === undefined) {
    return undefined;
  }

  let dirs = getDirectories(currentDir);
  // if is subdirectory, add '../'
  if (currentDir !== getWorkspaceFolder()) {
    dirs.unshift('..');
  }
  // all files ends with '.sv'
  let files = getFiles(currentDir).filter((file) => file.endsWith('.v') || file.endsWith('.sv'));

  // available quick pick items
  // Indicate folders in the Quick pick
  let items: vscode.QuickPickItem[] = [];
  dirs.forEach((dir) => {
    items.push({
      label: dir,
      description: 'folder',
    });
  });
  files.forEach((file) => {
    items.push({
      label: file,
    });
  });

  let selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'Choose the module file',
  });
  if (!selected) {
    return undefined;
  }

  // if is a directory
  let location = path.join(currentDir, selected.label);
  if (fs.statSync(location).isDirectory()) {
    return selectFile(location);
  }

  // return file path
  return location;
}

function getDirectories(srcpath: string): string[] {
  return fs
    .readdirSync(srcpath)
    .filter((file) => fs.statSync(path.join(srcpath, file)).isDirectory());
}

function getFiles(srcpath: string): string[] {
  return fs.readdirSync(srcpath).filter((file) => fs.statSync(path.join(srcpath, file)).isFile());
}

class ModuleTags extends CtagsParser {
  buildSymbolsList(tags: string): Promise<void> {
    if (tags === '') {
      return Promise.resolve();
    }
    // Parse ctags output
    let lines: string[] = tags.split(/\r?\n/);
    lines.forEach((line) => {
      if (line !== '') {
        let tag: Symbol | undefined = this.parseTagLine(line);
        if (tag === undefined) {
          return;
        }
        // add only modules and ports
        if (tag.type === 'interface' || tag.type === 'module' || tag.type === 'port' || tag.type === 'parameter') {
          this.symbols.push(tag);
        }
      }
    });
    // skip finding end tags
    return Promise.resolve();
  }
}
