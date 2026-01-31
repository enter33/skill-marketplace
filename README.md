# Skill Marketplace - Agent Skill 应用市场

一个用于分享和管理 Claude Agent Skills 的平台，让用户可以上传、下载和发现各种实用的 Agent Skills。

## ✨ 功能特性

### 核心功能
- 🔍 **Skill 浏览与搜索** - 发现社区分享的优质 Skills
- 📦 **Skill 上传** - 分享你的自定义 Skills
- ⬇️ **Skill 下载** - 下载并使用他人分享的 Skills
- 👤 **用户系统** - 注册/登录，支持用户名或邮箱登录
- 🔐 **个人中心** - 查看个人信息、修改密码
- 📊 **管理后台** - 管理员可管理用户和 Skills

### 用户角色
- **普通用户** - 浏览、下载、上传 Skills
- **管理员** - 额外拥有用户管理、Skill 管理、数据统计权限

## 🛠️ 技术栈

- **框架**: Next.js 16 + React 19
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **数据库**: SQLite + Prisma ORM
- **认证**: NextAuth.js
- **构建**: 支持 Docker 部署

## 🚀 快速开始

### 环境要求
- Node.js 20+
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd skill-marketplace
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
# 复制环境变量模板
copy .env .env.local

# 编辑 .env.local 文件，设置你的密钥
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

4. **数据库初始化**
```bash
# 运行数据库迁移
npx prisma migrate dev

# 生成 Prisma Client
npx prisma generate
```

5. **创建默认管理员**（可选）
```bash
node scripts/init-default-admin.js
```

### 开发环境运行

```bash
npm run dev
```

访问 http://localhost:3000

### 生产环境构建

```bash
# 构建
npm run build

# 启动生产服务
npm start
```

## 🐳 Docker 部署

### 使用 Docker 命令

```bash
# 构建镜像
docker build -t skill-marketplace:latest .

# 运行容器
docker run -d \
  -p 3000:3000 \
  -e NEXTAUTH_SECRET="your-secret-key" \
  -v skill-marketplace-data:/app/data \
  --name skill-marketplace \
  skill-marketplace:latest
```

### 使用 Docker Compose

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 👤 默认账号

系统初始化后会创建默认管理员账号：

| 角色 | 用户名 | 邮箱 | 密码 |
|------|--------|------|------|
| 管理员 | admin | admin@163.com | admin |

> ⚠️ **安全提示**: 首次登录后请立即修改默认密码！

## 📁 项目结构

```
skill-marketplace/
├── src/
│   ├── app/                 # Next.js 页面路由
│   │   ├── api/            # API 路由
│   │   ├── admin/          # 管理后台页面
│   │   ├── auth/           # 认证页面（登录/注册）
│   │   ├── dashboard/      # 用户仪表盘
│   │   ├── profile/        # 个人中心
│   │   └── skill/          # Skill 详情页
│   ├── components/         # React 组件
│   ├── lib/               # 工具函数和配置
│   └── types/             # TypeScript 类型定义
├── prisma/
│   ├── schema.prisma      # 数据库模型
│   └── migrations/        # 数据库迁移文件
├── scripts/               # 实用脚本
├── public/               # 静态资源
├── uploads/              # 上传文件存储
└── Dockerfile            # Docker 构建文件
```

## 📖 使用指南

### 普通用户

1. **注册/登录**
   - 访问 `/auth/register` 注册账号
   - 或使用 `/auth/login` 登录（支持用户名或邮箱）

2. **浏览 Skills**
   - 首页展示所有 Skills
   - 支持按时间/下载量排序
   - 支持关键词搜索

3. **上传 Skill**
   - 进入 "我的 Skills" 页面
   - 点击 "上传 Skill"
   - 填写名称、描述，上传文件

4. **下载 Skill**
   - 点击 Skill 卡片进入详情页
   - 点击下载按钮

5. **管理个人信息**
   - 点击导航栏用户名进入个人中心
   - 可查看个人信息和修改密码

### 管理员

1. **访问管理后台**
   - 管理员登录后，导航栏显示 "管理后台" 入口
   - 或直接访问 `/admin`

2. **仪表盘**
   - 查看系统统计数据
   - 用户总数、Skill 总数、下载次数

3. **用户管理**
   - 查看所有用户列表
   - 设置/取消管理员权限
   - 启用/禁用账号
   - 删除用户（会同时删除其上传的 Skills）

4. **Skill 管理**
   - 查看所有 Skills
   - 删除任意 Skill

## 🔧 常用命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 运行测试
npm test

# 代码检查
npm run lint

# 数据库迁移
npx prisma migrate dev

# 生成 Prisma Client
npx prisma generate

# 查看数据库
npx prisma studio

# 创建默认管理员
node scripts/init-default-admin.js
```

## 📝 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DATABASE_URL` | SQLite 数据库路径 | `file:./dev.db` |
| `NEXTAUTH_SECRET` | NextAuth 密钥 | 必填 |
| `NEXTAUTH_URL` | 应用 URL | `http://localhost:3000` |

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
