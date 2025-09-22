import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-400 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">剧集不存在</h2>
        <p className="text-gray-400 mb-8 max-w-md">
          抱歉，您访问的剧集可能已被删除或不存在。
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
              <Home className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </Link>
          <Link href="/browse">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              浏览更多
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
