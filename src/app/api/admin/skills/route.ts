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
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const skip = (page - 1) * limit

    const validSortFields = ['createdAt', 'downloadCount', 'name']
    const validSortOrders = ['asc', 'desc']

    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt'
    const orderByDirection = validSortOrders.includes(sortOrder) ? sortOrder : 'desc'

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } }
          ]
        }
      : {}

    const [skills, total] = await Promise.all([
      prisma.skill.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderByField]: orderByDirection },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        }
      }),
      prisma.skill.count({ where })
    ])

    return NextResponse.json({
      skills,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get skills error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
