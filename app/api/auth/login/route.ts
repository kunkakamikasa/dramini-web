import { NextRequest, NextResponse } from 'next/server'
import { users } from '@/lib/auth-storage'

export const dynamic = 'force-dynamic'

// 登录
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
    }
    
    // 查找用户
    const user = users.get(email)
    if (!user || user.password !== password) {
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
