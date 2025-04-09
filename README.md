# 值班管理系统

一个基于 FastAPI 和 SQLite 的简单值班管理系统。

## 功能特点

- 用户管理
  - 用户登录/注销
  - 管理员可以创建、编辑和删除用户
  - 用户可以修改自己的密码
  - 支持部门分配
- 值班信息管理
  - 按日期查看值班信息
  - 按部门管理值班信息
  - 支持添加、编辑和删除值班信息
  - 限制只能查看和编辑当前日期及以前的值班信息
- 数据导入导出
  - 支持 Excel 格式的值班信息导入
  - 支持导出值班信息到 Excel
  - 提供导入模板下载

## 技术栈

- 后端
  - FastAPI
  - SQLAlchemy
  - SQLite
  - Python 3.8+
- 前端
  - HTML5
  - CSS3
  - JavaScript
  - Bootstrap 5

## 安装步骤

1. 克隆仓库
```bash
git clone [repository-url]
cd duty-management-system
```

2. 创建虚拟环境
```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows
```

3. 安装依赖
```bash
pip install -r requirements.txt
```

4. 启动服务
```bash
cd backend
uvicorn main:app --reload
```

5. 访问系统
打开浏览器访问 http://localhost:8000

## 使用说明

1. 用户登录
   - 默认管理员账号：admin
   - 默认管理员密码：admin123

2. 值班信息管理
   - 选择日期查看值班信息
   - 点击编辑按钮修改值班信息
   - 只能查看和编辑当前日期及以前的值班信息

3. 用户管理（仅管理员）
   - 创建新用户
   - 编辑用户信息
   - 删除用户
   - 分配用户部门

4. 数据导入导出
   - 下载导入模板
   - 按模板格式填写值班信息
   - 上传 Excel 文件导入数据
   - 导出值班信息到 Excel

## 项目结构

```
duty-management-system/
├── backend/
│   ├── main.py              # 后端主程序
│   ├── requirements.txt     # Python 依赖
│   └── duty_system.db      # SQLite 数据库文件
├── frontend/
│   ├── static/
│   │   ├── css/
│   │   │   └── style.css   # 样式文件
│   │   └── js/
│   │       └── script.js   # JavaScript 文件
│   └── templates/
│       └── index.html      # 主页面模板
└── README.md               # 项目说明文档
```

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情 