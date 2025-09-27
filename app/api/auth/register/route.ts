import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// 简单的内存存储（生产环境应该使用数据库）
const users = new Map<string, { id: string; email: string; password: string; name: string; coins: number }>()

// 注册
export async function POST(request: NextRequest) {
  try {
    const { email, password, name, verificationCode } = await request.json()
    
    if (!email || !password || !name || !verificationCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // 验证验证码
    const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_WEB_BASE_URL || 'http://localhost:3000'}/api/auth/verify-email`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code: verificationCode }),
    })

    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json()
      return NextResponse.json({ error: errorData.error || 'Invalid verification code' }, { status: 400 })
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
