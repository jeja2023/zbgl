# 值班管理系统

一个基于 FastAPI 和 SQLite 的简单值班管理系统。

## 功能特点

- 用户登录/登出
- 管理员功能
  - 用户管理
  - 部门管理
  - 值班信息管理
- 数据导入/导出
- 局域网部署支持

## 技术栈

- 后端：FastAPI 0.104.1
- 数据库：SQLite
- 前端：HTML + CSS + JavaScript
- 认证：JWT

## 安装步骤

1. 克隆仓库：
```bash
git clone https://github.com/jeja2023/zbgl.git
cd zbgl
```

2. 创建虚拟环境：
```bash
python -m venv .venv
```

3. 激活虚拟环境：
- Windows:
```bash
.venv\Scripts\activate
```
- Linux/Mac:
```bash
source .venv/bin/activate
```

4. 安装依赖：
```bash
cd backend
pip install -r requirements.txt
```

## 使用方法

1. 启动服务器：
- Windows: 双击运行 `start_server.bat`
- 命令行方式：
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

2. 访问系统：
- 本机访问：http://localhost:8000
- 局域网访问：http://<服务器IP>:8000

3. 默认管理员账号：
- 用户名：admin
- 密码：admin123

## 局域网部署说明

1. 确保服务器和客户端在同一个局域网内

2. 查看服务器 IP 地址：
- Windows: 打开命令提示符，输入 `ipconfig`
- Linux/Mac: 打开终端，输入 `ifconfig` 或 `ip addr`

3. 启动服务器：
- 使用 `start_server.bat` 或命令行方式启动
- 确保使用 `--host 0.0.0.0` 参数

4. 客户端访问：
- 在浏览器中输入 `http://<服务器IP>:8000`
- 例如：`http://192.168.1.100:8000`

5. 防火墙设置：
- 确保 Windows 防火墙允许 8000 端口的入站连接
- 或临时关闭防火墙进行测试

## 项目结构

```
.
├── backend/                # 后端代码
│   ├── main.py            # 主程序
│   └── requirements.txt   # 依赖文件
├── frontend/              # 前端代码
│   ├── static/           # 静态文件
│   └── templates/        # HTML 模板
├── start_server.bat      # Windows 启动脚本
└── README.md             # 项目说明
```

## 注意事项

1. 首次运行时会自动创建数据库和管理员账号
2. 请及时修改默认管理员密码
3. 确保服务器有足够的存储空间
4. 定期备份数据库文件 