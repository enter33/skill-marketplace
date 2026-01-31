import AdmZip from 'adm-zip'

describe('Debug ZIP', () => {
  test('应该正确创建和读取 ZIP 文件', () => {
    const zip = new AdmZip()
    zip.addFile('SKILL.md', Buffer.from('test content'))
    const zipBuffer = zip.toBuffer()

    console.log('ZIP Buffer length:', zipBuffer.length)
    console.log('ZIP Buffer first 20 bytes:', zipBuffer.slice(0, 20))

    const newZip = new AdmZip(zipBuffer)
    const entries = newZip.getEntries()

    console.log('Number of entries:', entries.length)
    entries.forEach((entry, index) => {
      console.log(`Entry ${index}:`, {
        name: entry.entryName,
        isDirectory: entry.isDirectory,
        size: entry.header.size
      })
    })

    expect(entries.length).toBeGreaterThan(0)
  })

  test('应该正确处理文件路径', () => {
    const zip = new AdmZip()
    zip.addFile('SKILL.md', Buffer.from('test content'))
    zip.addFile('subdir/SKILL.md', Buffer.from('nested content'))
    const zipBuffer = zip.toBuffer()

    const newZip = new AdmZip(zipBuffer)
    const entries = newZip.getEntries()

    console.log('All entries:')
    entries.forEach(entry => {
      console.log('Entry name:', entry.entryName)
    })

    const skillEntry = entries.find(entry => 
      entry.entryName === 'SKILL.md' || entry.entryName.endsWith('/SKILL.md')
    )

    expect(skillEntry).toBeDefined()
    if (skillEntry) {
      console.log('Found SKILL.md entry:', skillEntry.entryName)
    }
  })
})