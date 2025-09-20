// ===============================
// 상품 추천 알고리즘 백엔드 로직
// PRD 기반 한화생명 e상품군 추천 엔진
// ===============================

import {
  MotherInfo,
  Product,
  ProductRecommendation,
  ProductType,
  PremiumQuoteRequest,
  PremiumQuoteResponse,
  BusinessLogicError,
  EligibilityCriteria,
  PremiumCalculation
} from '../types/backend'

export class ProductRecommendationEngine {
  private static instance: ProductRecommendationEngine
  private products: Map<ProductType, Product> = new Map()
  
  public static getInstance(): ProductRecommendationEngine {
    if (!ProductRecommendationEngine.instance) {
      ProductRecommendationEngine.instance = new ProductRecommendationEngine()
      ProductRecommendationEngine.instance.initializeProducts()
    }
    return ProductRecommendationEngine.instance
  }

  /**
   * 한화생명 e상품군 초기화 (PRD 기반)
   */
  private initializeProducts(): void {
    // e시그니처암보험(종합) - PRD 메인 상품
    this.products.set('e-signature-cancer', {
      id: 'e-signature-cancer',
      name: 'e시그니처암보험(종합)',
      type: 'cancer',
      monthlyPremium: 52000, // 63세 여성 기준
      coverage: [
        '암 진단시 최대 10회 반복 진단금',
        '여성특화암 진단금 2배 보장',
        '항암치료비 및 통원비 실비보장'
      ],
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
      emotionalMessage: '갑상선과 자궁 질환 이력이 있는 어머님께 가장 적합한 맞춤 보장입니다 💐',
      eligibilityCriteria: {
        minAge: 20,
        maxAge: 75,
        excludedConditions: ['현재암치료중', '3개월내수술예정'],
        requiredHealthCheck: false,
        underwritingRequired: true,
        autoApprovalThreshold: 70
      },
      premiumCalculation: {
        baseRate: 35000,
        ageMultiplier: {
          '40-49': 1.0,
          '50-59': 1.2,
          '60-69': 1.5,
          '70-75': 2.0
        },
        healthMultiplier: {
          'excellent': 0.9,
          'good': 1.0,
          'fair': 1.2,
          'poor': 1.5
        },
        occupationMultiplier: {
          'office': 1.0,
          'physical': 1.1,
          'high-risk': 1.3,
          'retired': 0.95
        },
        maxPremium: 150000,
        minPremium: 25000
      }
    })

    // e건강보험
    this.products.set('e-health', {
      id: 'e-health',
      name: 'e건강보험',
      type: 'health',
      monthlyPremium: 41000,
      coverage: [
        '갑상선·자궁 등 여성질환 집중 케어',
        '생활습관병 종합 보장',
        '건강검진 지원 서비스'
      ],
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
      emotionalMessage: '전반적 건강 관리와 예방을 중요시하는 어머님께 적합합니다',
      eligibilityCriteria: {
        minAge: 20,
        maxAge: 80,
        excludedConditions: ['중증만성질환'],
        requiredHealthCheck: false,
        underwritingRequired: false,
        autoApprovalThreshold: 60
      },
      premiumCalculation: {
        baseRate: 28000,
        ageMultiplier: {
          '40-49': 1.0,
          '50-59': 1.15,
          '60-69': 1.4,
          '70-80': 1.8
        },
        healthMultiplier: {
          'excellent': 0.85,
          'good': 1.0,
          'fair': 1.15,
          'poor': 1.4
        },
        occupationMultiplier: {
          'office': 1.0,
          'physical': 1.05,
          'high-risk': 1.2,
          'retired': 0.9
        },
        maxPremium: 120000,
        minPremium: 20000
      }
    })

    // e정기보험
    this.products.set('e-term', {
      id: 'e-term',
      name: 'e정기보험',
      type: 'term',
      monthlyPremium: 33000,
      coverage: [
        '고액 사망보험금',
        '가족 생계 보장',
        '재정적 안정성 확보'
      ],
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
      emotionalMessage: '재정적 안정과 가족 사랑을 중시하는 어머님께 적합합니다',
      eligibilityCriteria: {
        minAge: 20,
        maxAge: 70,
        excludedConditions: ['중증질환', '고령'],
        requiredHealthCheck: true,
        underwritingRequired: true,
        autoApprovalThreshold: 75
      },
      premiumCalculation: {
        baseRate: 22000,
        ageMultiplier: {
          '40-49': 1.0,
          '50-59': 1.3,
          '60-69': 1.7,
          '70': 2.2
        },
        healthMultiplier: {
          'excellent': 0.8,
          'good': 1.0,
          'fair': 1.25,
          'poor': 1.6
        },
        occupationMultiplier: {
          'office': 1.0,
          'physical': 1.15,
          'high-risk': 1.4,
          'retired': 1.1
        },
        maxPremium: 100000,
        minPremium: 15000
      }
    })
  }

  /**
   * 메인 추천 엔진 (PRD 시나리오 기반)
   */
  public generateRecommendations(motherInfo: MotherInfo): ProductRecommendation[] {
    try {
      const recommendations: ProductRecommendation[] = []
      const age = motherInfo.age
      const conditions = motherInfo.normalizedConditions
      const riskProfile = motherInfo.riskProfile

      // PRD 핵심 시나리오 검증 (한화진 33세, 어머니 63세)
      const isPrdMainScenario = this.checkPrdMainScenario(motherInfo)

      // 각 상품별 추천 평가
      Array.from(this.products.entries()).forEach(([productId, product]) => {
        const recommendation = this.evaluateProduct(motherInfo, product, isPrdMainScenario)
        if (recommendation.confidence >= 30) { // 최소 신뢰도 30% 이상만 포함
          recommendations.push(recommendation)
        }
      })

      // 추천 우선순위 정렬 (confidence 내림차순)
      recommendations.sort((a, b) => {
        // 우선 primary > secondary > alternative 순으로
        const priorityOrder = { 'primary': 3, 'secondary': 2, 'alternative': 1 }
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        if (priorityDiff !== 0) return priorityDiff
        
        // 같은 우선순위라면 신뢰도순
        return b.confidence - a.confidence
      })

      // 최대 3개까지만 추천
      const finalRecommendations = recommendations.slice(0, 3)

      // 추천이 없는 경우 기본 추천 제공
      if (finalRecommendations.length === 0) {
        finalRecommendations.push(this.getDefaultRecommendation(motherInfo))
      }

      // 감정적 메시지 개인화
      this.personalizeEmotionalMessages(finalRecommendations, motherInfo)

      return finalRecommendations

    } catch (error) {
      throw new BusinessLogicError(
        '상품 추천 생성 중 오류가 발생했습니다.',
        'RECOMMENDATION_ERROR',
        'high',
        { motherInfo, error }
      )
    }
  }

  /**
   * PRD 메인 시나리오 확인 (한화진 33세 → 어머님 63세)
   */
  private checkPrdMainScenario(motherInfo: MotherInfo): boolean {
    const age = motherInfo.age
    const hasThyroidOrUterine = motherInfo.normalizedConditions.some(c => 
      c.type === 'thyroid' || c.type === 'uterine'
    )
    const isWorking = motherInfo.occupation.includes('직장') || 
                     motherInfo.occupation.includes('회사')

    // PRD 정확한 시나리오: 63세 + 갑상선/자궁 질환 + 직장 다님
    return age === 63 && hasThyroidOrUterine && isWorking
  }

  /**
   * 개별 상품 평가 및 추천 생성
   */
  private evaluateProduct(
    motherInfo: MotherInfo, 
    product: Product, 
    isPrdMainScenario: boolean
  ): ProductRecommendation {
    
    let confidence = 0
    const matchingFactors: string[] = []
    const reasons: string[] = []
    let priority: 'primary' | 'secondary' | 'alternative' = 'alternative'

    // PRD 메인 시나리오인 경우 e시그니처암보험 최우선
    if (isPrdMainScenario && product.id === 'e-signature-cancer') {
      confidence = 95
      priority = 'primary'
      matchingFactors.push('PRD 메인 시나리오')
      reasons.push('63세 + 갑상선/자궁 질환 + 직장 다님으로 e시그니처암보험이 최적입니다')
    }
    // 일반적인 평가 로직
    else {
      confidence = this.calculateProductConfidence(motherInfo, product)
      
      if (confidence >= 80) priority = 'primary'
      else if (confidence >= 60) priority = 'secondary'
      else priority = 'alternative'

      // 매칭 요인 분석
      const factors = this.analyzeMatchingFactors(motherInfo, product)
      matchingFactors.push(...factors.matching)
      reasons.push(...factors.reasons)
    }

    // 자격 상태 확인
    const eligibilityStatus = this.checkEligibility(motherInfo, product)

    // 보험료 계산
    const monthlyPremium = this.calculatePremium(motherInfo, product)

    // 감정적 메시지 생성
    const emotionalMessage = this.generateEmotionalMessage(motherInfo, product, confidence)

    return {
      productId: product.id,
      product,
      confidence: Math.round(confidence),
      matchingFactors,
      reasons,
      emotionalMessage,
      priority,
      monthlyPremium,
      eligibilityStatus
    }
  }

  /**
   * 상품별 신뢰도 계산
   */
  private calculateProductConfidence(motherInfo: MotherInfo, product: Product): number {
    const age = motherInfo.age
    const conditions = motherInfo.normalizedConditions
    const riskProfile = motherInfo.riskProfile
    let confidence = 0

    // 연령 적합성
    if (age >= product.eligibilityCriteria.minAge && age <= product.eligibilityCriteria.maxAge) {
      confidence += 20
    }

    // 상품별 특화 점수 계산
    if (product.id === 'e-signature-cancer') {
      confidence += this.calculateCancerInsuranceScore(motherInfo)
    } else if (product.id === 'e-health') {
      confidence += this.calculateHealthInsuranceScore(motherInfo)
    } else if (product.id === 'e-term') {
      confidence += this.calculateTermInsuranceScore(motherInfo)
    }

    // 건강 상태 매칭
    const healthScore = this.calculateHealthCompatibilityScore(motherInfo, product)
    confidence += healthScore

    // 우려사항 매칭
    const concernScore = this.calculateConcernMatchScore(motherInfo, product)
    confidence += concernScore

    return Math.max(0, Math.min(100, confidence))
  }

  /**
   * 암보험 특화 점수
   */
  private calculateCancerInsuranceScore(motherInfo: MotherInfo): number {
    let score = 0

    // 갑상선/자궁 질환 (PRD 핵심)
    const hasThyroidOrUterine = motherInfo.normalizedConditions.some(c => 
      c.type === 'thyroid' || c.type === 'uterine'
    )
    if (hasThyroidOrUterine) score += 40

    // 암 가족력
    const hasCancerHistory = motherInfo.normalizedConditions.some(c => 
      c.type === 'cancer' && c.status === 'family_history'
    )
    if (hasCancerHistory) score += 30

    // 연령 (60대 이상 우선)
    if (motherInfo.age >= 60) score += 25

    // 건강검진 불규칙
    if (motherInfo.healthCheckup.includes('불규칙') || motherInfo.healthCheckup.includes('받지')) {
      score += 15
    }

    // 암에 대한 우려
    if (motherInfo.concerns.includes('암') || motherInfo.concerns.includes('진단')) {
      score += 20
    }

    return score
  }

  /**
   * 건강보험 특화 점수
   */
  private calculateHealthInsuranceScore(motherInfo: MotherInfo): number {
    let score = 0

    // 만성질환
    const hasChronicDisease = motherInfo.normalizedConditions.some(c => 
      c.type === 'diabetes' || c.type === 'hypertension' || c.type === 'chronic'
    )
    if (hasChronicDisease) score += 35

    // 전반적 건강 관심
    if (motherInfo.concerns.includes('건강') || motherInfo.concerns.includes('관리')) {
      score += 25
    }

    // 정기 검진 실시
    if (motherInfo.healthCheckup.includes('매년') || motherInfo.healthCheckup.includes('정기')) {
      score += 20
    }

    // 예방 의식
    if (motherInfo.concerns.includes('예방') || motherInfo.concerns.includes('검진')) {
      score += 15
    }

    // 생활습관 관련
    if (motherInfo.occupation.includes('직장')) {
      score += 10 // 직장인 건강관리 필요
    }

    return score
  }

  /**
   * 정기보험 특화 점수
   */
  private calculateTermInsuranceScore(motherInfo: MotherInfo): number {
    let score = 0

    // 가족 책임감
    if (motherInfo.concerns.includes('가족') || motherInfo.concerns.includes('보장')) {
      score += 30
    }

    // 경제적 활동
    const isWorking = motherInfo.occupation.includes('직장') || 
                     motherInfo.occupation.includes('회사')
    if (isWorking) score += 25

    // 적정 연령 (60-70세)
    if (motherInfo.age >= 60 && motherInfo.age <= 70) {
      score += 20
    }

    // 경제적 우려
    if (motherInfo.concerns.includes('경제') || motherInfo.concerns.includes('치료비')) {
      score += 15
    }

    return score
  }

  /**
   * 건강 호환성 점수
   */
  private calculateHealthCompatibilityScore(motherInfo: MotherInfo, product: Product): number {
    let score = 0
    const excludedConditions = product.eligibilityCriteria.excludedConditions

    // 제외 조건 확인
    const hasExcludedCondition = motherInfo.normalizedConditions.some(condition => {
      return excludedConditions.some(excluded => 
        condition.description.includes(excluded) || 
        (condition.severity === 'severe' && excluded.includes('중증'))
      )
    })

    if (!hasExcludedCondition) {
      score += 15
    } else {
      score -= 25 // 페널티
    }

    // 자격 점수 기반
    if (motherInfo.eligibilityScore >= product.eligibilityCriteria.autoApprovalThreshold) {
      score += 10
    }

    return score
  }

  /**
   * 우려사항 매칭 점수
   */
  private calculateConcernMatchScore(motherInfo: MotherInfo, product: Product): number {
    let score = 0
    const concerns = motherInfo.concerns.toLowerCase()

    // 상품별 관련 키워드
    const productKeywords: Record<ProductType, string[]> = {
      'e-signature-cancer': ['암', '종양', '진단', '치료', '갑상선', '자궁'],
      'e-health': ['건강', '관리', '예방', '검진', '당뇨', '고혈압'],
      'e-term': ['가족', '보장', '경제', '안정', '사망', '생계']
    }

    const keywords = productKeywords[product.id] || []
    keywords.forEach(keyword => {
      if (concerns.includes(keyword)) {
        score += 5
      }
    })

    return score
  }

  /**
   * 매칭 요인 분석
   */
  private analyzeMatchingFactors(motherInfo: MotherInfo, product: Product): {
    matching: string[]
    reasons: string[]
  } {
    const matching: string[] = []
    const reasons: string[] = []

    const age = motherInfo.age
    const conditions = motherInfo.normalizedConditions

    // 연령 매칭
    if (age >= 60) {
      matching.push(`${age}세 연령대`)
      reasons.push(`${age}세 어머님 연령대에 적합한 보장 설계`)
    }

    // 건강 상태 매칭
    if (product.id === 'e-signature-cancer') {
      const hasWomenDisease = conditions.some(c => c.type === 'thyroid' || c.type === 'uterine')
      if (hasWomenDisease) {
        matching.push('갑상선/자궁 질환')
        reasons.push('갑상선, 자궁 관련 질환에 특화된 여성암 보장')
      }
      
      const hasCancerConcern = motherInfo.concerns.includes('암')
      if (hasCancerConcern) {
        matching.push('암 보장 필요')
        reasons.push('암에 대한 우려를 해결할 수 있는 종합적 보장')
      }
    }

    if (product.id === 'e-health') {
      const hasChronicDisease = conditions.some(c => c.type === 'diabetes' || c.type === 'hypertension')
      if (hasChronicDisease) {
        matching.push('만성질환 관리')
        reasons.push('당뇨, 고혈압 등 생활습관병의 종합적 관리')
      }
    }

    if (product.id === 'e-term') {
      const isWorking = motherInfo.occupation.includes('직장')
      if (isWorking) {
        matching.push('경제활동 중')
        reasons.push('활발한 사회활동을 하시는 어머님의 가족 보장')
      }
    }

    // 직업 매칭
    const isWorking = motherInfo.occupation.includes('직장') || motherInfo.occupation.includes('회사')
    if (isWorking) {
      matching.push('활발한 사회활동')
      reasons.push('직장 생활 중인 어머님의 라이프스타일 고려')
    }

    return { matching, reasons }
  }

  /**
   * 자격 확인
   */
  private checkEligibility(motherInfo: MotherInfo, product: Product): 'eligible' | 'needs_review' | 'ineligible' {
    const criteria = product.eligibilityCriteria

    // 연령 확인
    if (motherInfo.age < criteria.minAge || motherInfo.age > criteria.maxAge) {
      return 'ineligible'
    }

    // 제외 조건 확인
    const hasExcludedCondition = motherInfo.normalizedConditions.some(condition => {
      return criteria.excludedConditions.some(excluded => {
        if (excluded === '현재암치료중' && condition.type === 'cancer' && condition.status === 'current') {
          return true
        }
        if (excluded === '중증질환' && condition.severity === 'severe') {
          return true
        }
        if (excluded === '중증만성질환' && 
            (condition.type === 'diabetes' || condition.type === 'hypertension') && 
            condition.severity === 'severe') {
          return true
        }
        return false
      })
    })

    if (hasExcludedCondition) {
      return 'ineligible'
    }

    // 자동 승인 임계값 확인
    if (motherInfo.eligibilityScore >= criteria.autoApprovalThreshold) {
      return 'eligible'
    }

    // 그 외의 경우 검토 필요
    return 'needs_review'
  }

  /**
   * 보험료 계산
   */
  private calculatePremium(motherInfo: MotherInfo, product: Product): number {
    const calc = product.premiumCalculation
    let premium = calc.baseRate

    // 연령별 할증
    const ageGroup = this.getAgeGroup(motherInfo.age)
    const ageMultiplier = calc.ageMultiplier[ageGroup] || 1.0
    premium *= ageMultiplier

    // 건강상태별 할증
    const healthGrade = this.assessHealthGrade(motherInfo)
    const healthMultiplier = calc.healthMultiplier[healthGrade] || 1.0
    premium *= healthMultiplier

    // 직업별 할증
    const occupationType = this.categorizeOccupation(motherInfo.occupation)
    const occupationMultiplier = calc.occupationMultiplier[occupationType] || 1.0
    premium *= occupationMultiplier

    // 한도 적용
    premium = Math.max(calc.minPremium, Math.min(calc.maxPremium, premium))

    return Math.round(premium)
  }

  /**
   * 연령 그룹 분류
   */
  private getAgeGroup(age: number): string {
    if (age < 50) return '40-49'
    if (age < 60) return '50-59'
    if (age < 70) return '60-69'
    if (age <= 75) return '70-75'
    return '70-80'
  }

  /**
   * 건강 등급 평가
   */
  private assessHealthGrade(motherInfo: MotherInfo): string {
    const score = motherInfo.eligibilityScore
    
    if (score >= 90) return 'excellent'
    if (score >= 75) return 'good'
    if (score >= 60) return 'fair'
    return 'poor'
  }

  /**
   * 직업 분류
   */
  private categorizeOccupation(occupation: string): string {
    occupation = occupation.toLowerCase()
    
    if (occupation.includes('주부') || occupation.includes('무직')) return 'retired'
    if (occupation.includes('사무') || occupation.includes('회사원') || occupation.includes('직장')) return 'office'
    if (occupation.includes('위험') || occupation.includes('건설') || occupation.includes('운전')) return 'high-risk'
    return 'physical'
  }

  /**
   * 감정적 메시지 생성
   */
  private generateEmotionalMessage(motherInfo: MotherInfo, product: Product, confidence: number): string {
    if (confidence >= 80) {
      return `${motherInfo.age}세 어머님께 가장 적합한 보장입니다 💝`
    } else if (confidence >= 60) {
      return `어머님의 상황을 고려할 때 좋은 선택이 될 것 같아요 🌸`
    } else {
      return `이런 보장도 함께 고려해보시면 좋을 것 같아요`
    }
  }

  /**
   * 기본 추천 제공
   */
  private getDefaultRecommendation(motherInfo: MotherInfo): ProductRecommendation {
    const defaultProduct = motherInfo.age >= 65 ? 
      this.products.get('e-signature-cancer')! : 
      this.products.get('e-health')!

    return {
      productId: defaultProduct.id,
      product: defaultProduct,
      confidence: 70,
      matchingFactors: [`${motherInfo.age}세 연령대`],
      reasons: ['연령대를 고려한 기본 추천'],
      emotionalMessage: '어머님 연령대에 일반적으로 추천되는 보장입니다',
      priority: 'primary',
      monthlyPremium: this.calculatePremium(motherInfo, defaultProduct),
      eligibilityStatus: this.checkEligibility(motherInfo, defaultProduct)
    }
  }

  /**
   * 감정적 메시지 개인화
   */
  private personalizeEmotionalMessages(recommendations: ProductRecommendation[], motherInfo: MotherInfo): void {
    recommendations.forEach(recommendation => {
      const personalElements: string[] = []

      // 연령 언급
      if (motherInfo.age >= 63) {
        personalElements.push(`${motherInfo.age}세`)
      }

      // 건강 상태 언급
      const hasSpecificCondition = motherInfo.normalizedConditions.some(c => 
        c.type === 'thyroid' || c.type === 'uterine'
      )
      if (hasSpecificCondition) {
        personalElements.push('갑상선·자궁 질환을 고려한')
      }

      // 직업 언급
      if (motherInfo.occupation.includes('직장')) {
        personalElements.push('활동적인')
      }

      if (personalElements.length > 0) {
        const personalPrefix = personalElements.join(' ') + ' 어머님께'
        recommendation.emotionalMessage = `${personalPrefix} ${recommendation.emotionalMessage}`
      }
    })
  }

  /**
   * 보험료 견적 생성
   */
  public generatePremiumQuote(request: PremiumQuoteRequest): PremiumQuoteResponse {
    const product = this.products.get(request.productId)
    if (!product) {
      throw new BusinessLogicError(
        '요청한 상품을 찾을 수 없습니다.',
        'PRODUCT_NOT_FOUND',
        'medium',
        { productId: request.productId }
      )
    }

    const basePremium = product.monthlyPremium
    const adjustedPremium = this.calculatePremium(request.motherInfo, product)
    
    const ageGroup = this.getAgeGroup(request.motherInfo.age)
    const healthGrade = this.assessHealthGrade(request.motherInfo)
    const occupationType = this.categorizeOccupation(request.motherInfo.occupation)

    const adjustmentFactors = {
      age: product.premiumCalculation.ageMultiplier[ageGroup] || 1.0,
      health: product.premiumCalculation.healthMultiplier[healthGrade] || 1.0,
      occupation: product.premiumCalculation.occupationMultiplier[occupationType] || 1.0
    }

    const eligibilityStatus = this.checkEligibility(request.motherInfo, product)

    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + 30) // 30일간 유효

    return {
      productId: request.productId,
      basePremium,
      adjustedPremium,
      adjustmentFactors,
      coverage: this.generateCoverageDetails(product, request.motherInfo),
      eligibilityStatus,
      validUntil
    }
  }

  /**
   * 보장 세부사항 생성
   */
  private generateCoverageDetails(product: Product, motherInfo: MotherInfo): Record<string, any> {
    const details: Record<string, any> = {}

    if (product.id === 'e-signature-cancer') {
      details.cancerDiagnosis = '최대 10회 반복 진단금'
      details.womenCancer = '여성특화암 2배 보장'
      details.treatmentCost = '항암치료비 및 통원비'
      
      // 개인화된 보장
      const hasWomenDisease = motherInfo.normalizedConditions.some(c => 
        c.type === 'thyroid' || c.type === 'uterine'
      )
      if (hasWomenDisease) {
        details.specialCare = '갑상선·자궁암 특별 케어'
      }
    }

    return details
  }

  /**
   * 상품 정보 조회
   */
  public getProduct(productId: ProductType): Product | null {
    return this.products.get(productId) || null
  }

  /**
   * 전체 상품 목록 조회
   */
  public getAllProducts(): Product[] {
    return Array.from(this.products.values())
  }
}