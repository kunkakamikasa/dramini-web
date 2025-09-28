import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// 登录 - 直接调用API端点
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
    }
    
    console.log('Login attempt for email:', email)
    
    // 调用API的登录端点
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://dramini-api.onrender.com'
    const response = await fetch(`${apiBase}/api/v1/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      console.log('API login failed:', errorData)
      return NextResponse.json({ error: errorData.error || 'Login failed' }, { status: response.status })
    }
    
    const data = await response.json()
    console.log('API login successful:', data.user.id)
    
    return NextResponse.json({
      userId: data.user.id,
      email: data.user.email,
      name: data.user.name,
      coins: data.user.coins
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
