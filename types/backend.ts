// ===============================
// 효도 보험 상담 앱 백엔드 타입 정의
// PRD 기반 비즈니스 로직 및 데이터 모델
// ===============================

export interface MotherInfo {
  age: number
  occupation: string
  healthStatus: string
  familyHistory: string
  healthCheckup: string
  concerns: string
  // 내부 처리용 정규화된 필드들
  normalizedConditions: HealthCondition[]
  riskProfile: RiskProfile
  eligibilityScore: number
}

export interface HealthCondition {
  type: 'thyroid' | 'uterine' | 'cancer' | 'diabetes' | 'hypertension' | 'chronic' | 'other'
  severity: 'mild' | 'moderate' | 'severe'
  status: 'current' | 'history' | 'family_history'
  description: string
  isRiskFactor: boolean
  affectedProducts: ProductType[]
}

export interface RiskProfile {
  cancerRisk: number  // 0-100 점수
  womenDiseaseRisk: number
  chronicDiseaseRisk: number
  ageRisk: number
  lifestyleRisk: number
  overallScore: number
  primaryRiskFactors: string[]
  recommendedProductTypes: ProductType[]
}

export type ProductType = 'e-signature-cancer' | 'e-health' | 'e-term'

export interface Product {
  id: ProductType
  name: string
  type: 'cancer' | 'health' | 'term'
  monthlyPremium: number
  coverage: string[]
  description: string
  keyFeatures: string[]
  targetConditions: string[]
  emotionalMessage: string
  eligibilityCriteria: EligibilityCriteria
  premiumCalculation: PremiumCalculation
}

export interface EligibilityCriteria {
  minAge: number
  maxAge: number
  excludedConditions: string[]
  requiredHealthCheck: boolean
  underwritingRequired: boolean
  autoApprovalThreshold: number
}

export interface PremiumCalculation {
  baseRate: number
  ageMultiplier: Record<string, number>
  healthMultiplier: Record<string, number>
  occupationMultiplier: Record<string, number>
  maxPremium: number
  minPremium: number
}

// 상담 진행 관련
export interface ConsultationSession {
  id: string
  customerId?: string
  motherInfo: Partial<MotherInfo>
  currentStep: number
  completedSteps: number[]
  startedAt: Date
  lastUpdatedAt: Date
  completedAt?: Date
  status: 'active' | 'completed' | 'abandoned'
  progressScore: number  // 0-100
  recommendedProducts?: ProductRecommendation[]
}

export interface ProductRecommendation {
  productId: ProductType
  product: Product
  confidence: number  // 추천 신뢰도 0-100
  matchingFactors: string[]
  reasons: string[]
  emotionalMessage: string
  priority: 'primary' | 'secondary' | 'alternative'
  monthlyPremium: number
  eligibilityStatus: 'eligible' | 'needs_review' | 'ineligible'
}

// 청약 관련
export interface ApplicationData {
  id: string
  sessionId: string
  customerInfo: CustomerInfo
  motherInfo: MotherInfo
  selectedProduct: ProductRecommendation
  paymentInfo: PaymentInfo
  agreements: Agreements
  status: ApplicationStatus
  submittedAt: Date
  processedAt?: Date
  approvedAt?: Date
  policyNumber?: string
  validationErrors?: ValidationError[]
}

export interface CustomerInfo {
  name: string
  phone: string
  email: string
  relationship: '딸' | '아들' | '며느리' | '사위' | '기타'
  // 신원 확인용 (향후 확장)
  birthDate?: string
  idNumber?: string
  address?: Address
}

export interface Address {
  zipCode: string
  baseAddress: string
  detailAddress: string
  city: string
  district: string
}

export interface PaymentInfo {
  method: 'card' | 'bank'
  cardNumber?: string
  cardExpiry?: string
  cardCVC?: string
  cardHolderName?: string
  bankCode?: string
  bankAccount?: string
  accountHolderName?: string
  // 자동이체 설정
  autoPayment: boolean
  paymentDay: number  // 1-28
}

export interface Agreements {
  personalInfo: boolean  // 개인정보 수집 이용 (필수)
  serviceTerms: boolean  // 보험약관 및 서비스 이용 (필수)
  marketing: boolean     // 마케팅 정보 수신 (선택)
  thirdParty: boolean    // 제3자 정보 제공 (선택)
  signedAt: Date
  ipAddress: string
  userAgent: string
}

export type ApplicationStatus = 
  | 'draft'           // 작성 중
  | 'submitted'       // 제출됨
  | 'under_review'    // 심사 중
  | 'approved'        // 승인됨
  | 'rejected'        // 거절됨
  | 'requires_documents' // 서류 추가 필요
  | 'policy_issued'   // 보험증서 발급됨

export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning' | 'info'
  code: string
}

// 효도 선물 이벤트 관련
export interface GiftEvent {
  id: string
  applicationId: string
  customerId: string
  giftType: GiftType
  status: GiftEventStatus
  selectedAt: Date
  deliveryInfo?: DeliveryInfo
  completedAt?: Date
  metadata: Record<string, any>
}

export type GiftType = 
  | 'health_checkup'     // 건강검진권
  | 'massage_voucher'    // 마사지권
  | 'spa_voucher'        // 스파 이용권
  | 'flower_delivery'    // 꽃 배송 서비스
  | 'wellness_package'   // 웰니스 패키지

export type GiftEventStatus = 'selected' | 'processing' | 'delivered' | 'completed' | 'cancelled'

export interface DeliveryInfo {
  recipientName: string
  recipientPhone: string
  address: Address
  deliveryDate: Date
  deliveryMethod: 'visit' | 'mail' | 'digital'
  trackingNumber?: string
  specialInstructions?: string
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  timestamp: Date
  requestId: string
}

export interface ConsultationAnalysisResult {
  motherInfo: MotherInfo
  riskProfile: RiskProfile
  recommendations: ProductRecommendation[]
  insights: string[]
  warnings: string[]
  nextSteps: string[]
}

export interface PremiumQuoteRequest {
  motherInfo: MotherInfo
  productId: ProductType
  coverageOptions?: Record<string, any>
}

export interface PremiumQuoteResponse {
  productId: ProductType
  basePremium: number
  adjustedPremium: number
  adjustmentFactors: {
    age: number
    health: number
    occupation: number
  }
  coverage: Record<string, any>
  eligibilityStatus: 'eligible' | 'needs_review' | 'ineligible'
  validUntil: Date
}

// 비즈니스 로직 설정
export interface BusinessRules {
  consultation: {
    maxSessionDuration: number  // 분
    minCompletionScore: number  // 0-100
    requiredFields: (keyof MotherInfo)[]
  }
  recommendation: {
    minConfidenceThreshold: number  // 0-100
    maxRecommendations: number
    priorityWeights: Record<string, number>
  }
  application: {
    maxProcessingTime: number  // 시간
    requiredDocuments: string[]
    autoApprovalThreshold: number
    manualReviewConditions: string[]
  }
  payment: {
    supportedMethods: ('card' | 'bank')[]
    maxPaymentAttempts: number
    paymentTimeoutSeconds: number
  }
  gift: {
    eligibilityRules: Record<GiftType, (app: ApplicationData) => boolean>
    maxGiftsPerCustomer: number
    giftValidityDays: number
  }
}

// 시스템 메트릭스 및 모니터링
export interface SystemMetrics {
  consultation: {
    totalSessions: number
    completionRate: number
    averageSessionTime: number
    abandonmentPoints: Record<number, number>
  }
  recommendation: {
    accuracyScore: number
    customerSatisfaction: number
    conversionRate: Record<ProductType, number>
  }
  application: {
    submissionRate: number
    approvalRate: number
    averageProcessingTime: number
    errorRate: number
  }
  business: {
    totalRevenue: number
    customerAcquisitionCost: number
    lifetimeValue: number
    churnRate: number
  }
}

// 오류 처리
export class BusinessLogicError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: 'low' | 'medium' | 'high' | 'critical',
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'BusinessLogicError'
  }
}