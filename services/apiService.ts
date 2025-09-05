// ===============================
// API 서비스 레이어 및 Mock 데이터 구현
// 프론트엔드와 백엔드 로직 연결 인터페이스
// ===============================

import {
  ApiResponse,
  ConsultationSession,
  ConsultationAnalysisResult,
  MotherInfo,
  ProductRecommendation,
  ApplicationData,
  GiftEvent,
  PremiumQuoteRequest,
  PremiumQuoteResponse,
  CustomerInfo,
  PaymentInfo,
  Agreements,
  GiftType,
  ValidationError
} from '../types/backend'

import { ConsultationAnalyzer } from './consultationAnalyzer'
import { ProductRecommendationEngine } from './productRecommendationEngine'
import { ApplicationProcessor } from './applicationProcessor'
import { GiftEventManager } from './giftEventManager'

export class ApiService {
  private static instance: ApiService
  private consultationAnalyzer: ConsultationAnalyzer
  private recommendationEngine: ProductRecommendationEngine
  private applicationProcessor: ApplicationProcessor
  private giftEventManager: GiftEventManager
  
  // API 호출 시뮬레이션을 위한 지연시간 설정
  private readonly apiDelay = {
    consultation: 800,    // 상담 API
    recommendation: 1200, // 추천 API  
    application: 1000,    // 청약 API
    payment: 2000,        // 결제 API
    gift: 600            // 선물 API
  }

  private constructor() {
    this.consultationAnalyzer = ConsultationAnalyzer.getInstance()
    this.recommendationEngine = ProductRecommendationEngine.getInstance()
    this.applicationProcessor = ApplicationProcessor.getInstance()
    this.giftEventManager = GiftEventManager.getInstance()
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService()
    }
    return ApiService.instance
  }

  /**
   * 공통 API 응답 생성 헬퍼
   */
  private createApiResponse<T>(
    success: boolean,
    data?: T,
    errorCode?: string,
    errorMessage?: string
  ): ApiResponse<T> {
    const response: ApiResponse<T> = {
      success,
      timestamp: new Date(),
      requestId: this.generateRequestId()
    }

    if (success && data !== undefined) {
      response.data = data
    }

    if (!success && errorCode && errorMessage) {
      response.error = {
        code: errorCode,
        message: errorMessage
      }
    }

    return response
  }

  /**
   * API 지연 시뮬레이션
   */
  private async simulateApiDelay(type: keyof typeof this.apiDelay): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, this.apiDelay[type]))
  }

  // ===============================
  // 상담 관련 API
  // ===============================

  /**
   * 상담 세션 시작
   */
  async startConsultation(customerId?: string): Promise<ApiResponse<ConsultationSession>> {
    try {
      await this.simulateApiDelay('consultation')
      
      const session = this.consultationAnalyzer.createSession(customerId)
      
      return this.createApiResponse(true, session)
    } catch (error) {
      return this.createApiResponse(false, undefined, 'CONSULTATION_START_ERROR', '상담 시작 중 오류가 발생했습니다.')
    }
  }

  /**
   * 상담 정보 업데이트
   */
  async updateConsultation(
    sessionId: string,
    motherInfo: Partial<MotherInfo>
  ): Promise<ApiResponse<ConsultationSession>> {
    try {
      await this.simulateApiDelay('consultation')
      
      const updatedSession = this.consultationAnalyzer.updateSession(sessionId, {
        motherInfo,
        lastUpdatedAt: new Date()
      })
      
      return this.createApiResponse(true, updatedSession)
    } catch (error) {
      return this.createApiResponse(false, undefined, 'CONSULTATION_UPDATE_ERROR', '상담 정보 업데이트 중 오류가 발생했습니다.')
    }
  }

  /**
   * 상담 완료 및 분석
   */
  async completeConsultation(sessionId: string): Promise<ApiResponse<ConsultationAnalysisResult>> {
    try {
      await this.simulateApiDelay('consultation')
      
      const analysisResult = this.consultationAnalyzer.completeSession(sessionId)
      
      // 상품 추천 생성
      const recommendations = this.recommendationEngine.generateRecommendations(analysisResult.motherInfo)
      analysisResult.recommendations = recommendations
      
      return this.createApiResponse(true, analysisResult)
    } catch (error) {
      return this.createApiResponse(false, undefined, 'CONSULTATION_COMPLETE_ERROR', '상담 완료 처리 중 오류가 발생했습니다.')
    }
  }

  // ===============================
  // 상품 추천 관련 API
  // ===============================

  /**
   * 상품 추천 조회
   */
  async getProductRecommendations(motherInfo: MotherInfo): Promise<ApiResponse<ProductRecommendation[]>> {
    try {
      await this.simulateApiDelay('recommendation')
      
      const recommendations = this.recommendationEngine.generateRecommendations(motherInfo)
      
      return this.createApiResponse(true, recommendations)
    } catch (error) {
      return this.createApiResponse(false, undefined, 'RECOMMENDATION_ERROR', '상품 추천 생성 중 오류가 발생했습니다.')
    }
  }

  /**
   * 보험료 견적 조회
   */
  async getPremiumQuote(request: PremiumQuoteRequest): Promise<ApiResponse<PremiumQuoteResponse>> {
    try {
      await this.simulateApiDelay('recommendation')
      
      const quote = this.recommendationEngine.generatePremiumQuote(request)
      
      return this.createApiResponse(true, quote)
    } catch (error) {
      return this.createApiResponse(false, undefined, 'PREMIUM_QUOTE_ERROR', '보험료 견적 조회 중 오류가 발생했습니다.')
    }
  }

  /**
   * 상품 상세 정보 조회
   */
  async getProductDetails(productId: string): Promise<ApiResponse<any>> {
    try {
      await this.simulateApiDelay('recommendation')
      
      const product = this.recommendationEngine.getProduct(productId as any)
      if (!product) {
        return this.createApiResponse(false, undefined, 'PRODUCT_NOT_FOUND', '상품을 찾을 수 없습니다.')
      }
      
      return this.createApiResponse(true, product)
    } catch (error) {
      return this.createApiResponse(false, undefined, 'PRODUCT_DETAILS_ERROR', '상품 정보 조회 중 오류가 발생했습니다.')
    }
  }

  // ===============================
  // 청약 관련 API
  // ===============================

  /**
   * 청약서 생성
   */
  async createApplication(
    sessionId: string,
    motherInfo: MotherInfo,
    selectedProduct: ProductRecommendation
  ): Promise<ApiResponse<ApplicationData>> {
    try {
      await this.simulateApiDelay('application')
      
      const application = this.applicationProcessor.createApplication(sessionId, motherInfo, selectedProduct)
      
      return this.createApiResponse(true, application)
    } catch (error) {
      return this.createApiResponse(false, undefined, 'APPLICATION_CREATE_ERROR', '청약서 생성 중 오류가 발생했습니다.')
    }
  }

  /**
   * 고객 정보 업데이트
   */
  async updateCustomerInfo(
    applicationId: string,
    customerInfo: Partial<CustomerInfo>
  ): Promise<ApiResponse<{ success: boolean; errors: ValidationError[] }>> {
    try {
      await this.simulateApiDelay('application')
      
      const result = this.applicationProcessor.updateCustomerInfo(applicationId, customerInfo)
      
      return this.createApiResponse(true, result)
    } catch (error) {
      return this.createApiResponse(false, undefined, 'CUSTOMER_INFO_UPDATE_ERROR', '고객 정보 업데이트 중 오류가 발생했습니다.')
    }
  }

  /**
   * 결제 정보 업데이트
   */
  async updatePaymentInfo(
    applicationId: string,
    paymentInfo: Partial<PaymentInfo>
  ): Promise<ApiResponse<{ success: boolean; errors: ValidationError[] }>> {
    try {
      await this.simulateApiDelay('payment')
      
      const result = this.applicationProcessor.updatePaymentInfo(applicationId, paymentInfo)
      
      return this.createApiResponse(true, result)
    } catch (error) {
      return this.createApiResponse(false, undefined, 'PAYMENT_INFO_UPDATE_ERROR', '결제 정보 업데이트 중 오류가 발생했습니다.')
    }
  }

  /**
   * 약관 동의 업데이트
   */
  async updateAgreements(
    applicationId: string,
    agreements: Partial<Agreements>,
    metadata: { ipAddress: string; userAgent: string }
  ): Promise<ApiResponse<{ success: boolean; errors: ValidationError[] }>> {
    try {
      await this.simulateApiDelay('application')
      
      const result = this.applicationProcessor.updateAgreements(applicationId, agreements, metadata)
      
      return this.createApiResponse(true, result)
    } catch (error) {
      return this.createApiResponse(false, undefined, 'AGREEMENTS_UPDATE_ERROR', '약관 동의 업데이트 중 오류가 발생했습니다.')
    }
  }

  /**
   * 청약 제출
   */
  async submitApplication(applicationId: string): Promise<ApiResponse<{ success: boolean; policyNumber?: string; errors?: ValidationError[] }>> {
    try {
      await this.simulateApiDelay('payment')
      
      const result = await this.applicationProcessor.submitApplication(applicationId)
      
      return this.createApiResponse(true, result)
    } catch (error) {
      return this.createApiResponse(false, undefined, 'APPLICATION_SUBMIT_ERROR', '청약 제출 중 오류가 발생했습니다.')
    }
  }

  /**
   * 청약 상태 조회
   */
  async getApplicationStatus(applicationId: string): Promise<ApiResponse<any>> {
    try {
      await this.simulateApiDelay('application')
      
      const status = this.applicationProcessor.getApplicationStatus(applicationId)
      
      return this.createApiResponse(true, status)
    } catch (error) {
      return this.createApiResponse(false, undefined, 'APPLICATION_STATUS_ERROR', '청약 상태 조회 중 오류가 발생했습니다.')
    }
  }

  /**
   * 청약 진행률 조회
   */
  async getApplicationProgress(applicationId: string): Promise<ApiResponse<any>> {
    try {
      await this.simulateApiDelay('application')
      
      const progress = this.applicationProcessor.calculateApplicationProgress(applicationId)
      
      return this.createApiResponse(true, progress)
    } catch (error) {
      return this.createApiResponse(false, undefined, 'APPLICATION_PROGRESS_ERROR', '청약 진행률 조회 중 오류가 발생했습니다.')
    }
  }

  // ===============================
  // 효도 선물 관련 API
  // ===============================

  /**
   * 선물 자격 확인
   */
  async checkGiftEligibility(applicationId: string): Promise<ApiResponse<any>> {
    try {
      await this.simulateApiDelay('gift')
      
      const application = this.applicationProcessor.getApplication(applicationId)
      const eligibility = this.giftEventManager.checkGiftEligibility(application)
      
      return this.createApiResponse(true, eligibility)
    } catch (error) {
      return this.createApiResponse(false, undefined, 'GIFT_ELIGIBILITY_ERROR', '선물 자격 확인 중 오류가 발생했습니다.')
    }
  }

  /**
   * 선물 카탈로그 조회
   */
  async getGiftCatalog(applicationId: string): Promise<ApiResponse<any>> {
    try {
      await this.simulateApiDelay('gift')
      
      const application = this.applicationProcessor.getApplication(applicationId)
      const catalog = this.giftEventManager.getAvailableGiftCatalog(application)
      
      return this.createApiResponse(true, catalog)
    } catch (error) {
      return this.createApiResponse(false, undefined, 'GIFT_CATALOG_ERROR', '선물 카탈로그 조회 중 오류가 발생했습니다.')
    }
  }

  /**
   * 선물 선택
   */
  async selectGift(
    applicationId: string,
    customerId: string,
    giftType: GiftType
  ): Promise<ApiResponse<{ success: boolean; giftEventId?: string; error?: string }>> {
    try {
      await this.simulateApiDelay('gift')
      
      const result = this.giftEventManager.selectGift(applicationId, customerId, giftType)
      
      return this.createApiResponse(true, result)
    } catch (error) {
      return this.createApiResponse(false, undefined, 'GIFT_SELECTION_ERROR', '선물 선택 중 오류가 발생했습니다.')
    }
  }

  /**
   * 선물 이벤트 조회
   */
  async getGiftEvent(giftEventId: string): Promise<ApiResponse<GiftEvent | null>> {
    try {
      await this.simulateApiDelay('gift')
      
      const giftEvent = this.giftEventManager.getGiftEvent(giftEventId)
      
      return this.createApiResponse(true, giftEvent)
    } catch (error) {
      return this.createApiResponse(false, undefined, 'GIFT_EVENT_ERROR', '선물 이벤트 조회 중 오류가 발생했습니다.')
    }
  }

  // ===============================
  // 통계 및 관리 API
  // ===============================

  /**
   * 시스템 통계 조회
   */
  async getSystemStatistics(): Promise<ApiResponse<any>> {
    try {
      await this.simulateApiDelay('application')
      
      const applicationStats = this.applicationProcessor.getApplicationStatistics()
      const giftStats = this.giftEventManager.getGiftStatistics()
      const inventoryStatus = this.giftEventManager.getInventoryStatus()
      
      const statistics = {
        applications: applicationStats,
        gifts: giftStats,
        inventory: inventoryStatus,
        timestamp: new Date()
      }
      
      return this.createApiResponse(true, statistics)
    } catch (error) {
      return this.createApiResponse(false, undefined, 'STATISTICS_ERROR', '통계 조회 중 오류가 발생했습니다.')
    }
  }

  /**
   * 시스템 상태 확인 (Health Check)
   */
  async healthCheck(): Promise<ApiResponse<any>> {
    try {
      // 각 서비스 상태 확인
      const healthStatus = {
        consultation: { status: 'healthy', responseTime: this.apiDelay.consultation },
        recommendation: { status: 'healthy', responseTime: this.apiDelay.recommendation },
        application: { status: 'healthy', responseTime: this.apiDelay.application },
        gift: { status: 'healthy', responseTime: this.apiDelay.gift },
        overall: 'healthy',
        uptime: process.uptime ? Math.floor(process.uptime()) : 0,
        timestamp: new Date()
      }
      
      return this.createApiResponse(true, healthStatus)
    } catch (error) {
      return this.createApiResponse(false, undefined, 'HEALTH_CHECK_ERROR', '시스템 상태 확인 중 오류가 발생했습니다.')
    }
  }

  // ===============================
  // PRD 시나리오별 Mock 데이터 생성
  // ===============================

  /**
   * PRD 메인 시나리오 Mock 데이터 생성 (한화진 33세 → 어머님 63세)
   */
  generatePrdMainScenarioData(): {
    motherInfo: any
    expectedRecommendation: string
    testCases: any[]
  } {
    const motherInfo = {
      age: '63',
      occupation: '직장을 다니고 있음',
      healthStatus: '갑상선 질환과 자궁 관련 질환이 있음',
      familyHistory: '특별한 가족력 없음',
      healthCheckup: '불규칙적으로 받고 있음',
      concerns: '암에 대한 걱정이 많음, 치료비 부담'
    }

    const expectedRecommendation = 'e-signature-cancer'

    const testCases = [
      {
        scenario: 'PRD 메인 시나리오',
        input: motherInfo,
        expectedOutput: {
          primaryRecommendation: 'e시그니처암보험(종합)',
          confidence: 95,
          matchingFactors: ['PRD 메인 시나리오', '63세 연령대', '갑상선/자궁 질환', '활발한 사회활동']
        }
      },
      {
        scenario: '연령만 다른 경우 (65세)',
        input: { ...motherInfo, age: '65' },
        expectedOutput: {
          primaryRecommendation: 'e시그니처암보험(종합)',
          confidence: 90,
          reason: '갑상선/자궁 질환으로 인한 우선 추천'
        }
      },
      {
        scenario: '건강한 경우',
        input: { 
          ...motherInfo, 
          healthStatus: '비교적 건강함',
          concerns: '전반적인 건강 관리'
        },
        expectedOutput: {
          primaryRecommendation: 'e건강보험',
          confidence: 75,
          reason: '전반적 건강 관리 필요'
        }
      }
    ]

    return {
      motherInfo,
      expectedRecommendation,
      testCases
    }
  }

  /**
   * 다양한 테스트 케이스 생성
   */
  generateTestScenarios(): Array<{
    name: string
    motherInfo: any
    expectedFlow: string[]
    expectedResults: any
  }> {
    return [
      {
        name: '젊은 어머님 (55세) - 예방 중심',
        motherInfo: {
          age: '55',
          occupation: '주부',
          healthStatus: '건강함',
          familyHistory: '당뇨 가족력',
          healthCheckup: '매년 정기적으로',
          concerns: '예방과 건강 관리'
        },
        expectedFlow: ['상담', '건강보험 추천', '청약', '선물'],
        expectedResults: {
          recommendation: 'e건강보험',
          premium: 35000,
          gifts: ['health_checkup', 'spa_voucher']
        }
      },
      {
        name: '고령 어머님 (72세) - 종합 보장',
        motherInfo: {
          age: '72',
          occupation: '무직',
          healthStatus: '고혈압, 관절염',
          familyHistory: '암 가족력',
          healthCheckup: '불규칙',
          concerns: '암 걱정, 의료비'
        },
        expectedFlow: ['상담', '암보험 추천', '심사 필요', '선물'],
        expectedResults: {
          recommendation: 'e시그니처암보험(종합)',
          premium: 75000,
          eligibility: 'needs_review',
          gifts: ['massage_voucher', 'wellness_package']
        }
      },
      {
        name: '활동적인 어머님 (58세) - 정기보험',
        motherInfo: {
          age: '58',
          occupation: '자영업',
          healthStatus: '건강함',
          familyHistory: '특별히 없음',
          healthCheckup: '정기적',
          concerns: '가족 보장, 경제적 안정'
        },
        expectedFlow: ['상담', '정기보험 추천', '청약', '선물'],
        expectedResults: {
          recommendation: 'e정기보험',
          premium: 28000,
          gifts: ['flower_delivery', 'spa_voucher']
        }
      }
    ]
  }

  // ===============================
  // 유틸리티 메서드
  // ===============================

  private generateRequestId(): string {
    return `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
  }

  /**
   * API 호출 로그
   */
  private logApiCall(endpoint: string, method: string, data?: any): void {
    console.log(`[API] ${method} ${endpoint}`, {
      timestamp: new Date().toISOString(),
      data: data ? JSON.stringify(data).substring(0, 100) : undefined
    })
  }

  /**
   * 오류 추적
   */
  private trackError(error: any, context: string): void {
    console.error(`[API Error] ${context}:`, {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * 메모리 정리 (개발용)
   */
  async cleanup(): Promise<void> {
    this.consultationAnalyzer.cleanupOldSessions()
    this.applicationProcessor.cleanupOldApplications()
    console.log('[API] 메모리 정리 완료')
  }
}

// 싱글톤 인스턴스 export
export const apiService = ApiService.getInstance()

// 개발용 유틸리티
export const devUtils = {
  // PRD 시나리오 테스트
  async testPrdScenario() {
    const api = ApiService.getInstance()
    const mockData = api.generatePrdMainScenarioData()
    
    console.log('🧪 PRD 메인 시나리오 테스트 시작')
    console.log('Input:', mockData.motherInfo)
    
    try {
      // 상담 시작
      const sessionResponse = await api.startConsultation()
      if (!sessionResponse.success) throw new Error('상담 시작 실패')
      
      const sessionId = sessionResponse.data!.id
      
      // 상담 완료
      const analysisResponse = await api.completeConsultation(sessionId)
      if (!analysisResponse.success) throw new Error('상담 분석 실패')
      
      const recommendations = analysisResponse.data!.recommendations
      const primaryRec = recommendations.find(r => r.priority === 'primary')
      
      console.log('✅ 추천 결과:', {
        product: primaryRec?.product.name,
        confidence: primaryRec?.confidence,
        matchingFactors: primaryRec?.matchingFactors
      })
      
      // 예상 결과와 비교
      const isExpected = primaryRec?.productId === mockData.expectedRecommendation
      console.log(isExpected ? '✅ 예상 결과와 일치' : '❌ 예상 결과와 다름')
      
    } catch (error) {
      console.error('❌ 테스트 실패:', error)
    }
  },
  
  // 전체 플로우 테스트
  async testFullFlow() {
    const api = ApiService.getInstance()
    
    console.log('🧪 전체 플로우 테스트 시작')
    
    try {
      // 1. 상담
      const sessionResponse = await api.startConsultation()
      const sessionId = sessionResponse.data!.id
      
      // 2. 상담 완료 및 추천
      const analysisResponse = await api.completeConsultation(sessionId)
      const motherInfo = analysisResponse.data!.motherInfo
      const recommendations = analysisResponse.data!.recommendations
      const primaryRec = recommendations[0]
      
      // 3. 청약 생성
      const appResponse = await api.createApplication(sessionId, motherInfo, primaryRec)
      const applicationId = appResponse.data!.id
      
      // 4. 고객 정보 입력
      await api.updateCustomerInfo(applicationId, {
        name: '한화진',
        phone: '010-1234-5678',
        email: 'test@example.com',
        relationship: '딸'
      })
      
      // 5. 결제 정보 입력
      await api.updatePaymentInfo(applicationId, {
        method: 'card',
        cardNumber: '1234-5678-9012-3456'
      })
      
      // 6. 약관 동의
      await api.updateAgreements(applicationId, {
        personalInfo: true,
        serviceTerms: true,
        marketing: false
      }, {
        ipAddress: '127.0.0.1',
        userAgent: 'test-browser'
      })
      
      // 7. 청약 제출
      const submitResponse = await api.submitApplication(applicationId)
      
      if (submitResponse.data!.success) {
        console.log('✅ 청약 제출 성공:', submitResponse.data!.policyNumber)
        
        // 8. 선물 선택
        const giftResponse = await api.selectGift(applicationId, 'customer_001', 'health_checkup')
        if (giftResponse.data!.success) {
          console.log('✅ 선물 선택 성공:', giftResponse.data!.giftEventId)
        }
      }
      
      console.log('✅ 전체 플로우 테스트 완료')
      
    } catch (error) {
      console.error('❌ 플로우 테스트 실패:', error)
    }
  }
}