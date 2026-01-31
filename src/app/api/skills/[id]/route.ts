import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin-auth'
import AdmZip from 'adm-zip'
import path from 'path'
import fs from 'fs/promises'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const skill = await prisma.skill.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            username: true
          }
        }
      }
    })
    
    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(skill)
  } catch (error) {
    console.error('Get skill error:', error)
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
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const skill = await prisma.skill.findUnique({
      where: { id }
    })

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      )
    }

    // 允许管理员或作者本人更新
    if (skill.authorId !== session.user.id && !isAdmin(session)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const bytes = await file.arrayBuffer()
    const fileName = `${Date.now()}-${file.name}`
    const uploadPath = path.join(process.cwd(), 'uploads', 'skills', fileName)
    await fs.writeFile(uploadPath, Buffer.from(bytes))

    const zip = new AdmZip(Buffer.from(bytes))
    const entries = zip.getEntries()
    const skillMdEntry = entries.find(entry => 
      entry.entryName.toLowerCase().endsWith('skill.md')
    )

    if (!skillMdEntry) {
      await fs.unlink(uploadPath)
      return NextResponse.json(
        { error: 'ZIP must contain SKILL.md file' },
        { status: 400 }
      )
    }

    const content = skillMdEntry.getData().toString('utf-8')
    const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
    
    if (!frontMatterMatch) {
      await fs.unlink(uploadPath)
      return NextResponse.json(
        { error: 'SKILL.md must contain valid frontmatter' },
        { status: 400 }
      )
    }

    const frontMatter = frontMatterMatch[1]
    const nameMatch = frontMatter.match(/^name:\s*(.+)/m)
    const descMatch = frontMatter.match(/^description:\s*(.+)/m)

    if (!nameMatch || !descMatch) {
      await fs.unlink(uploadPath)
      return NextResponse.json(
        { error: 'SKILL.md must contain name and description fields' },
        { status: 400 }
      )
    }

    const name = nameMatch[1].trim()
    const description = descMatch[1].trim()

    const updatedSkill = await prisma.skill.update({
      where: { id },
      data: {
        name,
        description,
        filePath: fileName,
        updatedAt: new Date().toISOString()
      }
    })

    await fs.unlink(path.join(process.cwd(), 'uploads', 'skills', skill.filePath))

    return NextResponse.json(updatedSkill)
  } catch (error) {
    console.error('Update skill error:', error)
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
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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

    // 允许管理员或作者本人删除
    if (skill.authorId !== session.user.id && !isAdmin(session)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    await fs.unlink(path.join(process.cwd(), 'uploads', 'skills', skill.filePath))

    await prisma.skill.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete skill error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
