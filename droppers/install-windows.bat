@echo off
echo ========================================
echo    VivEye Agent Installer (Windows)
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from https://nodejs.org
    echo Download the LTS version and run the installer.
    echo.
    pause
    exit /b 1
)

echo Node.js is installed. Version:
node --version
echo.

REM Create agent.js file
echo Creating agent.js file...
(
echo const WebSocket = require('ws'^);
echo const { exec } = require('child_process'^);
echo const os = require('os'^);
echo.
echo class VivEyeAgent {
echo   constructor(serverUrl^) {
echo     this.serverUrl = serverUrl;
echo     this.ws = null;
echo     this.agentId = 'agent-' + Math.random(^).toString(36^).substr(2, 9^);
echo   }
echo.
echo   connect(^) {
echo     this.ws = new WebSocket(this.serverUrl^);
echo     this.ws.on('open', (^) =^> {
echo       console.log('Connected to VivEye server'^);
echo       this.register(^);
echo     }^);
echo     this.ws.on('message', (data^) =^> {
echo       const command = JSON.parse(data^);
echo       this.executeCommand(command^);
echo     }^);
echo   }
echo.
echo   register(^) {
echo     this.ws.send(JSON.stringify({
echo       type: 'agent-register',
echo       agentId: this.agentId,
echo       name: 'Windows Agent',
echo       os: os.platform(^)
echo     }^)^);
echo   }
echo.
echo   async executeCommand(command^) {
echo     try {
echo       const result = await this.runCommand(command.payload^);
echo       this.ws.send(JSON.stringify({
echo         type: 'command-result',
echo         commandId: command.id,
echo         result: result,
echo         status: 'completed'
echo       }^)^);
echo     } catch (error^) {
echo       this.ws.send(JSON.stringify({
echo         type: 'command-result',
echo         commandId: command.id,
echo         result: error.message,
echo         status: 'failed'
echo       }^)^);
echo     }
echo   }
echo.
echo   runCommand(cmd^) {
echo     return new Promise((resolve, reject^) =^> {
echo       exec(cmd, (error, stdout, stderr^) =^> {
echo         if (error^) reject(error^);
echo         else resolve(stdout^);
echo       }^);
echo     }^);
echo   }
echo }
echo.
echo const agent = new VivEyeAgent('ws://YOUR_IP:8080'^);
echo agent.connect(^);
) > agent.js

echo Agent file created successfully!
echo.

REM Install WebSocket dependency
echo Installing required dependencies...
npm install ws
echo.

echo ========================================
echo    IMPORTANT: Configuration Required
echo ========================================
echo.
echo 1. Edit agent.js and replace YOUR_IP with your VivEye server IP
echo    Example: ws://192.168.1.100:8080
echo.
echo 2. To run the agent, open Command Prompt and type:
echo    node agent.js
echo.
echo 3. The agent will appear in your VivEye dashboard
echo.

REM Ask user for server address
set /p SERVER_IP="Enter your VivEye server address (IP or domain, e.g., 192.168.1.100 or viveye.yourdomain.com): "

REM Replace YOUR_IP with actual IP
powershell -Command "(Get-Content agent.js) -replace 'YOUR_IP', '%SERVER_IP%' | Set-Content agent.js"

echo.
echo Configuration updated!
echo.

REM Ask if user wants to run the agent now
set /p RUN_NOW="Do you want to run the agent now? (y/n): "
if /i "%RUN_NOW%"=="y" (
    echo.
    echo Starting VivEye Agent...
    echo Press Ctrl+C to stop the agent
    echo.
    node agent.js
) else (
    echo.
    echo To run the agent later, open Command Prompt and type:
    echo node agent.js
)

echo.
pause
