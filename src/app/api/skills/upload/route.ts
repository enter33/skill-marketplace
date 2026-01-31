import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateSkillZip } from '@/lib/skill-validator'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!file.name.endsWith('.zip')) {
      return NextResponse.json(
        { error: 'File must be a ZIP archive' },
        { status: 400 }
      )
    }

    // 读取文件内容
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // 验证 Skill 结构
    const validation = validateSkillZip(buffer)
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid skill structure', details: validation.errors },
        { status: 400 }
      )
    }

    // 确保上传目录存在
    const uploadDir = path.join(process.cwd(), 'uploads', 'skills')
    await fs.mkdir(uploadDir, { recursive: true })
    
    // 生成唯一文件名
    const skillId = crypto.randomUUID()
    const fileName = `${skillId}.zip`
    const filePath = path.join(uploadDir, fileName)
    
    // 保存文件
    await fs.writeFile(filePath, buffer)
    
    // 创建数据库记录
    const skill = await prisma.skill.create({
      data: {
        id: skillId,
        name: validation.metadata!.name,
        description: validation.metadata!.description,
        filePath: fileName,
        authorId: session.user.id
      }
    })

    return NextResponse.json(
      { message: 'Skill uploaded successfully', skill },
      { status: 201 }
    )
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}