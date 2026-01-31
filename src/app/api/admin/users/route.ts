import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request)
  if (adminCheck instanceof NextResponse) {
    return adminCheck
  }

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { username: { contains: search } },
            { email: { contains: search } }
          ]
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              skills: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      users: users.map(user => ({
        ...user,
        skillCount: user._count.skills
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
