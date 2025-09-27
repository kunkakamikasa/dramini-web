// 共享的认证存储（生产环境应该使用数据库）
export const users = new Map<string, { id: string; email: string; password: string; name: string; coins: number }>()
export const verificationCodes = new Map<string, { code: string; expiresAt: number }>()

// 清理过期的验证码
export function cleanupExpiredCodes() {
  const now = Date.now()
  for (const [email, data] of verificationCodes.entries()) {
    if (now > data.expiresAt) {
      verificationCodes.delete(email)
    }
  }
}

// 定期清理过期验证码（每5分钟）
setInterval(cleanupExpiredCodes, 5 * 60 * 1000)
