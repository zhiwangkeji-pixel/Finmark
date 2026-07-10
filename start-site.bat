@echo off
setlocal

set "PROJECT_DIR=%~dp0"
set "NODE_EXE=C:\Users\10553\AppData\Local\OpenAI\Codex\bin\node.exe"

if not exist "%NODE_EXE%" (
  set "NODE_EXE=C:\Users\10553\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
)

if not exist "%NODE_EXE%" (
  set "NODE_EXE=C:\Program Files\WindowsApps\OpenAI.Codex_26.422.3464.0_x64__2p2nqsd0c76g0\app\resources\node.exe"
)

if not exist "%NODE_EXE%" (
  echo Could not find Node.js.
  echo Please install Node.js or add it to PATH.
  pause
  exit /b 1
)

cd /d "%PROJECT_DIR%"
echo Project: %CD%
echo Node: %NODE_EXE%
echo Starting Valuation Diary at http://localhost:3000/
echo Keep this window open while using the site.
echo.

"%NODE_EXE%" server.js

echo.
echo The server stopped or failed to start.
pause
endlocal
