#!/bin/bash
echo "正在安装值班管理系统依赖..."

# 创建虚拟环境
python3 -m venv .venv

# 激活虚拟环境
source .venv/bin/activate

# 升级 pip
python -m pip install --upgrade pip

# 安装依赖
cd backend
pip install -r requirements.txt

echo "依赖安装完成！"
echo "您现在可以运行 ./start_server.sh 启动服务器" 