import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export const dynamic = 'force-dynamic'

// 存储验证码（生产环境应该使用 Redis）
const verificationCodes = new Map<string, { code: string; expiresAt: number }>()

// 创建邮件传输器
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // 使用 Gmail 服务
    auth: {
      user: process.env.EMAIL_USER, // Gmail 邮箱
      pass: process.env.EMAIL_APP_PASSWORD, // Gmail 应用密码
    },
  })
}

// 生成6位数字验证码
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 发送验证码
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // 生成验证码
    const code = generateVerificationCode()
    const expiresAt = Date.now() + 5 * 60 * 1000 // 5分钟后过期

    // 存储验证码
    verificationCodes.set(email, { code, expiresAt })

    // 发送邮件
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Dramini 注册验证码',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #E50914;">Dramini 注册验证码</h2>
          <p>您好！</p>
          <p>您的注册验证码是：</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #E50914; letter-spacing: 5px;">${code}</span>
          </div>
          <p>验证码有效期为 5 分钟，请及时使用。</p>
          <p>如果您没有注册 Dramini 账户，请忽略此邮件。</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({ 
      success: true, 
      message: 'Verification code sent successfully' 
    })
  } catch (error) {
    console.error('Send verification code error:', error)
    return NextResponse.json({ 
      error: 'Failed to send verification code' 
    }, { status: 500 })
  }
}

// 验证验证码
export async function PUT(request: NextRequest) {
  try {
    const { email, code } = await request.json()
    
    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 })
    }

    const storedData = verificationCodes.get(email)
    
    if (!storedData) {
      return NextResponse.json({ error: 'Verification code not found' }, { status: 400 })
    }

    if (Date.now() > storedData.expiresAt) {
      verificationCodes.delete(email)
      return NextResponse.json({ error: 'Verification code expired' }, { status: 400 })
    }

    if (storedData.code !== code) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
    }

    // 验证成功，删除验证码
    verificationCodes.delete(email)

    return NextResponse.json({ 
      success: true, 
      message: 'Verification code verified successfully' 
    })
  } catch (error) {
    console.error('Verify code error:', error)
    return NextResponse.json({ 
      error: 'Failed to verify code' 
    }, { status: 500 })
  }
}
