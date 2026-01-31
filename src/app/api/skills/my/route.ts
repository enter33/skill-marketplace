import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '6')
    const skip = (page - 1) * limit
    
    const [skills, total] = await Promise.all([
      prisma.skill.findMany({
        where: { authorId: session.user.id },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.skill.count({ where: { authorId: session.user.id } })
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
    console.error('Get my skills error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}