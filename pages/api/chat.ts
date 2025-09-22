import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { message, context, step, systemPrompt, isConsultationMode } = req.body

    if (!message) {
      return res.status(400).json({ message: 'Message is required' })
    }

    // API 키 검증
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY가 설정되지 않았습니다.')
      return res.status(500).json({ message: 'OpenAI API 키가 설정되지 않았습니다.' })
    }

    // 상담 모드에 따른 시스템 프롬프트 설정
    const finalSystemPrompt = systemPrompt || `당신은 **한화생명 CARE+ 효도상담사**입니다.

**핵심 원칙:**
- **1문장으로 간결하게** 응답 (최대 20자 이내)
- **중요한 키워드는 볼드 처리** (**키워드**)
- 불필요한 설명 금지, 핵심만 전달
- 따뜻하지만 간결한 톤

**응답 패턴:**
- 질문: "**어머님 연세**가 어떻게 되시나요? 💝"
- 반응: "**60대 어머님**이시네요, **여성질환 보장**이 중요해요!"
- 추천: "**e시그니처암보험**을 추천드려요 🌸"

**금지사항:**
- 긴 설명 금지
- 복잡한 문장 금지
- 중복된 질문 금지
- 불필요한 감탄사 금지

**상품 간단 정리:**
- **e시그니처암보험**: 여성암 특화
- **e건강보험**: 만성질환 보장
- **e정기보험**: 가족보호

현재 상담 단계: ${step || '초기상담'}
이전 대화 맥락: ${context || '없음'}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: finalSystemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: isConsultationMode ? 300 : 50,
      temperature: isConsultationMode ? 0.1 : 0.3,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0.5,
      response_format: isConsultationMode ? { type: "json_object" } : undefined
    })

    const aiResponse = completion.choices[0]?.message?.content || '죄송합니다. 응답을 생성할 수 없습니다.'

    res.status(200).json({ 
      message: aiResponse,
      usage: completion.usage
    })

  } catch (error) {
    console.error('OpenAI API Error:', error)

    // OpenAI API 오류에 대한 적절한 응답
    let errorMessage = '죄송합니다. 일시적으로 상담 서비스에 문제가 있습니다. 잠시 후 다시 시도해주세요.'
    let statusCode = 500

    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })

      if (error.message.includes('insufficient_quota')) {
        errorMessage = '현재 API 사용량이 초과되었습니다. 관리자에게 문의해주세요.'
        statusCode = 429
      } else if (error.message.includes('invalid_api_key') || error.message.includes('Incorrect API key')) {
        errorMessage = 'OpenAI API 키가 잘못되었습니다. .env.local 파일의 OPENAI_API_KEY를 확인해주세요.'
        statusCode = 401
      } else if (error.message.includes('401')) {
        errorMessage = 'OpenAI API 인증 오류입니다. API 키를 확인해주세요.'
        statusCode = 401
      }
    }

    res.status(statusCode).json({
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      } : undefined
    })
  }
}