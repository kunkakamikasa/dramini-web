'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Activity, Users, Eye, BarChart2, TrendingUp, ArrowUp, ArrowDown, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TimeData {
  date: string
  hour?: number
  pv: number
  uv: number
  registrations: number
  viewers: number
}

interface OverviewData {
  today: { pv: number; uv: number; registrations: number; viewers: number }
  yesterday: { pv: number; uv: number; registrations: number; viewers: number }
  currentWeek: { pv: number; uv: number; registrations: number; viewers: number }
  currentMonth: { pv: number; uv: number; registrations: number; viewers: number }
}

interface ThirdPartyComparison {
  provider: string
  timeRange: { start: string; end: string; days: number }
  ourData: { pv: number; uv: number }
  thirdPartyData: { pv: number; uv: number } | null
  differences: {
    pv: number | null
    uv: number | null
    pv_percentage: number | null
    uv_percentage: number | null
  }
}

export default function AnalyticsVerificationPage() {
  const [timeRange, setTimeRange] = useState('7d')
  const [granularity, setGranularity] = useState<'hour' | 'day' | 'month' | 'year'>('day')
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [timeSeriesData, setTimeSeriesData] = useState<TimeData[]>([])
  const [loading, setLoading] = useState(true)
  const [comparisons, setComparisons] = useState<{ ga4?: ThirdPartyComparison; plausible?: ThirdPartyComparison }>({})

  useEffect(() => {
    fetchOverviewData()
  }, [])

  useEffect(() => {
    fetchTimeSeriesData()
  }, [timeRange, granularity])

  useEffect(() => {
    fetchComparisonData()
  }, [timeRange])

  const fetchOverviewData = async () => {
    try {
      const response = await fetch('/api/v1/analytics/overview')
      if (response.ok) {
        const result = await response.json()
        setOverview(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch overview:', error)
    }
  }

  const fetchTimeSeriesData = async () => {
    setLoading(true)
    try {
      const { startDate, endDate } = getDateRange(timeRange)
      const response = await fetch(
        `/api/v1/analytics/stats?startDate=${startDate}&endDate=${endDate}&granularity=${granularity}`
      )
      
      if (response.ok) {
        const result = await response.json()
        setTimeSeriesData(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch time series:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComparisonData = async () => {
    try {
      const { startDate, endDate } = getDateRange(timeRange)
      
      // 获取GA4对比数据
      const ga4Response = await fetch(
        `/api/v1/analytics/compare/ga4?startDate=${startDate}&endDate=${endDate}`
      )
      
      // 获取Plausible对比数据  
      const plausibleResponse = await fetch(
        `/api/v1/analytics/compare/plausible?startDate=${startDate}&endDate=${endDate}`
      )
      
      const comparisonData: any = {}
      
      if (ga4Response.ok) {
        const ga4 = await ga4Response.json()
        comparisonData.ga4 = ga4.comparison
      }
      
      if (plausibleResponse.ok) {
        const plausible = await plausibleResponse.json()
        comparisonData.plausible = plausible.comparison
      }
      
      setComparisons(comparisonData)
    } catch (error) {
      console.error('Failed to fetch comparison data:', error)
    }
  }

  const getDateRange = (range: string) => {
    const now = new Date()
    const endDate = now.toISOString()
    let startDate: Date

    switch (range) {
      case ['today'][0]:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        setGranularity('hour') // 当天默认按小时查看
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        setGranularity('day')
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        setGranularity('day')
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        setGranularity('day')
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        setGranularity('month')
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    return { startDate: startDate.toISOString(), endDate }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const calculateGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous * 100)
  }

  const testAnalyticsSystem = async () => {
    console.log('🧪 Testing Analytics System...')
    
    // 测试1: 访客ID生成
    const visitorId1 = localStorage.getItem('analytics_visitor_id') || 'Not found'
    const sessionId1 = localStorage.getItem('analytics_session_id') || 'Not found'
    
    console.log('✅ Visitor ID:', visitorId1)
    console.log('✅ Session ID:', sessionId1)
    
    // 测试2: 幂等性（重复发送相同事件）
    const testEventId = crypto.randomUUID()
    const testPayload = {
      events: [{
        type: 'event',
        data: {
          event_id: testEventId,
          event_name: 'test_event',
          visitor_id: 'test-visitor',
          session_id: 'test-session',
          schema_version: 1
        }
      }]
    }
    
    console.log('🚀 Sending test event:', testPayload)
    
    try {
      const response1 = await fetch('/api/v1/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      })
      
      const result1 = await response1.json()
      console.log('📊 First response:', result1)
      
      // 重复发送相同事件
      const response2 = await fetch('/api/v1/analytics/track', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      })
      
      const result2 = await response2.json()
      console.log('📊 Second response (idempotency):', result2)
      
      if (result2.filtered > 0) {
        console.log('✅ Idempotency test PASSED')
      } else {
        console.log('❌ Idempotency test FAILED')
      }
      
    } catch (error) {
      console.error('❌ Test failed:', error)
    }
    
    // 测试3: 机器人过滤
    console.log('🤖 Testing bot filter...')
    await fetch('/api/v1/analytics/track', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'bot/crawler-test'
      },
      body: JSON.stringify({
        events: [{
          type: 'event',
          data: {
            event_id: crypto.randomUUID(),
            event_name: 'bot_test',
            visitor_id: 'bot-visitor',
            session_id: 'bot-session', 
            schema_version: 1
          }
        }]
      })
    })
    console.log('🤖 Bot filter test sent')
  }

  if (loading && !overview) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="text-center">
          <div className="text-xl mb-4">Loading Analytics...</div>
          <div className="animate-spin inline-block w-8 h-8 border-4 border-red-500 border-t-transparents rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">📊 Analytics Verification Center</h1>
            <p className="text-gray-400">专业级埋点系统验证与第三方对比</p>
          </div>
          
          <Button 
            onClick={testAnalyticsSystem}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            🧪 运行系统测试
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5" />
              数据筛选
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* 时间范围 */}
              <div>
                <label className="block text-sm font-medium mb-2">时间范围</label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="bg-gray-800 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today" className="bg-white text-black">
                      🕐 当天 (按小时)
                    </SelectItem>
                    <SelectItem value="7d" className="bg-white text-black">最近7天</SelectItem>
                    <SelectItem value="30d" className="bg-white text-black">最近30天</SelectItem>
                    <SelectItem value="90d" className="bg-white text-black">最近90天</SelectItem>
                    <SelectItem value="1y" className="bg-white text-black">最近1年</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 统计维度 */}
              <div>
                <label className="block text-sm font-medium mb-2">统计维度</label>
                <Select value={granularity} onValueChange={(value: any) => setGranularity(value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hour" className="bg-white text-black">按小时</SelectItem>
                    <SelectItem value="day" className="bg-white text-black">按天</SelectItem>
                    <SelectItem value="month" className="bg-white text-black">按月</SelectItem>
                    <SelectItem value="year" className="bg-white text-black">按年</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Stats */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 今日PV */}
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">今日 PV</p>
                    <p className="text-2xl font-bold">{formatNumber(overview.today.pv)}</p>
                    {overview.yesterday.pv > 0 && (
                      <div className={`flex items-center text-sm ${
                        calculateGrowthRate(overview.today.pv, overview.yesterday.pv) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {calculateGrowthRate(overview.today.pv, overview.yesterday.pv) >= 0 ? (
                          <ArrowUp className="w-4 h-4 mr-1" />
                        ) : (
                          <ArrowDown className="w-4 h-4 mr-1" />
                        )}
                        {Math.abs(calculateGrowthRate(overview.today.pv, overview.yesterday.pv)).toFixed(1)}%
                      </div>
                    )}
                  </div>
                  <Eye className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            {/* 今日UV */}
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">今日 UV</p>
                    <p className="text-2xl font-bold">{formatNumber(overview.today.uv)}</p>
                    {overview.yesterday.uv > 0 && (
                      <div className={`flex items-center text-sm ${
                        calculateGrowthRate(overview.today.uv, overview.yesterday.uv) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {calculateGrowthRate(overview.today.uv, overview.yesterday.uv) >= 0 ? (
                          <ArrowUp className="w-4 h-4 mr-1" />
                        ) : (
                          <ArrowDown className="w-4 h-4 mr-1" />
                        )}
                        {Math.abs(calculateGrowthRate(overview.today.uv, overview.yesterday.uv)).toFixed(1)}%
                      </div>
                    )}
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            {/* 注册用户 */}
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">注册用户</p>
                    <p className="text-2xl font-bold">{formatNumber(overview.today.registrations)}</p>
                    {overview.yesterday.registrations > 0 && (
                      <div className={`flex items-center text-sm ${
                        calculateGrowthRate(overview.today.registrations, overview.yesterday.registrations) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {calculateGrowthRate(overview.today.registrations, overview.yesterday.registrations) >= 0 ? (
                          <ArrowUp className="w-4 h-4 mr-1" />
                        ) : (
                          <ArrowDown className="w-4 h-4 mr-1" />
                        )}
                        {Math.abs(calculateGrowthRate(overview.today.registrations, overview.yesterday.registrations)).toFixed(1)}%
                      </div>
                    )}
                  </div>
                  <Activity className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            {/* 观看用户 */}
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">观看用户</p>
                    <p className="text-2xl font-bold">{formatNumber(overview.today.viewers)}</p>
                    {overview.yesterday.viewers > 0 && (
                      <div className={`flex items-center text-sm ${
                        calculateGrowthRate(overview.today.viewers, overview.yesterday.viewers) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {calculateGrowthRate(overview.today.viewers, overview.yesterday.viewers) >= 0 ? (
                          <ArrowUp className="w-4 h-4 mr-1" />
                        ) : (
                          <ArrowDown className="w-4 h-4 mr-1" />
                        )}
                        {Math.abs(calculateGrowthRate(overview.today.viewers, overview.yesterday.viewers)).toFixed(1)}%
                      </div>
                    )}
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Third Party Comparisons */}
        {(comparisons.ga4 || comparisons.plausible) && (
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                第三方对比验证
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* GA4对比 */}
                {comparisons.ga4 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      📈 Google Analytics 4
                      <span className="text-sm text-gray-400">({comparisons.ga4.timeRange.days}天)</span>
                    </h3>
                    
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">我们的数据</p>
                          <p className="font-medium">PV: {formatNumber(comparisons.ga4.ourData.pv)}</p>
                          <p className="font-medium">UV: {formatNumber(comparisons.ga4.ourData.uv)}</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-400">GA4数据</p>
                          <p className="font-medium">
                            PV: {comparisons.ga4.thirdPartyData ? formatNumber(comparisons.ga4.thirdPartyData.pv) : '未集成'}
                          </p>
                          <p className="font-medium">
                            UV: {comparisons.ga4.thirdPartyData ? formatNumber(comparisons.ga4.thirdPartyData.uv) : '未集成'}
                          </p>
                        </div>
                      </div>
                      
                      {comparisons.ga4.differences.pv_percentage !== null && (
                        <div className="mt-4 text-sm">
                          <p className="text-gray-400">差异分析:</p>
                          <p>PV差异: {Math.abs(comparisons.ga4.differences.pv_percentage).toFixed(1)}%</p>
                          <p>UV差异: {Math.abs(comparisons.ga4.differences.uv_percentage || 0).toFixed(1)}%</p>
                          
                          {Math.abs(comparisons.ga4.differences.pv_percentage) <= 10 ? (
                            <div className="flex items-center gap-1 text-green-400 mt-2">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm">偏差在可接受范围内 (≤10%)</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-400 mt-2">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm">偏差过大，需要检查</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Plausible对比 */}
                {comparisons.plausible && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      📊 Plausible Analytics
                      <span className="text-sm text-gray-400">({comparisons.plausible.timeRange.days}天)</span>
                    </h3>
                    
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">我们的数据</p>
                          <p className="font-medium">PV: {formatNumber(comparisons.plausible.ourData.pv)}</p>
                          <p className="font-medium">UV: {formatNumber(comparisons.plausible.ourData.uv)}</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-400">Plausible数据</p>
                          <p className="font-medium">
                            PV: {comparisons.plausible.thirdPartyData ? formatNumber(comparisons.plausible.thirdPartyData.pv) : '未集成'}
                          </p>
                          <p className="font-medium">
                            UV: {comparisons.plausible.thirdPartyData ? formatNumber(comparisons.plausible.thirdPartyData.uv) : '未集成'}
                          </p>
                        </div>
                      </div>
                      
                      {comparisons.plausible.differences.pv_percentage !== null && (
                        <div className="mt-4 text-sm">
                          <div className="flex items-center gap-1 text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">偏差分析可用</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <h4 className="font-semibold mb-2">🎯 验证标准</h4>
                <ul className="text-sm space-y-1">
                  <li>✅ 同一访客刷新多次：PV递增、UV不变</li>
                  <li>✅ 超过30分钟无操作后返回：新session，UV不变</li>
                  <li>✅ 同一路径2秒内多次pushState：只记1次PV</li>
                  <li>✅ 弱网重试/sendBeacon重发：无重复计数</li>
                  <li>✅ 与第三方PV/UV差异 ≤ 10%</li>
                  <li>✅ 典型爬虫UA请求不产生PV/UV</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Time Series Table */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              详细数据表
              {timeRange === 'today' && granularity === 'hour' && (
                <span className="text-sm text-gray-400 ml-2">📅 当天按小时统计</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin inline-block w-6 h-6 border-4 border-red-500 border-t-transparent rounded-full"></div>
                <p className="mt-2 text-gray-400">Loading...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4">时间</th>
                      <th className="text-right py-3">{formatNumber(timeSeriesData.reduce((acc, d) => acc + d.pv, 0))}</th>
                      <th className="text-right py-3">{formatNumber(timeSeriesData.reduce((acc, d) => acc + d.uv, 0))}</th>
                      <th className="text-right py-3">{formatNumber(timeSeriesData.reduce((acc, d) => acc + d.registrations, 0))}</th>
                      <th className="text-right py-3">{formatNumber(timeSeriesData.reduce((acc, d) => acc + d.viewers, 0))}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeSeriesData.map((row, index) => (
                      <tr key={index} className="border-b border-gray-800">
                        <td className="py-3 px-4">
                          {row.hour !== undefined 
                            ? `${new Date(row.date).toLocaleDateString()} ${row.hour}:00` 
                            : new Date(row.date).toLocaleDateString()
                          }
                        </td>
                        <td className="text-right py-3">{formatNumber(row.pv)}</td>
                        <td className="text-right py-3">{formatNumber(row.uv)}</td>
                        <td className="text-right py-3">{formatNumber(row.registrations)}</td>
                        <td className="text-right py-3">{formatNumber(row.viewers)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {timeSeriesData.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    暂无数据
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
