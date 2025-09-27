'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Eye, EyeOff, Mail, Lock, User, RefreshCw } from 'lucide-react'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    verificationCode: ''
  })
  const [verificationSent, setVerificationSent] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [canResend, setCanResend] = useState(true)

  // 倒计时效果
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
    } else if (countdown === 0 && verificationSent) {
      setCanResend(true)
    }
    return () => clearTimeout(timer)
  }, [countdown, verificationSent])

  const sendVerificationCode = async () => {
    if (!formData.email) {
      alert('Please enter your email first')
      return
    }

    setSendingCode(true)
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      })

      if (response.ok) {
        setVerificationSent(true)
        setCountdown(60) // 开始60秒倒计时
        setCanResend(false) // 禁用重新发送按钮
        alert('Verification code sent to your email')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to send verification code')
      }
    } catch (error) {
      console.error('Send verification code error:', error)
      alert('Failed to send verification code')
    } finally {
      setSendingCode(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        // 登录逻辑
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        })

        if (response.ok) {
          const data = await response.json()
          localStorage.setItem('userId', data.userId)
          localStorage.setItem('userEmail', data.email)
          localStorage.setItem('userName', data.name)
          
          // 跳转到原页面或首页
          router.push(redirectTo)
        } else {
          alert('Login failed. Please check your credentials.')
        }
      } else {
        // 注册逻辑
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name,
            verificationCode: formData.verificationCode
          })
        })

        if (response.ok) {
          const data = await response.json()
          localStorage.setItem('userId', data.userId)
          localStorage.setItem('userEmail', data.email)
          localStorage.setItem('userName', data.name)
          
          // 跳转到原页面或首页
          router.push(redirectTo)
        } else {
          alert('Registration failed. Please try again.')
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const toggleAuthMode = () => {
    setIsLogin(!isLogin)
    // 重置验证码相关状态
    setVerificationSent(false)
    setCountdown(0)
    setCanResend(true)
    setSendingCode(false)
    setFormData({
      ...formData,
      verificationCode: ''
    })
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <p className="text-gray-400">
            {isLogin ? 'Sign in to continue watching' : 'Join us to start watching'}
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required={!isLogin}
                    className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="pl-10 pr-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
            
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="verificationCode" className="text-gray-300">Verification Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    placeholder="Enter verification code"
                    value={formData.verificationCode}
                    onChange={handleInputChange}
                    required={!isLogin}
                    className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={sendVerificationCode}
                    disabled={sendingCode || !canResend}
                    className="px-4 bg-gray-800 border-gray-600 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingCode ? (
                      <div className="flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Sending...</span>
                      </div>
                    ) : countdown > 0 ? (
                      <span>Resend ({countdown}s)</span>
                    ) : (
                      <span>Send Code</span>
                    )}
                  </Button>
                </div>
                {verificationSent && (
                  <div className="space-y-1">
                    <p className="text-sm text-green-400">✓ Verification code sent! Check your email.</p>
                    {countdown > 0 && (
                      <p className="text-xs text-gray-400">
                        You can resend the code in {countdown} seconds
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>
          
          <Separator className="my-6 bg-gray-700" />
          
          <div className="text-center">
            <p className="text-gray-400">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </p>
            <Button
              variant="link"
              className="text-red-500 hover:text-red-400 p-0 h-auto"
              onClick={toggleAuthMode}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </Button>
          </div>
          
          <div className="text-center mt-4">
            <Link href="/" className="text-gray-400 hover:text-gray-300 text-sm">
              ← Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-4">Loading...</div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
