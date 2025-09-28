'use client'

import { useEffect, useState } from 'react'

export default function DebugPage() {
  const [localStorageData, setLocalStorageData] = useState<any>(null)
  const [apiData, setApiData] = useState<any>(null)

  useEffect(() => {
    // 检查localStorage中的数据
    const userId = localStorage.getItem('userId')
    const userEmail = localStorage.getItem('userEmail')
    const userName = localStorage.getItem('userName')
    
    setLocalStorageData({
      userId,
      userEmail,
      userName
    })

    // 测试API调用
    if (userId) {
      fetch(`/api/user/profile?userId=${encodeURIComponent(userId)}`)
        .then(response => response.json())
        .then(data => {
          setApiData(data)
        })
        .catch(error => {
          setApiData({ error: error.message })
        })
    }
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-6">🔍 调试信息</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">📱 localStorage 数据</h2>
          <pre className="text-sm">
            {JSON.stringify(localStorageData, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">🌐 API 响应数据</h2>
          <pre className="text-sm">
            {JSON.stringify(apiData, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">🔧 修复建议</h2>
          <div className="text-sm space-y-2">
            {localStorageData?.userId ? (
              <p className="text-green-400">✅ localStorage 中有用户ID</p>
            ) : (
              <p className="text-red-400">❌ localStorage 中没有用户ID</p>
            )}
            
            {apiData?.coins !== undefined ? (
              <p className="text-green-400">✅ API 返回了金币数据: {apiData.coins}</p>
            ) : (
              <p className="text-red-400">❌ API 没有返回金币数据</p>
            )}
            
            {localStorageData?.userId && apiData?.coins !== undefined ? (
              <p className="text-green-400">✅ 数据流正常，金币应该显示为: {apiData.coins}</p>
            ) : (
              <p className="text-yellow-400">⚠️ 需要检查数据流</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}