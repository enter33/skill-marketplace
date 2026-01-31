import { prisma } from '../src/lib/prisma'

async function initAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
  
  try {
    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (!existingUser) {
      console.log(`User with email ${adminEmail} not found.`)
      console.log('Please register a user first, then run this script.')
      process.exit(1)
    }

    // 更新用户为管理员
    const updatedUser = await prisma.user.update({
      where: { email: adminEmail },
      data: { role: 'admin' }
    })

    console.log(`User ${updatedUser.username} (${updatedUser.email}) is now an admin.`)
  } catch (error) {
    console.error('Failed to init admin:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

initAdmin()
