import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// 获取用户资料 - 通过后端API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    console.log('🔍 Profile API called with userId:', userId)
    
    if (!userId) {
      console.log('❌ Missing userId parameter')
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }
    
    // 调用后端API获取用户资料
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://dramini-api.onrender.com/api/v1'
    console.log('🔍 Calling backend API:', `${apiBase}/user/profile?userId=${userId}`)
    
    const response = await fetch(`${apiBase}/user/profile?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      console.log('❌ Backend API error:', errorData)
      return NextResponse.json({ 
        error: 'Failed to get profile from backend',
        details: errorData.error || `HTTP ${response.status}`
      }, { status: response.status })
    }
    
    const userData = await response.json()
    console.log('✅ Backend API response:', userData)
    
    return NextResponse.json(userData)
    
  } catch (error) {
    console.error('❌ Get profile error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json({ 
      error: 'Failed to get profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
