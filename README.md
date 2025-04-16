# 值班管理系统

一个基于 FastAPI 和 SQLite 的简单值班管理系统，支持多班次值班管理、数据导入导出等功能。

## 功能特点

- 用户管理
  - 用户登录/登出
  - 密码修改
  - 管理员权限控制
- 部门管理
  - 部门信息维护
  - 部门值班信息管理
- 值班管理
  - 多班次值班（1-4班）
  - 值班人员信息维护
  - 备班人员管理
  - 值班历史记录查询
- 运营中心值班管理
  - 固定值班人员设置
  - 备班人员管理
  - 班次轮换管理
  - 值班信息批量编辑
- 数据管理
  - Excel 数据导入/导出
  - 模板下载
  - 数据备份

## 技术栈

- 后端：FastAPI
- 数据库：SQLite
- 前端：HTML + CSS + JavaScript
- 认证：JWT
- 数据处理：pandas, openpyxl, xlsxwriter

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

## Python 包依赖

主要依赖包及其用途：

- `fastapi`: Web 框架
- `uvicorn`: ASGI 服务器
- `python-jose[cryptography]`: JWT 认证
- `passlib[bcrypt]`: 密码加密
- `python-multipart`: 文件上传支持
- `pandas`: 数据处理
- `openpyxl`: Excel 文件处理
- `xlsxwriter`: Excel 文件生成
- `python-dotenv`: 环境变量管理

完整依赖列表请查看 `backend/requirements.txt`。

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

## 值班班次说明

- 系统支持 4 个班次（1-4班）轮换
- 每个班次的值班时间为：当天上午 9:00 到次日 8:59:59
- 班次轮换规则：
  - 每天自动切换到下一个班次
  - 第 4 班后自动切换到第 1 班
  - 凌晨 0:00 到上午 8:59:59 显示前一天的班次

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

## 开发说明

1. 数据库初始化：
- 系统首次运行时会自动创建数据库和必要的数据表
- 默认创建管理员账号（admin/admin123）

2. 数据备份：
- 定期备份 `duty_system.db` 文件
- 使用导出功能备份值班信息

3. 安全建议：
- 定期修改管理员密码
- 及时删除不必要的用户账号
- 限制数据库文件的访问权限

## 许可证

MIT License 