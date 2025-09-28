import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

// 获取用户资料
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    console.log('🔍 Profile API called with userId:', userId)
    
    if (!userId) {
      console.log('❌ Missing userId parameter')
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }
    
    // 从数据库获取用户信息
    console.log('🔍 Looking up user in database...')
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })
    
    console.log('🔍 User lookup result:', user)
    
    if (!user) {
      console.log('❌ User not found for ID:', userId)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // 获取用户金币余额
    console.log('🔍 Looking up user coins...')
    const userCoins = await prisma.userCoins.findUnique({
      where: { userId: user.id }
    })
    
    console.log('🔍 User coins lookup result:', userCoins)
    
    const response = {
      id: user.id,
      name: user.name || '',
      email: user.email,
      coins: userCoins?.balance || 0,
      watchHistory: [], // 这里应该从数据库获取观看历史
      createdAt: user.createdAt
    }
    
    console.log('✅ Profile API response:', response)
    
    return NextResponse.json(response)
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
