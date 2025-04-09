@echo off
echo 正在下载依赖包...

REM 创建依赖包目录
mkdir packages

REM 下载依赖包
pip download -r backend/requirements.txt -d packages

echo 依赖包下载完成！
echo 所有依赖包已保存到 packages 目录
pause 