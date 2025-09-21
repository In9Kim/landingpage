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
  const [motherInfo, setMotherInfo] = useState<any>({})
  const [isAiResponding, setIsAiResponding] = useState(false)
  const [useOpenAI, setUseOpenAI] = useState(true) // OpenAI 사용 여부 토글 - 기본값 true로 설정
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [optionsReady, setOptionsReady] = useState(false) // 옵션 선택 가능 상태
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const chatFlow = [
    {
      aiMessage: "**CARE+ 효도상담사**입니다 💐\n\n**어머님 연세**를 선택해주세요.",
      field: 'age',
      options: ['40대', '50대', '60대', '70대', '80대'],
      validation: (input: string) => {
        return input ? null : '연령대를 선택해주세요.'
      },
      followUpMessage: (input: string) => {
        if (input.includes('60') || input.includes('70') || input.includes('80')) {
          return `**${input} 어머님**이시네요. **여성질환 보장**이 중요해요!`
        }
        return `**${input} 어머님**을 위한 **맞춤 보장**을 찾아드릴게요 🌸`
      }
    },
    {
      aiMessage: "**어머님 현재 상황**을 선택해주세요.",
      field: 'occupation',
      options: ['주부', '회사원', '자영업', '은퇴', '기타'],
      followUpMessage: (input: string) => {
        if (input.includes('회사원') || input.includes('자영업')) {
          return '**활동적인 어머님**이시네요! 💪'
        }
        return '**생활패턴**을 고려해서 찾아드릴게요.'
      }
    },
    {
      aiMessage: "**어머님 건강상태**를 선택해주세요. (복수 선택)",
      field: 'healthStatus',
      options: ['건강함', '갑상선 질환', '자궁 관련 질환', '당뇨', '고혈압', '기타 만성질환'],
      multiSelect: true,
      followUpMessage: (input: string) => {
        if (input.includes('갑상선') || input.includes('자궁')) {
          return '**여성질환**이 있으시네요. **특화보장**이 필요해요! 💝'
        }
        if (input.includes('건강함')) {
          return '**건강한 어머님**이시네요. **예방보장**을 준비해요! 🌸'
        }
        return '**건강상태**를 고려해서 찾아드릴게요.'
      }
    },
    {
      aiMessage: "**가족력**으로 걱정되는 질병이 있나요? (복수 선택)",
      field: 'familyHistory',
      options: ['없음', '암', '갑상선 질환', '자궁 질환', '당뇨', '고혈압', '심장병'],
      multiSelect: true,
      followUpMessage: (input: string) => {
        if (input.includes('암')) {
          return '**암 가족력**이 있으시네요. **미리 대비**가 중요해요!'
        }
        if (input.includes('갑상선') || input.includes('자궁')) {
          return '**여성질환 가족력**이 있으시네요. **중점 보장**해드릴게요!'
        }
        return '**가족력**을 고려해서 찾아드릴게요.'
      }
    },
    {
      aiMessage: "**건강검진 주기**를 선택해주세요.",
      field: 'healthCheckup',
      options: ['매년 받음', '2년에 한 번', '불규칙적', '받지 않음'],
      followUpMessage: (input: string) => {
        if (input.includes('매년')) {
          return '**정기검진**을 잘 받고 계시네요! 👍'
        }
        if (input.includes('불규칙') || input.includes('받지')) {
          return '**건강검진**도 함께 챙겨보세요!'
        }
        return '**검진패턴**을 고려해드릴게요.'
      }
    },
    {
      aiMessage: "**가장 중요한 보장**을 선택해주세요. (복수 선택)",
      field: 'concerns',
      options: ['암 진단 및 치료', '통원 치료비', '수술 및 입원비', '정기 검진', '응급상황 대응', '일상 건강관리'],
      multiSelect: true,
      followUpMessage: (input: string) => {
        if (input.includes('암')) {
          return '**암보장**을 중요하게 생각하시는군요! 💪'
        }
        if (input.includes('통원') || input.includes('치료비')) {
          return '**치료비 보장**까지 꼼꼼히 고려해드릴게요!'
        }
        return '**원하시는 보장**을 중심으로 찾아드릴게요!'
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
      // 옵션 비활성화
      setOptionsReady(false)

      const timer = setTimeout(() => {
        addMessage('ai', chatFlow[currentStep].aiMessage)

        // AI 질문이 표시된 후 1초 뒤에 옵션 활성화
        setTimeout(() => {
          setOptionsReady(true)
        }, 1000)
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

    // 같은 sender의 연속된 메시지는 합치기 (로딩 메시지 제외)
    if (!isLoading && text.trim()) {
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1]
        if (lastMessage &&
            lastMessage.sender === sender &&
            !lastMessage.isLoading &&
            Date.now() - lastMessage.timestamp.getTime() < 2000) { // 2초 이내의 연속 메시지
          // 마지막 메시지에 텍스트 추가
          const updatedMessages = [...prev]
          updatedMessages[updatedMessages.length - 1] = {
            ...lastMessage,
            text: lastMessage.text + ' ' + text,
            timestamp: new Date()
          }
          return updatedMessages
        }
        return [...prev, newMessage]
      })
    } else {
      setMessages(prev => [...prev, newMessage])
    }

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

      // 응답을 하나의 문자열로 결합 (줄바꿈이나 분할된 응답 처리)
      const cleanResponse = (data.message || '죄송합니다. 응답을 생성할 수 없습니다.')
        .replace(/\n+/g, ' ') // 줄바꿈을 공백으로 변경
        .trim()

      return cleanResponse

    } catch (error) {
      console.error('OpenAI API 호출 오류:', error)

      // 로딩 메시지 제거
      setMessages(prev => prev.filter(msg => !msg.isLoading))

      return '죄송합니다. 일시적으로 AI 상담 서비스에 문제가 있습니다. 직접 입력하시거나 잠시 후 다시 시도해주세요.'
    } finally {
      setIsAiResponding(false)
    }
  }

  // fallback 응답 처리 함수
  const handleFallbackResponse = (currentStepData: any, userMessage: string, newMotherInfo: any) => {
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
        const summaryMessage = generateSummaryMessage(newMotherInfo)
        addMessage('ai', summaryMessage)
        setTimeout(() => {
          onComplete(newMotherInfo)
        }, 2000)
      }, 1000)
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

    // 사용자가 답변한 후 즉시 옵션 비활성화
    setOptionsReady(false)

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

        // API 에러 메시지 표시
        addMessage('ai', '죄송합니다. 일시적으로 AI 상담 서비스에 문제가 있습니다. 기본 상담으로 진행하겠습니다.')

        // 기본 로직으로 fallback - OpenAI 사용 비활성화
        setUseOpenAI(false)

        // 기본 상담 로직으로 처리
        setTimeout(() => {
          handleFallbackResponse(currentStepData, userMessage, newMotherInfo)
        }, 1000)
      }
    } else {
      // 기존 로직 사용
      handleFallbackResponse(currentStepData, userMessage, newMotherInfo)
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
              <span className="chat-typing-indicator rounded-full text-xs bg-coral-50 text-coral-600">
                <div className="w-2 h-2 bg-coral-400 rounded-full animate-pulse mr-2"></div>
                CARE+ 답변중...
              </span>
            </div>
          )}
          
          {/* 옵션 선택 버튼들 - AI 답변 중이거나 옵션이 준비되지 않았을 때 비활성화 */}
          {!isAiResponding && currentStep < chatFlow.length && chatFlow[currentStep].options && (
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