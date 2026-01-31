#!/bin/sh
set -e

echo "🚀 Starting Skill Marketplace..."

# 创建数据目录
echo "📁 Creating data directories..."
mkdir -p /app/data
mkdir -p /app/data/uploads/skills

# 设置数据库路径
export DATABASE_URL="file:/app/data/dev.db"

# 检查数据库文件是否存在
if [ ! -f "/app/data/dev.db" ]; then
    echo "🗄️  Database not found, initializing..."
    
    # 运行数据库迁移
    echo "📊 Running database migrations..."
    npx prisma migrate deploy
    
    # 生成 Prisma Client
    echo "🔧 Generating Prisma Client..."
    npx prisma generate
    
    echo "✅ Database initialized successfully!"
else
    echo "🗄️  Database found, checking migrations..."
    npx prisma migrate deploy
    npx prisma generate
fi

# 创建默认管理员（如果不存在）
echo "👤 Checking default admin..."
node scripts/init-default-admin.js || echo "⚠️  Default admin may already exist or script failed"

echo "✨ Starting application..."
echo ""

# 启动应用
exec "$@"
