import { kv } from '@vercel/kv'

interface VerificationCodeData {
  code: string
  expiresAt: number
}

// 验证码存储键前缀
const VERIFICATION_CODE_PREFIX = 'verification_code:'

// 内存存储作为fallback
const memoryStorage = new Map<string, VerificationCodeData>()

// 验证码存储（使用 Vercel KV，fallback到内存）
export const verificationCodes = {
  async get(email: string): Promise<VerificationCodeData | undefined> {
    try {
      console.log('=== KV GET VERIFICATION CODE ===')
      console.log('Email:', email)
      
      // 首先尝试从KV获取
      const key = `${VERIFICATION_CODE_PREFIX}${email}`
      console.log('KV Key:', key)
      
      let data: VerificationCodeData | undefined
      
      try {
        const kvData = await kv.get<VerificationCodeData>(key)
        data = kvData || undefined
        console.log('Retrieved data from KV:', data)
      } catch (kvError) {
        console.log('KV not available, falling back to memory storage')
        data = memoryStorage.get(email)
        console.log('Retrieved data from memory:', data)
      }
      
      if (data) {
        const now = Date.now()
        const isExpired = now > data.expiresAt
        console.log('Current time:', new Date(now).toISOString())
        console.log('Expires at:', new Date(data.expiresAt).toISOString())
        console.log('Is expired:', isExpired)
        
        if (isExpired) {
          console.log('Code is expired, removing it')
          try {
            await kv.del(key)
          } catch (kvError) {
            memoryStorage.delete(email)
          }
          return undefined
        }
      }
      
      console.log('=== END KV GET ===')
      return data || undefined
    } catch (error) {
      console.error('Error getting verification code:', error)
      // Fallback to memory storage
      const data = memoryStorage.get(email)
      if (data && Date.now() > data.expiresAt) {
        memoryStorage.delete(email)
        return undefined
      }
      return data || undefined
    }
  },
  
  async set(email: string, data: VerificationCodeData): Promise<void> {
    try {
      console.log('=== KV SET VERIFICATION CODE ===')
      console.log('Email:', email)
      console.log('Code:', data.code)
      console.log('Expires at:', new Date(data.expiresAt).toISOString())
      
      const key = `${VERIFICATION_CODE_PREFIX}${email}`
      console.log('KV Key:', key)
      
      // 设置过期时间为 5 分钟
      const ttl = Math.floor((data.expiresAt - Date.now()) / 1000)
      console.log('TTL (seconds):', ttl)
      
      try {
        await kv.setex(key, ttl, data)
        console.log('Successfully stored in KV')
      } catch (kvError) {
        console.log('KV not available, storing in memory')
        memoryStorage.set(email, data)
        console.log('Successfully stored in memory')
      }
      
      console.log('=== END KV SET ===')
    } catch (error) {
      console.error('Error setting verification code:', error)
      // Fallback to memory storage
      memoryStorage.set(email, data)
      console.log('Fallback: stored in memory')
    }
  },
  
  async delete(email: string): Promise<void> {
    try {
      console.log('=== KV DELETE VERIFICATION CODE ===')
      console.log('Email:', email)
      
      const key = `${VERIFICATION_CODE_PREFIX}${email}`
      console.log('KV Key:', key)
      
      try {
        const deleted = await kv.del(key)
        console.log('Deleted count from KV:', deleted)
      } catch (kvError) {
        console.log('KV not available, deleting from memory')
        memoryStorage.delete(email)
        console.log('Deleted from memory')
      }
      
      console.log('=== END KV DELETE ===')
    } catch (error) {
      console.error('Error deleting verification code:', error)
      // Fallback to memory storage
      memoryStorage.delete(email)
      console.log('Fallback: deleted from memory')
    }
  },
  
  async keys(): Promise<string[]> {
    try {
      console.log('=== KV GET ALL KEYS ===')
      
      const pattern = `${VERIFICATION_CODE_PREFIX}*`
      console.log('Pattern:', pattern)
      
      try {
        const keys = await kv.keys(pattern)
        console.log('Found keys in KV:', keys)
        
        // 移除前缀，只返回邮箱
        const emails = keys.map(key => key.replace(VERIFICATION_CODE_PREFIX, ''))
        console.log('Emails from KV:', emails)
        console.log('=== END KV GET ALL KEYS ===')
        
        return emails
      } catch (kvError) {
        console.log('KV not available, getting keys from memory')
        const emails = Array.from(memoryStorage.keys())
        console.log('Emails from memory:', emails)
        console.log('=== END KV GET ALL KEYS ===')
        
        return emails
      }
    } catch (error) {
      console.error('Error getting keys:', error)
      // Fallback to memory storage
      const emails = Array.from(memoryStorage.keys())
      console.log('Fallback: emails from memory:', emails)
      return emails
    }
  }
}
