import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { verificationCodes } from '@/lib/auth-storage'

export const dynamic = 'force-dynamic'

// 创建邮件传输器 - 支持多种邮箱服务商
const createTransporter = () => {
  const email = process.env.EMAIL_USER
  console.log('EMAIL_USER:', email ? 'configured' : 'not configured')
  console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? 'configured' : 'not configured')
  
  if (!email) {
    throw new Error('EMAIL_USER not configured')
  }

  // 根据邮箱域名自动选择SMTP配置
  const domain = email.split('@')[1].toLowerCase()
  
  let smtpConfig: any = {
    auth: {
      user: email,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  }

  switch (domain) {
    case 'gmail.com':
      smtpConfig.service = 'gmail'
      break
    case 'outlook.com':
    case 'hotmail.com':
    case 'live.com':
      smtpConfig.service = 'hotmail'
      break
    case 'yahoo.com':
    case 'yahoo.co.uk':
    case 'yahoo.ca':
      smtpConfig.service = 'yahoo'
      break
    case 'icloud.com':
    case 'me.com':
    case 'mac.com':
      smtpConfig.host = 'smtp.mail.me.com'
      smtpConfig.port = 587
      smtpConfig.secure = false
      break
    case 'protonmail.com':
      smtpConfig.host = 'smtp.protonmail.com'
      smtpConfig.port = 587
      smtpConfig.secure = false
      break
    case 'zoho.com':
      smtpConfig.host = 'smtp.zoho.com'
      smtpConfig.port = 587
      smtpConfig.secure = false
      break
    case 'aol.com':
      smtpConfig.host = 'smtp.aol.com'
      smtpConfig.port = 587
      smtpConfig.secure = false
      break
    case 'yandex.com':
    case 'yandex.ru':
      smtpConfig.host = 'smtp.yandex.com'
      smtpConfig.port = 587
      smtpConfig.secure = false
      break
    case 'mail.ru':
      smtpConfig.host = 'smtp.mail.ru'
      smtpConfig.port = 587
      smtpConfig.secure = false
      break
    default:
      // 对于其他邮箱服务商，使用通用SMTP配置
      smtpConfig.host = process.env.SMTP_HOST || 'smtp.gmail.com'
      smtpConfig.port = parseInt(process.env.SMTP_PORT || '587')
      smtpConfig.secure = process.env.SMTP_SECURE === 'true'
  }

  return nodemailer.createTransport(smtpConfig)
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

    // 检查环境变量
    console.log('Environment check:')
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'configured' : 'NOT CONFIGURED')
    console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? 'configured' : 'NOT CONFIGURED')
    
    if (!process.env.EMAIL_USER) {
      console.error('EMAIL_USER environment variable is missing')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }
    
    if (!process.env.EMAIL_APP_PASSWORD) {
      console.error('EMAIL_APP_PASSWORD environment variable is missing')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    // 生成验证码
    const code = generateVerificationCode()
    const expiresAt = Date.now() + 5 * 60 * 1000 // 5分钟后过期

    // 存储验证码
    await verificationCodes.set(email, { code, expiresAt })
    console.log('Verification code stored for email:', email)
    console.log('Code:', code)
    console.log('Expires at:', new Date(expiresAt).toISOString())
    console.log('Current verification codes:', await verificationCodes.keys())

    // 发送邮件
    console.log('Creating transporter...')
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `"ShortDramini" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'ShortDramini Registration Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
          <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #E50914; margin: 0; font-size: 28px;">ShortDramini</h1>
              <p style="color: #666; margin: 10px 0 0 0;">Your Premium Drama Platform</p>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Registration Verification Code</h2>
            
            <p style="color: #555; line-height: 1.6;">Hello!</p>
            <p style="color: #555; line-height: 1.6;">Thank you for registering with ShortDramini. To complete your registration, please use the verification code below:</p>
            
            <div style="background: linear-gradient(135deg, #E50914, #ff6b6b); padding: 25px; text-align: center; margin: 25px 0; border-radius: 8px;">
              <span style="font-size: 36px; font-weight: bold; color: white; letter-spacing: 8px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${code}</span>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>Important:</strong> This verification code will expire in 5 minutes. Please use it promptly.
              </p>
            </div>
            
            <p style="color: #555; line-height: 1.6;">If you did not register for a ShortDramini account, please ignore this email.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p style="margin: 0;">This email was sent automatically by ShortDramini system.</p>
              <p style="margin: 5px 0 0 0;">Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      `,
    }

    console.log('Sending email to:', email)
    await transporter.sendMail(mailOptions)
    console.log('Email sent successfully')

    return NextResponse.json({ 
      success: true, 
      message: 'Verification code sent successfully' 
    })
  } catch (error) {
    console.error('Send verification code error:', error)
    console.error('Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      name: (error as Error).name
    })
    return NextResponse.json({ 
      error: 'Failed to send verification code',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
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

    const storedData = await verificationCodes.get(email)
    
    if (!storedData) {
      return NextResponse.json({ error: 'Verification code not found' }, { status: 400 })
    }

    if (Date.now() > storedData.expiresAt) {
      await verificationCodes.delete(email)
      return NextResponse.json({ error: 'Verification code expired' }, { status: 400 })
    }

    if (storedData.code !== code) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
    }

    // 验证成功，删除验证码
    await verificationCodes.delete(email)

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
