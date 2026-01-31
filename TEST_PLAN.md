# Skill Marketplace 测试计划

## 测试范围

### 1. 单元测试 (Unit Tests)
- **lib/auth.ts** - 密码加密和验证
- **lib/skill-validator.ts** - Skill ZIP 文件验证
- **lib/prisma.ts** - 数据库连接

### 2. API 路由测试 (API Route Tests)
- **/api/auth/register** - 用户注册
- **/api/auth/[...nextauth]** - 用户登录/会话
- **/api/skills** - Skill 列表查询
- **/api/skills/upload** - Skill 上传
- **/api/skills/my** - 用户 Skill 管理
- **/api/skills/[id]** - Skill 详情/更新/删除

### 3. 集成测试 (Integration Tests)
- 完整的用户注册 -> 登录 -> 上传 -> 下载流程

### 4. E2E 测试 (End-to-End Tests)
- 使用 Playwright 进行浏览器自动化测试

---

## 详细测试用例

### 模块 1: 用户认证 (lib/auth.ts)

#### TC-AUTH-001: 密码哈希
**描述**: 验证密码哈希功能
**前置条件**: 无
**输入**: 明文密码 "password123"
**预期输出**: 
- 返回哈希字符串
- 哈希长度大于 0
- 哈希不等于原始密码

#### TC-AUTH-002: 密码验证成功
**描述**: 验证正确的密码通过验证
**前置条件**: 已生成哈希密码
**输入**: 原始密码 "password123", 哈希密码
**预期输出**: 返回 true

#### TC-AUTH-003: 密码验证失败
**描述**: 验证错误的密码不通过验证
**前置条件**: 已生成哈希密码
**输入**: 错误密码 "wrongpassword", 哈希密码
**预期输出**: 返回 false

#### TC-AUTH-004: 空密码哈希
**描述**: 验证空密码处理
**前置条件**: 无
**输入**: 空字符串 ""
**预期输出**: 返回哈希字符串（允许空密码哈希）

---

### 模块 2: Skill 验证 (lib/skill-validator.ts)

#### TC-VAL-001: 有效的 Skill ZIP
**描述**: 验证包含正确 SKILL.md 的 ZIP 文件
**前置条件**: 准备有效的 Skill ZIP 文件
**输入**: 包含 SKILL.md (name, description) 的 ZIP Buffer
**预期输出**: 
- valid: true
- errors: []
- metadata: { name, description }

#### TC-VAL-002: 缺少 SKILL.md
**描述**: 验证缺少 SKILL.md 的 ZIP 文件
**前置条件**: 准备缺少 SKILL.md 的 ZIP 文件
**输入**: 不含 SKILL.md 的 ZIP Buffer
**预期输出**: 
- valid: false
- errors: ["Missing required file: SKILL.md"]

#### TC-VAL-003: SKILL.md 缺少 name 字段
**描述**: 验证 SKILL.md 缺少 name 字段
**前置条件**: 准备 SKILL.md 缺少 name 的 ZIP 文件
**输入**: SKILL.md 只有 description 的 ZIP Buffer
**预期输出**: 
- valid: false
- errors: ["SKILL.md frontmatter missing required field: name"]

#### TC-VAL-004: SKILL.md 缺少 description 字段
**描述**: 验证 SKILL.md 缺少 description 字段
**前置条件**: 准备 SKILL.md 缺少 description 的 ZIP 文件
**输入**: SKILL.md 只有 name 的 ZIP Buffer
**预期输出**: 
- valid: false
- errors: ["SKILL.md frontmatter missing required field: description"]

#### TC-VAL-005: SKILL.md 缺少 frontmatter
**描述**: 验证 SKILL.md 没有 YAML frontmatter
**前置条件**: 准备没有 frontmatter 的 SKILL.md
**输入**: 没有 --- 标记的 SKILL.md 的 ZIP Buffer
**预期输出**: 
- valid: false
- errors: ["SKILL.md must contain YAML frontmatter between --- markers"]

#### TC-VAL-006: 无效的 YAML frontmatter
**描述**: 验证 SKILL.md 包含无效的 YAML
**前置条件**: 准备包含无效 YAML 的 SKILL.md
**输入**: YAML 语法错误的 SKILL.md 的 ZIP Buffer
**预期输出**: 
- valid: false
- errors: ["Invalid YAML frontmatter in SKILL.md"]

#### TC-VAL-007: 无效的 ZIP 格式
**描述**: 验证非 ZIP 文件格式
**前置条件**: 无
**输入**: 非 ZIP 格式的 Buffer
**预期输出**: 
- valid: false
- errors: ["Invalid ZIP file format"]

#### TC-VAL-008: 空的 ZIP 文件
**描述**: 验证空的 ZIP 文件
**前置条件**: 无
**输入**: 空的 ZIP Buffer
**预期输出**: 
- valid: false
- errors: ["Missing required file: SKILL.md"]

---

### 模块 3: API 路由 - 用户注册

#### TC-API-REG-001: 成功注册
**描述**: 使用有效数据注册新用户
**前置条件**: 数据库中不存在该邮箱
**输入**: 
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```
**预期输出**: 
- Status: 201
- Response: { id, username, email, createdAt }
- 数据库中存在该用户

#### TC-API-REG-002: 邮箱已存在
**描述**: 使用已存在的邮箱注册
**前置条件**: 数据库中已存在该邮箱
**输入**: 已存在的邮箱
**预期输出**: 
- Status: 400
- Response: { error: "Email already registered" }

#### TC-API-REG-003: 用户名已存在
**描述**: 使用已存在的用户名注册
**前置条件**: 数据库中已存在该用户名
**输入**: 已存在的用户名
**预期输出**: 
- Status: 400
- Response: { error: "Username already taken" }

#### TC-API-REG-004: 缺少必填字段
**描述**: 提交缺少必填字段的数据
**前置条件**: 无
**输入**: 
```json
{
  "username": "",
  "email": "",
  "password": ""
}
```
**预期输出**: 
- Status: 400
- Response: { error: "Missing required fields" }

#### TC-API-REG-005: 密码太短
**描述**: 提交少于 6 个字符的密码
**前置条件**: 无
**输入**: 密码 "12345"
**预期输出**: 
- Status: 400
- Response: { error: "Password must be at least 6 characters" }

#### TC-API-REG-006: 无效的邮箱格式
**描述**: 提交无效的邮箱格式
**前置条件**: 无
**输入**: 邮箱 "invalid-email"
**预期输出**: 
- Status: 400
- Response: { error: "Invalid email format" }

---

### 模块 4: API 路由 - 用户登录

#### TC-API-LOGIN-001: 成功登录
**描述**: 使用正确的凭据登录
**前置条件**: 用户已注册
**输入**: 
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
**预期输出**: 
- Status: 200
- 设置 session cookie
- Response: { user: { id, email, name } }

#### TC-API-LOGIN-002: 错误的密码
**描述**: 使用错误的密码登录
**前置条件**: 用户已注册
**输入**: 错误的密码
**预期输出**: 
- Status: 401
- Response: { error: "Invalid credentials" }

#### TC-API-LOGIN-003: 不存在的用户
**描述**: 使用不存在的邮箱登录
**前置条件**: 无
**输入**: 不存在的邮箱
**预期输出**: 
- Status: 401
- Response: { error: "Invalid credentials" }

#### TC-API-LOGIN-004: 缺少凭据
**描述**: 提交空的登录凭据
**前置条件**: 无
**输入**: 空的 email 和 password
**预期输出**: 
- Status: 400
- Response: { error: "Missing credentials" }

---

### 模块 5: API 路由 - Skill 上传

#### TC-API-UPLOAD-001: 成功上传 Skill
**描述**: 已登录用户上传有效的 Skill ZIP
**前置条件**: 用户已登录
**输入**: 
- 有效的 ZIP 文件
- 包含正确的 SKILL.md
**预期输出**: 
- Status: 201
- Response: { message, skill: { id, name, description, authorId } }
- 文件保存到 uploads/skills/
- 数据库创建记录

#### TC-API-UPLOAD-002: 未登录上传
**描述**: 未登录用户尝试上传
**前置条件**: 无 session
**输入**: 任意 ZIP 文件
**预期输出**: 
- Status: 401
- Response: { error: "Unauthorized" }

#### TC-API-UPLOAD-003: 上传非 ZIP 文件
**描述**: 上传非 ZIP 格式的文件
**前置条件**: 用户已登录
**输入**: .txt 文件
**预期输出**: 
- Status: 400
- Response: { error: "File must be a ZIP archive" }

#### TC-API-UPLOAD-004: 上传无效的 Skill 结构
**描述**: 上传缺少 SKILL.md 的 ZIP
**前置条件**: 用户已登录
**输入**: 缺少 SKILL.md 的 ZIP
**预期输出**: 
- Status: 400
- Response: { error: "Invalid skill structure", details: [...] }

#### TC-API-UPLOAD-005: 没有提供文件
**描述**: 请求中没有文件
**前置条件**: 用户已登录
**输入**: 空的 formData
**预期输出**: 
- Status: 400
- Response: { error: "No file provided" }

---

### 模块 6: API 路由 - 获取用户 Skills

#### TC-API-MY-001: 获取已登录用户的 Skills
**描述**: 已登录用户获取自己的 Skills 列表
**前置条件**: 用户已登录，有已上传的 Skills
**输入**: 无
**预期输出**: 
- Status: 200
- Response: { skills: [...] }

#### TC-API-MY-002: 未登录获取 Skills
**描述**: 未登录用户尝试获取 Skills
**前置条件**: 无 session
**输入**: 无
**预期输出**: 
- Status: 401
- Response: { error: "Unauthorized" }

#### TC-API-MY-003: 获取空的 Skills 列表
**描述**: 用户没有上传任何 Skill
**前置条件**: 用户已登录，无 Skills
**输入**: 无
**预期输出**: 
- Status: 200
- Response: { skills: [] }

---

### 模块 7: API 路由 - Skill 详情

#### TC-API-DETAIL-001: 获取存在的 Skill 详情
**描述**: 获取存在的 Skill 详情
**前置条件**: Skill 存在
**输入**: Skill ID
**预期输出**: 
- Status: 200
- Response: { id, name, description, author: { username } }

#### TC-API-DETAIL-002: 获取不存在的 Skill
**描述**: 获取不存在的 Skill 详情
**前置条件**: 无
**输入**: 不存在的 Skill ID
**预期输出**: 
- Status: 404
- Response: { error: "Skill not found" }

---

### 模块 8: API 路由 - 更新 Skill

#### TC-API-UPDATE-001: 成功更新 Skill
**描述**: 作者更新自己的 Skill
**前置条件**: 用户已登录，是 Skill 作者
**输入**: 
- Skill ID
- 新的 ZIP 文件
**预期输出**: 
- Status: 200
- Response: 更新后的 Skill 对象
- 旧文件被替换

#### TC-API-UPDATE-002: 未登录更新
**描述**: 未登录用户尝试更新
**前置条件**: 无 session
**输入**: Skill ID
**预期输出**: 
- Status: 401
- Response: { error: "Unauthorized" }

#### TC-API-UPDATE-003: 更新他人的 Skill
**描述**: 非作者尝试更新 Skill
**前置条件**: 用户已登录，不是 Skill 作者
**输入**: 他人的 Skill ID
**预期输出**: 
- Status: 403
- Response: { error: "Forbidden" }

#### TC-API-UPDATE-004: 更新不存在的 Skill
**描述**: 更新不存在的 Skill
**前置条件**: 用户已登录
**输入**: 不存在的 Skill ID
**预期输出**: 
- Status: 404
- Response: { error: "Skill not found" }

---

### 模块 9: API 路由 - 删除 Skill

#### TC-API-DELETE-001: 成功删除 Skill
**描述**: 作者删除自己的 Skill
**前置条件**: 用户已登录，是 Skill 作者
**输入**: Skill ID
**预期输出**: 
- Status: 200
- Response: { message: "Skill deleted successfully" }
- 数据库记录删除
- 文件被删除

#### TC-API-DELETE-002: 未登录删除
**描述**: 未登录用户尝试删除
**前置条件**: 无 session
**输入**: Skill ID
**预期输出**: 
- Status: 401
- Response: { error: "Unauthorized" }

#### TC-API-DELETE-003: 删除他人的 Skill
**描述**: 非作者尝试删除 Skill
**前置条件**: 用户已登录，不是 Skill 作者
**输入**: 他人的 Skill ID
**预期输出**: 
- Status: 403
- Response: { error: "Forbidden" }

#### TC-API-DELETE-004: 删除不存在的 Skill
**描述**: 删除不存在的 Skill
**前置条件**: 用户已登录
**输入**: 不存在的 Skill ID
**预期输出**: 
- Status: 404
- Response: { error: "Skill not found" }

---

### 模块 10: API 路由 - Skill 列表

#### TC-API-LIST-001: 获取 Skill 列表
**描述**: 获取公开的 Skill 列表
**前置条件**: 有已上传的 Skills
**输入**: 无
**预期输出**: 
- Status: 200
- Response: { skills: [...], total, page, limit }

#### TC-API-LIST-002: 搜索 Skills
**描述**: 使用关键词搜索 Skills
**前置条件**: 有匹配的 Skills
**输入**: query="test"
**预期输出**: 
- Status: 200
- Response: { skills: [...] } (过滤后的结果)

#### TC-API-LIST-003: 分页获取
**描述**: 获取分页的 Skills
**前置条件**: 有足够的 Skills
**输入**: page=2&limit=10
**预期输出**: 
- Status: 200
- Response: { skills: [...], total, page: 2, limit: 10 }

---

## 测试工具配置

### 使用的测试框架
- **Jest** - 单元测试和 API 测试
- **@testing-library/react** - React 组件测试
- **Playwright** - E2E 测试

### 测试环境
- **Node.js** 20+
- **SQLite** (内存数据库用于测试)
- **Next.js** Test Environment

### 覆盖率目标
- 语句覆盖率: > 80%
- 分支覆盖率: > 75%
- 函数覆盖率: > 80%
- 行覆盖率: > 80%

---

## 测试数据准备

### 测试用户
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

### 测试 Skill ZIP 文件
- **valid-skill.zip** - 包含正确 SKILL.md 的有效 Skill
- **missing-skill-md.zip** - 缺少 SKILL.md
- **invalid-yaml.zip** - SKILL.md 包含无效 YAML
- **missing-name.zip** - SKILL.md 缺少 name 字段
- **missing-description.zip** - SKILL.md 缺少 description 字段

---

## 执行计划

### 阶段 1: 单元测试
1. lib/auth.test.ts
2. lib/skill-validator.test.ts

### 阶段 2: API 路由测试
1. api/auth/register.test.ts
2. api/skills/upload.test.ts
3. api/skills/my.test.ts
4. api/skills/[id].test.ts

### 阶段 3: 集成测试
1. 完整用户流程测试

### 阶段 4: E2E 测试
1. 使用 Playwright 进行浏览器测试
