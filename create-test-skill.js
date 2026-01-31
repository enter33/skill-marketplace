const AdmZip = require('adm-zip');

const zip = new AdmZip();

const skillMd = `---
name: Test Skill E2E
description: This is a test skill for E2E testing
---

# Test Skill E2E

This is the body content for testing.
`;

zip.addFile('SKILL.md', Buffer.from(skillMd));
zip.writeZip('test-skill.zip');

console.log('Created test-skill.zip');
