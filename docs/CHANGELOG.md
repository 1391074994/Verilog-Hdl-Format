# 中文 

# Verilog Hdl Format Change Log

## [0.1.9] - 2024-04-13
  1. 修复了verilog 文件数会识别到注释块里面的内容
  2. 修改了文件树miss文件图标，加入了文件树命令openFileInExplorer，openFileInVSCodeExplorer，openFileInNewEditor，openFileInMainEditor的功能
  3. 修改了主题颜色的.md .ts .json等文件的颜色.

## [0.1.8] - 2024-04-08
  1. 修复语法检测设置错误，
  2. 修复文件树bug-当模块例化时参数传递内部有单引号或者双引号时，文件树无法识别此模块例化。
  3. 修改了主题颜色

## [0.1.7] - 2024-04-06
  1. 加入了颜色主题- VSCODE 颜色主题：jiang percy verilog themes

## [0.1.6] - 2024-04-05
  1. 加入了 （ctrl + 鼠标左键） 进行定义跳转- 需要配置ctags的路径 

## [0.1.5] - 2024-03-22
  1. wire类型定义数组已经修复
  2. localparam|parameter 后注释BUG已修复
  3. 例化参数传递BUG修复
  4. 对于module的输入输出端口有无符号类型，实例化时没有对应有无符号的定义BUG修复
  5. 文件树查找例化模块中bug修复

## [0.1.4] - 2024-03-19
  1. 修复了tb的小小bug,heiheihei.
  2. 去掉了动态代码片段,动态代码片段会影响 VSCODE的IntelliSense 的功能，所以改成命令触发：Create_Module,Create_Testbench

## [0.1.3] - 2024-03-16

  1. 修复了定义跳转的情况下参数例化的PIN角不能跳转的情况 
  2. 增加了代码格式化空格数配置功能：6个位置空格数可以配置。详情见文档。
  3. 加入always 模块的格式化，以及格式化空格数可以配置，命令：verilog-simplealign.always_valuation_func；快捷键ctrl + U。
  4. 修复(加入)了一键例化和一键TB的参数传递。

## [0.1.2] - 2024-03-12

  1. 增加了verilog文件树自定义屏蔽文件夹名称的功能：所打开的文件夹中屏蔽掉IP/或者一些备份文件的Verilog文件，使文件树的TOP层显示更加干净，默认是屏蔽（ip和core的文件夹）。配置位置：设置 → 扩展设置 → verilog-hdl-format插件设置 → Verilog Module Finder: Exclude Folders 
  2. Company Name和User Name已经优化 修改之后在注释头文件里面已经可以全部正常显示。配置位置：设置 → 扩展设置 → verilog-hdl-format插件设置 → Extension: Company Name 和 Extension: User Name
  3. (本插件和)【Verilog-HDL/SystemVerilog/Bluespec SystemVerilog】同时使用冲突已经修复。

## [0.1.1] - 2024-03-11

  1. 优化了跳转方式，鼠标放在变量的位置直接鼠标右键选择对应命令就可以跳转。

## [0.1.0] - 2024-03-10

  1. 优化定义跳转和例化的端口跳转，跳转之后会选中变量。

## [0.0.9] - 2024-03-08

  1. 加入verilog定义跳转,例化名跳转,例化的端口跳转.  
  2. 加入中文汉化包

## [0.0.8] - 2024-03-06

  1. 文件树加入鼠标右键刷新功能
  2. 修复// paramater 会丢失的BUG
  3. 文件树打开文件方式为新的编辑器

## [0.0.7] - 2024-02-06

  1. 文件树做了文件名为“IP”，或者“CORE”名称的屏蔽选择，在设置里面勾选与否，默认使能屏蔽

[0.0.6] - 2024-01-17
  1. 加入了verilog 文件树显示功能.需要命令Find Verilog Modules 触发和刷新

## [0.0.5] - 2023-12-21

  1. 修改了tcl,xdc,ucf,do 文件的注释方式为“#”
  2. 修复了了reg 后面有"="而不能格式化的BUG
  3. 加入了incrementSelection的功能：使用多个游标进行递增、递减或反向选择
  4. 修复实例化的时候最后的“));”中“;”会被吞掉的情况。
  5. 修复ifdef等高亮问题

## [0.0.4] - 2023-12-16

  1. 修改了 vivado仿真文件的快速转换功能 BUG ,
  2. 修复了parameter和localparam 不能格式化后最为","的情况,
  3. 加入了代码格式化位宽设置功能,若[]里面的位宽比较宽,请修改设置下里面的simpleAlign.num数值

## [0.0.3] - 2023-10-30

  1. 修改插件名称 Verilog Hdl Farmat → Verilog Hdl Format 
  2. 修改了parameter和localparam悬停 BUG 和其他的显示BUG
  3. 优化了在行数较多的情况下没有悬停显示的异常情况
  4. 优化了对于paramater的格式化
  5. 加入tcl和modelsim的.do文件语法高亮
  6. 修复了assign,localparam,parameter后面的注释异常
  7. 加入了vivado仿真文件的快速转换功能 可以把 compile.do  , elaborate.do , simulate.do转换成tb.do 仿真的时候一键do tb.do 快速仿真 + 用户配置接口

## [0.0.2] - 2023-09-26

  1. 加入了代码片段always,dapai.assign
  2. 修改了代码悬停数字显示的bug和定义显示bug
  3. 加入了Verilog-HDL/SystemVerilog/Bluespec SystemVerilog的linter,语法检测功能
  4. 修改verilog高亮的代码-颜色样式

## [0.0.1] - 2023-09-16

  1. 第一版-公开





# ENGLISH

## Verilog Hdl Format Change Log

## [0.1.3] - 2024-03-16

1. Fixed a situation where the parametrically instantiated PIN corner could not jump in the case of defined jump
2. Added code format space number configuration function: 6 position space number can be configured. See the documentation for details.
3. Add the always module format, and the number of formatted Spaces can be configured, the command: verilog-simplealign.always_valuation_func; Keyboard shortcut ctrl + U.
4. Fixed (added) one-click instantiation and one-click TB parameter passing.

## [0.1.2] - 2024-03-12

1. Added the function of verilog file tree custom mask folder name: The Verilog files of IP/ or some backup files are blocked in the opened folder, so that the TOP layer of the file tree is displayed more cleaner.The default is to mask (ip and core folder). Configuration location: Settings → Extension Settings → Verilog-HDL-Format Plug-in Settings → verilog Module Finder: Exclude Folders
2. Company Name and User Name can be displayed normally in the comment header file after optimization and modification. Configuration location: Settings → Extension Settings → verilog-hdl-format plug-in Settings → Extension: Company Name and Extension: User Name
3. This plugin (and) the Verilog HDL/SystemVerilog/Bluespec SystemVerilog 】 at the same time use the conflict has been repaired.

## [0.1.1] - 2024-03-11

1. Optimize the jump mode, the mouse in the position of the variable directly right click the mouse to select the corresponding command can jump.

## [0.1.0] - 2024-03-10

1. Optimize the definition jump and the instantiated port jump, after which variables are selected.

## [0.0.9] - 2024-03-08

1. Add verilog definition jump, instantiate alias jump, instantiate port jump.
2. Add Chinese localization package

## [0.0.8] - 2024-03-06

1. Add right mouse button refresh function to file tree
2. Fix the BUG where // paramater is lost
3. The file tree opens the file as a new editor

## [0.0.7] - 2024-02-06

1. File tree made the file name "IP", or "CORE" name mask selection, in the Settings check or not, the default enable mask

[0.0.6] - 2024-01-17
1. Added verilog file tree display. The command Find Verilog Modules is required to trigger and refresh

## [0.0.5] - 2023-12-21

1. Changed the comment mode of tcl,xdc,ucf,do files to "#"
2. Fixed a BUG where reg had "=" after it and couldn't be formatted
Added the ability to use multiple cursors to increase, decrease, or reverse selection
4. Fix the final ")); "during instantiation In the ";" It's going to be swallowed up.
5. Fix ifdef and other highlighting issues

## [0.0.4] - 2023-12-16

1. Fixed the BUG of quick conversion function of vivado simulation file.
2. Fixed the case where parameter and localparam could not be formatted with ",",
3. Added the function of code format bit width setting. If the bit width in [] is relatively wide, please modify the simpleAlign.num value under the setting

## [0.0.3] - 2023-10-30

1. Change the plugin name Verilog Hdl Farmat → Verilog Hdl Format
2. Fixed parameter and localparam hovering bugs and other display bugs
3. Optimized the abnormal case of no hover display in the case of a large number of rows
4. Optimized paramater formatting
5. Add syntax highlighting of tcl and modelsim's.do files
6. Repair the assign localparam, abnormal behind the parameter annotation
7. Added vivado simulation file fast conversion function can be compile.do, elaborate.do, simulate.do into tb.do simulation when one key do tb.do fast simulation + user configuration interface

## [0.0.2] - 2023-09-26

Add the code snippet always,dapai.assign
2. Fixed code hover number display bug and definition display bug
3. Join the Verilog HDL/SystemVerilog/Bluespec SystemVerilog linter, syntax checking function
4. Modify the code-color style for verilog highlighting

## [0.0.1] - 2023-09-16

1. First version - Public