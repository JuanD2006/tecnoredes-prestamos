@echo off
setlocal
if not exist .env copy .env.example .env
if not exist node_modules (
  echo Instalando dependencias del API...
  call npm.cmd ci
  if errorlevel 1 exit /b 1
)
call npm.cmd run seed
