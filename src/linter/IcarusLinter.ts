// SPDX-License-Identifier: MIT
import * as vscode from 'vscode';
import * as child from 'child_process';
import * as path from 'path';
import BaseLinter from './BaseLinter';
import { Logger } from '../logger';

let standardToArg: Map<string, string> = new Map<string, string>([
  ['Verilog-95', '-g1995'],
  ['Verilog-2001', '-g2001'],
  ['Verilog-2005', '-g2005'],
  ['SystemVerilog2005', '-g2005-sv'],
  ['SystemVerilog2009', '-g2009'],
  ['SystemVerilog2012', '-g2012'],
]);

export default class IcarusLinter extends BaseLinter {
  private configuration: vscode.WorkspaceConfiguration;
  private linterInstalledPath: string;
  private arguments: string;
  private includePath: string[];
  private standards: Map<string, string>;
  private runAtFileLocation: boolean;

  constructor(diagnosticCollection: vscode.DiagnosticCollection, logger: Logger) {
    super('iverilog', diagnosticCollection, logger);
    vscode.workspace.onDidChangeConfiguration(() => {
      this.updateConfig();
    });
    this.updateConfig();
  }

  private updateConfig() {
    this.linterInstalledPath = <string>(
      vscode.workspace.getConfiguration().get('FPGA_verilog.linting.path')
    );
    this.configuration = vscode.workspace.getConfiguration('FPGA_verilog.linting.iverilog');
    this.arguments = <string>this.configuration.get('arguments');
    let path = <string[]>this.configuration.get('includePath');
    this.includePath = path.map((includePath: string) => this.resolvePath(includePath));
    this.standards = new Map<string, string>([
      ['verilog', this.configuration.get('verilogHDL.standard')],
      ['systemverilog', this.configuration.get('systemVerilog.standard')],
    ]);
    this.runAtFileLocation = <boolean>this.configuration.get('runAtFileLocation');
  }

  protected convertToSeverity(severityString: string): vscode.DiagnosticSeverity {
    switch (severityString) {
      case 'error':
        return vscode.DiagnosticSeverity.Error;
      case 'warning':
        return vscode.DiagnosticSeverity.Warning;
    }
    return vscode.DiagnosticSeverity.Information;
  }

  protected lint(doc: vscode.TextDocument) {
    this.logger.info('Executing IcarusLinter.lint()');

    let binPath: string = path.join(this.linterInstalledPath, 'iverilog');
    this.logger.info('iverilog binary path: ' + binPath);

    let args: string[] = [];
    args.push('-t null');

    args.push(standardToArg.get(this.standards.get(doc.languageId)));
    args = args.concat(this.includePath.map((path: string) => '-I "' + path + '"'));
    args.push(this.arguments);
    args.push('"' + doc.uri.fsPath + '"');

    let command: string = binPath + ' ' + args.join(' ');

    // TODO: We have to apply the the #419 fix?
    let cwd: string =
      this.runAtFileLocation || vscode.workspace.workspaceFolders === undefined
        ? path.dirname(doc.uri.fsPath)
        : vscode.workspace.workspaceFolders[0].uri.fsPath;

    this.logger.info('Execute');
    this.logger.info('  command: ', command);
    this.logger.info('  cwd    : ', cwd);

    var _: child.ChildProcess = child.exec(
      command,
      { cwd: cwd },
      (_error: Error, _stdout: string, stderr: string) => {
        let diagnostics: vscode.Diagnostic[] = [];
        // Parse output lines
        // the message is something like this
        // /home/ubuntu/project1/module_1.sv:3: syntax error"
        // /home/ubuntu/project1/property_1.sv:3: error: Invalid module instantiation"
        stderr.split(/\r?\n/g).forEach((line, _) => {
          if (!line.startsWith(doc.fileName)) {
            return;
          }
          line = line.replace(doc.fileName, '');
          let terms = line.split(':');
          let lineNum = parseInt(terms[1].trim()) - 1;
          if (terms.length === 3) {
            diagnostics.push({
              severity: vscode.DiagnosticSeverity.Error,
              range: new vscode.Range(lineNum, 0, lineNum, Number.MAX_VALUE),
              message: terms[2].trim(),
              code: 'iverilog',
              source: 'iverilog',
            });
          } else if (terms.length >= 4) {
            let sev: vscode.DiagnosticSeverity = this.convertToSeverity(terms[2].trim());
            diagnostics.push({
              severity: sev,
              range: new vscode.Range(lineNum, 0, lineNum, Number.MAX_VALUE),
              message: terms[3].trim(),
              code: 'iverilog',
              source: 'Icarus Verilog',
            });
          }
        });
        if (diagnostics.length > 0) {
          this.logger.info(diagnostics.length + ' errors/warnings returned');
        }
        this.diagnosticCollection.set(doc.uri, diagnostics);
      }
    );
  }
}
