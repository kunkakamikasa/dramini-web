import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('paypal-transmission-id')
    const webhookId = request.headers.get('paypal-webhook-id')
    const timestamp = request.headers.get('paypal-transmission-time')
    
    // 验证 Webhook 签名
    if (!signature || !webhookId || !timestamp) {
      console.error('Missing PayPal webhook headers')
      return NextResponse.json({ error: 'Missing headers' }, { status: 400 })
    }

    // 验证 Webhook ID
    const expectedWebhookId = process.env.PAYPAL_WEBHOOK_ID
    if (webhookId !== expectedWebhookId) {
      console.error('Invalid PayPal webhook ID')
      return NextResponse.json({ error: 'Invalid webhook ID' }, { status: 400 })
    }

    // 验证签名
    const isValid = verifyPayPalWebhook(body, signature, webhookId, timestamp)
    if (!isValid) {
      console.error('Invalid PayPal webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    console.log('PayPal webhook received:', event.event_type)

    // 处理不同类型的 PayPal 事件
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCompleted(event)
        break
      case 'PAYMENT.CAPTURE.DENIED':
        await handlePaymentDenied(event)
        break
      case 'PAYMENT.CAPTURE.REFUNDED':
        await handlePaymentRefunded(event)
        break
      case 'CHECKOUT.ORDER.APPROVED':
        await handleOrderApproved(event)
        break
      default:
        console.log('Unhandled PayPal event type:', event.event_type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

function verifyPayPalWebhook(
  body: string,
  signature: string,
  webhookId: string,
  timestamp: string
): boolean {
  try {
    const webhookSecret = process.env.PAYPAL_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('PAYPAL_WEBHOOK_SECRET not configured')
      return false
    }

    // 构建验证字符串
    const data = `${webhookId}|${timestamp}|${body}`
    
    // 计算 HMAC-SHA256
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(data)
      .digest('hex')

    // 验证签名
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  } catch (error) {
    console.error('PayPal webhook verification error:', error)
    return false
  }
}

async function handlePaymentCompleted(event: any) {
  try {
    const capture = event.resource
    const customId = capture.custom_id
    
    if (!customId) {
      console.error('No custom_id in PayPal payment capture')
      return
    }

    // 解析 custom_id 获取订单信息
    const orderData = JSON.parse(customId)
    const { plan, priceCents, meta } = orderData

    console.log('Payment completed:', {
      plan,
      priceCents,
      coins: meta.coins,
      bonus: meta.bonus,
      episodeId: meta.episodeId,
      titleId: meta.titleId
    })

    // 调用 API 服务更新用户金币余额
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://dramini-api.onrender.com/api/v1'
    
    const response = await fetch(`${API_BASE}/user/coins/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: meta.userId, // 需要从 session 或其他方式获取
        coins: meta.coins + meta.bonus,
        source: 'paypal_purchase',
        transactionId: capture.id,
        planId: plan
      })
    })

    if (!response.ok) {
      console.error('Failed to update user coins:', response.statusText)
    }

  } catch (error) {
    console.error('Error handling payment completed:', error)
  }
}

async function handlePaymentDenied(event: any) {
  try {
    const capture = event.resource
    console.log('Payment denied:', capture.id)
    
    // 记录支付失败
    // 可以发送通知给用户或管理员
    
  } catch (error) {
    console.error('Error handling payment denied:', error)
  }
}

async function handlePaymentRefunded(event: any) {
  try {
    const refund = event.resource
    console.log('Payment refunded:', refund.id)
    
    // 处理退款逻辑
    // 扣除用户金币等
    
  } catch (error) {
    console.error('Error handling payment refunded:', error)
  }
}

async function handleOrderApproved(event: any) {
  try {
    const order = event.resource
    console.log('Order approved:', order.id)
    
    // 处理订单批准逻辑
    
  } catch (error) {
    console.error('Error handling order approved:', error)
  }
}
