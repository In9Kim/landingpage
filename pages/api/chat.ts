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
    const { message, context, step } = req.body

    if (!message) {
      return res.status(400).json({ message: 'Message is required' })
    }

    // 한화생명 보험 설계사 역할의 시스템 프롬프트
    const systemPrompt = `당신은 한화생명의 전문 보험 설계사입니다. 30-40대 여성 고객의 어머님을 위한 효도보험 상담을 진행하고 있습니다.

**역할과 책임:**
- 한화생명 e-시리즈 상품(e시그니처암보험, e건강보험, e정기보험) 전문가
- 따뜻하고 공감적인 상담 스타일
- 어머님의 건강과 가족의 효도 마음을 중시하는 감성적 접근
- 정확한 보험 지식과 맞춤 상담 제공

**상담 원칙:**
1. 어머님의 연령, 건강상태, 생활패턴을 종합적으로 고려
2. 가족력과 건강 관심사에 맞는 보장 내용 추천
3. 경제적 부담과 보장 범위의 균형 고려
4. 복잡한 보험 용어보다는 이해하기 쉬운 설명
5. 효도하는 마음을 담은 따뜻한 응답
6. 2줄이 넘지 않는 길지 않은 답변

**상품 지식:**
- e시그니처암보험(종합): 여성특화암, 암 진단금, 통원비 보장
- e건강보험: 생활습관병, 종합건강관리, 예방 중심
- e정기보험: 사망보장, 가족보호, 경제적 안정

**응답 스타일:**
- 존댓말 사용
- 공감과 이해를 보이는 따뜻한 톤, 상냥한 말투
- 구체적이고 도움이 되는 조언
- 적절한 이모지 사용 (💝, 🌸, 💐 등)

현재 상담 단계: ${step || '초기상담'}
이전 대화 맥락: ${context || '없음'}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
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
    
    if (error instanceof Error) {
      if (error.message.includes('insufficient_quota')) {
        errorMessage = '현재 API 사용량이 초과되었습니다. 관리자에게 문의해주세요.'
      } else if (error.message.includes('invalid_api_key')) {
        errorMessage = 'API 키 설정에 문제가 있습니다. 관리자에게 문의해주세요.'
      }
    }

    res.status(500).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error : undefined
    })
  }
}