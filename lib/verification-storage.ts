// 基于内存的简单数据库存储
// 在 Vercel 环境中，我们需要使用外部存储服务

interface VerificationCodeData {
  code: string
  expiresAt: number
}

// 使用一个简单的内存存储，但添加更多调试信息
const verificationCodesStore = new Map<string, VerificationCodeData>()

// 添加清理过期验证码的功能
function cleanupExpiredCodes() {
  const now = Date.now()
  console.log('Cleaning up expired codes, current time:', new Date(now).toISOString())
  
  for (const [email, data] of verificationCodesStore.entries()) {
    if (now > data.expiresAt) {
      console.log('Removing expired code for email:', email)
      verificationCodesStore.delete(email)
    }
  }
  
  console.log('After cleanup, remaining codes:', Array.from(verificationCodesStore.keys()))
}

// 定期清理过期验证码
setInterval(cleanupExpiredCodes, 60000) // 每分钟清理一次

export const verificationCodes = {
  get: (email: string) => {
    console.log('=== GET VERIFICATION CODE ===')
    console.log('Email:', email)
    console.log('Store size:', verificationCodesStore.size)
    console.log('All emails in store:', Array.from(verificationCodesStore.keys()))
    
    const data = verificationCodesStore.get(email)
    console.log('Retrieved data:', data)
    
    if (data) {
      const now = Date.now()
      const isExpired = now > data.expiresAt
      console.log('Current time:', new Date(now).toISOString())
      console.log('Expires at:', new Date(data.expiresAt).toISOString())
      console.log('Is expired:', isExpired)
      
      if (isExpired) {
        console.log('Code is expired, removing it')
        verificationCodesStore.delete(email)
        return undefined
      }
    }
    
    console.log('=== END GET ===')
    return data
  },
  
  set: (email: string, data: VerificationCodeData) => {
    console.log('=== SET VERIFICATION CODE ===')
    console.log('Email:', email)
    console.log('Code:', data.code)
    console.log('Expires at:', new Date(data.expiresAt).toISOString())
    
    verificationCodesStore.set(email, data)
    
    console.log('Store size after set:', verificationCodesStore.size)
    console.log('All emails in store:', Array.from(verificationCodesStore.keys()))
    console.log('=== END SET ===')
  },
  
  delete: (email: string) => {
    console.log('=== DELETE VERIFICATION CODE ===')
    console.log('Email:', email)
    
    const existed = verificationCodesStore.delete(email)
    console.log('Code existed:', existed)
    console.log('Store size after delete:', verificationCodesStore.size)
    console.log('All emails in store:', Array.from(verificationCodesStore.keys()))
    console.log('=== END DELETE ===')
  },
  
  keys: () => {
    const keys = Array.from(verificationCodesStore.keys())
    console.log('Getting all keys:', keys)
    return keys
  }
}
