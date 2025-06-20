# 中文

# Verilog Hdl Format Change Log

## [0.3.6] - 2025-06-20
1. 加入了.txt/.log等文件高亮
2. 加入了sv的logic识别
3. 加入了文件树里面的联合仿真模式，以及创建tb.do

## [0.3.5] - 2025-02-20
1. 文件树设置顶层的配置文件夹可能不存在修复

## [0.3.4] - 2025-02-16
1. 修改例化模块的参数最后一行的BUG修复
2. 文件树的功能可以设置顶层

## [0.3.3] - 2025-01-20
1. 修改仿真文件里面 每次启动都需要创建wave.do √
2. 修改tb的模块名称为sim_****,tb 会把//后面的也识别进去 √ 
3. begin/end 之前不要空格 √
4. web界面在处于打开的状态下，再次运行命令，不能切换到这个界面- √
5. 增加快捷键-打开web界面 √
6. 在web功能里面：优化不存在bit文件夹的时候给出信息提示 √

## [0.3.2] - 2024-12-18

1. 加入了FTP上传文件夹的功能；win11 和win10互相传输出BUG 舍弃
2. 加入了共享上传文件夹的功能；

## [0.3.1] - 2024-11-09

1. 优化了代码格式化的配置；

## [0.3.0] - 2024-10-11

1. 优化了always的格式化操作
2. 修改部分代码片段
2. 修改仿真加入本地配置文件，可以自定义工程仿真的配置文件

## [0.2.9] - 2024-08-18

1. 优化了always的格式化操作

## [0.2.8] - 2024-08-17

1. 增加了数字递增递减的步进
2. 优化了文档
3. 增加了常见打印函数
4. 优化了vivado联合仿真

## [0.2.7] - 2024-07-16

1. 优化web界面排序方式为最新的开始往下排序
2. 文件树例化识别#前面不存在空格识别失败bug修复
3. VHDL文件树识别优化
4. 优化定义悬停和加入悬停开关-定义悬停优化

## [0.2.6] - 2024-06-22

1. FTP的BIT备份界面优化
2. 优化代码格式化的inout的端口为);结束的情况或丢失的情况，
3. wire 的格式里面多个变量的情况例如 “wireA = BRAM_INF_CX1_addr[0] & asd;//48948“情况的时候后面的注释会丢失的情况
4. 文件树显示加入了systemverilog和vhdl的显示 ，支持VHDL和verilog systemverilog 的混合文件树显示

## [0.2.5] - 2024-06-05

1. FTP下载优化
2. 例化功能部分优化-后续会继续优化

## [0.2.4] - 2024-05-26

1. 程序备份界面：web显示只在一个界面内显示，避免命令触发反复打开对于的web界面
2. 加入了FTP 功能，以及WEB界面的程序一键FTP上传功能
3. 加入了寄存器文档生成功能【markdown/excel】
4. 例化修改能正确处理以LF（Unix风格）作为行结束符的文件，使其同时兼容CRLF（Windows风格）的行结束符的文件识别

## [0.2.3] - 2024-05-12

1. 修复了一键tb/例化的多余注释BUG
2. 修改了悬停和定义跳转的正则匹配
3. 增加了内部ctags,外部ctags选择-默认为内部ctags

## [0.2.2] - 2024-05-01

1. 优化了一键tb/例化的注释保留
2. 加入了VIVADO 的web界面功能-刷新ila 的脚本

## [0.2.1] - 2024-04-28

1. 修复了ctags的路径BUG.
2. 加入了一点静态代码片段
3. 加入了VIVADO 的 tcl脚本延迟
4. 加入了ltx,vhdl,systemverilog的语法高亮
5. 修改了bit文件备份的逻辑
6. 加入了VIVADO和questasim/modelsim的联合仿真功能
7. 修改VSCODE最低支持版本为1.74.3

## [0.2.0] - 2024-04-21

1. 读取VIVAD 的最新ip的Veo文件 ：就是IP的例化文件
2. 加入了bit文件备份功能,使用Bitbackup命令进行备份
3. 加入自动生成下载bit程序和刷新ILA脚本,使用ReFreShWbLog命令打开WEB界面,点击按钮后直接在VIVADO 的 tcl栏目黏贴既可运行备份的版本程序.

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
