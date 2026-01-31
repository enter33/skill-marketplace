import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '6')
    const skip = (page - 1) * limit
    
    // 排序参数
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // 验证排序字段
    const validSortFields = ['createdAt', 'downloadCount']
    const validSortOrders = ['asc', 'desc']
    
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt'
    const orderByDirection = validSortOrders.includes(sortOrder) ? sortOrder : 'desc'
    
    // 构建查询条件
    // 注意：SQLite 默认不区分大小写，所以不需要 mode 参数
    // Prisma 的 count() 方法不支持 mode 参数
    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } }
          ]
        }
      : {}
    
    // 获取总数
    const total = await prisma.skill.count({ where })
    
    // 获取 Skill 列表
    const skills = await prisma.skill.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [orderByField]: orderByDirection },
      include: {
        author: {
          select: {
            username: true
          }
        }
      }
    })
    
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