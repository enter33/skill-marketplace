import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import AdmZip from 'adm-zip'
import path from 'path'
import fs from 'fs/promises'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')
    
    const skill = await prisma.skill.findUnique({
      where: { id }
    })
    
    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      )
    }
    
    // 读取 ZIP 文件
    const zipPath = path.join(process.cwd(), 'uploads', 'skills', skill.filePath)
    const zipBuffer = await fs.readFile(zipPath)
    const zip = new AdmZip(zipBuffer)
    
    // 如果指定了文件路径，返回文件内容
    if (filePath) {
      const entry = zip.getEntry(filePath)
      if (!entry) {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        )
      }
      
      const content = entry.getData().toString('utf-8')
      return NextResponse.json({ path: filePath, content })
    }
    
    // 否则返回文件目录树
    const entries = zip.getEntries()
    const files = entries.map(entry => ({
      path: entry.entryName,
      isDirectory: entry.isDirectory,
      size: entry.header.size
    }))
    
    return NextResponse.json({ files })
  } catch (error) {
    console.error('Get files error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}