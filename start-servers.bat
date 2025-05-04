@echo off
net start MySQL80
cd crickfest-backend
node server.js
