# Introduction to the verilog-hdl-format plugin

## Preface
- Upgrading🟢: If you have any good suggestions for improvement, please leave me a message. 🐧QQ: 1391074994  🐧QQ group: 819816965
- If it works well, please remember to give a good review
* Example of operation: [bilibi demonstration link](https://www.bilibili.com/video/BV1xi421d7e9/?vd_source=99e34f775e17481ae5a0ed7fad6b00cc#reply1451507881)
* Demo document link: [[Chinese document]](https://1391074994.github.io/Verilog-Hdl-Format/)[[english]](https://1391074994.github.io/Verilog-Hdl-Format/#/./README_en)
* GitHub link: [verilog-hdl-format](https://github.com/1391074994/verilog-hdl-format)
## Function Introduction
1. Grammar function
    * [Code Formatting](./en/gsh/geshihua.md)
    * [Displaying the file tree](./en/wjs/wenjianshu.md)
    * [One-click instantiation](./en/lihua/lihua.md)
    * [Syntax highlighting](./en/gl/gl.md)
    * [Syntax Jump](./en/yf/yf.md)
    * [Code completion](./en/bq/bq.md)
    * [Define hover](./en/yf/yf.md)
    * [Code Error Checking](./en/linter/linter.md)
2. Other functions
    * [ucf to xdc file](./zh-ch/ucf_to_xdc/ucf_to_xdc.md)
    * [Fast conversion of Vivado simulation files](./en/sim_do/sim_do.md)
    * [Incrementing and Decrementing a Cursor Column](./en/incrementSelection/incrementSelection.md)
    * [Color Theme](./en/thems/thems.md)

3. Implement verilog code formatting functions (variable alignment, comma alignment, bracket alignment), and configure the indentation amount in the settings interface. Function trigger: Press Ctrl+Shift+P: Enter verilog. Shortcut key CTRL + L; Function 2: Add formatting only for always blocks, and configure the indentation amount in the settings interface. Command: verilog-simplealign.always_valuation_func; Shortcut key CTRL + U.
4. One-click instantiation function, the instantiated code is automatically copied to the clipboard. Function trigger: press Ctrl+Shift+P: enter Convert_instance. One-click tb function: press Ctrl+Shift+P: enter Convert_testbench
5. UCF to xdc file:
      - Normal order conversion. Function trigger: Press Ctrl+Shift+P: Enter Convert UCF to XDC NORMAL ORDER.
      - The sequence number can be arranged from small to large. Function trigger: Press Ctrl+Shift+P: Enter Convert UCF to XDC SORT ORDER.
6. High-function syntax highlighting: ucf, xdc, do, tcl syntax highlighting, verilog syntax highlighting, high cloud.cst syntax highlighting.
7. Common fragments of verilog code.
8. The verilog code defines variable hover display.
9. Code error checking: add the linter (verilog syntax detection) of [Verilog-HDL/SystemVerilog/Bluespec SystemVerilog](https://github.com/mshr-h/vscode-verilog-hdl-support)
10. Quick conversion function of Vivado simulation file: Enter the sim_1\behav\questa (or modelsim) folder under the Vivado project and run the command Conver Modelsim do, which will generate the xxx_compile.do, xxx_elaborate.do, xxx_simulate.do and user-defined configuration files to generate a one-click run tb.do file
11. The function of incrementSelection: use multiple cursors to perform incremental, decremental, or reverse selection
12. Added the verilog file tree display function. The command Refresh the verilog file tree display is required to trigger and refresh (there is a refresh button in the upper right corner of the container/there is also a command in the main editor area with the right mouse button)
13. Add verilog definition jumps, instantiation name jumps, and instantiation port jumps. Quick jumps require ctags (supporting cross-file jumps).
14. Added color theme - VSCODE color theme: [jiang percy verilog themes]()


* Code snippet: Supported code snippets:  | module | geli | jishuqi | shangshenyan | tb | zhuangtaiji | always | dapai | assign | alwaysposclk | alwaysnegclk | begin | end | initial | case | reg | regarray | regmemory | wire | wirearray | array | parameter | localparam | integer | signed | include | def | ifdef | if
  
* Among them, the more commonly used ones are: module/geli/jishuqi/shangshenyan/tb/zhuangtaiji/always/dapai



## Introduction to Setting Interface Configuration
```
Configuration location: Settings → Extensions Settings → verilog-hdl-format plugin settings
```
1. Extension: Company Name: Enter your company or organization name, and it will be automatically filled in when using the TB, module code snippet after setting it up
2. Extension: User Name: Enter your author name, and it will be automatically filled in when using the TB, module code snippet after setting it
3. Extract Data: Custom Options: Define the instructions to add after the modelsim software one-click do file merge.
4. The settings for the linter (verilog syntax detection) function of [Verilog-HDL/SystemVerilog/Bluespec SystemVerilog](https://github.com/mshr-h/vscode-verilog-hdl-support) that begin with FPGA_verilog. If syntax detection is required, a common setting (other syntax detectors can also be selected) is to set FPGA_verilog › Linting: Linter: to xvlog, and the system environment variable is set to the path of xvlog for Vivado.
5. Simple Align: **Num1** to Simple Align: **Num4**: The number of spaces for code formatting, respectively:
  For example, the original code is:
```verilog
      output     [   7: 0]   uart_data_232_0        ,
      reg        [  15: 0]   reg_rf_ct9             ;
      parameter              RF_ADC3_MIN            = 16'h8233;
      assign                 uart_bus_clk           = clk;
  // instantiate
  uart_top_232 u0_uart_top_232(
      .uart_bus_clk          (uart_bus_clk     ),
      .uart_bus_rst          (~rst_n           ),
      .uart_tx               (rx_232_0         )
);
```
Configure the corresponding position:
```verilog
 /*[num1]*/  output    /*[num2]*/  [   7: 0]  /*[num3]*/  uart_data_232_0  /*[num4]*/          ,
 /*[num1]*/  reg       /*[num2]*/  [  15: 0]  /*[num3]*/  reg_rf_ct9       /*[num4]*/          ;
 /*[num1]*/  parameter                        /*[num3]*/  RF_ADC3_MIN      /*[num4]*/ = 16'h8233;
 /*[num1]*/  assign                           /*[num3]*/  uart_bus_clk     /*[num4]*/ = clk;
 // instantiate
 uart_top_232 u0_uart_top_232(
 /*[num1]*/ .uart_bus_clk                     /*[num3]*/  (uart_bus_clk    /*[num4]*/ ),
 /*[num1]*/ .uart_bus_rst                     /*[num3]*/  (~rst_n          /*[num4]*/ ),
 /*[num1]*/ .uart_tx                          /*[num3]*/  (rx_232_0        /*[num4]*/ )
);


```
6. Simple Align › Num5: Upbound and Simple Align › Num6: Lowbound are the number of [ ] spaces within the bit width.
For example:
```verilog
output          [ /*[num5]*/  7:/*[num6]*/ 0]      uart_data_232_0        ,
```
7. Simple Align: Width_always: is the indentation amount of the always code line,
8. Simple Align: Width_always_valuation: is the amount of indentation for internal assignment,
9. Simple Align: Width_begin_end: is the amount of indentation for begin/end,
10. Simple Align: Width_else: is the indentation amount of else,
11. Simple Align: Width_else_if: is the indentation of else if,
12. Simple Align: Width_if: is the indentation amount of if.
For example:
```verilog
      [Width_always]          always @(posedge clk or negedge rst_n_power)                    
      [Width_begin_end]             begin                                                                  
      [Width_if]                          if(!rst_n_power)              
      [Width_always_valuation]                  F_POWER_EN_cnt <= 'd0   ;
      [Width_else_if]                     else if(F_BAT_SW==0)           
      [Width_always_valuation]                  F_POWER_EN_cnt <= F_POWER_EN_cnt + 1'b1;
      [Width_else]                        else
      [Width_always_valuation]                  F_POWER_EN_cnt <= 'd0  ;
      [Width_begin_end]             end
```

13. Verilog Module Finder: Exclude Folders: The excluded folder names of the verilog file tree can be customized and added, and the folder names that need to be matched can be deleted. [The Verilog files in the IP/ or backup files are blocked in the opened folder, making the TOP layer of the file tree display cleaner. The default is to block (ip and core folders).]().

14. FPGA_verilog.ctags.path: the path to the external environment ctags is required. It can implement syntax definition jump (supporting cross-file).

# Thank you

* [verilog-simplealign](https://github.com/CENZONGJUN/verilog-simplealign)
* [Verilog-HDL/SystemVerilog/Bluespec SystemVerilog](https://github.com/mshr-h/vscode-verilog-hdl-support)