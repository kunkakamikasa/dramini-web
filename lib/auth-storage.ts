import { verificationCodes } from './kv-storage'

// 共享的认证存储（生产环境应该使用数据库）
export const users = new Map<string, { id: string; email: string; password: string; name: string; coins: number }>()

// 导出验证码存储
export { verificationCodes }
