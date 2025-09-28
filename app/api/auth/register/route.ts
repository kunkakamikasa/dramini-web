import { NextRequest, NextResponse } from 'next/server'
import { users, verificationCodes } from '@/lib/auth-storage'

export const dynamic = 'force-dynamic'

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
    console.log('Registration attempt for email:', email)
    console.log('Verification code provided:', verificationCode)
    console.log('Current verification codes in storage:', await verificationCodes.keys())
    
    const storedData = await verificationCodes.get(email)
    console.log('Stored data for email:', storedData)
    
    if (!storedData) {
      console.log('Verification code not found for email:', email)
      return NextResponse.json({ error: 'Verification code not found' }, { status: 400 })
    }

    if (Date.now() > storedData.expiresAt) {
      await verificationCodes.delete(email)
      return NextResponse.json({ error: 'Verification code expired' }, { status: 400 })
    }

    if (storedData.code !== verificationCode) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
    }

    // 验证成功，删除验证码
    await verificationCodes.delete(email)
    
    // 检查用户是否已存在
    const existingUser = await users.findByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }
    
    // 创建新用户
    const newUser = await users.create({
      email,
      password, // 生产环境应该加密密码
      name
    })
    
    return NextResponse.json({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      coins: newUser.coins
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
