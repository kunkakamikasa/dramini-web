import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('Missing Stripe signature header')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // 验证 Webhook 签名
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('Stripe webhook received:', event.type)

    // 处理不同类型的 Stripe 事件
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break
      case 'charge.dispute.created':
        await handleChargeDisputeCreated(event.data.object as Stripe.Dispute)
        break
      default:
        console.log('Unhandled Stripe event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const metadata = session.metadata
    
    if (!metadata) {
      console.error('No metadata in Stripe checkout session')
      return
    }

    const { plan, priceCents, coins, bonus, episodeId, titleId, userId } = metadata

    console.log('Checkout session completed:', {
      sessionId: session.id,
      plan,
      priceCents,
      coins,
      bonus,
      episodeId,
      titleId,
      userId
    })

    // 调用 API 服务更新用户金币余额
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://dramini-api.onrender.com/api/v1'
    
    const response = await fetch(`${API_BASE}/user/coins/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        coins: parseInt(coins) + parseInt(bonus),
        source: 'stripe_purchase',
        transactionId: session.id,
        planId: plan
      })
    })

    if (!response.ok) {
      console.error('Failed to update user coins:', response.statusText)
    }

  } catch (error) {
    console.error('Error handling checkout session completed:', error)
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment intent succeeded:', paymentIntent.id)
    
    // 处理支付成功逻辑
    // 通常 checkout.session.completed 已经处理了主要逻辑
    
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error)
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment intent failed:', paymentIntent.id)
    
    // 处理支付失败逻辑
    // 可以发送通知给用户或管理员
    
  } catch (error) {
    console.error('Error handling payment intent failed:', error)
  }
}

async function handleChargeDisputeCreated(dispute: Stripe.Dispute) {
  try {
    console.log('Charge dispute created:', dispute.id)
    
    // 处理争议创建逻辑
    // 可能需要暂停相关服务或发送通知
    
  } catch (error) {
    console.error('Error handling charge dispute created:', error)
  }
}
