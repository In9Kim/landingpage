import { useState, useEffect } from 'react'

interface CompletionEventProps {
  onRestart: () => void
}

const gifts = [
  {
    id: 'health-checkup',
    name: '종합건강검진권',
    description: '갑상선, 자궁 관련 정밀 검사를 포함한 여성 맞춤 건강검진권',
    icon: '🏥',
    value: '18만원 상당',
    features: ['갑상선 초음파 검사', '자궁경부암 검사', '유방암 검사', '골밀도 검사'],
    deliveryInfo: '전국 한화생명 지정 병원에서 이용 가능'
  },
  {
    id: 'massage',
    name: '힐링 스파 & 마사지권',
    description: '어머님의 일상 피로와 스트레스를 풀어드리는 프리미엄 힐링 패키지',
    icon: '💆‍♀️',
    value: '12만원 상당',
    features: ['전신 아로마 마사지', '족욕 & 발마사지', '어깨·목 집중 케어', '힐링 차 서비스'],
    deliveryInfo: '전국 제휴 스파 및 마사지샵에서 이용'
  },
  {
    id: 'health-care-set',
    name: '프리미엄 건강관리 세트',
    description: '60대 여성 건강을 위한 엄선된 건강기능식품과 건강 용품',
    icon: '💝',
    value: '15만원 상당',
    features: ['여성 종합비타민', '오메가3', '칼슘+마그네슘', '건강 측정기(혈압계)'],
    deliveryInfo: '보험증서와 함께 택배 발송'
  }
]

export default function CompletionEvent({ onRestart }: CompletionEventProps) {
  const [selectedGift, setSelectedGift] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(true)
  const [currentStep, setCurrentStep] = useState<'celebration' | 'gift-selection' | 'final-message'>('celebration')

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false)
      setCurrentStep('gift-selection')
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleGiftSelect = (giftId: string) => {
    setSelectedGift(giftId)
    setTimeout(() => {
      setCurrentStep('final-message')
    }, 1000)
  }

  const selectedGiftData = gifts.find(gift => gift.id === selectedGift)

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce text-2xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              {['🎉', '🎊', '💝', '❤️', '✨'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Celebration Step */}
        {currentStep === 'celebration' && (
          <div className="text-center max-w-2xl mx-auto">
            <div className="mb-8">
              <div className="w-32 h-32 bg-gradient-hanwha rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <span className="text-4xl text-white">🎉</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                효도 보험 가입이<br />
                <span className="text-hanwha-red">완료되었습니다!</span>
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                어머님을 향한 따뜻한 마음이<br />
                든든한 보장으로 전해질 예정입니다 💝
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl mb-2">📱</div>
                  <h3 className="font-semibold text-gray-900 mb-1">SMS 발송</h3>
                  <p className="text-sm text-gray-600">어머님께 안내 문자가 발송됩니다</p>
                </div>
                <div>
                  <div className="text-2xl mb-2">📋</div>
                  <h3 className="font-semibold text-gray-900 mb-1">보험증서 발송</h3>
                  <p className="text-sm text-gray-600">3-5일 내 우편으로 발송됩니다</p>
                </div>
                <div>
                  <div className="text-2xl mb-2">📞</div>
                  <h3 className="font-semibold text-gray-900 mb-1">고객센터 안내</h3>
                  <p className="text-sm text-gray-600">1588-6363 언제든 문의하세요</p>
                </div>
              </div>
            </div>

            <div className="animate-bounce">
              <p className="text-hanwha-red font-medium">
                잠시만 기다려주세요... 특별한 선물을 준비했어요! ✨
              </p>
            </div>
          </div>
        )}

        {/* Gift Selection Step */}
        {currentStep === 'gift-selection' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-hanwha rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-white">🎁</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                효도의 마음을 담은<br />
                <span className="text-hanwha-red">특별한 선물</span>
              </h2>
              <p className="text-gray-600 mb-2">
                어머님을 위한 보험 가입을 축하드리며,<br />
                건강과 행복을 위한 선물을 준비했습니다
              </p>
              <p className="text-sm text-hanwha-red font-medium">
                하나를 선택해주세요 (무료 제공)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {gifts.map((gift) => (
                <div
                  key={gift.id}
                  onClick={() => handleGiftSelect(gift.id)}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200 hover:border-coral hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:scale-105"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-4">{gift.icon}</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{gift.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{gift.description}</p>
                    
                    {/* 선물 세부 특징 */}
                    <div className="text-left mb-4">
                      <div className="text-xs text-gray-500 mb-2">포함 내용:</div>
                      <div className="space-y-1">
                        {gift.features.map((feature, index) => (
                          <div key={index} className="flex items-start text-xs text-gray-600">
                            <span className="text-coral mr-1">•</span>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="inline-block bg-coral-100 text-coral px-3 py-1 rounded-full text-sm font-medium mb-3">
                      {gift.value}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      📍 {gift.deliveryInfo}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <div className="bg-blue-50 rounded-xl p-4 max-w-md mx-auto">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">🎯 참고:</span> 선택하신 선물은 보험증서와 함께<br />
                  3-5일 내에 어머님께 직접 전달됩니다
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Final Message Step */}
        {currentStep === 'final-message' && selectedGiftData && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-24 h-24 bg-warm-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">{selectedGiftData.icon}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                완벽한 선택이에요! 🎉
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                <strong>{selectedGiftData.name}</strong>이<br />
                어머님께 특별한 기쁨을 선사할 거예요
              </p>
            </div>

            <div className="bg-gradient-to-r from-coral-100 to-orange-100 rounded-2xl p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">💌 어머님께 전달될 효도 메시지</h3>
              <div className="bg-white rounded-lg p-6 text-left shadow-sm border-l-4 border-coral">
                <p className="text-gray-700 leading-relaxed">
                  "어머니, 항상 건강하시길 바라는 마음으로<br />
                  특별한 보장과 함께 작은 선물을 준비했어요.<br /><br />
                  
                  <strong>한화생명 {selectedGiftData.id === 'health-checkup' ? 'e시그니처암보험(종합)' : '보험'}</strong>으로 
                  갑상선과 자궁 건강까지 꼼꼼히 지키시고,<br />
                  <strong>{selectedGiftData.name}</strong>으로 더욱 건강하고 
                  행복한 시간 보내세요.<br /><br />
                  
                  효도하고 싶은 마음이 이런 작은 실천으로<br />
                  어머니께 전해지길 바랍니다. 늘 건강하시고 사랑해요! ❤️<br /><br />
                  
                  <em className="text-sm text-gray-500">- 한화생명 AI 효도 상담사와 함께 -</em>"
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h4 className="font-semibold text-gray-900 mb-3">📋 앞으로 진행될 일정</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-hanwha-red rounded-full mr-3"></span>
                    <span><strong>오늘:</strong> 어머님께 가입 완료 안내 SMS 발송</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-hanwha-red rounded-full mr-3"></span>
                    <span><strong>3일 후:</strong> 보험증서 + 선물 배송 시작</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-hanwha-red rounded-full mr-3"></span>
                    <span><strong>5일 후:</strong> 한화생명 고객센터에서 안부 연락</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onRestart}
                className="flex-1 bg-white border-2 border-hanwha-red text-hanwha-red py-4 px-6 rounded-xl font-semibold hover:bg-warm-50 transition-colors"
              >
                다른 가족도 가입하기
              </button>
              <button
                onClick={() => window.close()}
                className="flex-1 bg-gradient-hanwha text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
              >
                완료
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                문의사항이 있으시면 한화생명 고객센터 <strong>1588-6363</strong>으로 연락해주세요
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}