import { useState, useEffect, useRef } from 'react'

interface Message {
  id: string
  sender: 'ai' | 'user'
  text: string
  timestamp: Date
  isLoading?: boolean
}

interface ConsultationChatProps {
  onComplete: (motherInfo: any) => void
  onBack: () => void
}

const ChatBubble = ({ message }: { message: Message }) => (
  <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
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
        <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
      )}
    </div>
  </div>
)

export default function ConsultationChat({ onComplete, onBack }: ConsultationChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  const [motherInfo, setMotherInfo] = useState<any>({})
  const [isAiResponding, setIsAiResponding] = useState(false)
  const [useOpenAI, setUseOpenAI] = useState(true) // OpenAI 사용 여부 토글
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const chatFlow = [
    {
      aiMessage: "안녕하세요! CARE+ AI 케어 상담사입니다 💐\n\n먼저 어머님 연세대를 선택해주세요.",
      field: 'age',
      options: ['40대', '50대', '60대', '70대', '80대'],
      validation: (input: string) => {
        return input ? null : '연령대를 선택해주세요.'
      },
      followUpMessage: (input: string) => {
        if (input.includes('60') || input.includes('70') || input.includes('80')) {
          return `${input} 어머님이시군요. 더욱 세심한 건강 케어가 필요한 시기이시네요.`
        }
        return `${input} 어머님을 위한 최적의 케어 플랜을 찾아보겠습니다.`
      }
    },
    {
      aiMessage: "어머님의 현재 상황을 선택해주세요.",
      field: 'occupation',
      options: ['주부', '회사원', '자영업', '은퇴', '기타'],
      followUpMessage: (input: string) => {
        if (input.includes('회사원') || input.includes('자영업')) {
          return '아직도 활발히 활동하고 계시는군요! 활동적인 어머님이시네요.'
        }
        return '어머님의 생활 패턴을 고려해서 맞춤 케어 플랜을 찾아드리겠습니다.'
      }
    },
    {
      aiMessage: "어머님의 건강 상태를 선택해주세요. (복수 선택 가능)",
      field: 'healthStatus',
      options: ['건강함', '갑상선 질환', '자궁 관련 질환', '당뇨', '고혈압', '기타 만성질환'],
      multiSelect: true,
      followUpMessage: (input: string) => {
        if (input.includes('갑상선') || input.includes('자궁')) {
          return '갑상선이나 자궁 관련 질환을 겪고 계시는군요. 이런 부분을 특별히 고려해서 케어 플랜을 찾아보겠습니다.'
        }
        if (input.includes('건강함')) {
          return '건강하게 지내고 계시는군요. 예방 차원에서도 좋은 케어가 필요해요.'
        }
        return '어머님의 건강 상태를 꼼꼼히 고려해서 맞춤 케어 플랜을 준비해드리겠습니다.'
      }
    },
    {
      aiMessage: "가족력으로 걱정되는 질병이 있으시다면 선택해주세요. (복수 선택 가능)",
      field: 'familyHistory',
      options: ['없음', '암', '갑상선 질환', '자궁 질환', '당뇨', '고혈압', '심장병'],
      multiSelect: true,
      followUpMessage: (input: string) => {
        if (input.includes('암')) {
          return '가족력에 암이 있으시는군요. 미리 대비해두시는 것이 현명한 선택입니다.'
        }
        if (input.includes('갑상선') || input.includes('자궁')) {
          return '여성 질환 관련 가족력이 있으시는군요. 이 부분을 중점적으로 고려해보겠습니다.'
        }
        return '가족력을 고려한 맞춤 케어 플랜을 준비해드리겠습니다.'
      }
    },
    {
      aiMessage: "어머님의 건강검진 주기를 선택해주세요.",
      field: 'healthCheckup',
      options: ['매년 받음', '2년에 한 번', '불규칙적', '받지 않음'],
      followUpMessage: (input: string) => {
        if (input.includes('매년')) {
          return '정기적으로 건강검진을 받고 계시는군요. 건강 관리를 잘 하고 계시네요.'
        }
        if (input.includes('불규칙') || input.includes('받지')) {
          return '건강검진을 규칙적으로 받지 않고 계시는군요. 케어 플랜과 함께 건강검진도 챙겨보세요.'
        }
        return '건강검진 패턴을 고려해서 케어 플랜을 설계해드리겠습니다.'
      }
    },
    {
      aiMessage: "마지막으로, 어머님께 가장 중요한 케어 포인트를 선택해주세요. (복수 선택 가능)",
      field: 'concerns',
      options: ['암 진단 및 치료', '통원 치료비', '수술 및 입원비', '정기 검진', '응급상황 대응', '일상 건강관리'],
      multiSelect: true,
      followUpMessage: (input: string) => {
        if (input.includes('암')) {
          return '암 진단과 치료에 대한 케어를 중요하게 생각하고 계시는군요.'
        }
        if (input.includes('통원') || input.includes('치료비')) {
          return '실제 치료비와 통원비 부분까지 꼼꼼히 고려해서 케어 플랜을 추천해드리겠습니다.'
        }
        return '어머님이 원하시는 케어 내용을 중심으로 최적의 플랜을 찾아드리겠습니다.'
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
    if (currentStep < chatFlow.length) {
      const timer = setTimeout(() => {
        addMessage('ai', chatFlow[currentStep].aiMessage)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentStep])

  const addMessage = (sender: 'ai' | 'user', text: string, isLoading?: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender,
      text,
      timestamp: new Date(),
      isLoading
    }
    setMessages(prev => [...prev, newMessage])
    return newMessage.id
  }

  // OpenAI API 호출 함수
  const callOpenAI = async (userMessage: string, context: string): Promise<string> => {
    try {
      setIsAiResponding(true)
      
      // 로딩 메시지 추가
      const loadingMessageId = addMessage('ai', '', true)
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: context,
          step: `${currentStep + 1}단계: ${chatFlow[currentStep]?.field || '일반상담'}`
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

      return data.message || '죄송합니다. 응답을 생성할 수 없습니다.'

    } catch (error) {
      console.error('OpenAI API 호출 오류:', error)

      // 로딩 메시지 제거
      setMessages(prev => prev.filter(msg => msg.isLoading))
      
      return '죄송합니다. 일시적 문제가 있습니다.'
    } finally {
      setIsAiResponding(false)
    }
  }

  // 대화 맥락 생성 함수
  const createContext = (): string => {
    const recentMessages = messages.slice(-6) // 최근 6개 메시지
    const context = recentMessages.map(msg => 
      `${msg.sender === 'user' ? '고객' : 'AI상담사'}: ${msg.text}`
    ).join('\n')
    
    const motherInfoContext = Object.keys(motherInfo).length > 0 
      ? `\n현재까지 수집된 어머님 정보: ${JSON.stringify(motherInfo, null, 2)}`
      : ''
    
    return context + motherInfoContext
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
    const currentStepData = chatFlow[currentStep]
    let messageText = optionText || currentInput.trim()
    
    // 다중 선택의 경우 선택된 옵션들을 조합
    if (currentStepData.multiSelect && selectedOptions.length > 0) {
      messageText = selectedOptions.join(', ')
    }
    
    if (!messageText || currentStep >= chatFlow.length || isAiResponding) return

    if (currentStepData.validation) {
      const validationError = currentStepData.validation(messageText)
      if (validationError) {
        addMessage('ai', validationError)
        return
      }
    }

    addMessage('user', messageText)
    
    const newMotherInfo = {
      ...motherInfo,
      [currentStepData.field]: messageText
    }
    setMotherInfo(newMotherInfo)
    const userMessage = messageText
    setCurrentInput('')
    setSelectedOptions([])

    // OpenAI 사용 여부에 따라 다른 응답 처리
    if (useOpenAI) {
      try {
        const context = createContext()
        const aiResponse = await callOpenAI(userMessage, context)
        addMessage('ai', aiResponse)

        // 다음 단계로 진행 (OpenAI가 자연스럽게 대화를 이어갈 것임)
        if (currentStep < chatFlow.length - 1) {
          setTimeout(() => {
            setCurrentStep(prev => prev + 1)
          }, 1500)
        } else {
          // 마지막 단계일 때 완료 처리
          setTimeout(() => {
            onComplete(newMotherInfo)
          }, 2000)
        }
      } catch (error) {
        console.error('OpenAI 응답 처리 오류:', error)
        // 오류 시 기본 로직으로 fallback
        handleFallbackResponse(currentStepData, userMessage, newMotherInfo)
      }
    } else {
      // 기존 로직 사용
      handleFallbackResponse(currentStepData, userMessage, newMotherInfo)
    }
  }

  // 기본 응답 로직 (OpenAI 실패 시 또는 비활성화 시 사용)
  const handleFallbackResponse = (currentStepData: any, userMessage: string, newMotherInfo: any) => {
    // Add follow-up message if available
    if (currentStepData.followUpMessage) {
      setTimeout(() => {
        const followUp = currentStepData.followUpMessage(userMessage)
        addMessage('ai', followUp)
      }, 500)
    }

    if (currentStep === chatFlow.length - 1) {
      setTimeout(() => {
        const summaryMessage = generateSummaryMessage(newMotherInfo)
        addMessage('ai', summaryMessage)
        setTimeout(() => {
          onComplete(newMotherInfo)
        }, 2000)
      }, currentStepData.followUpMessage ? 1500 : 1000)
    } else {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1)
      }, currentStepData.followUpMessage ? 1500 : 1000)
    }
  }

  const generateSummaryMessage = (info: any) => {
    const age = parseInt(info.age) || 60
    const hasThyroidOrUterine = info.healthStatus?.includes('갑상선') || info.healthStatus?.includes('자궁') ||
                                info.familyHistory?.includes('갑상선') || info.familyHistory?.includes('자궁')
    const hasWorkingStatus = info.occupation?.includes('직장') || info.occupation?.includes('회사')
    
    let message = `말씀해주신 어머님 정보를 바탕으로 상담을 마무리할게요 💝\n\n`
    
    if (age >= 63 && hasThyroidOrUterine && hasWorkingStatus) {
      // PRD 시나리오와 정확히 일치하는 경우
      message += `${age}세 어머님께서 갑상선과 자궁 질환 이력이 있으시고 아직도 활발히 직장을 다니고 계시는군요. 이런 상황에서는 **e시그니처암보험(종합)**이 가장 적합한 선택이 될 것 같습니다.`
    } else if (hasThyroidOrUterine) {
      message += `어머님의 갑상선이나 자궁 관련 건강 이력을 특별히 고려해서, 여성 특화 보장이 강화된 **e시그니처암보험(종합)**을 우선 추천드립니다.`
    } else if (age >= 60) {
      message += `${age}세 어머님의 연령과 생활 패턴을 고려해서 가장 적합한 한화생명 e상품을 선별해드렸습니다.`
    } else {
      message += `어머님의 건강 상태와 생활 패턴을 꼼꼼히 고려해서 가장 적합한 한화생명 e상품을 찾아드렸습니다.`
    }
    
    message += `\n\n어머님이 걱정 없이 웃을 수 있도록, 세상에서 가장 소중한 분을 위한 특별한 보장을 준비해드리겠습니다.`
    
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

      {/* Progress */}
      <div className="bg-white px-4 py-2 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-neutral-600">상담 진행</span>
          <span className="text-sm text-coral font-semibold">
            {Math.min(currentStep + 1, chatFlow.length)} / {chatFlow.length}
          </span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div 
            className="bg-coral h-2 rounded-full transition-all duration-500"
            style={{ width: `${(Math.min(currentStep + 1, chatFlow.length) / chatFlow.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <div className="max-w-2xl mx-auto">
          {isAiResponding && (
            <div className="mb-3 text-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-coral-50 text-coral-600">
                <div className="w-2 h-2 bg-coral-400 rounded-full animate-pulse mr-2"></div>
                CARE+ 상담사가 답변중입니다...
              </span>
            </div>
          )}
          
          {/* 옵션 선택 버튼들 */}
          {currentStep < chatFlow.length && chatFlow[currentStep].options && (
            <div className="mb-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                {chatFlow[currentStep].options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(option)}
                    className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                      selectedOptions.includes(option)
                        ? 'bg-coral text-white border-coral'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:border-coral hover:bg-coral-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              
              {/* 다중 선택용 확인 버튼 */}
              {chatFlow[currentStep].multiSelect && selectedOptions.length > 0 && (
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
                currentStep < chatFlow.length && chatFlow[currentStep].options
                  ? "위에서 선택하시거나 직접 입력하세요..."
                  : isAiResponding ? "AI 응답을 기다리는 중..." : "메시지를 입력하세요..."
              }
              className="flex-1 border border-neutral-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent disabled:bg-neutral-100 disabled:text-neutral-500 disabled:border-neutral-200"
              disabled={currentStep >= chatFlow.length || isAiResponding}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!currentInput.trim() || currentStep >= chatFlow.length || isAiResponding}
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