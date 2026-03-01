const crypto = require('crypto')
const querystring = require('querystring')

const vnpayConfig = {
  tmnCode: process.env.VNPAY_TMN_CODE || 'VNPAY_SANDBOX',
  secretKey: process.env.VNPAY_SECRET_KEY || 'sandbox_secret',
  url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  returnUrl: `${process.env.CLIENT_URL}/don-hang`,
}

const createVNPayUrl = ({ orderId, amount, orderInfo, ipAddr }) => {
  const date = new Date()
  const createDate = date.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)

  const params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: vnpayConfig.tmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: amount * 100,
    vnp_ReturnUrl: vnpayConfig.returnUrl,
    vnp_IpAddr: ipAddr || '127.0.0.1',
    vnp_CreateDate: createDate,
  }

  const sortedParams = Object.keys(params).sort().reduce((obj, key) => { obj[key] = params[key]; return obj }, {})
  const signData = querystring.stringify(sortedParams, '&', '=')
  const hmac = crypto.createHmac('sha512', vnpayConfig.secretKey)
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

  return `${vnpayConfig.url}?${querystring.stringify(sortedParams)}&vnp_SecureHash=${signed}`
}

module.exports = { vnpayConfig, createVNPayUrl }
