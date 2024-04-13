
# 代码格式化

## 功能描述

- 实现verilog代码格式化功能,在设置界面可以自定义配置缩进量。

### 实现verilog代码格式化功能-(**每行的变量对齐，逗号对齐，括号对齐**)。

- 触发命令: 按下 ctrl+shift+p :输入 verilog;
- 快捷键:   CTRL + L;
- 设置界面：Simple Align: **Num1** 到 Simple Align: **Num4** ：分别为 代码格式化的空格数量：
- 例如原本代码为：   
```verilog
      output     [   7: 0]   uart_data_232_0        ,
      reg        [  15: 0]   reg_rf_ct9             ;
      parameter              RF_ADC3_MIN            = 16'h8233;
      assign                 uart_bus_clk           = clk;
  // 例化
  uart_top_232 u0_uart_top_232(
      .uart_bus_clk          (uart_bus_clk     ),
      .uart_bus_rst          (~rst_n           ),
      .uart_tx               (rx_232_0         )
);
```
配置对应的位置： 
```verilog
 /*[num1]*/  output    /*[num2]*/  [   7: 0]  /*[num3]*/  uart_data_232_0  /*[num4]*/          ,
 /*[num1]*/  reg       /*[num2]*/  [  15: 0]  /*[num3]*/  reg_rf_ct9       /*[num4]*/          ;
 /*[num1]*/  parameter                        /*[num3]*/  RF_ADC3_MIN      /*[num4]*/ = 16'h8233;
 /*[num1]*/  assign                           /*[num3]*/  uart_bus_clk     /*[num4]*/ = clk;
 // 例化
 uart_top_232 u0_uart_top_232(
 /*[num1]*/ .uart_bus_clk                     /*[num3]*/  (uart_bus_clk    /*[num4]*/ ),
 /*[num1]*/ .uart_bus_rst                     /*[num3]*/  (~rst_n          /*[num4]*/ ),
 /*[num1]*/ .uart_tx                          /*[num3]*/  (rx_232_0        /*[num4]*/ )
);
```
- Simple Align › Num5: Upbound 和 Simple Align › Num6: Lowbound 为 位宽内的[ ]空格数。
例如：    
```verilog
output          [ /*[num5]*/  7:/*[num6]*/ 0]      uart_data_232_0        ,
```

### 实现只对于always块的格式化
- 触发命令: verilog-simplealign.always_valuation_func；
- 快捷键ctrl + U。
- 设置界面：
    - Simple Align: Width_always ：是alway代码行的缩进量，
    - Simple Align: Width_always_valuation : 是alway内部赋值的缩进量，
    - Simple Align: Width_begin_end : 是begin/end的缩进量，
    - Simple Align: Width_else : 是else的缩进量，
    - Simple Align: Width_else_if : 是else if的缩进量，
    - Simple Align: Width_if : 是if的缩进量。
- 例如：    
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

> 温馨提示：设置界面的配置位置：设置 → 扩展设置 → verilog-hdl-format插件设置    