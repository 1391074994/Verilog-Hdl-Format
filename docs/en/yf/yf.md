

# Syntax jump and define hover
## ctags configuration

- ctags must be configured to define shortcut jumps.

- If ctags is not configured, the shortcut jump function cannot be used. However, commands can be used to jump.

1. It is recommended to download ctags to drive c

2. Configure ctags.exe to the environment variable

- powershell: Enter ctags -version to view the ctags installation and version information

3. Configure ctags.exe to vscode- Settings inside the configuration :ctags: for example, C:\ ctags-2023-06-08_P6.0.20230604.0-1-G89081cc-x64 \ctags.exe

## Function

1. verilog defines jump

2. verilog example alias jump

3. Port forwarding of verilog

### Functional demonstration:
- Use commands for syntax jumps (no ctags required)

- ![命令进行语法跳转](../../vivado/yf/1.gif)

- Use the shortcut keys (ctrl+ left mouse button) for syntax jump (requires ctags environment)

- ![命令进行语法跳转](../../vivado/yf/2.gif)