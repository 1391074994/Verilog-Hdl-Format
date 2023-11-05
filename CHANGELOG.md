# Verilog Hdl Format Change Log

[0.0.1] - 2023-09-16

* 第一版-公开

[0.0.2] - 2023-09-26

  1. 加入了代码片段always,dapai.assign
  2. 修改了代码悬停数字显示的bug和定义显示bug
  3. 加入了Verilog-HDL/SystemVerilog/Bluespec SystemVerilog的linter,语法检测功能
  4. 修改verilog高亮的代码-颜色样式

[0.0.3] - 2023-10-30
  1. 修改插件名称 Verilog Hdl Farmat → Verilog Hdl Format 
  2. 修改了parameter和localparam悬停 BUG 和其他的显示BUG
  3. 优化了在行数较多的情况下没有悬停显示的异常情况
  4. 优化了对于paramater的格式化
  5. 加入tcl和modelsim的.do文件语法高亮
  6. 修复了assign,localparam,parameter后面的注释异常
  7. 加入了vivado仿真文件的快速转换功能 可以把 compile.do  , elaborate.do , simulate.do转换成tb.do 仿真的时候一键do tb.do 快速仿真 + 用户配置接口