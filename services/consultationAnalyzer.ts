// ===============================
// 상담 데이터 처리 및 분석 엔진
// PRD 기반 비즈니스 로직 구현
// ===============================

import { 
  MotherInfo, 
  HealthCondition, 
  RiskProfile, 
  ConsultationSession,
  ConsultationAnalysisResult,
  BusinessLogicError,
  ProductType 
} from '../types/backend'

export class ConsultationAnalyzer {
  private static instance: ConsultationAnalyzer
  private sessions: Map<string, ConsultationSession> = new Map()

  public static getInstance(): ConsultationAnalyzer {
    if (!ConsultationAnalyzer.instance) {
      ConsultationAnalyzer.instance = new ConsultationAnalyzer()
    }
    return ConsultationAnalyzer.instance
  }

  /**
   * 상담 데이터 검증 및 정규화
   */
  public validateAndNormalizeData(rawData: any): MotherInfo {
    try {
      // 1. 필수 필드 검증
      const requiredFields = ['age', 'occupation', 'healthStatus', 'familyHistory', 'healthCheckup', 'concerns']
      for (const field of requiredFields) {
        if (!rawData[field] || typeof rawData[field] !== 'string') {
          throw new BusinessLogicError(
            `필수 필드 '${field}'가 누락되었거나 잘못되었습니다.`,
            'MISSING_REQUIRED_FIELD',
            'high',
            { field, value: rawData[field] }
          )
        }
      }

      // 2. 연령 검증 및 정규화
      const age = parseInt(rawData.age)
      if (isNaN(age) || age < 40 || age > 85) {
        throw new BusinessLogicError(
          '연령은 40세 이상 85세 이하여야 합니다.',
          'INVALID_AGE',
          'high',
          { age: rawData.age }
        )
      }

      // 3. 텍스트 데이터 정규화
      const normalizedData: MotherInfo = {
        age,
        occupation: this.normalizeText(rawData.occupation),
        healthStatus: this.normalizeText(rawData.healthStatus),
        familyHistory: this.normalizeText(rawData.familyHistory),
        healthCheckup: this.normalizeText(rawData.healthCheckup),
        concerns: this.normalizeText(rawData.concerns),
        normalizedConditions: [],
        riskProfile: this.createEmptyRiskProfile(),
        eligibilityScore: 0
      }

      // 4. 건강 상태 조건 추출 및 분류
      normalizedData.normalizedConditions = this.extractHealthConditions(normalizedData)

      // 5. 리스크 프로필 계산
      normalizedData.riskProfile = this.calculateRiskProfile(normalizedData)

      // 6. 전반적인 자격 점수 계산
      normalizedData.eligibilityScore = this.calculateEligibilityScore(normalizedData)

      return normalizedData

    } catch (error) {
      if (error instanceof BusinessLogicError) {
        throw error
      }
      throw new BusinessLogicError(
        '상담 데이터 검증 중 오류가 발생했습니다.',
        'VALIDATION_ERROR',
        'medium',
        { originalError: error }
      )
    }
  }

  /**
   * 건강 상태에서 주요 조건 추출 (PRD 기반)
   */
  private extractHealthConditions(motherInfo: MotherInfo): HealthCondition[] {
    const conditions: HealthCondition[] = []
    const allText = `${motherInfo.healthStatus} ${motherInfo.familyHistory} ${motherInfo.concerns}`.toLowerCase()

    // PRD 중심 조건 매핑
    const conditionKeywords = {
      thyroid: {
        keywords: ['갑상선', '갑상샘', 'thyroid'],
        severity: this.assessSeverity(allText, ['갑상선']),
        isRiskFactor: true,
        affectedProducts: ['e-signature-cancer'] as ProductType[]
      },
      uterine: {
        keywords: ['자궁', '난소', '유방', 'uterine', 'ovarian', 'breast'],
        severity: this.assessSeverity(allText, ['자궁', '난소', '유방']),
        isRiskFactor: true,
        affectedProducts: ['e-signature-cancer'] as ProductType[]
      },
      cancer: {
        keywords: ['암', '종양', '악성', 'cancer', 'tumor'],
        severity: this.assessSeverity(allText, ['암', '종양']),
        isRiskFactor: true,
        affectedProducts: ['e-signature-cancer', 'e-health'] as ProductType[]
      },
      diabetes: {
        keywords: ['당뇨', '혈당', 'diabetes'],
        severity: this.assessSeverity(allText, ['당뇨', '혈당']),
        isRiskFactor: true,
        affectedProducts: ['e-health'] as ProductType[]
      },
      hypertension: {
        keywords: ['고혈압', '혈압', 'hypertension'],
        severity: this.assessSeverity(allText, ['고혈압', '혈압']),
        isRiskFactor: true,
        affectedProducts: ['e-health'] as ProductType[]
      },
      chronic: {
        keywords: ['만성', '지속적', '계속', 'chronic'],
        severity: this.assessSeverity(allText, ['만성', '지속적']),
        isRiskFactor: false,
        affectedProducts: ['e-health'] as ProductType[]
      }
    }

    Object.entries(conditionKeywords).forEach(([conditionType, config]) => {
      const hasCondition = config.keywords.some(keyword => allText.includes(keyword))
      
      if (hasCondition) {
        // 현재 상태인지 가족력인지 구분
        const isFamilyHistory = motherInfo.familyHistory.toLowerCase().includes(config.keywords.find(k => allText.includes(k)) || '')
        const isCurrentCondition = motherInfo.healthStatus.toLowerCase().includes(config.keywords.find(k => allText.includes(k)) || '')

        conditions.push({
          type: conditionType as any,
          severity: config.severity,
          status: isCurrentCondition ? 'current' : isFamilyHistory ? 'family_history' : 'history',
          description: this.extractConditionDescription(motherInfo, config.keywords),
          isRiskFactor: config.isRiskFactor,
          affectedProducts: config.affectedProducts
        })
      }
    })

    return conditions
  }

  /**
   * 조건의 심각도 평가
   */
  private assessSeverity(text: string, keywords: string[]): 'mild' | 'moderate' | 'severe' {
    const severeKeywords = ['심각', '중증', '악성', '수술', '입원', '치료중']
    const moderateKeywords = ['치료', '약물', '관리', '검사', '의심']
    
    if (severeKeywords.some(keyword => text.includes(keyword))) {
      return 'severe'
    }
    if (moderateKeywords.some(keyword => text.includes(keyword))) {
      return 'moderate'
    }
    return 'mild'
  }

  /**
   * 조건 설명 추출
   */
  private extractConditionDescription(motherInfo: MotherInfo, keywords: string[]): string {
    const allText = `${motherInfo.healthStatus} ${motherInfo.familyHistory} ${motherInfo.concerns}`
    const sentences = allText.split(/[.!?]/)
    
    for (const sentence of sentences) {
      if (keywords.some(keyword => sentence.includes(keyword))) {
        return sentence.trim()
      }
    }
    return keywords[0] + ' 관련 상황'
  }

  /**
   * 리스크 프로필 계산 (PRD 기반)
   */
  private calculateRiskProfile(motherInfo: MotherInfo): RiskProfile {
    const age = motherInfo.age
    const conditions = motherInfo.normalizedConditions
    
    // PRD 시나리오 기반 위험도 계산
    let cancerRisk = this.calculateCancerRisk(age, conditions, motherInfo)
    let womenDiseaseRisk = this.calculateWomenDiseaseRisk(conditions, motherInfo)
    let chronicDiseaseRisk = this.calculateChronicDiseaseRisk(conditions, motherInfo)
    let ageRisk = this.calculateAgeRisk(age)
    let lifestyleRisk = this.calculateLifestyleRisk(motherInfo)

    // 전체 점수 계산 (가중평균)
    const overallScore = Math.round(
      (cancerRisk * 0.3) + 
      (womenDiseaseRisk * 0.25) + 
      (chronicDiseaseRisk * 0.2) + 
      (ageRisk * 0.15) + 
      (lifestyleRisk * 0.1)
    )

    // 주요 위험 요소 식별
    const primaryRiskFactors = this.identifyPrimaryRiskFactors(motherInfo, {
      cancerRisk,
      womenDiseaseRisk,
      chronicDiseaseRisk,
      ageRisk,
      lifestyleRisk
    })

    // 추천 상품 타입 결정
    const recommendedProductTypes = this.determineRecommendedProductTypes({
      cancerRisk,
      womenDiseaseRisk,
      chronicDiseaseRisk,
      age,
      conditions
    })

    return {
      cancerRisk,
      womenDiseaseRisk,
      chronicDiseaseRisk,
      ageRisk,
      lifestyleRisk,
      overallScore,
      primaryRiskFactors,
      recommendedProductTypes
    }
  }

  /**
   * 암 위험도 계산 (PRD 핵심 로직)
   */
  private calculateCancerRisk(age: number, conditions: HealthCondition[], motherInfo: MotherInfo): number {
    let risk = 0

    // 연령 기반 기본 위험도
    if (age >= 60) risk += 40
    if (age >= 65) risk += 20

    // 갑상선/자궁 질환 (PRD 핵심 시나리오)
    const hasThyroidOrUterine = conditions.some(c => 
      c.type === 'thyroid' || c.type === 'uterine'
    )
    if (hasThyroidOrUterine) risk += 35

    // 암 가족력
    const hasCancerHistory = conditions.some(c => 
      c.type === 'cancer' && c.status === 'family_history'
    )
    if (hasCancerHistory) risk += 25

    // 건강검진 패턴
    if (motherInfo.healthCheckup.includes('불규칙') || motherInfo.healthCheckup.includes('받지')) {
      risk += 15
    }

    // 우려사항에 암 관련 언급
    if (motherInfo.concerns.includes('암') || motherInfo.concerns.includes('진단')) {
      risk += 10
    }

    return Math.min(100, risk)
  }

  /**
   * 여성질환 위험도 계산
   */
  private calculateWomenDiseaseRisk(conditions: HealthCondition[], motherInfo: MotherInfo): number {
    let risk = 30 // 기본 여성 위험도

    const womenConditions = conditions.filter(c => 
      c.type === 'thyroid' || c.type === 'uterine'
    )

    womenConditions.forEach(condition => {
      if (condition.status === 'current') risk += 30
      else if (condition.status === 'history') risk += 20
      else if (condition.status === 'family_history') risk += 15
    })

    return Math.min(100, risk)
  }

  /**
   * 만성질환 위험도 계산
   */
  private calculateChronicDiseaseRisk(conditions: HealthCondition[], motherInfo: MotherInfo): number {
    let risk = 0

    const chronicConditions = conditions.filter(c => 
      c.type === 'diabetes' || c.type === 'hypertension' || c.type === 'chronic'
    )

    chronicConditions.forEach(condition => {
      if (condition.status === 'current') risk += 25
      else if (condition.status === 'history') risk += 15
    })

    // 생활습관 관련
    if (motherInfo.occupation.includes('직장') || motherInfo.occupation.includes('회사')) {
      risk += 10 // 직장인 스트레스
    }

    return Math.min(100, risk)
  }

  /**
   * 연령 위험도 계산
   */
  private calculateAgeRisk(age: number): number {
    if (age >= 80) return 100
    if (age >= 75) return 85
    if (age >= 70) return 70
    if (age >= 65) return 55
    if (age >= 60) return 40
    if (age >= 50) return 25
    return 10
  }

  /**
   * 생활습관 위험도 계산
   */
  private calculateLifestyleRisk(motherInfo: MotherInfo): number {
    let risk = 0

    // 직업적 스트레스
    if (motherInfo.occupation.includes('직장') || motherInfo.occupation.includes('회사')) {
      risk += 20
    }

    // 건강 관리 태도
    if (motherInfo.healthCheckup.includes('불규칙') || motherInfo.healthCheckup.includes('받지')) {
      risk += 15
    }

    // 건강에 대한 관심도 (낮을 경우)
    if (!motherInfo.concerns.includes('건강') && !motherInfo.concerns.includes('관리')) {
      risk += 10
    }

    return Math.min(100, risk)
  }

  /**
   * 주요 위험 요소 식별
   */
  private identifyPrimaryRiskFactors(motherInfo: MotherInfo, risks: Record<string, number>): string[] {
    const factors: string[] = []

    if (risks.cancerRisk >= 60) factors.push('암 발병 위험')
    if (risks.womenDiseaseRisk >= 60) factors.push('여성질환 위험')
    if (risks.chronicDiseaseRisk >= 50) factors.push('만성질환 위험')
    if (risks.ageRisk >= 50) factors.push('고령에 따른 위험')
    
    if (motherInfo.age >= 63) factors.push('63세 이상 고령')
    
    const hasThyroidOrUterine = motherInfo.normalizedConditions.some(c => 
      c.type === 'thyroid' || c.type === 'uterine'
    )
    if (hasThyroidOrUterine) factors.push('갑상선/자궁 질환 이력')

    if (motherInfo.occupation.includes('직장')) factors.push('활발한 사회활동')

    return factors
  }

  /**
   * 추천 상품 타입 결정 (PRD 로직)
   */
  private determineRecommendedProductTypes(params: {
    cancerRisk: number
    womenDiseaseRisk: number
    chronicDiseaseRisk: number
    age: number
    conditions: HealthCondition[]
  }): ProductType[] {
    const { cancerRisk, womenDiseaseRisk, chronicDiseaseRisk, age, conditions } = params
    const recommendations: ProductType[] = []

    // PRD 우선순위별 추천
    
    // 1순위: e시그니처암보험 (PRD 메인 시나리오)
    if ((age >= 60 && (cancerRisk >= 50 || womenDiseaseRisk >= 60)) ||
        conditions.some(c => c.type === 'thyroid' || c.type === 'uterine')) {
      recommendations.push('e-signature-cancer')
    }

    // 2순위: e건강보험
    if (chronicDiseaseRisk >= 40 || 
        (age >= 60 && cancerRisk < 50 && womenDiseaseRisk < 60)) {
      recommendations.push('e-health')
    }

    // 3순위: e정기보험
    if (age >= 60 && age <= 70 && cancerRisk < 40) {
      recommendations.push('e-term')
    }

    // 기본 추천 (빈 경우)
    if (recommendations.length === 0) {
      if (age >= 65) recommendations.push('e-signature-cancer')
      else if (age >= 60) recommendations.push('e-health')
      else recommendations.push('e-health')
    }

    return recommendations
  }

  /**
   * 전반적인 자격 점수 계산
   */
  private calculateEligibilityScore(motherInfo: MotherInfo): number {
    const riskProfile = motherInfo.riskProfile
    
    // 기본 점수 (연령 기반)
    let score = 100

    // 연령 페널티
    if (motherInfo.age > 75) score -= 20
    else if (motherInfo.age > 70) score -= 10
    else if (motherInfo.age > 65) score -= 5

    // 건강 상태 페널티
    const severeConditions = motherInfo.normalizedConditions.filter(c => c.severity === 'severe')
    score -= severeConditions.length * 15

    const moderateConditions = motherInfo.normalizedConditions.filter(c => c.severity === 'moderate')
    score -= moderateConditions.length * 10

    // 정기 검진 보너스
    if (motherInfo.healthCheckup.includes('매년') || motherInfo.healthCheckup.includes('정기')) {
      score += 10
    }

    // 건강 관심도 보너스
    if (motherInfo.concerns.includes('건강') || motherInfo.concerns.includes('예방')) {
      score += 5
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * 텍스트 정규화
   */
  private normalizeText(text: string): string {
    return text.trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s가-힣]/g, '')
  }

  /**
   * 빈 리스크 프로필 생성
   */
  private createEmptyRiskProfile(): RiskProfile {
    return {
      cancerRisk: 0,
      womenDiseaseRisk: 0,
      chronicDiseaseRisk: 0,
      ageRisk: 0,
      lifestyleRisk: 0,
      overallScore: 0,
      primaryRiskFactors: [],
      recommendedProductTypes: []
    }
  }

  /**
   * 상담 세션 관리
   */
  public createSession(customerId?: string): ConsultationSession {
    const sessionId = this.generateSessionId()
    const session: ConsultationSession = {
      id: sessionId,
      customerId,
      motherInfo: {},
      currentStep: 0,
      completedSteps: [],
      startedAt: new Date(),
      lastUpdatedAt: new Date(),
      status: 'active',
      progressScore: 0
    }

    this.sessions.set(sessionId, session)
    return session
  }

  public updateSession(sessionId: string, updates: Partial<ConsultationSession>): ConsultationSession {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new BusinessLogicError(
        '상담 세션을 찾을 수 없습니다.',
        'SESSION_NOT_FOUND',
        'medium',
        { sessionId }
      )
    }

    const updatedSession = { ...session, ...updates, lastUpdatedAt: new Date() }
    this.sessions.set(sessionId, updatedSession)
    return updatedSession
  }

  public completeSession(sessionId: string): ConsultationAnalysisResult {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new BusinessLogicError(
        '상담 세션을 찾을 수 없습니다.',
        'SESSION_NOT_FOUND',
        'medium',
        { sessionId }
      )
    }

    // 상담 완료 처리
    const motherInfo = this.validateAndNormalizeData(session.motherInfo)
    
    const updatedSession = this.updateSession(sessionId, {
      status: 'completed',
      completedAt: new Date(),
      progressScore: 100
    })

    return {
      motherInfo,
      riskProfile: motherInfo.riskProfile,
      recommendations: [], // 이는 ProductRecommendationEngine에서 생성
      insights: this.generateInsights(motherInfo),
      warnings: this.generateWarnings(motherInfo),
      nextSteps: this.generateNextSteps(motherInfo)
    }
  }

  /**
   * 인사이트 생성
   */
  private generateInsights(motherInfo: MotherInfo): string[] {
    const insights: string[] = []
    const age = motherInfo.age
    const conditions = motherInfo.normalizedConditions

    if (age >= 63 && conditions.some(c => c.type === 'thyroid' || c.type === 'uterine')) {
      insights.push('PRD 핵심 시나리오: 63세 이상 + 갑상선/자궁 질환으로 e시그니처암보험이 최적입니다.')
    }

    if (motherInfo.occupation.includes('직장')) {
      insights.push('활발한 사회활동을 하시는 어머님께는 포괄적인 보장이 중요합니다.')
    }

    if (motherInfo.riskProfile.cancerRisk >= 60) {
      insights.push('암 위험도가 높아 전문적인 암보험 보장을 우선 고려해보세요.')
    }

    return insights
  }

  /**
   * 주의사항 생성
   */
  private generateWarnings(motherInfo: MotherInfo): string[] {
    const warnings: string[] = []

    if (motherInfo.eligibilityScore < 70) {
      warnings.push('건강 상태에 따라 추가 심사가 필요할 수 있습니다.')
    }

    if (motherInfo.age > 75) {
      warnings.push('75세 이상은 가입 조건이 제한될 수 있습니다.')
    }

    const severeConditions = motherInfo.normalizedConditions.filter(c => c.severity === 'severe')
    if (severeConditions.length > 0) {
      warnings.push('중증 질환이 있는 경우 보장 제외 조건이 적용될 수 있습니다.')
    }

    return warnings
  }

  /**
   * 다음 단계 안내 생성
   */
  private generateNextSteps(motherInfo: MotherInfo): string[] {
    const nextSteps: string[] = []

    nextSteps.push('맞춤 상품 추천을 확인해보세요.')
    nextSteps.push('3분 간편 청약으로 보험 가입을 완료하세요.')
    
    if (motherInfo.eligibilityScore < 80) {
      nextSteps.push('정확한 보험료 산출을 위해 건강 상태를 상세히 확인해주세요.')
    }

    nextSteps.push('가입 완료 후 효도 선물 이벤트에 참여하세요.')

    return nextSteps
  }

  /**
   * 세션 ID 생성
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 진행률 계산
   */
  public calculateProgress(session: ConsultationSession): number {
    const totalSteps = 6 // PRD 기반 상담 단계 수
    return Math.round((session.completedSteps.length / totalSteps) * 100)
  }

  /**
   * 세션 정리 (메모리 관리)
   */
  public cleanupOldSessions(): void {
    const now = new Date()
    const maxAge = 2 * 60 * 60 * 1000 // 2시간

    this.sessions.forEach((session, sessionId) => {
      if (now.getTime() - session.lastUpdatedAt.getTime() > maxAge) {
        this.sessions.delete(sessionId)
      }
    })
  }
}