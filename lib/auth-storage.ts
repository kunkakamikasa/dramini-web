import { verificationCodes } from './kv-storage'
import { PrismaClient } from '@prisma/client'

// 创建 Prisma 客户端
const prisma = new PrismaClient()

// 用户存储接口
export interface UserData {
  id: string
  email: string
  name: string
  coins: number
}

// 用户存储（使用数据库）
export const users = {
  async create(userData: { email: string; password: string; name: string }): Promise<UserData> {
    try {
      console.log('Creating user in database:', userData.email)
      
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: userData.password, // 注意：生产环境应该加密密码
          name: userData.name,
          provider: 'email',
          status: 'ACTIVE'
        }
      })
      
      console.log('User created successfully:', user.id)
      
      // 创建用户金币记录
      await prisma.userCoins.create({
        data: {
          userId: user.id,
          balance: 0
        }
      })
      
      return {
        id: user.id,
        email: user.email,
        name: user.name || '',
        coins: 0
      }
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  },
  
  async findByEmail(email: string): Promise<UserData | null> {
    try {
      console.log('Finding user by email:', email)
      
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          // 这里需要关联 UserCoins，但 Prisma schema 中没有这个关系
          // 我们需要单独查询
        }
      })
      
      if (!user) {
        console.log('User not found')
        return null
      }
      
      // 查询用户金币余额
      const userCoins = await prisma.userCoins.findUnique({
        where: { userId: user.id }
      })
      
      console.log('User found:', user.id)
      
      return {
        id: user.id,
        email: user.email,
        name: user.name || '',
        coins: userCoins?.balance || 0
      }
    } catch (error) {
      console.error('Error finding user:', error)
      return null
    }
  },
  
  async updateCoins(userId: string, coins: number): Promise<void> {
    try {
      console.log('Updating user coins:', userId, coins)
      
      await prisma.userCoins.upsert({
        where: { userId },
        update: { balance: coins },
        create: { userId, balance: coins }
      })
      
      console.log('User coins updated successfully')
    } catch (error) {
      console.error('Error updating user coins:', error)
      throw error
    }
  }
}

// 导出验证码存储
export { verificationCodes }
