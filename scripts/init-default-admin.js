const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function initDefaultAdmin() {
  const adminData = {
    username: 'admin',
    email: 'admin@163.com',
    password: 'admin',
    role: 'admin',
    isActive: true
  };

  try {
    // 检查是否已存在该邮箱的用户
    const existingUser = await prisma.user.findUnique({
      where: { email: adminData.email }
    });

    if (existingUser) {
      // 如果用户存在但不是管理员，更新为管理员
      if (existingUser.role !== 'admin') {
        const updatedUser = await prisma.user.update({
          where: { email: adminData.email },
          data: { role: 'admin', isActive: true }
        });
        console.log('✅ 已将现有用户升级为管理员:');
        console.log('   用户名:', updatedUser.username);
        console.log('   邮箱:', updatedUser.email);
        console.log('   角色:', updatedUser.role);
      } else {
        console.log('ℹ️  管理员账号已存在:');
        console.log('   用户名:', existingUser.username);
        console.log('   邮箱:', existingUser.email);
        console.log('   角色:', existingUser.role);
      }
      return;
    }

    // 检查用户名是否已被占用
    const existingUsername = await prisma.user.findUnique({
      where: { username: adminData.username }
    });

    if (existingUsername) {
      console.log('❌ 用户名 "admin" 已被占用，请使用其他用户名');
      return;
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // 创建管理员用户
    const user = await prisma.user.create({
      data: {
        username: adminData.username,
        email: adminData.email,
        password: hashedPassword,
        role: adminData.role,
        isActive: adminData.isActive
      }
    });

    console.log('✅ 默认管理员创建成功!');
    console.log('   用户名:', user.username);
    console.log('   邮箱:', user.email);
    console.log('   密码: admin');
    console.log('   角色:', user.role);
    console.log('');
    console.log('📝 请尽快登录并修改默认密码以保证安全');

  } catch (error) {
    console.error('❌ 创建管理员失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

initDefaultAdmin();
