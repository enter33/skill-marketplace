import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from './auth'
import { prisma } from './prisma'

export interface AdminSession {
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

export async function requireAdmin(request: NextRequest): Promise<AdminSession | NextResponse> {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // 从数据库获取最新用户信息（检查是否被禁用或角色变更）
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isActive: true }
  })

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )
  }

  if (!user.isActive) {
    return NextResponse.json(
      { error: 'Account is disabled' },
      { status: 403 }
    )
  }

  if (user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden - Admin access required' },
      { status: 403 }
    )
  }

  return session as AdminSession
}

export function isAdmin(session: any): boolean {
  return session?.user?.role === 'admin'
}
