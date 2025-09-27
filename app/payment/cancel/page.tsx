"use client"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { XCircle, Home, ArrowLeft } from 'lucide-react'

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 bg-gray-900 border-gray-700">
        <CardContent className="p-8 text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">支付已取消</h1>
          <p className="text-gray-300 mb-6">
            您已取消支付，没有产生任何费用。您可以随时重新尝试购买。
          </p>
          
          <div className="space-y-3">
            <Link href="/">
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                <Home className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回上一页
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
