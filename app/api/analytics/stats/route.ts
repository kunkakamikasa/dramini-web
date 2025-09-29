import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// 转发到后端API获取时间序列数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate') 
    const granularity = searchParams.get('granularity')
    
    if (!startDate || !endDate || !granularity) {
      return NextResponse.json({ 
        error: 'Missing required parameters',
        message: 'startDate, endDate and granularity are required'
      }, { status: 400 })
    }
    
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://dramini-api.onrender.com/api/v1'
    
    const response = await fetch(`${apiBase}/analytics/stats?startDate=${startDate}&endDate=${endDate}&granularity=${granularity}`, {
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
