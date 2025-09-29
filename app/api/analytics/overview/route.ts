import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// 转发到后端API获取概览数据
export async function GET(request: NextRequest) {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://dramini-api.onrender.com/api/v1'
    
    const response = await fetch(`${apiBase}/analytics/overview`, {
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
    console.error('Analytics overview API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch analytics overview',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
