import { useState } from 'react'

interface ApplicationFlowProps {
  motherInfo: any
  selectedProduct: any
  onComplete: () => void
  onBack: () => void
}

interface ApplicationData {
  customerName: string
  customerPhone: string
  customerEmail: string
  relationship: string
  paymentMethod: 'card' | 'bank'
  cardNumber?: string
  bankAccount?: string
  agreementPersonal: boolean
  agreementService: boolean
  agreementMarketing: boolean
}

export default function ApplicationFlow({ motherInfo, selectedProduct, onComplete, onBack }: ApplicationFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    relationship: '딸',
    paymentMethod: 'card',
    agreementPersonal: false,
    agreementService: false,
    agreementMarketing: false
  })

  const handleInputChange = (field: keyof ApplicationData, value: any) => {
    setApplicationData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    
    // 실제로는 API 호출
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsLoading(false)
    onComplete()
  }

  const isStepValid = () => {
    if (currentStep === 1) {
      return applicationData.customerName && applicationData.customerPhone && applicationData.customerEmail
    }
    if (currentStep === 2) {
      return applicationData.paymentMethod && 
        (applicationData.paymentMethod === 'card' ? applicationData.cardNumber : applicationData.bankAccount)
    }
    if (currentStep === 3) {
      return applicationData.agreementPersonal && applicationData.agreementService
    }
    return false
  }

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
            step <= currentStep ? 'bg-coral text-white' : 'bg-neutral-200 text-neutral-500'
          }`}>
            {step}
          </div>
          {step < 3 && (
            <div className={`w-12 h-1 ${
              step < currentStep ? 'bg-coral' : 'bg-neutral-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center">
        <button onClick={onBack} className="mr-4 p-2 hover:bg-neutral-100 rounded-full">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="font-semibold text-neutral-800">CARE+ 가입 신청</h2>
          <p className="text-sm text-neutral-500">간편한 절차로 완료됩니다</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <StepIndicator />

          {/* Step 1: Customer Information */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-center mb-6">
                <div className="text-2xl mb-2">👤</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">신청자 정보</h3>
                <p className="text-gray-600 text-sm">
                  어머님의 보험을 신청하실 분의 정보를 입력해주세요
                </p>
                
                {/* 상담 정보 요약 */}
                <div className="mt-4 bg-coral-50 rounded-lg p-3">
                  <p className="text-sm text-neutral-700">
                    <span className="font-medium">상담 정보:</span> {motherInfo.age}세 어머님, {selectedProduct.name}
                  </p>
                  {motherInfo.healthStatus && (
                    <p className="text-xs text-neutral-600 mt-1">
                      건강상태: {motherInfo.healthStatus}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    성함 <span className="text-hanwha-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={applicationData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-hanwha-red focus:border-transparent"
                    placeholder="홍길동"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    휴대폰 번호 <span className="text-hanwha-red">*</span>
                  </label>
                  <input
                    type="tel"
                    value={applicationData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-hanwha-red focus:border-transparent"
                    placeholder="010-1234-5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 <span className="text-hanwha-red">*</span>
                  </label>
                  <input
                    type="email"
                    value={applicationData.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-hanwha-red focus:border-transparent"
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    어머님과의 관계
                  </label>
                  <select
                    value={applicationData.relationship}
                    onChange={(e) => handleInputChange('relationship', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-hanwha-red focus:border-transparent"
                  >
                    <option value="딸">딸</option>
                    <option value="아들">아들</option>
                    <option value="며느리">며느리</option>
                    <option value="사위">사위</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => setCurrentStep(2)}
                disabled={!isStepValid()}
                className="w-full btn-filled mt-6 font-semibold"
              >
                다음 단계
              </button>
            </div>
          )}

          {/* Step 2: Payment Information */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-center mb-6">
                <div className="text-2xl mb-2">💳</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">결제 정보</h3>
                <p className="text-gray-600 text-sm">
                  {selectedProduct.name} 월 {selectedProduct.monthlyPremium.toLocaleString()}원
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  ({motherInfo.age}세 여성 기준 보험료)
                </p>
                
                {/* 선택된 상품 요약 */}
                <div className="mt-4 bg-blue-50 rounded-lg p-3">
                  <h4 className="font-medium text-sm text-gray-800 mb-2">선택하신 보험상품</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    {selectedProduct.coverage.slice(0, 2).map((item: string, index: number) => (
                      <div key={index} className="flex items-start">
                        <span className="text-coral mr-1">•</span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">결제 방법</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleInputChange('paymentMethod', 'card')}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        applicationData.paymentMethod === 'card'
                          ? 'border-hanwha-red bg-warm-50 text-hanwha-red'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">💳</div>
                      <div className="font-medium">신용/체크카드</div>
                    </button>
                    <button
                      onClick={() => handleInputChange('paymentMethod', 'bank')}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        applicationData.paymentMethod === 'bank'
                          ? 'border-hanwha-red bg-warm-50 text-hanwha-red'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">🏦</div>
                      <div className="font-medium">계좌이체</div>
                    </button>
                  </div>
                </div>

                {applicationData.paymentMethod === 'card' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      카드 번호 <span className="text-hanwha-red">*</span>
                    </label>
                    <input
                      type="text"
                      value={applicationData.cardNumber || ''}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-hanwha-red focus:border-transparent"
                      placeholder="1234-5678-9012-3456"
                      maxLength={19}
                    />
                  </div>
                )}

                {applicationData.paymentMethod === 'bank' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      계좌 번호 <span className="text-hanwha-red">*</span>
                    </label>
                    <input
                      type="text"
                      value={applicationData.bankAccount || ''}
                      onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-hanwha-red focus:border-transparent"
                      placeholder="123-456-789012"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 btn-outlined font-semibold"
                >
                  이전 단계
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={!isStepValid()}
                  className="flex-1 btn-filled font-semibold"
                >
                  다음 단계
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Agreements */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-center mb-6">
                <div className="text-2xl mb-2">📋</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">약관 동의</h3>
                <p className="text-gray-600 text-sm">
                  마지막 단계입니다. 필수 약관에 동의해주세요
                </p>
              </div>

              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="agreement-personal"
                      checked={applicationData.agreementPersonal}
                      onChange={(e) => handleInputChange('agreementPersonal', e.target.checked)}
                      className="mt-1 h-4 w-4 text-hanwha-red focus:ring-hanwha-red border-gray-300 rounded"
                    />
                    <label htmlFor="agreement-personal" className="ml-3 flex-1">
                      <span className="text-sm font-medium text-gray-900">
                        개인정보 수집 및 이용 동의 <span className="text-hanwha-red">(필수)</span>
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        보험 가입을 위한 개인정보 수집 및 이용에 동의합니다.
                      </p>
                    </label>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="agreement-service"
                      checked={applicationData.agreementService}
                      onChange={(e) => handleInputChange('agreementService', e.target.checked)}
                      className="mt-1 h-4 w-4 text-hanwha-red focus:ring-hanwha-red border-gray-300 rounded"
                    />
                    <label htmlFor="agreement-service" className="ml-3 flex-1">
                      <span className="text-sm font-medium text-gray-900">
                        보험 약관 및 서비스 이용 동의 <span className="text-hanwha-red">(필수)</span>
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedProduct.name} 약관 및 서비스 이용에 동의합니다.
                      </p>
                    </label>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="agreement-marketing"
                      checked={applicationData.agreementMarketing}
                      onChange={(e) => handleInputChange('agreementMarketing', e.target.checked)}
                      className="mt-1 h-4 w-4 text-hanwha-red focus:ring-hanwha-red border-gray-300 rounded"
                    />
                    <label htmlFor="agreement-marketing" className="ml-3 flex-1">
                      <span className="text-sm font-medium text-gray-900">
                        마케팅 정보 수신 동의 (선택)
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        새로운 상품 및 혜택 정보를 받아보실 수 있습니다.
                      </p>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-gradient-to-r from-coral-50 to-orange-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">🎁 가입 완료 후 특별 혜택</h4>
                <div className="text-sm text-gray-700 space-y-2">
                  <div className="flex items-start">
                    <span className="text-coral mr-2">💌</span>
                    <span><strong>효도 메시지 전달:</strong> 어머님께 따뜻한 효도 메시지와 가입 안내 SMS 발송</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-coral mr-2">🎁</span>
                    <span><strong>효도 선물 이벤트:</strong> 건강검진권, 마사지권 등 선물 옵션 제공</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-coral mr-2">🏥</span>
                    <span><strong>한화생명 고객센터:</strong> 1588-6363 전담 상담사 24시간 지원</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-coral mr-2">📱</span>
                    <span><strong>디지털 서비스:</strong> 한화생명 앱으로 보험증서 및 보장내용 간편 조회</span>
                  </div>
                </div>
                
                <div className="mt-4 bg-white rounded-lg p-3 border-l-4 border-coral">
                  <p className="text-xs text-gray-600">
                    <strong>💝 효도 완성:</strong> "단 3분만 투자하시면, 엄마 보험 가입이 완료돼요. 
                    효도의 마음이 선물처럼 전해지길 바랍니다."
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 btn-outlined font-semibold"
                >
                  이전 단계
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isStepValid() || isLoading}
                  className="flex-1 btn-filled font-semibold"
                >
                  {isLoading ? '가입 처리 중...' : '효도 보험 가입 완료하기'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}