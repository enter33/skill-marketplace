import { validateSkillZip } from '../skill-validator'
import AdmZip from 'adm-zip'

describe('Skill Validator', () => {
  // 辅助函数：创建 ZIP Buffer
  const createZipBuffer = (files: { name: string; content: string }[]): Buffer => {
    const zip = new AdmZip()

    files.forEach(file => {
      zip.addFile(file.name, Buffer.from(file.content))
    })

    // 使用 writeZip 到内存
    const zipData = zip.toBuffer()
    return zipData
  }

  describe('TC-VAL-001: 有效的 Skill ZIP', () => {
    test('应该验证包含正确 SKILL.md 的 ZIP', () => {
      const skillMd = `---
name: Test Skill
description: This is a test skill
---

# Test Skill

This is the body content.
`
      const zipBuffer = createZipBuffer([
        { name: 'SKILL.md', content: skillMd }
      ])

      const result = validateSkillZip(zipBuffer)

      expect(result.valid).toBe(true)
      expect(result.name).toBe('Test Skill')
      expect(result.description).toBe('This is a test skill')
    })

    test('应该处理包含额外文件的 ZIP', () => {
      const skillMd = `---
name: Test Skill
description: This is a test skill
---

# Test Skill
`
      const zipBuffer = createZipBuffer([
        { name: 'SKILL.md', content: skillMd },
        { name: 'readme.md', content: '# Readme' },
        { name: 'src/index.ts', content: 'console.log("hello")' }
      ])

      const result = validateSkillZip(zipBuffer)

      expect(result.valid).toBe(true)
      expect(result.name).toBe('Test Skill')
      expect(result.description).toBe('This is a test skill')
    })
  })

  describe('TC-VAL-002: 缺少 SKILL.md', () => {
    test('应该拒绝没有 SKILL.md 的 ZIP', () => {
      const zipBuffer = createZipBuffer([
        { name: 'readme.md', content: '# Readme' }
      ])

      const result = validateSkillZip(zipBuffer)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Missing required file: SKILL.md')
    })
  })

  describe('TC-VAL-003: SKILL.md 缺少 name 字段', () => {
    test('应该拒绝缺少 name 的 SKILL.md', () => {
      const skillMd = `---
description: This is a test skill
---

# Test Skill
`
      const zipBuffer = createZipBuffer([
        { name: 'SKILL.md', content: skillMd }
      ])

      const result = validateSkillZip(zipBuffer)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('SKILL.md frontmatter missing required field: name')
    })
  })

  describe('TC-VAL-004: SKILL.md 缺少 description 字段', () => {
    test('应该拒绝缺少 description 的 SKILL.md', () => {
      const skillMd = `---
name: Test Skill
---

# Test Skill
`
      const zipBuffer = createZipBuffer([
        { name: 'SKILL.md', content: skillMd }
      ])

      const result = validateSkillZip(zipBuffer)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('SKILL.md frontmatter missing required field: description')
    })
  })

  describe('TC-VAL-005: SKILL.md 缺少 frontmatter', () => {
    test('应该拒绝没有 frontmatter 的 SKILL.md', () => {
      const skillMd = `# Test Skill

This skill has no frontmatter.
`
      const zipBuffer = createZipBuffer([
        { name: 'SKILL.md', content: skillMd }
      ])

      const result = validateSkillZip(zipBuffer)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('SKILL.md must contain YAML frontmatter between --- markers')
    })
  })

  describe('TC-VAL-006: 无效的 YAML frontmatter', () => {
    test('应该拒绝格式错误的 YAML', () => {
      const skillMd = `---
name: Test Skill
description: "unclosed quote
---

# Test Skill
`
      const zipBuffer = createZipBuffer([
        { name: 'SKILL.md', content: skillMd }
      ])

      const result = validateSkillZip(zipBuffer)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid YAML frontmatter in SKILL.md')
    })
  })

  describe('TC-VAL-007: 无效的 ZIP 格式', () => {
    test('应该拒绝非 ZIP 格式的 Buffer', () => {
      const invalidBuffer = Buffer.from('This is not a zip file')

      const result = validateSkillZip(invalidBuffer)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid ZIP file format')
    })

    test('应该拒绝损坏的 ZIP', () => {
      const corruptedZip = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x00, 0x00])

      const result = validateSkillZip(corruptedZip)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid ZIP file format')
    })
  })

  describe('Edge Cases', () => {
    test('应该处理包含多个 --- 的 SKILL.md', () => {
      const skillMd = `---
name: Test Skill
description: This is a test skill
---

# Test Skill

---

Some content with --- in it
`
      const zipBuffer = createZipBuffer([
        { name: 'SKILL.md', content: skillMd }
      ])

      const result = validateSkillZip(zipBuffer)

      expect(result.valid).toBe(true)
      expect(result.name).toBe('Test Skill')
      expect(result.description).toBe('This is a test skill')
    })
  })
})
