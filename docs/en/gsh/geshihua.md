
# Code formatting

## Function Description

- Implement verilog code formatting function, and customize the indentation amount in the settings interface.

### Implement the verilog code formatting function - ( **variable alignment, comma alignment, bracket alignment on each line**).

- Trigger command: Press Ctrl+Shift+P: Enter verilog;
- Shortcut: CTRL + L;
- Setting interface: Simple Align: **Num1** to Simple Align: **Num4**: They are the number of spaces for code formatting:
- For example, the original code is:
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
- Simple Align › Num5: Upbound and Simple Align › Num6: Lowbound are the number of [ ] spaces within the bit width.
For example:
```verilog
output          [ /*[num5]*/  7:/*[num6]*/ 0]      uart_data_232_0        ,
```

### Implement formatting only for the always block
- Trigger command: verilog-simplealign.always_valuation_func;
- Shortcut key: ctrl + U.
- Setup interface:
    - Simple Align: Width_always: is the indentation amount of the always code line,
    - Simple Align: Width_always_valuation: is the indentation amount for always internal assignment,
    - Simple Align: Width_begin_end: is the amount of indentation for begin/end,
    - Simple Align: Width_else: is the indentation amount of else,
    - Simple Align: Width_else_if: is the indentation amount of else if,
    - Simple Align: Width_if: is the indentation amount of if.
- For example:
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

> Reminder: The configuration location of the settings interface is: Settings → Extensions Settings → verilog-hdl-format plugin settings