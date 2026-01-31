import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Home,
  Shield
} from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-violet-600" />
              <h1 className="text-xl font-semibold text-gray-900">管理后台</h1>
            </div>
            <Link 
              href="/"
              className="flex items-center text-gray-600 hover:text-violet-600 transition-colors"
            >
              <Home className="h-5 w-5 mr-1" />
              返回首页
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              <Link
                href="/admin"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
              >
                <LayoutDashboard className="h-5 w-5 mr-3" />
                仪表盘
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
              >
                <Users className="h-5 w-5 mr-3" />
                用户管理
              </Link>
              <Link
                href="/admin/skills"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
              >
                <Package className="h-5 w-5 mr-3" />
                Skill 管理
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
