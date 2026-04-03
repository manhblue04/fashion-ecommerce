const axios = require('axios')
const Setting = require('../models/Setting')

const STORE_CONTEXT = `Bạn là trợ lý AI của Fashion Store — cửa hàng thời trang trực tuyến.
Hãy trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp.
Thông tin hữu ích:
- Giao hàng toàn quốc 2-5 ngày, miễn phí từ 500.000₫
- Đổi/trả trong 7 ngày, sản phẩm còn nguyên tag
- Thanh toán: COD, MoMo, VNPay
- Hotline: 1900-xxxx (8h-22h)
Nếu không biết câu trả lời, hãy đề nghị khách liên hệ nhân viên hỗ trợ.`

async function getAIConfig() {
  try {
    const settings = await Setting.findOne().lean()
    if (settings?.ai?.apiKey) {
      return {
        provider: settings.ai.provider || 'openai',
        apiKey: settings.ai.apiKey,
        model: settings.ai.model || 'gpt-4o-mini',
        systemPrompt: settings.ai.systemPrompt || STORE_CONTEXT,
      }
    }
  } catch { /* fallback to env */ }

  if (!process.env.AI_API_KEY) return null
  return {
    provider: process.env.AI_PROVIDER || 'openai',
    apiKey: process.env.AI_API_KEY,
    model: process.env.AI_MODEL || 'gpt-4o-mini',
    systemPrompt: STORE_CONTEXT,
  }
}

async function callOpenAI(config, messages) {
  const res = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: config.model,
      messages,
      max_tokens: 500,
      temperature: 0.7,
    },
    { headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' }, timeout: 15000 }
  )
  return res.data.choices?.[0]?.message?.content?.trim()
}

async function callGemini(config, messages) {
  const model = config.model || 'gemini-2.5-flash'
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

  const systemInstruction = messages.find((m) => m.role === 'system')?.content || ''

  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`,
    {
      system_instruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
      contents,
      generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
    },
    { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
  )
  return res.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
}

async function generateReply(conversationHistory, userMessage) {
  const config = await getAIConfig()
  if (!config) throw new Error('AI not configured')

  const messages = [
    { role: 'system', content: config.systemPrompt },
    ...conversationHistory.slice(-8),
    ...(userMessage ? [{ role: 'user', content: userMessage }] : []),
  ]

  let text
  if (config.provider === 'gemini') {
    text = await callGemini(config, messages)
  } else {
    text = await callOpenAI(config, messages)
  }

  if (!text) throw new Error('Empty AI response')
  return { text, provider: config.provider }
}

module.exports = { generateReply }
