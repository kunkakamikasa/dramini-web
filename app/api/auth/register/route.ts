import { NextRequest, NextResponse } from 'next/server'

// 简单的内存存储（生产环境应该使用数据库）
const users = new Map<string, { id: string; email: string; password: string; name: string; coins: number }>()

// 注册
export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()
    
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // 检查用户是否已存在
    if (users.has(email)) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }
    
    // 创建新用户
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    users.set(email, {
      id: userId,
      email,
      password, // 生产环境应该加密密码
      name,
      coins: 0
    })
    
    return NextResponse.json({
      userId,
      email,
      name,
      coins: 0
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
