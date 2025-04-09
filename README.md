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

## 系统要求

- Python 3.8 或更高版本
- 至少 500MB 可用磁盘空间
- 支持 Windows、Linux 和 MacOS

## 安装步骤

### 在线安装

1. 克隆仓库：
```bash
git clone https://github.com/jeja2023/zbgl.git
cd zbgl
```

2. 安装依赖：
- Windows: 双击运行 `install_dependencies.bat`
- Linux/Mac: 
```bash
chmod +x install_dependencies.sh
./install_dependencies.sh
```

### 离线安装

1. 在有网络的环境下：
   - Windows: 运行 `download_dependencies.bat`
   - Linux/Mac: 
     ```bash
     chmod +x download_dependencies.sh
     ./download_dependencies.sh
     ```
   - 将整个项目目录（包含 packages 文件夹）复制到目标机器

2. 在目标机器上：
   - Windows: 运行 `install_dependencies_offline.bat`
   - Linux/Mac:
     ```bash
     chmod +x install_dependencies_offline.sh
     ./install_dependencies_offline.sh
     ```

## 使用方法

1. 启动服务器：
- Windows: 双击运行 `start_server.bat`
- Linux/Mac: 
```bash
chmod +x start_server.sh
./start_server.sh
```
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
├── packages/              # 离线安装包目录
├── install_dependencies.bat      # Windows 在线安装脚本
├── install_dependencies.sh       # Linux/Mac 在线安装脚本
├── install_dependencies_offline.bat  # Windows 离线安装脚本
├── install_dependencies_offline.sh   # Linux/Mac 离线安装脚本
├── download_dependencies.bat     # Windows 下载依赖脚本
├── download_dependencies.sh      # Linux/Mac 下载依赖脚本
├── start_server.bat      # Windows 启动脚本
├── start_server.sh       # Linux/Mac 启动脚本
└── README.md             # 项目说明
```

## 依赖说明

主要依赖包及其用途：
- fastapi: Web 框架
- uvicorn: ASGI 服务器
- python-jose: JWT 认证
- passlib: 密码哈希
- python-multipart: 文件上传
- jinja2: 模板引擎
- pandas: 数据处理
- openpyxl: Excel 文件处理
- python-dotenv: 环境变量管理
- bcrypt: 密码加密

## 注意事项

1. 首次运行时会自动创建数据库和管理员账号
2. 请及时修改默认管理员密码
3. 确保服务器有足够的存储空间
4. 定期备份数据库文件
5. 离线安装时确保 packages 目录包含所有必要的依赖包 