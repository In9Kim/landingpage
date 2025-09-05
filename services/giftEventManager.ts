// ===============================
// 효도 선물 이벤트 관리 시스템
// PRD 기반 가입 완료 후 효도 선물 제공
// ===============================

import {
  GiftEvent,
  GiftType,
  GiftEventStatus,
  DeliveryInfo,
  ApplicationData,
  BusinessLogicError
} from '../types/backend'

export class GiftEventManager {
  private static instance: GiftEventManager
  private giftEvents: Map<string, GiftEvent> = new Map()
  private giftInventory: Map<GiftType, GiftInventory> = new Map()
  private giftRules = this.initializeGiftRules()

  public static getInstance(): GiftEventManager {
    if (!GiftEventManager.instance) {
      GiftEventManager.instance = new GiftEventManager()
      GiftEventManager.instance.initializeInventory()
    }
    return GiftEventManager.instance
  }

  private initializeGiftRules() {
    return {
      // 선물 자격 규칙
      eligibilityRules: {
        minAge: 60, // 어머님 최소 연령
        validStatuses: ['policy_issued'], // 청약 상태
        maxGiftsPerCustomer: 1, // 고객당 최대 선물 개수
        validityDays: 90, // 선물 선택 유효 기간
        blacklistProducts: [] as string[] // 제외 상품
      },
      
      // 선물별 특별 조건
      specialConditions: {
        health_checkup: {
          minAge: 50,
          description: '50세 이상 어머님을 위한 종합건강검진권'
        },
        massage_voucher: {
          minAge: 60,
          description: '60세 이상 어머님을 위한 전신마사지 이용권'
        },
        spa_voucher: {
          minAge: 55,
          description: '55세 이상 어머님을 위한 스파 힐링 패키지'
        },
        flower_delivery: {
          minAge: 40,
          description: '사랑하는 어머님께 직접 전달되는 꽃다발 서비스'
        },
        wellness_package: {
          minAge: 65,
          description: '65세 이상 어머님을 위한 웰니스 종합 패키지'
        }
      }
    }
  }

  private initializeInventory(): void {
    // 효도 선물 재고 초기화
    this.giftInventory.set('health_checkup', {
      type: 'health_checkup',
      name: '종합건강검진권',
      description: '어머님의 건강을 체크할 수 있는 종합건강검진권입니다',
      value: 150000,
      availableQuantity: 100,
      reservedQuantity: 0,
      deliveryMethod: 'mail',
      estimatedDeliveryDays: 3,
      providerName: '한화생명 제휴 병원',
      restrictions: '전국 주요 병원에서 사용 가능',
      validityDays: 365,
      emotionalMessage: '어머님의 건강한 미래를 선물하세요 💚',
      giftImage: '/images/gifts/health-checkup.jpg'
    })

    this.giftInventory.set('massage_voucher', {
      type: 'massage_voucher',
      name: '전신마사지 이용권',
      description: '어머님의 피로를 풀어드릴 수 있는 전신마사지 이용권입니다',
      value: 120000,
      availableQuantity: 80,
      reservedQuantity: 0,
      deliveryMethod: 'digital',
      estimatedDeliveryDays: 1,
      providerName: '프리미엄 마사지센터',
      restrictions: '서울/경기 지역 제휴 매장에서 사용',
      validityDays: 180,
      emotionalMessage: '어머님의 편안한 휴식을 선물하세요 🌸',
      giftImage: '/images/gifts/massage.jpg'
    })

    this.giftInventory.set('spa_voucher', {
      type: 'spa_voucher',
      name: '스파 힐링 패키지',
      description: '어머님께 특별한 힐링 시간을 선물할 수 있는 스파 이용권입니다',
      value: 200000,
      availableQuantity: 50,
      reservedQuantity: 0,
      deliveryMethod: 'mail',
      estimatedDeliveryDays: 2,
      providerName: '럭셔리 스파 리조트',
      restrictions: '전국 주요 스파 리조트에서 사용',
      validityDays: 270,
      emotionalMessage: '어머님께 특별한 힐링을 선물하세요 🧘‍♀️',
      giftImage: '/images/gifts/spa.jpg'
    })

    this.giftInventory.set('flower_delivery', {
      type: 'flower_delivery',
      name: '꽃다발 배송 서비스',
      description: '어머님께 직접 전달되는 아름다운 꽃다발입니다',
      value: 50000,
      availableQuantity: 200,
      reservedQuantity: 0,
      deliveryMethod: 'visit',
      estimatedDeliveryDays: 1,
      providerName: '프리미엄 플라워샵',
      restrictions: '전국 배송 가능',
      validityDays: 30,
      emotionalMessage: '어머님께 아름다운 마음을 전달하세요 🌹',
      giftImage: '/images/gifts/flowers.jpg'
    })

    this.giftInventory.set('wellness_package', {
      type: 'wellness_package',
      name: '웰니스 종합 패키지',
      description: '어머님의 몸과 마음 건강을 위한 종합 웰니스 프로그램입니다',
      value: 300000,
      availableQuantity: 30,
      reservedQuantity: 0,
      deliveryMethod: 'mail',
      estimatedDeliveryDays: 5,
      providerName: '웰니스 전문센터',
      restrictions: '서울/부산 지역 제휴 센터에서 이용',
      validityDays: 365,
      emotionalMessage: '어머님의 웰빙을 위한 특별한 선물 ✨',
      giftImage: '/images/gifts/wellness.jpg'
    })
  }

  /**
   * 선물 자격 확인
   */
  public checkGiftEligibility(applicationData: ApplicationData): {
    eligible: boolean
    availableGifts: GiftType[]
    ineligibleReasons: string[]
  } {
    const reasons: string[] = []
    
    // 기본 자격 확인
    if (!this.giftRules.eligibilityRules.validStatuses.includes(applicationData.status)) {
      reasons.push('보험 가입이 완료되지 않았습니다.')
      return { eligible: false, availableGifts: [], ineligibleReasons: reasons }
    }

    if (applicationData.motherInfo.age < this.giftRules.eligibilityRules.minAge) {
      reasons.push(`${this.giftRules.eligibilityRules.minAge}세 이상 어머님만 선물을 받으실 수 있습니다.`)
      return { eligible: false, availableGifts: [], ineligibleReasons: reasons }
    }

    // 중복 선물 확인
    const existingGifts = this.findGiftsByCustomer(
      applicationData.customerInfo.name,
      applicationData.customerInfo.phone
    )

    if (existingGifts.length >= this.giftRules.eligibilityRules.maxGiftsPerCustomer) {
      reasons.push('이미 효도 선물을 받으셨습니다.')
      return { eligible: false, availableGifts: [], ineligibleReasons: reasons }
    }

    // 사용 가능한 선물 목록 생성
    const availableGifts = this.getAvailableGiftsForAge(applicationData.motherInfo.age)
    
    return {
      eligible: true,
      availableGifts,
      ineligibleReasons: []
    }
  }

  /**
   * 연령대별 사용 가능한 선물 조회
   */
  private getAvailableGiftsForAge(age: number): GiftType[] {
    const availableGifts: GiftType[] = []
    
    Object.entries(this.giftRules.specialConditions).forEach(([giftType, condition]) => {
      if (age >= condition.minAge) {
        const inventory = this.giftInventory.get(giftType as GiftType)
        if (inventory && inventory.availableQuantity > inventory.reservedQuantity) {
          availableGifts.push(giftType as GiftType)
        }
      }
    })

    return availableGifts
  }

  /**
   * 선물 목록 조회 (상세 정보 포함)
   */
  public getAvailableGiftCatalog(applicationData: ApplicationData): GiftCatalogItem[] {
    const eligibilityCheck = this.checkGiftEligibility(applicationData)
    
    if (!eligibilityCheck.eligible) {
      return []
    }

    return eligibilityCheck.availableGifts.map(giftType => {
      const inventory = this.giftInventory.get(giftType)!
      const condition = this.giftRules.specialConditions[giftType]
      
      return {
        type: giftType,
        name: inventory.name,
        description: inventory.description,
        detailedDescription: condition.description,
        value: inventory.value,
        emotionalMessage: inventory.emotionalMessage,
        giftImage: inventory.giftImage,
        deliveryMethod: inventory.deliveryMethod,
        estimatedDeliveryDays: inventory.estimatedDeliveryDays,
        restrictions: inventory.restrictions,
        validityDays: inventory.validityDays,
        providerName: inventory.providerName,
        availability: {
          available: inventory.availableQuantity - inventory.reservedQuantity,
          total: inventory.availableQuantity,
          urgent: (inventory.availableQuantity - inventory.reservedQuantity) < 10
        }
      }
    })
  }

  /**
   * 선물 선택 및 예약
   */
  public selectGift(
    applicationId: string,
    customerId: string,
    giftType: GiftType
  ): { success: boolean; giftEventId?: string; error?: string } {
    try {
      // 재고 확인
      const inventory = this.giftInventory.get(giftType)
      if (!inventory) {
        return { success: false, error: '선택하신 선물을 찾을 수 없습니다.' }
      }

      if (inventory.availableQuantity <= inventory.reservedQuantity) {
        return { success: false, error: '선택하신 선물의 재고가 부족합니다.' }
      }

      // 선물 이벤트 생성
      const giftEventId = this.generateGiftEventId()
      const giftEvent: GiftEvent = {
        id: giftEventId,
        applicationId,
        customerId,
        giftType,
        status: 'selected',
        selectedAt: new Date(),
        metadata: {
          inventoryReservedAt: new Date(),
          estimatedDeliveryDate: this.calculateEstimatedDeliveryDate(giftType),
          giftValue: inventory.value,
          providerName: inventory.providerName
        }
      }

      // 재고 예약
      inventory.reservedQuantity += 1
      this.giftInventory.set(giftType, inventory)
      
      // 이벤트 저장
      this.giftEvents.set(giftEventId, giftEvent)

      // 처리 자동 시작 (비동기)
      this.processGiftDelivery(giftEventId).catch(error => {
        console.error(`선물 처리 중 오류 발생: ${giftEventId}`, error)
      })

      return { success: true, giftEventId }

    } catch (error) {
      throw new BusinessLogicError(
        '선물 선택 처리 중 오류가 발생했습니다.',
        'GIFT_SELECTION_ERROR',
        'high',
        { applicationId, giftType, error }
      )
    }
  }

  /**
   * 선물 배송 처리
   */
  private async processGiftDelivery(giftEventId: string): Promise<void> {
    const giftEvent = this.giftEvents.get(giftEventId)
    if (!giftEvent) return

    try {
      // 상태 업데이트: 처리 중
      giftEvent.status = 'processing'
      giftEvent.metadata.processingStartedAt = new Date()
      this.giftEvents.set(giftEventId, giftEvent)

      const inventory = this.giftInventory.get(giftEvent.giftType)!
      
      // 배송 방법에 따른 처리
      if (inventory.deliveryMethod === 'digital') {
        // 디지털 상품: 즉시 발송 (이메일/SMS)
        await this.sendDigitalGift(giftEvent)
      } else if (inventory.deliveryMethod === 'mail') {
        // 우편 배송: 배송 업체 연동
        await this.processMailDelivery(giftEvent)
      } else if (inventory.deliveryMethod === 'visit') {
        // 직접 방문: 방문 일정 조정
        await this.scheduleVisitDelivery(giftEvent)
      }

      // 상태 업데이트: 배송 완료
      giftEvent.status = 'delivered'
      giftEvent.metadata.deliveredAt = new Date()
      this.giftEvents.set(giftEventId, giftEvent)

      // 재고 확정 처리
      inventory.reservedQuantity -= 1
      if (inventory.availableQuantity > 0) {
        inventory.availableQuantity -= 1
      }
      this.giftInventory.set(giftEvent.giftType, inventory)

    } catch (error) {
      // 오류 발생 시 상태 업데이트
      giftEvent.status = 'cancelled'
      giftEvent.metadata.errorMessage = error instanceof Error ? error.message : '처리 중 오류'
      giftEvent.metadata.cancelledAt = new Date()
      this.giftEvents.set(giftEventId, giftEvent)

      // 예약 재고 해제
      const inventory = this.giftInventory.get(giftEvent.giftType)!
      inventory.reservedQuantity = Math.max(0, inventory.reservedQuantity - 1)
      this.giftInventory.set(giftEvent.giftType, inventory)

      throw error
    }
  }

  /**
   * 디지털 선물 발송
   */
  private async sendDigitalGift(giftEvent: GiftEvent): Promise<void> {
    // Mock: 실제로는 이메일/SMS 서비스 연동
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const inventory = this.giftInventory.get(giftEvent.giftType)!
    
    // 디지털 쿠폰 번호 생성
    const couponNumber = this.generateCouponNumber(giftEvent.giftType)
    
    giftEvent.metadata.digitalCoupon = {
      couponNumber,
      validUntil: this.calculateExpiryDate(inventory.validityDays),
      usageInstructions: `${inventory.providerName}에서 쿠폰번호를 제시하세요.`,
      contactNumber: '1588-0000'
    }
    
    console.log(`디지털 선물 발송 완료: ${giftEvent.id} - 쿠폰: ${couponNumber}`)
  }

  /**
   * 우편 배송 처리
   */
  private async processMailDelivery(giftEvent: GiftEvent): Promise<void> {
    // Mock: 실제로는 배송 업체 API 연동
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const trackingNumber = this.generateTrackingNumber()
    
    giftEvent.metadata.delivery = {
      trackingNumber,
      carrier: '효도택배',
      estimatedDeliveryDate: this.calculateEstimatedDeliveryDate(giftEvent.giftType),
      deliveryStatus: 'shipped'
    }
    
    console.log(`우편 배송 처리 완료: ${giftEvent.id} - 송장: ${trackingNumber}`)
  }

  /**
   * 방문 배송 일정 조정
   */
  private async scheduleVisitDelivery(giftEvent: GiftEvent): Promise<void> {
    // Mock: 실제로는 배송 스케줄링 시스템 연동
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const visitDate = new Date()
    visitDate.setDate(visitDate.getDate() + 1) // 내일 방문
    
    giftEvent.metadata.visit = {
      scheduledDate: visitDate,
      timeSlot: '오후 2-6시',
      driverName: '효도배송기사',
      contactNumber: '010-1234-5678',
      specialInstructions: '사전 연락 후 방문'
    }
    
    console.log(`방문 배송 일정 조정 완료: ${giftEvent.id} - 방문일: ${visitDate.toDateString()}`)
  }

  /**
   * 선물 이벤트 조회
   */
  public getGiftEvent(giftEventId: string): GiftEvent | null {
    return this.giftEvents.get(giftEventId) || null
  }

  /**
   * 고객별 선물 이력 조회
   */
  private findGiftsByCustomer(name: string, phone: string): GiftEvent[] {
    // 실제로는 고객 정보로 매칭해야 하지만, Mock 환경에서는 단순화
    return Array.from(this.giftEvents.values()).filter(gift => 
      gift.customerId.includes(name) || gift.customerId.includes(phone)
    )
  }

  /**
   * 배송 정보 업데이트
   */
  public updateDeliveryInfo(
    giftEventId: string,
    deliveryInfo: DeliveryInfo
  ): { success: boolean; error?: string } {
    const giftEvent = this.giftEvents.get(giftEventId)
    if (!giftEvent) {
      return { success: false, error: '선물 이벤트를 찾을 수 없습니다.' }
    }

    if (['delivered', 'completed', 'cancelled'].includes(giftEvent.status)) {
      return { success: false, error: '이미 처리가 완료된 선물입니다.' }
    }

    giftEvent.deliveryInfo = deliveryInfo
    giftEvent.metadata.deliveryInfoUpdatedAt = new Date()
    this.giftEvents.set(giftEventId, giftEvent)

    return { success: true }
  }

  /**
   * 선물 완료 처리
   */
  public completeGiftEvent(giftEventId: string): { success: boolean; error?: string } {
    const giftEvent = this.giftEvents.get(giftEventId)
    if (!giftEvent) {
      return { success: false, error: '선물 이벤트를 찾을 수 없습니다.' }
    }

    if (giftEvent.status !== 'delivered') {
      return { success: false, error: '배송이 완료된 선물만 완료 처리할 수 있습니다.' }
    }

    giftEvent.status = 'completed'
    giftEvent.completedAt = new Date()
    giftEvent.metadata.customerSatisfactionSurvey = {
      sent: true,
      surveyUrl: `https://survey.hanwhalife.com/gift/${giftEventId}`
    }

    this.giftEvents.set(giftEventId, giftEvent)
    return { success: true }
  }

  /**
   * 선물 취소
   */
  public cancelGiftEvent(
    giftEventId: string,
    reason: string
  ): { success: boolean; error?: string } {
    const giftEvent = this.giftEvents.get(giftEventId)
    if (!giftEvent) {
      return { success: false, error: '선물 이벤트를 찾을 수 없습니다.' }
    }

    if (['delivered', 'completed'].includes(giftEvent.status)) {
      return { success: false, error: '이미 배송된 선물은 취소할 수 없습니다.' }
    }

    // 예약 재고 해제
    const inventory = this.giftInventory.get(giftEvent.giftType)!
    inventory.reservedQuantity = Math.max(0, inventory.reservedQuantity - 1)
    this.giftInventory.set(giftEvent.giftType, inventory)

    // 상태 업데이트
    giftEvent.status = 'cancelled'
    giftEvent.metadata.cancelReason = reason
    giftEvent.metadata.cancelledAt = new Date()
    this.giftEvents.set(giftEventId, giftEvent)

    return { success: true }
  }

  /**
   * 재고 관리
   */
  public getInventoryStatus(): Record<GiftType, GiftInventoryStatus> {
    const status: Record<GiftType, GiftInventoryStatus> = {} as any

    this.giftInventory.forEach((inventory, giftType) => {
      status[giftType] = {
        available: inventory.availableQuantity - inventory.reservedQuantity,
        total: inventory.availableQuantity,
        reserved: inventory.reservedQuantity,
        value: inventory.value,
        urgentRestock: (inventory.availableQuantity - inventory.reservedQuantity) < 10,
        estimatedRunoutDate: this.calculateRunoutDate(giftType)
      }
    })

    return status
  }

  /**
   * 재고 보충
   */
  public restockGift(giftType: GiftType, quantity: number): { success: boolean; error?: string } {
    const inventory = this.giftInventory.get(giftType)
    if (!inventory) {
      return { success: false, error: '선물 타입을 찾을 수 없습니다.' }
    }

    inventory.availableQuantity += quantity
    inventory.lastRestockedAt = new Date()
    this.giftInventory.set(giftType, inventory)

    return { success: true }
  }

  /**
   * 통계 조회
   */
  public getGiftStatistics(): GiftStatistics {
    const events = Array.from(this.giftEvents.values())
    
    const byType: Record<GiftType, number> = {} as any
    const byStatus: Record<GiftEventStatus, number> = {
      'selected': 0,
      'processing': 0,
      'delivered': 0,
      'completed': 0,
      'cancelled': 0
    }
    
    let totalValue = 0
    let completionRate = 0
    
    events.forEach(event => {
      byType[event.giftType] = (byType[event.giftType] || 0) + 1
      byStatus[event.status] = (byStatus[event.status] || 0) + 1
      totalValue += event.metadata.giftValue || 0
    })
    
    const completedEvents = byStatus.completed + byStatus.delivered
    completionRate = events.length > 0 ? Math.round((completedEvents / events.length) * 100) : 0
    
    return {
      totalEvents: events.length,
      totalValue,
      completionRate,
      byType,
      byStatus,
      averageProcessingTime: this.calculateAverageProcessingTime(events)
    }
  }

  /**
   * 유틸리티 메서드들
   */
  private generateGiftEventId(): string {
    return `GIFT_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  }

  private generateCouponNumber(giftType: GiftType): string {
    const prefix = giftType.toUpperCase().substr(0, 3)
    return `${prefix}${Date.now().toString().slice(-8)}`
  }

  private generateTrackingNumber(): string {
    return `TRACK${Date.now().toString().slice(-10)}`
  }

  private calculateEstimatedDeliveryDate(giftType: GiftType): Date {
    const inventory = this.giftInventory.get(giftType)!
    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + inventory.estimatedDeliveryDays)
    return deliveryDate
  }

  private calculateExpiryDate(validityDays: number): Date {
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + validityDays)
    return expiryDate
  }

  private calculateRunoutDate(giftType: GiftType): Date | null {
    // 과거 7일간의 소비율로 계산
    const events = Array.from(this.giftEvents.values())
    const recent7Days = events.filter(event => 
      event.giftType === giftType &&
      Date.now() - event.selectedAt.getTime() < 7 * 24 * 60 * 60 * 1000
    )
    
    if (recent7Days.length === 0) return null
    
    const dailyConsumption = recent7Days.length / 7
    const inventory = this.giftInventory.get(giftType)!
    const remainingDays = Math.floor((inventory.availableQuantity - inventory.reservedQuantity) / dailyConsumption)
    
    const runoutDate = new Date()
    runoutDate.setDate(runoutDate.getDate() + remainingDays)
    return runoutDate
  }

  private calculateAverageProcessingTime(events: GiftEvent[]): number {
    const completedEvents = events.filter(e => 
      e.status === 'completed' && 
      e.completedAt && 
      e.metadata.processingStartedAt
    )
    
    if (completedEvents.length === 0) return 0
    
    const totalTime = completedEvents.reduce((sum, event) => {
      const processingTime = event.completedAt!.getTime() - event.metadata.processingStartedAt!.getTime()
      return sum + processingTime
    }, 0)
    
    return Math.round(totalTime / completedEvents.length / (1000 * 60 * 60)) // 시간 단위
  }
}

// 인터페이스 정의
interface GiftInventory {
  type: GiftType
  name: string
  description: string
  value: number
  availableQuantity: number
  reservedQuantity: number
  deliveryMethod: 'mail' | 'digital' | 'visit'
  estimatedDeliveryDays: number
  providerName: string
  restrictions: string
  validityDays: number
  emotionalMessage: string
  giftImage: string
  lastRestockedAt?: Date
}

interface GiftCatalogItem {
  type: GiftType
  name: string
  description: string
  detailedDescription: string
  value: number
  emotionalMessage: string
  giftImage: string
  deliveryMethod: 'mail' | 'digital' | 'visit'
  estimatedDeliveryDays: number
  restrictions: string
  validityDays: number
  providerName: string
  availability: {
    available: number
    total: number
    urgent: boolean
  }
}

interface GiftInventoryStatus {
  available: number
  total: number
  reserved: number
  value: number
  urgentRestock: boolean
  estimatedRunoutDate: Date | null
}

interface GiftStatistics {
  totalEvents: number
  totalValue: number
  completionRate: number
  byType: Record<GiftType, number>
  byStatus: Record<GiftEventStatus, number>
  averageProcessingTime: number
}