import { kv } from '@vercel/kv'

interface VerificationCodeData {
  code: string
  expiresAt: number
}

// 验证码存储键前缀
const VERIFICATION_CODE_PREFIX = 'verification_code:'

// 验证码存储（使用 Vercel KV）
export const verificationCodes = {
  async get(email: string): Promise<VerificationCodeData | undefined> {
    try {
      console.log('=== KV GET VERIFICATION CODE ===')
      console.log('Email:', email)
      
      const key = `${VERIFICATION_CODE_PREFIX}${email}`
      console.log('KV Key:', key)
      
      const data = await kv.get<VerificationCodeData>(key)
      console.log('Retrieved data from KV:', data)
      
      if (data) {
        const now = Date.now()
        const isExpired = now > data.expiresAt
        console.log('Current time:', new Date(now).toISOString())
        console.log('Expires at:', new Date(data.expiresAt).toISOString())
        console.log('Is expired:', isExpired)
        
        if (isExpired) {
          console.log('Code is expired, removing it from KV')
          await kv.del(key)
          return undefined
        }
      }
      
      console.log('=== END KV GET ===')
      return data || undefined
    } catch (error) {
      console.error('Error getting verification code from KV:', error)
      return undefined
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
      
      await kv.setex(key, ttl, data)
      console.log('Successfully stored in KV')
      console.log('=== END KV SET ===')
    } catch (error) {
      console.error('Error setting verification code in KV:', error)
      throw error
    }
  },
  
  async delete(email: string): Promise<void> {
    try {
      console.log('=== KV DELETE VERIFICATION CODE ===')
      console.log('Email:', email)
      
      const key = `${VERIFICATION_CODE_PREFIX}${email}`
      console.log('KV Key:', key)
      
      const deleted = await kv.del(key)
      console.log('Deleted count:', deleted)
      console.log('=== END KV DELETE ===')
    } catch (error) {
      console.error('Error deleting verification code from KV:', error)
      throw error
    }
  },
  
  async keys(): Promise<string[]> {
    try {
      console.log('=== KV GET ALL KEYS ===')
      
      const pattern = `${VERIFICATION_CODE_PREFIX}*`
      console.log('Pattern:', pattern)
      
      const keys = await kv.keys(pattern)
      console.log('Found keys:', keys)
      
      // 移除前缀，只返回邮箱
      const emails = keys.map(key => key.replace(VERIFICATION_CODE_PREFIX, ''))
      console.log('Emails:', emails)
      console.log('=== END KV GET ALL KEYS ===')
      
      return emails
    } catch (error) {
      console.error('Error getting keys from KV:', error)
      return []
    }
  }
}
