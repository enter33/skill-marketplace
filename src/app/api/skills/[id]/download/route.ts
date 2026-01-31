import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs/promises'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const skill = await prisma.skill.findUnique({
      where: { id }
    })
    
    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      )
    }
    
    // 增加下载计数
    await prisma.skill.update({
      where: { id },
      data: { downloadCount: { increment: 1 } }
    })
    
    // 读取文件
    const filePath = path.join(process.cwd(), 'uploads', 'skills', skill.filePath)
    const fileBuffer = await fs.readFile(filePath)
    
    // 返回文件
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${skill.name}.zip"`
      }
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}