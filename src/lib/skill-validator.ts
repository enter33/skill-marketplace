import AdmZip from 'adm-zip'
import yaml from 'js-yaml'

export interface SkillValidationResult {
  valid: boolean
  errors: string[]
  metadata?: {
    name: string
    description: string
  }
}

export function validateSkillZip(zipBuffer: Buffer): SkillValidationResult {
  const errors: string[] = []

  try {
    // 尝试创建 ZIP 实例
    let zip: AdmZip
    try {
      zip = new AdmZip(zipBuffer)
    } catch (e) {
      errors.push('Invalid ZIP file format')
      return { valid: false, errors }
    }

    // 读取 ZIP 条目
    const entries = zip.getEntries()

    // 检查是否有任何条目
    if (!entries || entries.length === 0) {
      errors.push('Missing required file: SKILL.md')
      return { valid: false, errors }
    }

    // 查找 SKILL.md 文件
    const skillEntry = entries.find(entry => {
      const entryName = entry.entryName
      return entryName === 'SKILL.md' || entryName.endsWith('/SKILL.md')
    })

    if (!skillEntry) {
      errors.push('Missing required file: SKILL.md')
      return { valid: false, errors }
    }

    // 读取 SKILL.md 内容
    let content: string
    try {
      const data = skillEntry.getData()
      if (!data || data.length === 0) {
        errors.push('SKILL.md is empty')
        return { valid: false, errors }
      }
      content = data.toString('utf-8')
    } catch (e) {
      errors.push('Failed to read SKILL.md content')
      return { valid: false, errors }
    }

    // 解析 YAML frontmatter
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)

    if (!frontmatterMatch) {
      errors.push('SKILL.md must contain YAML frontmatter between --- markers')
      return { valid: false, errors }
    }

    const [, frontmatter] = frontmatterMatch

    let metadata: any
    try {
      metadata = yaml.load(frontmatter)
    } catch (e) {
      errors.push('Invalid YAML frontmatter in SKILL.md')
      return { valid: false, errors }
    }

    // 验证必需字段
    if (!metadata?.name || metadata.name.trim() === '') {
      errors.push('SKILL.md frontmatter missing required field: name')
    }

    if (!metadata?.description || metadata.description.trim() === '') {
      errors.push('SKILL.md frontmatter missing required field: description')
    }

    if (errors.length > 0) {
      return { valid: false, errors }
    }

    return {
      valid: true,
      errors: [],
      metadata: {
        name: metadata.name.trim(),
        description: metadata.description.trim()
      }
    }

  } catch (error) {
    errors.push('Invalid ZIP file format')
    return { valid: false, errors }
  }
}
