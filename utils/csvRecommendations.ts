// CSV-based product recommendation mapping
// This file contains the logic to match user inputs with CSV data for product recommendations

export interface ProductMapping {
  product: string
  keywords: string[]
}

// CSV 데이터를 기반으로 한 상품 매핑
export const csvProductMappings: ProductMapping[] = [
  {
    product: 'e-signature-cancer',
    keywords: [
      // e암보험(비갱신) 관련 키워드
      '암', '암보험', '20대암보험', '30대암보험', '40대암보험', '50대암보험', 
      '추천암보험', '40대 암진단비 보험', '50대 암진단금 보장', '여성암', '남성암',
      '간편암', '유병자 보험', '유병자', '유병자 암보험', '유병력', '환자',
      '암진단비 보험', '암진단보험', '암진단비보장', '암진단특약', '암진단비만보장',
      '암진단비보험비교', '암진단비보험', '암진단보험추천', '암진단비플랜',
      '비갱신 암보험', '비갱신형 암보험', '갱신 없는 암보험', '갱신X 암보험',
      '보험료 고정 암보험', '보험료 변동 없는 암보험', '만기 100세 암보험',
      '100세 만기 암보험', '유병', '암진단', '비갱신암', '유병자보험', '비갱신',
      '위암', '간암', '폐암', '대장암', '췌장암', '혈액암', '백혈병', '뇌암',
      '유방암', '자궁암', '난소암', '전립선암', '고환암', '식도암', '담도암',
      '담낭암', '신장암', '방광암', '갑상선암', '피부암', '갑상선', '자궁',
      '위암 보험', '간암 보험', '폐암 보험', '대장암 보험', '췌장암 보험',
      '혈액암 보험', '백혈병 보험', '뇌암 보험', '유방암 보험', '자궁암 보험',
      '난소암 보험', '전립선암 보험', '고환암 보험', '식도암 보험', '담도암 보험',
      '담낭암 보험', '신장암 보험', '방광암 보험', '갑상선암 보험', '피부암 보험',
      '항암', '항암약물치료', '항암방사선치료', '표적항암치료', '항암 보험',
      '암치료', '암수술', '치료', '암통원', '통원', '통합', '통합암',
      '통합암진단', '통합암진단비', '통합암진단보험'
    ]
  },
  {
    product: 'e-signature-cancer',
    keywords: [
      // e시그니처암(종합) 관련 키워드
      '암수술비 보장', '수술보장보험', '수술보장특약', '수술보험', '수술비만보장',
      '수술비보장', '수술비보장보험', '수술비보험비교', '수술비보험한화',
      '수술비보험한화생명', '수술비암보험', '수술비용보장', '수술비용보장보험',
      '수술비용보험', '수술비특약', '수술비특약보험', '수술비플랜', '수술진단보험',
      '수술특약', '수술특약보험', '암입원 특약', '암입원비 보험', '입원비 보장',
      '입원보장보험', '입원보장특약', '입원보험', '입원비만보장', '입원비보장',
      '입원비보장보험', '입원비보험비교', '입원비보험한화', '입원비보험한화생명',
      '입원비암보험', '입원비용보장', '입원비용보장보험', '입원비용보험',
      '입원비특약', '입원비특약보험', '입원비플랜', '입원진단보험', '입원특약',
      '입원특약보험', '치료비보장', '치료보장보험', '치료보장특약', '치료보험',
      '치료비만보장', '치료비보장보험', '치료비보험비교', '치료비보험한화',
      '치료비보험한화생명', '치료비암보험', '치료비용보장', '치료비용보장보험',
      '치료비용보험', '치료비특약', '치료비특약보험', '치료비플랜', '치료진단보험',
      '치료특약', '치료특약보험', '암통원 특약', '통원비보장', '통원보장보험',
      '통원보장특약', '통원보험', '통원비만보장', '통원비보장보험', '통원비보험비교',
      '통원비보험한화', '통원비보험한화생명', '통원비암보험', '통원비용보장',
      '통원비용보장보험', '통원비용보험', '통원비특약', '통원비특약보험',
      '통원비플랜', '통원진단보험', '통원특약', '통원특약보험', '암통원치료비 보험',
      '수술', '수술비', '수술비용', '입원', '암입원', '다빈치 로봇수술 보험',
      '다빈치', 'e시', '시그니처', 'e암'
    ]
  },
  {
    product: 'e-health',
    keywords: [
      // e시그니처건강보험(암뇌심) 관련 키워드
      '2대질환보험', '3대진단비다이렉트', '3대진단비보험', '3대질병', '3대질병보험',
      '3대질병보험추천', '3대질환보험뇌경색보험', '뇌경색증', '뇌경색진단비',
      '뇌관련보험', '뇌동맥류보험', '뇌보험', '뇌심건강보험', '뇌심보험',
      '뇌심암보험', '뇌심장보험', '뇌심장질환보험', '뇌심혈관보험',
      '뇌심혈관질환보험', '뇌전증보험', '뇌전증보험가입', '뇌졸중보험',
      '뇌질환보험', '뇌출혈보험', '뇌출혈진단비', '뇌혈관보험', '뇌혈관심혈관보험',
      '뇌혈관진단비', '뇌혈관질환보험', '뇌혈관질환보험추천', '뇌혈관질환진단비',
      '뇌혈관질환허혈성심장질환보험', '종합건강보험추천', '종합보험허혈성',
      '허혈성보험', '허혈성심장질환보험', '허혈성질환보험', '혈관질환',
      '암뇌심', '종합건강보험', '건강', '건강보험', '뇌심', '심혈관', '혈관',
      '뇌전증', '뇌혈관', '뇌출혈', '뇌심장', '뇌'
    ]
  }
]

// 사용자 입력과 CSV 키워드를 매칭하는 함수
export function matchCsvRecommendation(userInputs: any): 'e-signature-cancer' | 'e-health' | 'e-term' | null {
  const {
    age,
    occupation,
    healthStatus,
    familyHistory,
    healthCheckup,
    concerns
  } = userInputs

  // 모든 입력값을 하나의 문자열로 결합
  const combinedInput = [
    age?.toString() || '',
    occupation || '',
    healthStatus || '',
    familyHistory || '',
    healthCheckup || '',
    concerns || ''
  ].join(' ').toLowerCase()

  // 각 상품별 매칭 점수 계산
  const scores: { [key: string]: number } = {}

  for (const mapping of csvProductMappings) {
    let score = 0
    
    for (const keyword of mapping.keywords) {
      if (combinedInput.includes(keyword.toLowerCase())) {
        score++
      }
    }
    
    if (scores[mapping.product]) {
      scores[mapping.product] += score
    } else {
      scores[mapping.product] = score
    }
  }

  // 가장 높은 점수를 받은 상품 반환
  let maxScore = 0
  let recommendedProduct: string | null = null

  for (const [product, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      recommendedProduct = product
    }
  }

  // 최소 점수 기준 (적어도 1개 이상의 키워드가 매칭되어야 함)
  if (maxScore > 0) {
    return recommendedProduct as 'e-signature-cancer' | 'e-health' | 'e-term'
  }

  return null
}

// 특정 키워드에 대한 상품 추천 함수
export function getRecommendationByKeyword(keyword: string): 'e-signature-cancer' | 'e-health' | 'e-term' | null {
  const lowerKeyword = keyword.toLowerCase()
  
  for (const mapping of csvProductMappings) {
    if (mapping.keywords.some(k => k.toLowerCase().includes(lowerKeyword))) {
      return mapping.product as 'e-signature-cancer' | 'e-health' | 'e-term'
    }
  }
  
  return null
}

// CSV 데이터에서 특정 상품의 모든 키워드 반환
export function getKeywordsForProduct(product: string): string[] {
  const mappings = csvProductMappings.filter(m => m.product === product)
  return mappings.reduce((acc, mapping) => [...acc, ...mapping.keywords], [] as string[])
}

// 디버깅용: 매칭된 키워드들을 반환하는 함수
export function getMatchedKeywords(userInputs: any): { product: string, matchedKeywords: string[] }[] {
  const combinedInput = [
    userInputs.age?.toString() || '',
    userInputs.occupation || '',
    userInputs.healthStatus || '',
    userInputs.familyHistory || '',
    userInputs.healthCheckup || '',
    userInputs.concerns || ''
  ].join(' ').toLowerCase()

  const results: { product: string, matchedKeywords: string[] }[] = []

  for (const mapping of csvProductMappings) {
    const matchedKeywords = mapping.keywords.filter(keyword => 
      combinedInput.includes(keyword.toLowerCase())
    )
    
    if (matchedKeywords.length > 0) {
      results.push({
        product: mapping.product,
        matchedKeywords
      })
    }
  }

  return results
}