import { useState, useEffect, useRef } from 'react'

interface Message {
  id: string
  sender: 'ai' | 'user'
  text: string
  timestamp: Date
  isLoading?: boolean
}

interface ConsultationChatProps {
  onComplete: (parentInfo: any) => void
  onBack: () => void
}

const ChatBubble = ({ message }: { message: Message }) => {
  const formatText = (text: string) => {
    // **텍스트** 형태의 볼드 마크다운을 <strong> 태그로 변환
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  }

  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-md lg:max-w-xl px-4 py-3 rounded-2xl ${
        message.sender === 'user'
          ? 'bg-coral text-white'
          : 'bg-white text-neutral-800 shadow-sm border'
      }`}>
        {message.isLoading ? (
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-xs text-neutral-500 ml-2">효도 설계사가 답변 중...</span>
          </div>
        ) : (
          <div
            className="text-sm leading-relaxed break-words"
            dangerouslySetInnerHTML={{ __html: formatText(message.text) }}
          />
        )}
      </div>
    </div>
  )
}

export default function ConsultationChat({ onComplete, onBack }: ConsultationChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  const [parentInfo, setParentInfo] = useState<any>({})
  const [isAiResponding, setIsAiResponding] = useState(false)
  const [useOpenAI, setUseOpenAI] = useState(true) // OpenAI 사용 여부 토글 - 기본값 true로 설정
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [optionsReady, setOptionsReady] = useState(false) // 옵션 선택 가능 상태
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const chatFlow = [
    {
      aiMessage: "**CARE+ 효도상담사**입니다 💐\n\n먼저 **보험을 선물하실 분**을 선택해주세요.",
      field: 'targetPerson',
      options: ['어머님', '아버님'],
      validation: (input: string) => {
        return input ? null : '보험을 받으실 분을 선택해주세요.'
      },
      followUpMessage: (input: string) => {
        const genderText = input.includes('어머님') ? '어머님' : '아버님'
        return `**${genderText}**을 위한 보험을 준비해드리겠습니다 🌸`
      }
    },
    {
      aiMessage: "**연세**를 선택해주세요.",
      field: 'age',
      options: ['40대', '50대', '60대', '70대', '80대'],
      validation: (input: string) => {
        return input ? null : '연령대를 선택해주세요.'
      },
      followUpMessage: (input: string) => {
        return `건강한 삶을 위한 보장을 준비해드리겠습니다!`
      }
    },
    {
      aiMessage: "**현재 상황**을 선택해주세요.",
      field: 'occupation',
      options: ['주부', '회사원', '자영업', '은퇴', '기타'],
      followUpMessage: (input: string) => {
        if (input.includes('회사원') || input.includes('자영업')) {
          return '**활동적이시네요!** 💪'
        }
        return '**생활패턴**을 고려해서 준비해드리겠습니다.'
      }
    },
    {
      aiMessage: "**건강상태**를 선택해주세요. (복수 선택)",
      field: 'healthStatus',
      options: ['건강함', '갑상선 질환', '자궁 관련 질환', '당뇨', '고혈압', '기타 만성질환'],
      multiSelect: true,
      followUpMessage: (input: string) => {
        if (input.includes('건강함')) {
          return '**건강하시네요.** 미리미리 준비하는 것이 중요합니다! 🌸'
        }
        return '**건강상태**를 고려해서 준비해드리겠습니다.'
      }
    },
    {
      aiMessage: "**가족력**으로 걱정되는 질병이 있나요? (복수 선택)",
      field: 'familyHistory',
      options: ['없음', '암', '갑상선 질환', '자궁 질환', '당뇨', '고혈압', '심장병'],
      multiSelect: true,
      followUpMessage: (input: string) => {
        if (input.includes('없음')) {
          return '가족력이 깨끗하시네요. 그래도 미리미리 준비하는 것이 중요합니다!'
        }
        if (input.includes('암')) {
          return '정기검진과 함께 미리 대비하는 것이 중요합니다!'
        }
        return '가족력을 고려해서 준비해드리겠습니다.'
      }
    },
    {
      aiMessage: "**건강검진 주기**를 선택해주세요.",
      field: 'healthCheckup',
      options: ['매년 받음', '2년에 한 번', '불규칙적', '받지 않음'],
      followUpMessage: (input: string) => {
        if (input.includes('매년')) {
          return '**정기검진**을 잘 챙기고 계시네요! 👍'
        }
        if (input.includes('불규칙') || input.includes('받지')) {
          return '건강검진도 함께 챙겨보세요. 조기발견이 가장 좋은 치료입니다!'
        }
        return '검진 패턴도 고려해서 준비해드리겠습니다.'
      }
    },
    {
      aiMessage: "**가장 중요한 보장**을 선택해주세요. (복수 선택)",
      field: 'concerns',
      options: ['암 진단 및 치료', '통원 치료비', '수술 및 입원비', '정기 검진', '응급상황 대응', '일상 건강관리'],
      multiSelect: true,
      followUpMessage: (input: string) => {
        if (input.includes('암')) {
          return '암 보장을 가장 중요하게 생각하시는군요. 이제 마지막 단계입니다! 💪'
        }
        if (input.includes('통원') || input.includes('치료비')) {
          return '일상의 의료비까지 꼼꼼히 준비하시는군요. 이제 마지막 단계입니다!'
        }
        return '맞춤 보장을 준비해드리겠습니다. 이제 마지막 단계입니다!'
      }
    }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (useOpenAI) {
      // OpenAI 모드: 구조적 질문 시작
      if (messages.length === 0) {
        const timer = setTimeout(() => {
          addMessage('ai', '**CARE+ 효도상담사**입니다 💐\n\n부모님을 위한 보험 상담을 도와드리겠습니다.')

          // 첫 번째 질문 자동 표시
          setTimeout(() => {
            const firstQuestion = requiredQuestions[0]
            addMessage('ai', `**총 ${requiredQuestions.length}가지 질문**을 통해 맞춤 상담을 진행하겠습니다.\n\n${firstQuestion.question}`)
          }, 1500)
        }, 500)
        return () => clearTimeout(timer)
      }
    } else {
      // 기본 모드: 기존 chatFlow 사용
      if (currentStep < chatFlow.length) {
        setOptionsReady(false)

        const timer = setTimeout(() => {
          addMessage('ai', chatFlow[currentStep].aiMessage)

          setTimeout(() => {
            setOptionsReady(true)
          }, 1000)
        }, 500)
        return () => clearTimeout(timer)
      }
    }
  }, [currentStep, useOpenAI, messages.length])

  const addMessage = (sender: 'ai' | 'user', text: string, isLoading?: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender,
      text,
      timestamp: new Date(),
      isLoading
    }

    // 중복 메시지 방지 및 연속 메시지 처리
    if (!isLoading && text.trim()) {
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1]

        // 완전 동일한 메시지 중복 방지
        if (lastMessage &&
            lastMessage.sender === sender &&
            lastMessage.text === text) {
          console.log('중복 메시지 방지:', text)
          return prev
        }

        // 연속된 AI 메시지 중에서 질문이 반복되는 경우 방지
        if (sender === 'ai' && lastMessage &&
            lastMessage.sender === 'ai' &&
            text.includes('어떤') && lastMessage.text.includes('어떤')) {
          console.log('반복 질문 방지:', text)
          return prev
        }

        return [...prev, newMessage]
      })
    } else {
      setMessages(prev => [...prev, newMessage])
    }

    return newMessage.id
  }

  // 현재 진행 단계 추적
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // 필수 질문 목록 정의
  const requiredQuestions = [
    {
      field: 'targetPerson',
      question: '어머님과 아버님 중 **어떤 분을 위한 보험**을 준비하고 계신가요? 💐',
      options: ['어머님', '아버님'],
      extractPattern: (text: string) => {
        if (text.includes('어머니') || text.includes('엄마') || text.includes('어머님')) return '어머님'
        if (text.includes('아버지') || text.includes('아빠') || text.includes('아버님')) return '아버님'
        return null
      }
    },
    {
      field: 'age',
      question: '**연세가 어떻게 되시나요?** 🌸',
      options: ['40대 (40-49세)', '50대 (50-59세)', '60대 (60-69세)', '70대 (70-79세)', '80대 (80세 이상)'],
      extractPattern: (text: string) => {
        if (text.includes('40') || text.includes('40대')) return '40대 (40-49세)'
        if (text.includes('50') || text.includes('50대')) return '50대 (50-59세)'
        if (text.includes('60') || text.includes('60대')) return '60대 (60-69세)'
        if (text.includes('70') || text.includes('70대')) return '70대 (70-79세)'
        if (text.includes('80') || text.includes('80대')) return '80대 (80세 이상)'
        return null
      }
    },
    {
      field: 'occupation',
      question: '**현재 어떤 일을 하고 계시나요?** 💼\n\n주부, 회사원, 자영업, 은퇴 등으로 알려주시면 됩니다.',
      options: ['주부', '회사원', '자영업', '은퇴'],
      extractPattern: (text: string) => {
        if (text.includes('주부') || text.includes('전업')) return '주부'
        if (text.includes('회사원') || text.includes('직장') || text.includes('회사') || text.includes('사무')) return '회사원'
        if (text.includes('자영업') || text.includes('사업') || text.includes('운영')) return '자영업'
        if (text.includes('은퇴') || text.includes('퇴직') || text.includes('쉬고')) return '은퇴'
        return '주부' // 기본값
      }
    },
    {
      field: 'healthStatus',
      question: '**현재 치료받고 계신 질환이 있으신가요?** 💚\n\n갑상선, 당뇨, 고혈압 등이 있으시면 알려주시고, 특별한 질환이 없으시면 "건강해요" 또는 "없어요"라고 말씀해주세요.',
      options: ['없음 (건강함)', '갑상선 질환', '자궁 관련 질환', '당뇨병', '고혈압', '기타 만성질환'],
      extractPattern: (text: string) => {
        const conditions = []
        if (text.includes('없') || text.includes('건강') || text.includes('괜찮')) conditions.push('없음 (건강함)')
        if (text.includes('갑상선')) conditions.push('갑상선 질환')
        if (text.includes('자궁') || text.includes('부인과')) conditions.push('자궁 관련 질환')
        if (text.includes('당뇨')) conditions.push('당뇨병')
        if (text.includes('고혈압') || text.includes('혈압')) conditions.push('고혈압')
        if (text.includes('질환') && conditions.length === 0) conditions.push('기타 만성질환')
        return conditions.length > 0 ? conditions : ['없음 (건강함)']
      }
    },
    {
      field: 'familyHistory',
      question: '**가족력으로 걱정되는 질병이 있으신가요?** 🏥\n\n부모님이나 형제자매 분들이 앓으셨던 병이 있으시면 알려주세요. 암, 당뇨, 고혈압 등이 있으시거나 특별히 없으시면 "없어요"라고 해주세요.',
      options: ['없음', '암 (각종 암)', '갑상선 질환', '자궁/난소 질환', '당뇨병', '고혈압', '심장병'],
      extractPattern: (text: string) => {
        const history = []
        if (text.includes('없') || text.includes('깨끗') || text.includes('괜찮')) return ['없음']
        if (text.includes('암')) history.push('암 (각종 암)')
        if (text.includes('갑상선')) history.push('갑상선 질환')
        if (text.includes('자궁') || text.includes('난소') || text.includes('부인과')) history.push('자궁/난소 질환')
        if (text.includes('당뇨')) history.push('당뇨병')
        if (text.includes('고혈압') || text.includes('혈압')) history.push('고혈압')
        if (text.includes('심장')) history.push('심장병')
        return history.length > 0 ? history : ['없음']
      }
    },
    {
      field: 'healthCheckup',
      question: '**건강검진은 얼마나 자주 받고 계시나요?** 🩺\n\n매년 받으시는지, 2-3년에 한 번인지, 아니면 불규칙하게 받으시는지 알려주세요.',
      options: ['매년 정기적으로', '2-3년에 한 번', '가끔씩 불규칙하게', '거의 받지 않음'],
      extractPattern: (text: string) => {
        if (text.includes('매년') || text.includes('정기') || text.includes('1년') || text.includes('년마다')) return '매년 정기적으로'
        if (text.includes('2년') || text.includes('3년') || text.includes('2-3')) return '2-3년에 한 번'
        if (text.includes('불규칙') || text.includes('가끔') || text.includes('때때로') || text.includes('생각날')) return '가끔씩 불규칙하게'
        if (text.includes('안') || text.includes('없') || text.includes('거의') || text.includes('못')) return '거의 받지 않음'
        return '가끔씩 불규칙하게'
      }
    },
    {
      field: 'concerns',
      question: '**가장 걱정되는 부분이 무엇인가요?** 🛡️\n\n암 치료비, 병원 통원비, 수술비, 일상 의료비 등 어떤 부분이 가장 걱정되시는지 자유롭게 말씀해주세요.',
      options: ['암 진단 시 치료비', '병원 통원 치료비', '큰 수술이나 입원비', '정기 건강검진비', '응급실 이용비', '일상 의료비'],
      extractPattern: (text: string) => {
        const concerns = []
        if (text.includes('암') || text.includes('큰병') || text.includes('중병')) concerns.push('암 진단 시 치료비')
        if (text.includes('통원') || text.includes('외래') || text.includes('병원비')) concerns.push('병원 통원 치료비')
        if (text.includes('수술') || text.includes('입원') || text.includes('큰 병')) concerns.push('큰 수술이나 입원비')
        if (text.includes('검진') || text.includes('건강검진') || text.includes('정기')) concerns.push('정기 건강검진비')
        if (text.includes('응급') || text.includes('급한') || text.includes('응급실')) concerns.push('응급실 이용비')
        if (text.includes('일상') || text.includes('평소') || text.includes('의료비') || text.includes('전체') || text.includes('모든')) concerns.push('일상 의료비')
        return concerns.length > 0 ? concerns : ['암 진단 시 치료비']
      }
    }
  ]

  // OpenAI API 호출 함수
  const callOpenAI = async (userMessage: string, context: string): Promise<{message: string, shouldComplete: boolean, parentInfo: any}> => {
    try {
      setIsAiResponding(true)

      // 로딩 메시지 추가
      const loadingMessageId = addMessage('ai', '', true)

      // 현재 질문 정보
      const currentQuestion = requiredQuestions[currentQuestionIndex]
      const totalQuestions = requiredQuestions.length
      const isLastQuestion = currentQuestionIndex >= totalQuestions - 1

      const systemPrompt = `당신은 "CARE+ 효도상담사"입니다. 부모님을 사랑하는 자녀의 마음을 이해하는 따뜻한 상담사입니다.

**📋 구조적 상담 진행 (${currentQuestionIndex + 1}/${totalQuestions})**

**현재 질문:** ${currentQuestion ? currentQuestion.question : '완료'}
**현재 필드:** ${currentQuestion ? currentQuestion.field : '완료'}

**이미 수집된 정보:**
${Object.entries(parentInfo).map(([key, value]) =>
  `- ${key}: ${Array.isArray(value) ? value.join(', ') : value}`
).join('\n')}

**🚨 CRITICAL 응답 규칙:**
1. 사용자의 답변에서 정보를 추출하여 JSON에 포함
2. ${currentQuestionIndex === 0 ? '첫 번째 답변: 절대 질문으로 끝내지 말고, 공감적 확인 메시지만 제공' : '공감적 응답 제공 후 자연스럽게 다음 질문 안내'}
3. ${isLastQuestion ? '모든 정보 수집 완료시 shouldComplete: true' : '다음 질문은 시스템이 자동으로 처리하므로 질문 포함 금지'}
4. 이미 수집된 정보는 절대 재질문 금지
5. 간결하고 따뜻한 톤으로 응답

**필수 JSON 응답:**
{
  "shouldComplete": ${isLastQuestion ? 'true' : 'false'},
  "parentInfo": {"${currentQuestion ? currentQuestion.field : ''}": "사용자_답변에서_추출한_값"},
  "message": "${currentQuestionIndex === 0 ? '첫 번째는 공감적 확인만: \"**어머님(또는 아버님)**을 위한 보험을 준비해드리겠습니다 💝\"' : isLastQuestion ? '완료 메시지' : '공감적 응답만 (질문 금지)'}"
}

**대화 스타일:** 💐🌸💝 이모티콘, "**강조**" 사용, 따뜻하고 간결한 톤`

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: context,
          systemPrompt: systemPrompt,
          isConsultationMode: true
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', response.status, errorData)
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()

      // 로딩 메시지 제거
      setMessages(prev => prev.filter(msg => msg.id !== loadingMessageId))

      try {
        // JSON 응답 파싱 시도
        let parsed
        try {
          parsed = JSON.parse(data.message)
        } catch {
          // JSON 파싱 실패시 메시지에서 JSON 추출 시도
          const jsonMatch = data.message.match(/\{[^}]*"shouldComplete"[^}]*\}/)
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0])
          } else {
            throw new Error('JSON not found')
          }
        }

        console.log('LLM 응답 파싱:', parsed)

        return {
          message: parsed.message || data.message,
          shouldComplete: parsed.shouldComplete || false,
          parentInfo: parsed.parentInfo || {}
        }
      } catch (error) {
        console.error('JSON 파싱 실패:', error, 'Original message:', data.message)

        // 강제로 일반 메시지로 처리하되, 간단한 패턴 매칭으로 정보 추출 시도
        const message = data.message || '죄송합니다. 응답을 생성할 수 없습니다.'
        const extractedInfo: any = {}

        // 간단한 패턴 매칭
        if (message.includes('어머님') && !parentInfo.targetPerson) {
          extractedInfo.targetPerson = '어머님'
        } else if (message.includes('아버님') && !parentInfo.targetPerson) {
          extractedInfo.targetPerson = '아버님'
        }

        // 연령대 패턴 매칭
        const ageMatch = message.match(/(40대|50대|60대|70대|80대)/)
        if (ageMatch && !parentInfo.age) {
          extractedInfo.age = ageMatch[1]
        }

        return {
          message: message,
          shouldComplete: false,
          parentInfo: extractedInfo
        }
      }

    } catch (error) {
      console.error('OpenAI API 호출 오류:', error)

      // 로딩 메시지 제거
      setMessages(prev => prev.filter(msg => !msg.isLoading))

      return {
        message: '죄송합니다. 일시적으로 AI 상담 서비스에 문제가 있습니다. 직접 입력하시거나 잠시 후 다시 시도해주세요.',
        shouldComplete: false,
        parentInfo: {}
      }
    } finally {
      setIsAiResponding(false)
    }
  }

  // fallback 응답 처리 함수
  const handleFallbackResponse = (currentStepData: any, userMessage: string, newParentInfo: any) => {
    // 기본 응답 로직
    if (currentStepData.followUpMessage) {
      const followUp = currentStepData.followUpMessage(userMessage)
      addMessage('ai', followUp)
    }

    // 다음 단계로 진행
    if (currentStep < chatFlow.length - 1) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1)
      }, 1500)
    } else {
      // 마지막 단계일 때 완료 처리
      setTimeout(() => {
        const summaryMessage = generateSummaryMessage(newParentInfo)
        addMessage('ai', summaryMessage)
        setTimeout(() => {
          onComplete(newParentInfo)
        }, 2000)
      }, 1000)
    }
  }

  // 대화 맥락 생성 함수
  const createContext = (): string => {
    const recentMessages = messages.slice(-10) // 최근 10개 메시지로 확장
    const context = recentMessages.map(msg =>
      `${msg.sender === 'user' ? '고객' : 'AI상담사'}: ${msg.text}`
    ).join('\n')

    // 수집된 정보 요약
    const collectedInfo = []
    if (parentInfo.targetPerson) collectedInfo.push(`대상자: ${parentInfo.targetPerson}`)
    if (parentInfo.age) collectedInfo.push(`연령: ${parentInfo.age}`)
    if (parentInfo.occupation) collectedInfo.push(`직업: ${parentInfo.occupation}`)
    if (parentInfo.healthStatus) collectedInfo.push(`건강상태: ${Array.isArray(parentInfo.healthStatus) ? parentInfo.healthStatus.join(', ') : parentInfo.healthStatus}`)
    if (parentInfo.familyHistory) collectedInfo.push(`가족력: ${Array.isArray(parentInfo.familyHistory) ? parentInfo.familyHistory.join(', ') : parentInfo.familyHistory}`)
    if (parentInfo.healthCheckup) collectedInfo.push(`검진주기: ${parentInfo.healthCheckup}`)
    if (parentInfo.concerns) collectedInfo.push(`관심보장: ${Array.isArray(parentInfo.concerns) ? parentInfo.concerns.join(', ') : parentInfo.concerns}`)

    const infoSummary = collectedInfo.length > 0
      ? `\n\n이미 수집된 정보: ${collectedInfo.join(' | ')}`
      : '\n\n아직 수집된 정보가 없습니다.'

    return context + infoSummary
  }

  const handleOptionSelect = (option: string) => {
    const currentStepData = chatFlow[currentStep]
    
    if (currentStepData.multiSelect) {
      const newSelectedOptions = selectedOptions.includes(option)
        ? selectedOptions.filter(item => item !== option)
        : [...selectedOptions, option]
      setSelectedOptions(newSelectedOptions)
    } else {
      setSelectedOptions([option])
      // 단일 선택의 경우 바로 메시지 전송
      setTimeout(() => handleSendMessage(option), 100)
    }
  }

  const handleSendMessage = async (optionText?: string) => {
    let messageText = optionText || currentInput.trim()

    if (!messageText || isAiResponding) return

    if (useOpenAI) {
      // OpenAI 모드: 자유로운 대화
      addMessage('user', messageText)
      setCurrentInput('')
      setSelectedOptions([])

      // 사용자 입력에서 직접 정보 추출 (백업 메커니즘)
      const userExtractedInfo: any = {}

      // 대상자 추출
      if (!parentInfo.targetPerson) {
        if (messageText.includes('어머니') || messageText.includes('엄마') || messageText.includes('어머님')) {
          userExtractedInfo.targetPerson = '어머님'
        } else if (messageText.includes('아버지') || messageText.includes('아빠') || messageText.includes('아버님')) {
          userExtractedInfo.targetPerson = '아버님'
        }
      }

      // 연령대 추출
      if (!parentInfo.age) {
        const ageMatch = messageText.match(/(40대|50대|60대|70대|80대)/)
        if (ageMatch) {
          userExtractedInfo.age = ageMatch[1]
        }
      }

      // 직업 추출
      if (!parentInfo.occupation) {
        if (messageText.includes('주부')) userExtractedInfo.occupation = '주부'
        else if (messageText.includes('회사원') || messageText.includes('직장')) userExtractedInfo.occupation = '회사원'
        else if (messageText.includes('자영업')) userExtractedInfo.occupation = '자영업'
        else if (messageText.includes('은퇴')) userExtractedInfo.occupation = '은퇴'
      }

      // 사용자 입력에서 추출된 정보가 있으면 즉시 업데이트
      if (Object.keys(userExtractedInfo).length > 0) {
        setParentInfo(prev => {
          const updated = { ...prev, ...userExtractedInfo }
          console.log('사용자 입력에서 정보 추출:', userExtractedInfo, '전체 업데이트:', updated)
          return updated
        })
      }

      try {
        const context = createContext()
        const aiResult = await callOpenAI(messageText, context)

        // 현재 질문에서 정보 추출 시도
        const currentQuestion = requiredQuestions[currentQuestionIndex]
        let extractedValue = null

        // 1. LLM 응답에서 정보 추출
        if (Object.keys(aiResult.parentInfo).length > 0) {
          extractedValue = aiResult.parentInfo[currentQuestion?.field]
        }

        // 2. 패턴 매칭으로 백업 추출
        if (!extractedValue && currentQuestion) {
          extractedValue = currentQuestion.extractPattern(messageText)
        }

        console.log(`질문 ${currentQuestionIndex + 1}/${requiredQuestions.length}: ${currentQuestion?.field} = ${extractedValue}`)

        // 정보 업데이트
        let finalParentInfo = parentInfo
        if (extractedValue && currentQuestion) {
          setParentInfo(prev => {
            const updated = { ...prev, [currentQuestion.field]: extractedValue }
            console.log('정보 업데이트:', updated)
            finalParentInfo = updated
            return updated
          })
        }

        addMessage('ai', aiResult.message)

        // 다음 단계 진행 로직
        if (aiResult.shouldComplete || currentQuestionIndex >= requiredQuestions.length - 1) {
          // 상담 완료
          console.log('🎉 상담 완료! 상품 추천으로 이동')
          setTimeout(() => {
            onComplete(finalParentInfo)
          }, 2000)
        } else if (extractedValue) {
          // 다음 질문으로 진행
          setTimeout(() => {
            setCurrentQuestionIndex(prev => {
              const nextIndex = prev + 1
              console.log(`다음 질문으로 이동: ${nextIndex + 1}/${requiredQuestions.length}`)

              // 다음 질문 자동 표시 (약간 더 빠르게)
              if (nextIndex < requiredQuestions.length) {
                setTimeout(() => {
                  const nextQuestion = requiredQuestions[nextIndex]
                  addMessage('ai', nextQuestion.question)
                }, 800) // 1500ms에서 800ms로 단축
              }

              return nextIndex
            })
          }, 500) // 1000ms에서 500ms로 단축
        } else {
          // 정보 추출 실패시 재질문 방지를 위한 강제 진행
          console.log('⚠️ 정보 추출 실패, 하지만 다음 단계로 진행')
          setTimeout(() => {
            setCurrentQuestionIndex(prev => {
              const nextIndex = prev + 1
              if (nextIndex < requiredQuestions.length) {
                setTimeout(() => {
                  const nextQuestion = requiredQuestions[nextIndex]
                  addMessage('ai', nextQuestion.question)
                }, 800)
              }
              return nextIndex
            })
          }, 1000)
        }
      } catch (error) {
        console.error('OpenAI 응답 처리 오류:', error)
        addMessage('ai', '죄송합니다. 일시적으로 AI 상담 서비스에 문제가 있습니다. 기본 상담으로 진행하겠습니다.')
        setUseOpenAI(false)
      }
    } else {
      // 기본 모드: 기존 chatFlow 사용
      const currentStepData = chatFlow[currentStep]

      // 다중 선택의 경우 선택된 옵션들을 조합
      if (currentStepData.multiSelect && selectedOptions.length > 0) {
        messageText = selectedOptions.join(', ')
      }

      if (currentStep >= chatFlow.length) return

      if (currentStepData.validation) {
        const validationError = currentStepData.validation(messageText)
        if (validationError) {
          addMessage('ai', validationError)
          return
        }
      }

      addMessage('user', messageText)
      setOptionsReady(false)

      const newParentInfo = {
        ...parentInfo,
        [currentStepData.field]: messageText
      }
      setParentInfo(newParentInfo)
      setCurrentInput('')
      setSelectedOptions([])

      // 기존 로직 사용
      handleFallbackResponse(currentStepData, messageText, newParentInfo)
    }
  }


  const generateSummaryMessage = (info: any) => {
    const genderText = info.targetPerson?.includes('어머님') ? '어머님' : '아버님'
    const age = parseInt(info.age) || 60
    const isMotherFlow = info.targetPerson?.includes('어머님')

    let message = `말씀해주신 ${genderText} 정보를 바탕으로 **맞춤 보험 추천**을 준비했습니다 💝\n\n`

    if (isMotherFlow) {
      const hasThyroidOrUterine = info.healthStatus?.includes('갑상선') || info.healthStatus?.includes('자궁') ||
                                  info.familyHistory?.includes('갑상선') || info.familyHistory?.includes('자궁')
      const hasWorkingStatus = info.occupation?.includes('직장') || info.occupation?.includes('회사')

      if (age >= 63 && hasThyroidOrUterine && hasWorkingStatus) {
        message += `${age}세 어머님께서 갑상선과 자궁 질환 이력이 있으시고 아직도 활발히 직장을 다니고 계시는군요. 이런 상황에서는 **e시그니처암보험(종합)**이 가장 적합한 선택이 될 것 같습니다.`
      } else if (hasThyroidOrUterine) {
        message += `어머님의 갑상선이나 자궁 관련 건강 이력을 특별히 고려한 **여성 특화 보장**을 중심으로 추천해드리겠습니다.`
      } else if (age >= 60) {
        message += `${age}세 어머님의 연령과 생활 패턴을 고려해서 가장 적합한 한화생명 e상품을 선별해드렸습니다.`
      } else {
        message += `어머님의 건강 상태와 생활 패턴을 꼼꼼히 고려해서 가장 적합한 한화생명 e상품을 찾아드렸습니다.`
      }
    } else {
      // 아버님을 위한 메시지
      const hasCardiovascularOrProstate = info.healthStatus?.includes('전립선') || info.healthStatus?.includes('심혈관') ||
                                          info.familyHistory?.includes('전립선') || info.familyHistory?.includes('심혈관')
      const hasWorkingStatus = info.occupation?.includes('직장') || info.occupation?.includes('회사')

      if (age >= 60 && hasCardiovascularOrProstate) {
        message += `${age}세 아버님의 전립선이나 심혈관 관련 건강 이력을 특별히 고려한 **남성 특화 보장**을 중심으로 추천해드리겠습니다.`
      } else if (age >= 60) {
        message += `${age}세 아버님의 연령과 생활 패턴을 고려해서 가장 적합한 한화생명 e상품을 선별해드렸습니다.`
      } else {
        message += `아버님의 건강 상태와 생활 패턴을 꼼꼼히 고려해서 가장 적합한 한화생명 e상품을 찾아드렸습니다.`
      }
    }

    message += `\n\n${genderText}이 걱정 없이 웃을 수 있도록, 세상에서 가장 소중한 분을 위한 특별한 보장을 준비해드리겠습니다.`

    return message
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={onBack} className="mr-4 p-2 hover:bg-neutral-100 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-coral rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-semibold text-sm">AI</span>
              </div>
              <div>
                <h2 className="font-semibold text-neutral-800">CARE+ 케어 상담사</h2>
                <p className="text-sm text-neutral-500">
                  {useOpenAI ? '🤖 AI 케어 상담' : '📋 기본 상담'}
                </p>
              </div>
            </div>
          </div>
          
          {/* OpenAI 토글 버튼 */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-neutral-600">OpenAI</span>
            <button
              onClick={() => setUseOpenAI(!useOpenAI)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 ${
                useOpenAI ? 'bg-coral' : 'bg-neutral-300'
              }`}
              disabled={isAiResponding}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  useOpenAI ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Progress - Fixed at top */}
      <div className="bg-white px-4 py-2 border-b sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-neutral-600">상담 진행</span>
          <span className="text-sm text-coral font-semibold">
            {useOpenAI
              ? `${Math.min(currentQuestionIndex + 1, requiredQuestions.length)} / ${requiredQuestions.length}`
              : `${Math.min(currentStep + 1, chatFlow.length)} / ${chatFlow.length}`
            }
          </span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div
            className="bg-coral h-2 rounded-full transition-all duration-500"
            style={{
              width: useOpenAI
                ? `${(Math.min(currentQuestionIndex + 1, requiredQuestions.length) / requiredQuestions.length) * 100}%`
                : `${(Math.min(currentStep + 1, chatFlow.length) / chatFlow.length) * 100}%`
            }}
          ></div>
        </div>

        {/* Current step indicator - Enhanced visibility */}
        {useOpenAI && currentQuestionIndex < requiredQuestions.length && (
          <div className="mt-3 bg-coral-50 px-3 py-2 rounded-lg border border-coral-200">
            <div className="text-sm font-semibold text-coral text-center">
              📋 현재 단계: {' '}
              {requiredQuestions[currentQuestionIndex]?.field === 'targetPerson' && '대상자 선택'}
              {requiredQuestions[currentQuestionIndex]?.field === 'age' && '연령 확인'}
              {requiredQuestions[currentQuestionIndex]?.field === 'occupation' && '직업/상황'}
              {requiredQuestions[currentQuestionIndex]?.field === 'healthStatus' && '건강상태'}
              {requiredQuestions[currentQuestionIndex]?.field === 'familyHistory' && '가족력'}
              {requiredQuestions[currentQuestionIndex]?.field === 'healthCheckup' && '검진주기'}
              {requiredQuestions[currentQuestionIndex]?.field === 'concerns' && '걱정사항'}
            </div>
            <div className="text-xs text-coral-600 text-center mt-1">
              ({currentQuestionIndex + 1}단계 / 총 {requiredQuestions.length}단계)
            </div>
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 relative">
        <div className="max-w-2xl mx-auto">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Floating Progress Indicator - Only when scrolled and OpenAI mode */}
        {useOpenAI && messages.length > 3 && (
          <div className="fixed top-20 right-4 bg-white shadow-lg rounded-lg px-3 py-2 border border-coral-200 z-20 min-w-[140px]">
            <div className="text-xs text-coral font-semibold text-center mb-2">
              📋 {currentQuestionIndex + 1} / {requiredQuestions.length}
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-1.5">
              <div
                className="bg-coral h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${(Math.min(currentQuestionIndex + 1, requiredQuestions.length) / requiredQuestions.length) * 100}%`
                }}
              ></div>
            </div>
            <div className="text-xs text-coral-600 text-center mt-1 font-medium">
              {requiredQuestions[currentQuestionIndex]?.field === 'targetPerson' && '대상자 선택'}
              {requiredQuestions[currentQuestionIndex]?.field === 'age' && '연령 확인'}
              {requiredQuestions[currentQuestionIndex]?.field === 'occupation' && '직업/상황'}
              {requiredQuestions[currentQuestionIndex]?.field === 'healthStatus' && '건강상태'}
              {requiredQuestions[currentQuestionIndex]?.field === 'familyHistory' && '가족력'}
              {requiredQuestions[currentQuestionIndex]?.field === 'healthCheckup' && '검진주기'}
              {requiredQuestions[currentQuestionIndex]?.field === 'concerns' && '걱정사항'}
              {currentQuestionIndex >= requiredQuestions.length && '완료'}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <div className="max-w-2xl mx-auto">
          {isAiResponding && (
            <div className="mb-3 text-center">
              <span className="chat-typing-indicator rounded-full text-xs bg-coral-50 text-coral-600">
                <div className="w-2 h-2 bg-coral-400 rounded-full animate-pulse mr-2"></div>
                CARE+ 답변중...
              </span>
            </div>
          )}
          
          {/* 옵션 선택 버튼들 - 기본 모드에서만 표시 */}
          {!useOpenAI && !isAiResponding && currentStep < chatFlow.length && chatFlow[currentStep].options && (
            <div className="mb-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                {chatFlow[currentStep].options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => optionsReady ? handleOptionSelect(option) : null}
                    disabled={!optionsReady}
                    className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                      !optionsReady
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : selectedOptions.includes(option)
                        ? 'bg-coral text-white border-coral'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:border-coral hover:bg-coral-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {/* 다중 선택용 확인 버튼 */}
              {chatFlow[currentStep].multiSelect && selectedOptions.length > 0 && optionsReady && (
                <div className="text-center">
                  <button
                    onClick={() => handleSendMessage()}
                    className="btn-filled"
                  >
                    선택 완료 ({selectedOptions.length}개)
                  </button>
                </div>
              )}
            </div>
          )}
          
          <div className="flex gap-3">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                useOpenAI
                  ? isAiResponding ? "AI 상담사가 답변 중..." : "부모님에 대해 편하게 말씀해주세요..."
                  : currentStep < chatFlow.length && chatFlow[currentStep].options
                  ? "위에서 선택하시거나 직접 입력하세요..."
                  : isAiResponding ? "AI 응답을 기다리는 중..." : "메시지를 입력하세요..."
              }
              className="flex-1 border border-neutral-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent disabled:bg-neutral-100 disabled:text-neutral-500 disabled:border-neutral-200"
              disabled={isAiResponding || (!useOpenAI && currentStep >= chatFlow.length)}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!currentInput.trim() || isAiResponding || (!useOpenAI && currentStep >= chatFlow.length)}
              className="btn-filled"
            >
              {isAiResponding ? '처리중...' : '전송'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}