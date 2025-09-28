import fs from 'fs'
import path from 'path'

// 验证码存储文件路径
const VERIFICATION_CODES_FILE = path.join(process.cwd(), 'verification-codes.json')

// 共享的认证存储（生产环境应该使用数据库）
export const users = new Map<string, { id: string; email: string; password: string; name: string; coins: number }>()

// 验证码存储接口
interface VerificationCodeData {
  code: string
  expiresAt: number
}

// 从文件读取验证码
function loadVerificationCodes(): Map<string, VerificationCodeData> {
  try {
    if (fs.existsSync(VERIFICATION_CODES_FILE)) {
      const data = fs.readFileSync(VERIFICATION_CODES_FILE, 'utf8')
      const parsed = JSON.parse(data)
      return new Map(Object.entries(parsed))
    }
  } catch (error) {
    console.error('Error loading verification codes:', error)
  }
  return new Map()
}

// 保存验证码到文件
function saveVerificationCodes(codes: Map<string, VerificationCodeData>) {
  try {
    const data = Object.fromEntries(codes)
    fs.writeFileSync(VERIFICATION_CODES_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error saving verification codes:', error)
  }
}

// 验证码存储（使用文件系统）
export const verificationCodes = {
  get: (email: string) => {
    const codes = loadVerificationCodes()
    return codes.get(email)
  },
  set: (email: string, data: VerificationCodeData) => {
    const codes = loadVerificationCodes()
    codes.set(email, data)
    saveVerificationCodes(codes)
  },
  delete: (email: string) => {
    const codes = loadVerificationCodes()
    codes.delete(email)
    saveVerificationCodes(codes)
  },
  keys: () => {
    const codes = loadVerificationCodes()
    return Array.from(codes.keys())
  }
}
