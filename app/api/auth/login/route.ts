import { NextRequest, NextResponse } from 'next/server'
import { users } from '@/lib/auth-storage'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

// 登录
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
    }
    
    // 查找用户
    const user = await users.findByEmail(email)
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    // 验证密码（这里需要从数据库获取密码进行比较）
    // 注意：这里简化了密码验证，生产环境应该使用加密密码
    const dbUser = await prisma.user.findUnique({
      where: { email },
      select: { password: true }
    })
    
    if (!dbUser || dbUser.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    return NextResponse.json({
      userId: user.id,
      email: user.email,
      name: user.name,
      coins: user.coins
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
