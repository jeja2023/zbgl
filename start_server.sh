#!/bin/bash
echo "正在启动值班管理系统..."
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload 