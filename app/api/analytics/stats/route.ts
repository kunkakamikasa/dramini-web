import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// 转发到后端API获取时间序列数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const granularity = searchParams.get('granularity') || 'day'
    const days = searchParams.get('days') || '7'
    
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://dramini-api.onrender.com/api/v1'
    
    // 构造URL参数，匹配后端API的期望格式
    const params = new URLSearchParams({
      granularity: granularity,
      days: days
    })
    
    const response = await fetch(`${apiBase}/analytics/stats?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })
    
    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Analytics stats API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch analytics stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
