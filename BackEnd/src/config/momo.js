const crypto = require('crypto')

const momoConfig = {
  partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO_SANDBOX',
  accessKey: process.env.MOMO_ACCESS_KEY || 'sandbox_access_key',
  secretKey: process.env.MOMO_SECRET_KEY || 'sandbox_secret_key',
  endpoint: 'https://test-payment.momo.vn/v2/gateway/api/create',
  redirectUrl: `${process.env.CLIENT_URL}/don-hang`,
  ipnUrl: `${process.env.CLIENT_URL}/api/payment/momo/callback`,
}

const createMoMoPayment = async ({ orderId, amount, orderInfo }) => {
  const requestId = `${orderId}_${Date.now()}`
  const rawSignature = `accessKey=${momoConfig.accessKey}&amount=${amount}&extraData=&ipnUrl=${momoConfig.ipnUrl}&orderId=${requestId}&orderInfo=${orderInfo}&partnerCode=${momoConfig.partnerCode}&redirectUrl=${momoConfig.redirectUrl}&requestId=${requestId}&requestType=payWithMethod`

  const signature = crypto.createHmac('sha256', momoConfig.secretKey).update(rawSignature).digest('hex')

  const body = {
    partnerCode: momoConfig.partnerCode,
    requestId,
    amount,
    orderId: requestId,
    orderInfo,
    redirectUrl: momoConfig.redirectUrl,
    ipnUrl: momoConfig.ipnUrl,
    requestType: 'payWithMethod',
    extraData: '',
    lang: 'vi',
    signature,
  }

  const response = await fetch(momoConfig.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  return response.json()
}

module.exports = { momoConfig, createMoMoPayment }
