# 代码补全

## 功能描述

- 实现verilog静态代码补全和动态代码补全功能

### verilog静态代码补全
* 代码片段:支持输入的代码片段:
 - module 
 - geli 
 - jishuqi 
 - shangshenyan 
 - tb 
 - zhuangtaiji 
 - always 
 - dapai 
 - assign 
 - alwaysposclk 
 - alwaysnegclk 
 - begin 
 - end 
 - initial 
 - case 
 - reg 
 - regarray 
 - regmemory 
 - wire 
 - wirearray 
 - array 
 - parameter 
 - localparam 
 - integer 
 - signed 
 - include 
 - def 
 - ifdef 
 - ifnf 
 - elsif 
 - else if 
 - else 
 - undef 
 - ts 
 - default_nettype 
 - ternary 
 - if 
 - ifelse 
 - for 
 - while 
 - forever 
 - function 
 - generate 
 - genvar
#### 比较常用的部分:
 - module
 - geli
 - jishuqi
 - shangshenyan
 - tb
 - zhuangtaiji
 - always
 - dapai

### 支持动态代码片段
支持module/tb
- 设置界面：    
1. Extension: Company Name ： 输入你的公司或组织名称，设置好之后在使用TB,module代码片段的时候会自动填入公司或组织名称
2. Extension: User Name ：  输入你的作者名称，设置好之后在使用TB,module代码片段的时候会自动填入作者名称