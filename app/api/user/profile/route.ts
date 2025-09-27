import { NextRequest, NextResponse } from 'next/server'

// 简单的内存存储（生产环境应该使用数据库）
const users = new Map<string, { id: string; email: string; password: string; name: string; coins: number }>()

// 获取用户资料
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }
    
    // 查找用户（这里简化处理，实际应该从数据库查询）
    const user = Array.from(users.values()).find(u => u.id === userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      coins: user.coins,
      watchHistory: [] // 这里应该从数据库获取观看历史
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: 'Failed to get profile' }, { status: 500 })
  }
}
