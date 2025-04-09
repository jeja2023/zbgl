@echo off
echo 正在安装值班管理系统依赖...

REM 创建虚拟环境
python -m venv .venv

REM 激活虚拟环境
call .venv\Scripts\activate

REM 升级 pip
python -m pip install --upgrade pip

REM 安装依赖
cd backend
pip install -r requirements.txt

echo 依赖安装完成！
echo 您现在可以运行 start_server.bat 启动服务器
pause 