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

- 后端：FastAPI
- 数据库：SQLite
- 前端：HTML + CSS + JavaScript
- 认证：JWT
- 数据处理：pandas

## 系统要求

- Python 3.8 或更高版本
- 至少 100MB 可用磁盘空间
- 支持 Windows、Linux 和 MacOS

## 安装步骤

1. 克隆仓库：
```bash
git clone https://github.com/jeja2023/zbgl.git
cd zbgl
```

2. 创建并激活虚拟环境：
```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Linux/Mac
python3 -m venv .venv
source .venv/bin/activate
```

3. 安装依赖：
```bash
cd backend
pip install -r requirements.txt
```

## 使用方法

1. 启动服务器：
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
- 使用 `--host 0.0.0.0` 参数启动服务器
- 确保防火墙允许 8000 端口的入站连接

4. 客户端访问：
- 在浏览器中输入 `http://<服务器IP>:8000`
- 例如：`http://192.168.1.100:8000`

## 项目结构

```
.
├── backend/                # 后端代码
│   ├── main.py            # 主程序
│   ├── duty_system.db     # SQLite 数据库文件
│   └── requirements.txt   # 依赖文件
├── frontend/              # 前端代码
│   ├── static/           # 静态文件
│   │   ├── css/         # 样式文件
│   │   └── js/          # JavaScript 文件
│   └── templates/        # HTML 模板
├── .gitignore            # Git 忽略文件
└── README.md             # 项目说明
```

## 依赖说明

主要依赖包及其用途：
- fastapi: Web 框架
- uvicorn: ASGI 服务器
- python-jose: JWT 认证
- bcrypt: 密码加密
- python-multipart: 文件上传
- jinja2: 模板引擎
- pandas: 数据处理
- openpyxl: Excel 文件处理

## 数据库说明

- 数据库文件：`backend/duty_system.db`
- 首次运行时会自动创建数据库和管理员账号
- 建议定期备份数据库文件

## 注意事项

1. 请及时修改默认管理员密码
2. 确保服务器有足够的存储空间
3. 定期备份数据库文件
4. 在导入 Excel 文件时，请确保数据格式正确
5. 导出数据时，手机号码会自动去除 ".0" 后缀 