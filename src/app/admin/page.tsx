import { prisma } from '@/lib/prisma'
import { Users, Package, Download, Shield } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  // 获取统计数据
  const [
    totalUsers,
    totalSkills,
    totalDownloads,
    adminCount,
    recentUsers,
    recentSkills
  ] = await Promise.all([
    prisma.user.count(),
    prisma.skill.count(),
    prisma.skill.aggregate({
      _sum: { downloadCount: true }
    }),
    prisma.user.count({ where: { role: 'admin' } }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    }),
    prisma.skill.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            username: true
          }
        }
      }
    })
  ])

  const stats = [
    {
      name: '总用户数',
      value: totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      href: '/admin/users'
    },
    {
      name: '总 Skills',
      value: totalSkills,
      icon: Package,
      color: 'bg-violet-500',
      href: '/admin/skills'
    },
    {
      name: '总下载量',
      value: totalDownloads._sum.downloadCount || 0,
      icon: Download,
      color: 'bg-green-500',
      href: '/admin/skills'
    },
    {
      name: '管理员数',
      value: adminCount,
      icon: Shield,
      color: 'bg-orange-500',
      href: '/admin/users'
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">仪表盘</h2>
        <p className="mt-1 text-gray-600">系统概览和统计数据</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">最近注册用户</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentUsers.map((user) => (
              <div key={user.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.username}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-gray-200">
            <Link
              href="/admin/users"
              className="text-sm text-violet-600 hover:text-violet-700 font-medium"
            >
              查看全部用户 →
            </Link>
          </div>
        </div>

        {/* Recent Skills */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">最近上传 Skills</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentSkills.map((skill) => (
              <div key={skill.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{skill.name}</p>
                    <p className="text-sm text-gray-500">by {skill.author.username}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(skill.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-gray-200">
            <Link
              href="/admin/skills"
              className="text-sm text-violet-600 hover:text-violet-700 font-medium"
            >
              查看全部 Skills →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
