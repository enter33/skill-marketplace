import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck instanceof NextResponse) {
    return adminCheck
  }

  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        skills: {
          select: {
            id: true,
            name: true,
            description: true,
            downloadCount: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck instanceof NextResponse) {
    return adminCheck
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { role, isActive } = body

    // 验证 role 值
    if (role && !['user', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role value' },
        { status: 400 }
      )
    }

    // 防止管理员禁用自己
    if (isActive === false && id === adminCheck.user.id) {
      return NextResponse.json(
        { error: 'Cannot disable your own account' },
        { status: 400 }
      )
    }

    // 防止管理员降级自己
    if (role === 'user' && id === adminCheck.user.id) {
      return NextResponse.json(
        { error: 'Cannot demote yourself' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(isActive !== undefined && { isActive })
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck instanceof NextResponse) {
    return adminCheck
  }

  try {
    const { id } = await params

    // 防止管理员删除自己
    if (id === adminCheck.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { skills: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // 使用事务删除用户及其所有 Skills
    await prisma.$transaction([
      // 先删除用户的所有 Skills
      prisma.skill.deleteMany({
        where: { authorId: id }
      }),
      // 再删除用户
      prisma.user.delete({
        where: { id }
      })
    ])

    return NextResponse.json({
      success: true,
      message: `用户 "${user.username}" 及其 ${user._count.skills} 个 Skill 已删除`
    })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
