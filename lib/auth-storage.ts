import { verificationCodes } from './kv-storage'

// 用户存储接口
export interface UserData {
  id: string
  email: string
  name: string
  coins: number
}

// 用户存储（通过API调用）
export const users = {
  async create(userData: { email: string; password: string; name: string }): Promise<UserData> {
    try {
      console.log('Creating user via API:', userData.email)
      
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://dramini-api.onrender.com/api/v1'
      const response = await fetch(`${apiBase}/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      })
      
      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`)
      }
      
      const newUser = await response.json()
      console.log('User created successfully via API:', newUser.id)
      
      return {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name || '',
        coins: newUser.coins || 0
      }
    } catch (error) {
      console.error('Error creating user via API:', error)
      throw error
    }
  },
  
  async findByEmail(email: string): Promise<UserData | null> {
    try {
      console.log('Finding user by email via API:', email)
      
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://dramini-api.onrender.com/api/v1'
      const response = await fetch(`${apiBase}/user/find-by-email?email=${encodeURIComponent(email)}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('User not found')
          return null
        }
        throw new Error(`API call failed: ${response.status}`)
      }
      
      const user = await response.json()
      console.log('User found via API:', user.id)
      
      return {
        id: user.id,
        email: user.email,
        name: user.name || '',
        coins: user.coins || 0
      }
    } catch (error) {
      console.error('Error finding user via API:', error)
      return null
    }
  },
  
  async updateCoins(userId: string, coins: number): Promise<void> {
    try {
      console.log('Updating user coins via API:', userId, coins)
      
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://dramini-api.onrender.com/api/v1'
      const response = await fetch(`${apiBase}/user/${userId}/coins`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coins })
      })
      
      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`)
      }
      
      console.log('User coins updated successfully via API')
    } catch (error) {
      console.error('Error updating user coins via API:', error)
      throw error
    }
  }
}

// 导出验证码存储
export { verificationCodes }
