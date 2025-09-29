'use client'

import { useState } from 'react'

export default function ApiTestPage() {
  const [result, setResult] = useState<string>('点击测试API')
  const [loading, setLoading] = useState(false)

  const testApi = async () => {
    setLoading(true)
    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE}/public/titles`
      console.log('Testing API URL:', url)
      
      const response = await fetch(url)
      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Response data:', data)
      
      setResult(`API调用成功！获取到 ${data.titles?.length || 0} 个剧目`)
    } catch (error) {
      console.error('API调用失败:', error)
      setResult(`API调用失败: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-xl text-center">
        <div className="mb-4">API测试页面</div>
        <div className="mb-4">API Base URL: {process.env.NEXT_PUBLIC_API_BASE}</div>
        <button 
          onClick={testApi}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mb-4 disabled:opacity-50"
        >
          {loading ? '测试中...' : '测试API'}
        </button>
        <div className="text-sm">{result}</div>
      </div>
    </div>
  )
}

