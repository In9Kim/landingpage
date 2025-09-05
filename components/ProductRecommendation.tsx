import { useState, useEffect } from 'react'
import { matchCsvRecommendation, getMatchedKeywords } from '../utils/csvRecommendations'

interface Product {
  id: string
  name: string
  type: 'cancer' | 'health' | 'term'
  monthlyPremium: number
  coverage: string[]
  description: string
  keyFeatures: string[]
  targetConditions: string[]
  emotionalMessage: string
}

interface ProductRecommendationProps {
  motherInfo: any
  onProductSelect: (product: Product) => void
  onBack: () => void
}

const products: Product[] = [
  {
    id: 'e-signature-cancer',
    name: 'e시그니처암보험(종합)',
    type: 'cancer',
    monthlyPremium: 52000,
    coverage: ['암 진단시 최대 10회 반복 진단금', '여성특화암 진단금 2배 보장', '항암치료비 및 통원비 실비보장'],
    description: '어머님의 건강, 늘 걱정되시죠? 갑상선과 자궁 질환 이력이 있으시고 아직도 직장을 다니시는 어머님께 딱 맞는 든든한 보장입니다.',
    keyFeatures: [
      '여성특화암(자궁·난소·유방·갑상선암) 진단부터 최우선 보장',
      '암 수술, 항암 치료, 방사선 치료, 통원비까지 종합 보장',
      '최대 10회까지 반복 진단금 지급으로 재발 시에도 안심',
      '치료비 및 입원·통원비 특약으로 실제 의료비 부담 최소화',
      '갑상선암, 자궁암 등 여성질환 집중 케어',
      '63세 어머님 기준 최적화된 보장 설계'
    ],
    targetConditions: ['thyroid', 'uterine', 'cancer', 'age60+', 'working', 'familyHistory'],
    emotionalMessage: '갑상선과 자궁 질환 이력이 있는 어머님께 가장 적합한 맞춤 보장입니다 💐'
  },
  {
    id: 'e-health',
    name: 'e건강보험',
    type: 'health',
    monthlyPremium: 41000,
    coverage: ['갑상선·자궁 등 여성질환 집중 케어', '생활습관병 종합 보장', '건강검진 지원 서비스'],
    description: '평생 건강을 케어하는 마음으로, 어머님의 일상을 종합적으로 지켜드리는 건강보험입니다 🌸',
    keyFeatures: [
      '갑상선·자궁 등 여성 건강 관리가 필요한 분께 최적',
      '당뇨, 고혈압 등 생활습관병 종합 보장',
      '60대 이상 여성 맞춤 설계로 연령별 질병 대비',
      '전반적 건강 관리와 일상 안정을 중시하는 설계',
      '정기 건강검진 지원으로 예방부터 치료까지',
      '만성질환 관리 및 통원 치료비 지원'
    ],
    targetConditions: ['chronicDisease', 'lifestyle', 'healthCare', 'age60+', 'prevention'],
    emotionalMessage: '전반적 건강 관리와 예방을 중요시하는 어머님께 적합합니다'
  },
  {
    id: 'e-term',
    name: 'e정기보험',
    type: 'term',
    monthlyPremium: 33000,
    coverage: ['고액 사망보험금', '가족 생계 보장', '재정적 안정성 확보'],
    description: '가족이 안심할 수 있도록, 어머님의 든든한 보장을 준비해드리는 정기보험입니다 💖',
    keyFeatures: [
      '60대 이상 여성, 가족을 생각하는 마음에 최적',
      '고액 사망보장으로 가족의 경제적 안정 확보',
      '재정적 안정과 가족 케어를 중시하는 설계',
      '보험료 부담이 적은 정기형으로 경제적 부담 완화',
      '활동적이고 책임감 있는 어머님께 적합',
      '가족 부양과 미래 계획을 고려한 보장'
    ],
    targetConditions: ['familySupport', 'deathBenefit', 'age60+', 'working', 'economicStability'],
    emotionalMessage: '재정적 안정과 가족 사랑을 중시하는 어머님께 적합합니다'
  }
]

const ProductCard = ({ product, isRecommended, onSelect }: { 
  product: Product
  isRecommended: boolean
  onSelect: () => void 
}) => (
  <div className={`bg-white rounded-2xl p-6 shadow-sm border transition-all duration-200 ${
    isRecommended ? 'border-coral bg-coral-50' : 'border-neutral-200 hover:border-coral'
  }`}>
    {isRecommended && (
      <div className="bg-coral text-white px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
        🎯 어머님께 가장 적합해요
      </div>
    )}
    
    <div className="mb-4">
      <h3 className="text-xl font-bold text-neutral-800 mb-2">{product.name}</h3>
      <p className="text-neutral-600 mb-3">{product.description}</p>
      <div className="text-2xl font-bold text-coral mb-1">
        월 {product.monthlyPremium.toLocaleString()}원
      </div>
      <p className="text-sm text-neutral-500">어머님 기준 예상 보험료</p>
    </div>

    <div className="mb-6">
      <h4 className="font-semibold text-neutral-800 mb-2">주요 보장</h4>
      <ul className="space-y-1">
        {product.coverage.map((item, index) => (
          <li key={index} className="text-sm text-neutral-700 flex items-start">
            <span className="text-coral mr-2">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>

    <div className="mb-6">
      <h4 className="font-semibold text-neutral-800 mb-2">특징</h4>
      <ul className="space-y-1">
        {product.keyFeatures.slice(0, 2).map((feature, index) => (
          <li key={index} className="text-sm text-neutral-600 flex items-start">
            <span className="text-coral mr-2">✓</span>
            {feature}
          </li>
        ))}
      </ul>
    </div>

    {isRecommended && (
      <div className="bg-coral-100 rounded-lg p-3 mb-4">
        <p className="text-sm text-neutral-700">
          <span className="font-medium text-coral">💝 추천 이유: </span>
          {product.emotionalMessage}
        </p>
      </div>
    )}

    <button
      onClick={onSelect}
      className={`w-full font-medium ${
        isRecommended ? 'btn-filled' : 'btn-outlined'
      }`}
    >
      {isRecommended ? '이 상품으로 진행하기' : '자세히 보기'}
    </button>
  </div>
)

export default function ProductRecommendation({ motherInfo, onProductSelect, onBack }: ProductRecommendationProps) {
  const [recommendedProduct, setRecommendedProduct] = useState<Product | null>(null)
  const [showComparison, setShowComparison] = useState(false)

  useEffect(() => {
    const getRecommendation = () => {
      // CSV 데이터를 기반으로 한 추천 로직
      const csvRecommendation = matchCsvRecommendation(motherInfo)
      
      if (csvRecommendation) {
        const recommendedProduct = products.find(p => p.id === csvRecommendation)
        if (recommendedProduct) {
          // 디버깅용: 매칭된 키워드 로그 출력
          const matchedKeywords = getMatchedKeywords(motherInfo)
          console.log('CSV 매칭 결과:', {
            추천상품: csvRecommendation,
            매칭된키워드: matchedKeywords,
            사용자입력: motherInfo
          })
          return recommendedProduct
        }
      }

      // CSV 매칭이 실패한 경우 기존 로직 사용 (fallback)
      const age = parseInt(motherInfo.age) || 60
      const healthStatus = motherInfo.healthStatus?.toLowerCase() || ''
      const familyHistory = motherInfo.familyHistory?.toLowerCase() || ''
      const occupation = motherInfo.occupation?.toLowerCase() || ''
      const concerns = motherInfo.concerns?.toLowerCase() || ''
      const checkup = motherInfo.healthCheckup?.toLowerCase() || ''

      // 조건 분석
      const hasThyroidOrUterine = healthStatus.includes('갑상선') || healthStatus.includes('자궁')
      const hasFamilyCancer = familyHistory.includes('암') || familyHistory.includes('갑상선') || familyHistory.includes('자궁')
      const isWorking = occupation.includes('직장') || occupation.includes('회사') || occupation.includes('활동')
      const hasChronicDisease = healthStatus.includes('당뇨') || healthStatus.includes('고혈압') || healthStatus.includes('만성')
      const concernsAboutCancer = concerns.includes('암') || concerns.includes('진단') || concerns.includes('치료')
      const concernsAboutCosts = concerns.includes('통원') || concerns.includes('치료비') || concerns.includes('경제')

      // 기존 PRD 우선순위별 추천 로직 (fallback)
      if (age >= 60 && (hasThyroidOrUterine || hasFamilyCancer || concernsAboutCancer)) {
        return products.find(p => p.id === 'e-signature-cancer')
      } else if (hasChronicDisease || 
               healthStatus.includes('건강관리') || 
               concerns.includes('건강') ||
               (age >= 60 && !concernsAboutCancer && !isWorking)) {
        return products.find(p => p.id === 'e-health')
      } else if (isWorking && (age >= 60 && age <= 70) && 
               (concerns.includes('가족') || concerns.includes('보장') || concernsAboutCosts)) {
        return products.find(p => p.id === 'e-term')
      } else if (age >= 65) {
        return products.find(p => p.id === 'e-signature-cancer')
      } else if (age >= 60) {
        return hasFamilyCancer ? 
          products.find(p => p.id === 'e-signature-cancer') : 
          products.find(p => p.id === 'e-health')
      } else {
        return products.find(p => p.id === 'e-health')
      }
    }

    setRecommendedProduct(getRecommendation() || null)
  }, [motherInfo])

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
          <h2 className="font-semibold text-neutral-800">CARE+ 맞춤 추천</h2>
          <p className="text-sm text-neutral-500">어머님께 딱 맞는 케어 플랜을 찾았어요</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Summary */}
        <div className="bg-white rounded-2xl p-6 mb-8 border max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-coral-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💝</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-800 mb-2">
              어머님을 위한 CARE+ 추천이 완료되었어요
            </h3>
            <p className="text-neutral-600">
              어머님의 {motherInfo.age}세, {motherInfo.healthStatus} 상태를 고려해서<br />
              가장 적합한 한화생명 보험상품을 선별해드렸습니다.
            </p>
          </div>
        </div>

        {/* Recommended Product */}
        {recommendedProduct && (
          <div className="max-w-4xl mx-auto mb-8">
            <h4 className="text-3xl font-bold text-center text-neutral-800 mb-2">
              어머님께 <span className="text-coral">가장 적합한</span> 보험
            </h4>
            <p className="text-center text-neutral-600 mb-8">
              상담 내용을 바탕으로 선별된 최적의 케어 플랜입니다
            </p>
            
            <div className="grid grid-cols-1 max-w-md mx-auto mb-8">
              <ProductCard
                product={recommendedProduct}
                isRecommended={true}
                onSelect={() => onProductSelect(recommendedProduct)}
              />
            </div>

            {/* Q&A Section - PRD 시나리오 기반 */}
            <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 border">
              <h5 className="text-xl font-bold text-neutral-800 mb-6 text-center">
                💬 실제 상담에서 자주 묻는 질문
              </h5>
              <div className="space-y-4">
                <div className="bg-coral-50 rounded-lg p-4">
                  <p className="font-semibold text-neutral-800 mb-2">
                    Q: "이 상품이 암에 걸려서 병원에 통원할 때도 도움이 되나요?"
                  </p>
                  <p className="text-neutral-700 mb-2">
                    <strong>A:</strong> 네, 물론입니다! e시그니처암보험(종합)은 여성 특화 암인 자궁·난소·유방·갑상선암 진단부터 암 수술, 항암 치료, 통원비까지 꼼꼼히 챙겨드립니다.
                  </p>
                  <p className="text-sm text-neutral-600">
                    특히 갑상선이나 자궁 관련 질환을 겪고 계신 어머님께는 통원 치료 시에도 실질적인 도움이 됩니다.
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="font-semibold text-neutral-800 mb-2">
                    Q: "진단금이 얼마나 나와요?"
                  </p>
                  <p className="text-neutral-700 mb-2">
                    <strong>A:</strong> 한화생명 e시그니처암보험은 최대 10회까지 반복 진단금을 지급합니다. 치료비 및 입원·통원비 특약까지 함께 제공해 어머님의 건강과 치료를 실질적으로 지원합니다.
                  </p>
                  <p className="text-sm text-neutral-600">
                    재발이나 전이 시에도 최대 10회까지 진단금을 받으실 수 있어 장기적으로 안심하고 치료받으실 수 있습니다.
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <p className="font-semibold text-neutral-800 mb-2">
                    Q: "63세 어머님도 가입 가능한가요? 보험료는 얼마나 되나요?"
                  </p>
                  <p className="text-neutral-700 mb-2">
                    <strong>A:</strong> 네, 63세 어머님도 충분히 가입 가능합니다. 63세 여성 기준으로 월 {recommendedProduct?.monthlyPremium.toLocaleString()}원 정도의 보험료로 든든한 보장을 받으실 수 있어요.
                  </p>
                  <p className="text-sm text-neutral-600">
                    연령을 고려한 맞춤 설계로 부담스럽지 않은 보험료에 최적의 보장을 제공합니다.
                  </p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="font-semibold text-neutral-800 mb-2">
                    Q: "갑상선이나 자궁 질환이 있어도 가입할 수 있나요?"
                  </p>
                  <p className="text-neutral-700 mb-2">
                    <strong>A:</strong> 기존 질환이 있으시더라도 상담을 통해 가입 가능 여부를 확인해드립니다. 특히 여성 질환에 특화된 보장을 제공하므로 오히려 더욱 필요한 보험이라고 할 수 있어요.
                  </p>
                  <p className="text-sm text-neutral-600">
                    정확한 건강 상태를 바탕으로 개인별 맞춤 상담을 진행하여 최적의 보장을 설계해드립니다.
                  </p>
                </div>
              </div>

              {/* 추가 안내 메시지 */}
              <div className="mt-6 bg-gradient-to-r from-coral-50 to-neutral-50 rounded-lg p-4 text-center">
                <p className="text-sm text-neutral-700">
                  <strong>💡 참고:</strong> 위 답변은 e시그니처암보험(종합) 기준이며, 
                  개인별 건강 상태와 나이에 따라 보장 내용과 보험료가 달라질 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Other Options */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="text-coral font-medium hover:underline"
            >
              {showComparison ? '다른 상품 숨기기' : '다른 상품도 함께 비교해보기'} 
              <span className="ml-1">{showComparison ? '▲' : '▼'}</span>
            </button>
          </div>

          {showComparison && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isRecommended={product.id === recommendedProduct?.id}
                  onSelect={() => onProductSelect(product)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Trust Message */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <div className="bg-blue-50 rounded-xl p-6">
            <div className="text-3xl mb-3">🏢</div>
            <h4 className="font-semibold text-gray-900 mb-2">한화생명과 함께하는 든든함</h4>
            <p className="text-sm text-gray-600">
              65년 전통의 한화생명이 어머님의 건강을 책임지겠습니다.<br />
              전국 어디서나 신뢰할 수 있는 보장 서비스를 제공해드려요.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}