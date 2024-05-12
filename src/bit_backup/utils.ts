
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 提取数据
 * @param folderPath 包含需要处理的文件的文件夹路径
 */
function extractData(folderPath: string) {
    const compileFiles = getFilesWithPattern(folderPath, /compile\.do$/i);
    const elaborateFiles = getFilesWithPattern(folderPath, /elaborate\.do$/i);
    const simulateFiles = getFilesWithPattern(folderPath, /simulate\.do$/i);

    const tbFilePath = path.join(folderPath, 'tb.do');
    fs.writeFileSync(tbFilePath, ''); // 清空 tb.do 文件

    compileFiles.forEach(file => {
        const fileContent = fs.readFileSync(file, 'utf8');
        const lines = fileContent.split('\n');

        const vlogIndex = lines.findIndex(line => line.includes('quit -force'));
        if (vlogIndex !== -1) {
            const extractedLines = lines.slice(0, vlogIndex);
            appendLinesToFile(extractedLines, tbFilePath);
        }

        // const quitIndex = lines.findIndex(line => line.includes('quit -force'));
        // if (quitIndex !== -1) {
        //     const extractedLines = lines.slice(0, quitIndex);
        //     appendLinesToFile(extractedLines, tbFilePath);
        // }
    });

    elaborateFiles.forEach(file => {
        const fileContent = fs.readFileSync(file, 'utf8');
        const lines = fileContent.split('\n');

        const quitIndex = lines.findIndex(line => line.includes('quit -force'));
        if (quitIndex !== -1) {
            const extractedLines = lines.slice(0, quitIndex);
            appendLinesToFile(extractedLines, tbFilePath);
        }
    });

    simulateFiles.forEach(file => {
        const fileContent = fs.readFileSync(file, 'utf8');
        const lines = fileContent.split('\n');

        const stdArithIndex = lines.findIndex(line => line.includes('set StdArithNoWarnings 1'));
        if (stdArithIndex !== -1) {
            const extractedLines = lines.slice(0, stdArithIndex + 1);
            appendLinesToFile(extractedLines, tbFilePath);
        }
    });

    const now = new Date();
    const createdDateStr = `# Created date: ${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    // 从设置中获取用户自定义的选项内容
    const customOptions = vscode.workspace.getConfiguration().get('extractData.customOptions') as string[];
    
    const codeSnippet = [
        "######################################################################",
        "# user config ",
        createdDateStr,
        "######################################################################",
        // 'log -r /*',
        // 'radix hex',
        // 'view wave',
        // 'view structure',
        // 'view signals',
        // 'do wave.do',
        // 'run 10ms'
        ...customOptions
    ].join('\n') + '\n';

    fs.appendFileSync(tbFilePath, codeSnippet);

    vscode.window.showInformationMessage('tb.do Data extraction completed.');
}

function getFilesWithPattern(folderPath: string, pattern: RegExp): string[] {
    const files = fs.readdirSync(folderPath);
    return files.filter(file => pattern.test(file)).map(file => path.join(folderPath, file));
}

function appendLinesToFile(lines: string[], filePath: string) {
    const content = lines.join('\n') + '\n';
    fs.appendFileSync(filePath, content);
}

export { extractData };




/*
    识别逻辑：
    写一个VSCODE 插件代码 识别这个文件夹里面的带有compile.do的文件名称的文件（这个名称里面可能包含例如是tb_detect_top_compile.do，或者TEST_TB_compile.do，包括下面的do文件名称也是这样识别）。
    提取里面的 在vlog -work xil_defaultlib "glbl.v"这行前面的所有行数据 复制到一个新文件tb.do里面，
    再次识别这个文件夹里面的带有elaborate.do的文件名称的文件。提取里面的 在quit -force这行前面的所有行数据 复制到文件tb.do里面。
    再次识别这个文件夹里面的带有simulate.do的文件名称的文件。提取里面的 在set StdArithNoWarnings 1 这行以及这行前面的所有行数据 复制到文件tb.do里面。
    然后在后面加上代码段
    "log -r /*
    radix hex
    view wave
    view structure
    view signals
    do wave.do 
    run 10ms  "
    还需要在 "# user config ",这一行的后面加上创建这个tb.do文件夹的时间：格式是 "# Created date:        年/月/日 时:分:秒 "  

bat 脚本

脚本识别有Bug----

@echo off
setlocal

rem 设置变量
set "folderPath=%~dp0"

rem 提取数据
call :extractData %folderPath%

echo Data extraction completed.
pause
exit /b

:extractData
set "compilePattern=compile.do"
set "elaboratePattern=elaborate.do"
set "simulatePattern=simulate.do"
set "tbtmpFile=tbtmpFile.do"
set "tbfile=tb.do"
set "now=%date:~0,4%/%date:~5,2%/%date:~8,2% %time:~0,2%:%time:~3,2%:%time:~6,2%"

rem 清空 tb.do 文件
type nul > "%~1\%tbtmpFile%"

rem 处理 compile.do 文件
for /r "%~1" %%F in (*%compilePattern%) do (
    for /f "usebackq delims=" %%L in ("%%F") do (
        echo %%L >> "%~1\%tbtmpFile%"
        echo %%L | findstr /i /c:"vlog -work xil_defaultlib \"glbl.v\"" > nul
        if not errorlevel 1 (
            goto :quitCompile
        )
    )
)
:quitCompile

rem 处理 elaborate.do 文件
set "foundQuit="
for /r "%~1" %%F in (*%elaboratePattern%) do (
    for /f "usebackq delims=" %%L in ("%%F") do (
        echo %%L >> "%~1\%tbtmpFile%"
        echo %%L | findstr /i /c:"quit -force" > nul
        if not errorlevel 1 (
            set "foundQuit=1"
        )
        if defined foundQuit (
            goto :quitElaborate
        )
    )
)
:quitElaborate

rem 处理 simulate.do 文件
set "foundSet="
for /r "%~1" %%F in (*%simulatePattern%) do (
    for /f "usebackq delims=" %%L in ("%%F") do (
        if defined foundSet (
            echo %%L >> "%~1\%tbtmpFile%"
        ) else (
            echo %%L >> "%~1\%tbtmpFile%"
            echo %%L | findstr /i /c:"set StdArithNoWarnings 1" > nul
            if not errorlevel 1 (
                set "foundSet=1"
            )
        )
        if defined foundSet (
            goto :quitSimulate
        )
    )
)
:quitSimulate

rem 添加固定代码片段
echo ###################################################################### >> "%~1\%tbtmpFile%"
echo # user config                                                        >> "%~1\%tbtmpFile%"
echo # Created date: %now%                                                >> "%~1\%tbtmpFile%"
echo ###################################################################### >> "%~1\%tbtmpFile%"
echo log -r /*                                                             >> "%~1\%tbtmpFile%"
echo radix hex                                                             >> "%~1\%tbtmpFile%"
echo view wave                                                             >> "%~1\%tbtmpFile%"
echo view structure                                                        >> "%~1\%tbtmpFile%"
echo view signals                                                          >> "%~1\%tbtmpFile%"
echo do wave.do                                                            >> "%~1\%tbtmpFile%"
echo run 10ms                                                              >> "%~1\%tbtmpFile%"




rem 删除指定行并添加固定代码片段
(for /f "usebackq delims=" %%L in ("%~1\%tbtmpFile%") do (
    echo %%L | findstr /i /c:"vlog -work xil_defaultlib \"glbl.v\"" > nul
    if errorlevel 1 (
        echo %%L | findstr /i /c:"quit -force" > nul
        if errorlevel 1 (
            echo %%L
        )
    )
)) > "%~1\%tbfile%"

rem 输出结果
type "%~1\%tbfile%"

del "%~1\%tbtmpFile%"


exit /b

*/