// ===============================
// 청약 데이터 처리 및 결제 검증 로직
// PRD 기반 3분 간편 청약 시스템
// ===============================

import {
  ApplicationData,
  CustomerInfo,
  PaymentInfo,
  Agreements,
  ApplicationStatus,
  ValidationError,
  MotherInfo,
  ProductRecommendation,
  BusinessLogicError
} from '../types/backend'

export class ApplicationProcessor {
  private static instance: ApplicationProcessor
  private applications: Map<string, ApplicationData> = new Map()
  private validationRules = this.initializeValidationRules()

  public static getInstance(): ApplicationProcessor {
    if (!ApplicationProcessor.instance) {
      ApplicationProcessor.instance = new ApplicationProcessor()
    }
    return ApplicationProcessor.instance
  }

  /**
   * 검증 규칙 초기화
   */
  private initializeValidationRules() {
    return {
      customerInfo: {
        name: {
          required: true,
          minLength: 2,
          maxLength: 20,
          pattern: /^[가-힣a-zA-Z\s]+$/,
          errorMessage: '이름은 2-20자의 한글 또는 영문으로 입력해주세요.'
        },
        phone: {
          required: true,
          pattern: /^010-\d{4}-\d{4}$/,
          errorMessage: '휴대폰 번호는 010-0000-0000 형식으로 입력해주세요.'
        },
        email: {
          required: true,
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          errorMessage: '올바른 이메일 주소를 입력해주세요.'
        },
        relationship: {
          required: true,
          allowedValues: ['딸', '아들', '며느리', '사위', '기타'],
          errorMessage: '어머님과의 관계를 선택해주세요.'
        }
      },
      paymentInfo: {
        method: {
          required: true,
          allowedValues: ['card', 'bank'],
          errorMessage: '결제 방법을 선택해주세요.'
        },
        cardNumber: {
          conditionalRequired: (data: any) => data.method === 'card',
          pattern: /^\d{4}-\d{4}-\d{4}-\d{4}$/,
          errorMessage: '카드 번호는 0000-0000-0000-0000 형식으로 입력해주세요.'
        },
        bankAccount: {
          conditionalRequired: (data: any) => data.method === 'bank',
          pattern: /^\d{3}-\d{2,6}-\d{6,12}$/,
          errorMessage: '계좌 번호를 올바른 형식으로 입력해주세요.'
        }
      },
      agreements: {
        personalInfo: {
          required: true,
          mustBeTrue: true,
          errorMessage: '개인정보 수집 및 이용에 동의해주세요. (필수)'
        },
        serviceTerms: {
          required: true,
          mustBeTrue: true,
          errorMessage: '보험 약관 및 서비스 이용에 동의해주세요. (필수)'
        },
        marketing: {
          required: false,
          errorMessage: '마케팅 정보 수신 동의는 선택사항입니다.'
        }
      }
    }
  }

  /**
   * 청약 데이터 생성 및 초기 검증
   */
  public createApplication(
    sessionId: string,
    motherInfo: MotherInfo,
    selectedProduct: ProductRecommendation
  ): ApplicationData {
    const applicationId = this.generateApplicationId()
    
    const application: ApplicationData = {
      id: applicationId,
      sessionId,
      customerInfo: {
        name: '',
        phone: '',
        email: '',
        relationship: '딸'
      },
      motherInfo,
      selectedProduct,
      paymentInfo: {
        method: 'card',
        autoPayment: true,
        paymentDay: 25
      },
      agreements: {
        personalInfo: false,
        serviceTerms: false,
        marketing: false,
        signedAt: new Date(),
        ipAddress: '',
        userAgent: ''
      },
      status: 'draft',
      submittedAt: new Date(),
      validationErrors: []
    }

    this.applications.set(applicationId, application)
    return application
  }

  /**
   * 고객 정보 업데이트 및 검증
   */
  public updateCustomerInfo(
    applicationId: string,
    customerInfo: Partial<CustomerInfo>
  ): { success: boolean; errors: ValidationError[] } {
    const application = this.getApplication(applicationId)
    
    // 고객 정보 검증
    const errors = this.validateCustomerInfo(customerInfo)
    
    if (errors.length === 0) {
      application.customerInfo = { ...application.customerInfo, ...customerInfo }
      application.validationErrors = application.validationErrors?.filter(
        e => !e.field.startsWith('customerInfo')
      ) || []
    } else {
      // 기존 고객 정보 관련 에러 제거 후 새 에러 추가
      application.validationErrors = [
        ...(application.validationErrors?.filter(e => !e.field.startsWith('customerInfo')) || []),
        ...errors
      ]
    }

    this.applications.set(applicationId, application)
    return { success: errors.length === 0, errors }
  }

  /**
   * 결제 정보 업데이트 및 검증
   */
  public updatePaymentInfo(
    applicationId: string,
    paymentInfo: Partial<PaymentInfo>
  ): { success: boolean; errors: ValidationError[] } {
    const application = this.getApplication(applicationId)
    
    // 결제 정보 검증
    const errors = this.validatePaymentInfo(paymentInfo)
    
    if (errors.length === 0) {
      application.paymentInfo = { ...application.paymentInfo, ...paymentInfo }
      application.validationErrors = application.validationErrors?.filter(
        e => !e.field.startsWith('paymentInfo')
      ) || []
    } else {
      application.validationErrors = [
        ...(application.validationErrors?.filter(e => !e.field.startsWith('paymentInfo')) || []),
        ...errors
      ]
    }

    this.applications.set(applicationId, application)
    return { success: errors.length === 0, errors }
  }

  /**
   * 약관 동의 업데이트 및 검증
   */
  public updateAgreements(
    applicationId: string,
    agreements: Partial<Agreements>,
    metadata: { ipAddress: string; userAgent: string }
  ): { success: boolean; errors: ValidationError[] } {
    const application = this.getApplication(applicationId)
    
    // 약관 동의 검증
    const errors = this.validateAgreements(agreements)
    
    if (errors.length === 0) {
      application.agreements = {
        ...application.agreements,
        ...agreements,
        signedAt: new Date(),
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent
      }
      application.validationErrors = application.validationErrors?.filter(
        e => !e.field.startsWith('agreements')
      ) || []
    } else {
      application.validationErrors = [
        ...(application.validationErrors?.filter(e => !e.field.startsWith('agreements')) || []),
        ...errors
      ]
    }

    this.applications.set(applicationId, application)
    return { success: errors.length === 0, errors }
  }

  /**
   * 전체 청약 데이터 검증
   */
  public validateFullApplication(applicationId: string): ValidationError[] {
    const application = this.getApplication(applicationId)
    const allErrors: ValidationError[] = []

    // 각 섹션별 검증
    allErrors.push(...this.validateCustomerInfo(application.customerInfo))
    allErrors.push(...this.validatePaymentInfo(application.paymentInfo))
    allErrors.push(...this.validateAgreements(application.agreements))

    // 추가 비즈니스 규칙 검증
    allErrors.push(...this.validateBusinessRules(application))

    return allErrors
  }

  /**
   * 청약 제출 처리
   */
  public async submitApplication(
    applicationId: string
  ): Promise<{ success: boolean; policyNumber?: string; errors?: ValidationError[] }> {
    try {
      const application = this.getApplication(applicationId)
      
      // 최종 검증
      const validationErrors = this.validateFullApplication(applicationId)
      
      if (validationErrors.length > 0) {
        return { success: false, errors: validationErrors }
      }

      // 결제 처리
      const paymentResult = await this.processPayment(application)
      if (!paymentResult.success) {
        return { 
          success: false, 
          errors: [{ 
            field: 'payment', 
            message: '결제 처리 중 오류가 발생했습니다.', 
            severity: 'error', 
            code: 'PAYMENT_FAILED' 
          }] 
        }
      }

      // 상태 업데이트
      application.status = 'submitted'
      application.submittedAt = new Date()

      // 언더라이팅 처리
      const underwritingResult = await this.processUnderwriting(application)
      
      if (underwritingResult.approved) {
        application.status = 'approved'
        application.approvedAt = new Date()
        application.policyNumber = this.generatePolicyNumber(application)
        
        // 정책 발급 처리
        await this.issuePolicyDocument(application)
        application.status = 'policy_issued'
        
        this.applications.set(applicationId, application)
        
        return { 
          success: true, 
          policyNumber: application.policyNumber 
        }
      } else if (underwritingResult.needsReview) {
        application.status = 'under_review'
        this.applications.set(applicationId, application)
        
        return { success: true } // 심사 중이지만 성공적으로 제출됨
      } else {
        application.status = 'rejected'
        this.applications.set(applicationId, application)
        
        return { 
          success: false, 
          errors: [{ 
            field: 'underwriting', 
            message: '보험 가입 승인이 거절되었습니다.', 
            severity: 'error', 
            code: 'UNDERWRITING_REJECTED' 
          }] 
        }
      }

    } catch (error) {
      throw new BusinessLogicError(
        '청약 제출 처리 중 오류가 발생했습니다.',
        'APPLICATION_SUBMISSION_ERROR',
        'critical',
        { applicationId, error }
      )
    }
  }

  /**
   * 고객 정보 검증
   */
  private validateCustomerInfo(customerInfo: Partial<CustomerInfo>): ValidationError[] {
    const errors: ValidationError[] = []
    const rules = this.validationRules.customerInfo

    // 이름 검증
    if (!customerInfo.name || customerInfo.name.trim() === '') {
      errors.push({
        field: 'customerInfo.name',
        message: rules.name.errorMessage,
        severity: 'error',
        code: 'REQUIRED_FIELD'
      })
    } else if (!rules.name.pattern.test(customerInfo.name)) {
      errors.push({
        field: 'customerInfo.name',
        message: rules.name.errorMessage,
        severity: 'error',
        code: 'INVALID_FORMAT'
      })
    }

    // 휴대폰 번호 검증
    if (!customerInfo.phone || customerInfo.phone.trim() === '') {
      errors.push({
        field: 'customerInfo.phone',
        message: rules.phone.errorMessage,
        severity: 'error',
        code: 'REQUIRED_FIELD'
      })
    } else if (!rules.phone.pattern.test(customerInfo.phone)) {
      errors.push({
        field: 'customerInfo.phone',
        message: rules.phone.errorMessage,
        severity: 'error',
        code: 'INVALID_FORMAT'
      })
    }

    // 이메일 검증
    if (!customerInfo.email || customerInfo.email.trim() === '') {
      errors.push({
        field: 'customerInfo.email',
        message: rules.email.errorMessage,
        severity: 'error',
        code: 'REQUIRED_FIELD'
      })
    } else if (!rules.email.pattern.test(customerInfo.email)) {
      errors.push({
        field: 'customerInfo.email',
        message: rules.email.errorMessage,
        severity: 'error',
        code: 'INVALID_FORMAT'
      })
    }

    // 관계 검증
    if (!customerInfo.relationship || 
        !rules.relationship.allowedValues.includes(customerInfo.relationship)) {
      errors.push({
        field: 'customerInfo.relationship',
        message: rules.relationship.errorMessage,
        severity: 'error',
        code: 'INVALID_VALUE'
      })
    }

    return errors
  }

  /**
   * 결제 정보 검증
   */
  private validatePaymentInfo(paymentInfo: Partial<PaymentInfo>): ValidationError[] {
    const errors: ValidationError[] = []
    const rules = this.validationRules.paymentInfo

    // 결제 방법 검증
    if (!paymentInfo.method || !rules.method.allowedValues.includes(paymentInfo.method)) {
      errors.push({
        field: 'paymentInfo.method',
        message: rules.method.errorMessage,
        severity: 'error',
        code: 'REQUIRED_FIELD'
      })
    }

    // 카드 번호 검증 (카드 결제인 경우)
    if (paymentInfo.method === 'card') {
      if (!paymentInfo.cardNumber || paymentInfo.cardNumber.trim() === '') {
        errors.push({
          field: 'paymentInfo.cardNumber',
          message: rules.cardNumber.errorMessage,
          severity: 'error',
          code: 'REQUIRED_FIELD'
        })
      } else if (!rules.cardNumber.pattern.test(paymentInfo.cardNumber)) {
        errors.push({
          field: 'paymentInfo.cardNumber',
          message: rules.cardNumber.errorMessage,
          severity: 'error',
          code: 'INVALID_FORMAT'
        })
      } else {
        // 카드 번호 유효성 검사 (루나 알고리즘)
        const isValidCard = this.validateCardNumber(paymentInfo.cardNumber)
        if (!isValidCard) {
          errors.push({
            field: 'paymentInfo.cardNumber',
            message: '유효하지 않은 카드 번호입니다.',
            severity: 'error',
            code: 'INVALID_CARD_NUMBER'
          })
        }
      }
    }

    // 계좌 번호 검증 (계좌 이체인 경우)
    if (paymentInfo.method === 'bank') {
      if (!paymentInfo.bankAccount || paymentInfo.bankAccount.trim() === '') {
        errors.push({
          field: 'paymentInfo.bankAccount',
          message: rules.bankAccount.errorMessage,
          severity: 'error',
          code: 'REQUIRED_FIELD'
        })
      } else if (!rules.bankAccount.pattern.test(paymentInfo.bankAccount)) {
        errors.push({
          field: 'paymentInfo.bankAccount',
          message: rules.bankAccount.errorMessage,
          severity: 'error',
          code: 'INVALID_FORMAT'
        })
      }
    }

    // 결제일 검증
    if (paymentInfo.paymentDay && (paymentInfo.paymentDay < 1 || paymentInfo.paymentDay > 28)) {
      errors.push({
        field: 'paymentInfo.paymentDay',
        message: '결제일은 1일부터 28일까지 선택 가능합니다.',
        severity: 'error',
        code: 'INVALID_VALUE'
      })
    }

    return errors
  }

  /**
   * 약관 동의 검증
   */
  private validateAgreements(agreements: Partial<Agreements>): ValidationError[] {
    const errors: ValidationError[] = []
    const rules = this.validationRules.agreements

    // 개인정보 동의 (필수)
    if (!agreements.personalInfo) {
      errors.push({
        field: 'agreements.personalInfo',
        message: rules.personalInfo.errorMessage,
        severity: 'error',
        code: 'REQUIRED_AGREEMENT'
      })
    }

    // 서비스 약관 동의 (필수)
    if (!agreements.serviceTerms) {
      errors.push({
        field: 'agreements.serviceTerms',
        message: rules.serviceTerms.errorMessage,
        severity: 'error',
        code: 'REQUIRED_AGREEMENT'
      })
    }

    return errors
  }

  /**
   * 비즈니스 규칙 검증
   */
  private validateBusinessRules(application: ApplicationData): ValidationError[] {
    const errors: ValidationError[] = []

    // 연령 제한 확인
    const age = application.motherInfo.age
    const product = application.selectedProduct.product
    
    if (age < product.eligibilityCriteria.minAge || age > product.eligibilityCriteria.maxAge) {
      errors.push({
        field: 'motherInfo.age',
        message: `이 상품은 ${product.eligibilityCriteria.minAge}세부터 ${product.eligibilityCriteria.maxAge}세까지 가입 가능합니다.`,
        severity: 'error',
        code: 'AGE_RESTRICTION'
      })
    }

    // 자격 상태 확인
    if (application.selectedProduct.eligibilityStatus === 'ineligible') {
      errors.push({
        field: 'eligibility',
        message: '현재 건강 상태로는 이 상품에 가입하실 수 없습니다.',
        severity: 'error',
        code: 'INELIGIBLE'
      })
    }

    // 중복 가입 확인 (같은 고객의 기존 가입 여부)
    const existingApplications = this.findApplicationsByCustomer(
      application.customerInfo.name,
      application.customerInfo.phone
    )
    
    const hasExistingPolicy = existingApplications.some(app => 
      app.id !== application.id && 
      app.status === 'policy_issued' &&
      app.selectedProduct.productId === application.selectedProduct.productId
    )

    if (hasExistingPolicy) {
      errors.push({
        field: 'duplicate',
        message: '동일한 상품에 이미 가입되어 있습니다.',
        severity: 'warning',
        code: 'DUPLICATE_POLICY'
      })
    }

    return errors
  }

  /**
   * 카드 번호 유효성 검사 (루나 알고리즘)
   */
  private validateCardNumber(cardNumber: string): boolean {
    const cleanNumber = cardNumber.replace(/-/g, '')
    
    if (cleanNumber.length !== 16) return false
    
    let sum = 0
    let isEven = false
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i), 10)
      
      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }
      
      sum += digit
      isEven = !isEven
    }
    
    return (sum % 10) === 0
  }

  /**
   * 결제 처리 (Mock)
   */
  private async processPayment(application: ApplicationData): Promise<{ success: boolean; transactionId?: string }> {
    // 실제 구현에서는 PG사 API 호출
    await new Promise(resolve => setTimeout(resolve, 1000)) // 결제 처리 시뮬레이션

    const paymentInfo = application.paymentInfo
    
    // 간단한 결제 검증 로직
    if (paymentInfo.method === 'card' && paymentInfo.cardNumber) {
      // 카드 결제 처리
      const isValidCard = this.validateCardNumber(paymentInfo.cardNumber)
      if (!isValidCard) {
        return { success: false }
      }
    } else if (paymentInfo.method === 'bank' && paymentInfo.bankAccount) {
      // 계좌 이체 처리
      const isValidAccount = /^\d{3}-\d{2,6}-\d{6,12}$/.test(paymentInfo.bankAccount)
      if (!isValidAccount) {
        return { success: false }
      }
    } else {
      return { success: false }
    }

    return { 
      success: true, 
      transactionId: this.generateTransactionId() 
    }
  }

  /**
   * 언더라이팅 처리 (Mock)
   */
  private async processUnderwriting(
    application: ApplicationData
  ): Promise<{ approved: boolean; needsReview: boolean; reason?: string }> {
    // 실제 구현에서는 언더라이팅 시스템 API 호출
    await new Promise(resolve => setTimeout(resolve, 500))

    const motherInfo = application.motherInfo
    const product = application.selectedProduct.product
    const eligibilityScore = motherInfo.eligibilityScore

    // 자동 승인 조건
    if (eligibilityScore >= product.eligibilityCriteria.autoApprovalThreshold) {
      return { approved: true, needsReview: false }
    }

    // 거절 조건
    if (eligibilityScore < 40) {
      return { 
        approved: false, 
        needsReview: false, 
        reason: '건강 상태가 가입 기준에 미달합니다.' 
      }
    }

    // 심사 필요
    return { 
      approved: false, 
      needsReview: true, 
      reason: '추가 심사가 필요합니다.' 
    }
  }

  /**
   * 보험증서 발급 처리 (Mock)
   */
  private async issuePolicyDocument(application: ApplicationData): Promise<void> {
    // 실제 구현에서는 보험증서 생성 시스템 연동
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 보험증서 번호는 이미 generatePolicyNumber에서 생성됨
    console.log(`보험증서 발급 완료: ${application.policyNumber}`)
  }

  /**
   * 청약서 조회
   */
  public getApplication(applicationId: string): ApplicationData {
    const application = this.applications.get(applicationId)
    if (!application) {
      throw new BusinessLogicError(
        '청약서를 찾을 수 없습니다.',
        'APPLICATION_NOT_FOUND',
        'medium',
        { applicationId }
      )
    }
    return application
  }

  /**
   * 고객별 청약서 조회
   */
  private findApplicationsByCustomer(name: string, phone: string): ApplicationData[] {
    return Array.from(this.applications.values()).filter(app => 
      app.customerInfo.name === name && app.customerInfo.phone === phone
    )
  }

  /**
   * 청약서 상태 조회
   */
  public getApplicationStatus(applicationId: string): {
    status: ApplicationStatus
    statusMessage: string
    nextSteps?: string[]
    estimatedTime?: string
  } {
    const application = this.getApplication(applicationId)
    
    const statusMessages: Record<ApplicationStatus, string> = {
      'draft': '작성 중',
      'submitted': '제출됨',
      'under_review': '심사 중',
      'approved': '승인됨',
      'rejected': '거절됨',
      'requires_documents': '서류 추가 필요',
      'policy_issued': '보험증서 발급 완료'
    }

    const nextSteps: Record<ApplicationStatus, string[]> = {
      'draft': ['청약 정보를 완성하고 제출해주세요.'],
      'submitted': ['심사 결과를 기다려주세요.'],
      'under_review': ['추가 심사가 진행 중입니다.', '1-3일 소요 예정입니다.'],
      'approved': ['보험증서 발급이 진행됩니다.'],
      'rejected': ['가입 조건을 확인하고 다른 상품을 고려해보세요.'],
      'requires_documents': ['요청된 서류를 제출해주세요.'],
      'policy_issued': ['보험 가입이 완료되었습니다.', '효도 선물 이벤트에 참여해보세요.']
    }

    const estimatedTimes: Record<ApplicationStatus, string> = {
      'submitted': '1-2시간',
      'under_review': '1-3일',
      'approved': '즉시',
      'requires_documents': '서류 제출 시까지',
      'draft': '즉시',
      'rejected': '완료',
      'policy_issued': '완료'
    }

    return {
      status: application.status,
      statusMessage: statusMessages[application.status],
      nextSteps: nextSteps[application.status],
      estimatedTime: estimatedTimes[application.status]
    }
  }

  /**
   * ID 생성 유틸리티
   */
  private generateApplicationId(): string {
    return `APP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generatePolicyNumber(application: ApplicationData): string {
    const productPrefix = {
      'e-signature-cancer': 'ESC',
      'e-health': 'EH',
      'e-term': 'ET'
    }[application.selectedProduct.productId] || 'POL'
    
    const year = new Date().getFullYear()
    const sequence = String(Date.now()).slice(-6)
    
    return `${productPrefix}${year}${sequence}`
  }

  private generateTransactionId(): string {
    return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  }

  /**
   * 청약 진행률 계산
   */
  public calculateApplicationProgress(applicationId: string): {
    percentage: number
    currentStep: string
    completedSteps: string[]
    remainingSteps: string[]
  } {
    const application = this.getApplication(applicationId)
    
    const steps = [
      { key: 'customer', name: '고객 정보', completed: !!application.customerInfo.name },
      { key: 'payment', name: '결제 정보', completed: !!application.paymentInfo.method && 
        (application.paymentInfo.method === 'card' ? !!application.paymentInfo.cardNumber : !!application.paymentInfo.bankAccount) },
      { key: 'agreements', name: '약관 동의', completed: application.agreements.personalInfo && application.agreements.serviceTerms },
      { key: 'submit', name: '제출 완료', completed: application.status !== 'draft' }
    ]
    
    const completedSteps = steps.filter(step => step.completed)
    const remainingSteps = steps.filter(step => !step.completed)
    const percentage = Math.round((completedSteps.length / steps.length) * 100)
    const currentStep = remainingSteps.length > 0 ? remainingSteps[0].name : '완료'
    
    return {
      percentage,
      currentStep,
      completedSteps: completedSteps.map(s => s.name),
      remainingSteps: remainingSteps.map(s => s.name)
    }
  }

  /**
   * 메모리 관리 - 오래된 청약서 정리
   */
  public cleanupOldApplications(): void {
    const now = new Date()
    const maxAge = 7 * 24 * 60 * 60 * 1000 // 7일

    this.applications.forEach((application, applicationId) => {
      const age = now.getTime() - application.submittedAt.getTime()
      
      // 완료되지 않은 오래된 청약서만 삭제
      if (age > maxAge && ['draft', 'submitted'].includes(application.status)) {
        this.applications.delete(applicationId)
      }
    })
  }

  /**
   * 통계 조회
   */
  public getApplicationStatistics(): {
    total: number
    byStatus: Record<ApplicationStatus, number>
    byProduct: Record<string, number>
    averageCompletionTime: number
  } {
    const applications = Array.from(this.applications.values())
    
    const byStatus: Record<ApplicationStatus, number> = {
      draft: 0,
      submitted: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      requires_documents: 0,
      policy_issued: 0
    }
    
    const byProduct: Record<string, number> = {}
    let totalCompletionTime = 0
    let completedCount = 0
    
    applications.forEach(app => {
      byStatus[app.status]++
      
      const productName = app.selectedProduct.product.name
      byProduct[productName] = (byProduct[productName] || 0) + 1
      
      if (app.status === 'policy_issued' && app.approvedAt) {
        totalCompletionTime += app.approvedAt.getTime() - app.submittedAt.getTime()
        completedCount++
      }
    })
    
    const averageCompletionTime = completedCount > 0 ? 
      Math.round(totalCompletionTime / completedCount / (1000 * 60 * 60)) : 0 // 시간 단위
    
    return {
      total: applications.length,
      byStatus,
      byProduct,
      averageCompletionTime
    }
  }
}