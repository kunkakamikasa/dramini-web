import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// 转发到后端API获取第三方对比数据
export async function GET(request: NextRequest, { params }: { params: { params: string[] } }) {
  try {
    const provider = params.params[0] // ga4 或 plausible
    
    if (!provider || !['ga4', 'plausible'].includes(provider)) {
      return NextResponse.json({ 
        error: 'Invalid provider',
        message: 'Provider must be either "ga4" or "plausible"'
      }, { status: 400 })
    }
    
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    // 默认7天前的数据
    if (!startDate || !endDate) {
      const now = new Date()
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      searchParams.set('startDate', sevenDaysAgo.toISOString())
      searchParams.set('endDate', now.toISOString())
    }
    
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://dramini-api.onrender.com/api/v1'
    
    const response = await fetch(`${apiBase}/analytics/compare/${provider}?${searchParams.toString()}`, {
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
    console.error('Analytics compare API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch comparison data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
