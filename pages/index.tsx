import Head from 'next/head'
import { useState } from 'react'
import ConsultationChat from '../components/ConsultationChat'
import ProductRecommendation from '../components/ProductRecommendation'
import ApplicationFlow from '../components/ApplicationFlow'
import CompletionEvent from '../components/CompletionEvent'

export default function Home() {
  const [currentStep, setCurrentStep] = useState<'intro' | 'chat' | 'recommendation' | 'application' | 'completion'>('intro')
  const [motherInfo, setMotherInfo] = useState<any>(null)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  return (
    <>
      <Head>
        <title>우리엄마 맞춤 보험 설계</title>
        <meta name="description" content="CARE+로 엄마 건강을 더 세심하게 케어하세요" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-white">
        {currentStep === 'intro' && (
          <div className="container mx-auto px-4 md:px-6 py-8 md:py-16" style={{ paddingBottom: '100px' }}>
            {/* Hero Section */}
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                {/* Left Content */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="text-4xl md:text-6xl font-bold text-coral mr-2">CARE</div>
                    <div className="text-4xl md:text-6xl font-bold text-coral">+</div>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold text-neutral-800 mb-6 leading-tight">
                    엄마 건강을 더 <span className="text-coral">세심하게</span><br />
                    케어하는 맞춤 보험
                  </h1>
                  <p className="text-lg md:text-xl text-neutral-600 mb-8 leading-relaxed">
                    AI케어 상담으로 어머님의 건강 상태를 정확히 분석하고 가장 적합한 맞춤 보험을 추천해드립니다.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* 일반 버튼은 숨김 */}
                  </div>
                </div>

                {/* Right Visual */}
                <div className="relative">
                  <div className="relative w-full h-96 bg-gradient-neutral rounded-2xl overflow-hidden">
                    {/* Abstract visual elements inspired by Anthropic */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        {/* Central node */}
                        <div className="w-16 h-16 bg-coral rounded-full absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                        
                        {/* Connected nodes */}
                        <div className="w-8 h-8 bg-coral-light rounded-full absolute -top-12 -left-8"></div>
                        <div className="w-6 h-6 bg-coral-light rounded-full absolute -top-16 right-4"></div>
                        <div className="w-10 h-10 bg-coral-light rounded-full absolute top-8 -right-12"></div>
                        <div className="w-8 h-8 bg-coral-light rounded-full absolute bottom-4 -left-16"></div>
                        <div className="w-6 h-6 bg-coral-light rounded-full absolute -bottom-8 right-8"></div>
                        
                        {/* Connection lines */}
                        <svg className="absolute inset-0 w-80 h-80" style={{left: '-50%', top: '-50%'}}>
                          <line x1="160" y1="160" x2="120" y2="100" stroke="#FF6600" strokeWidth="2" opacity="0.6"/>
                          <line x1="160" y1="160" x2="200" y2="80" stroke="#FF6600" strokeWidth="2" opacity="0.6"/>
                          <line x1="160" y1="160" x2="240" y2="200" stroke="#FF6600" strokeWidth="2" opacity="0.6"/>
                          <line x1="160" y1="160" x2="80" y2="240" stroke="#FF6600" strokeWidth="2" opacity="0.6"/>
                          <line x1="160" y1="160" x2="220" y2="280" stroke="#FF6600" strokeWidth="2" opacity="0.6"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features Section */}
              <div className="mt-12 md:mt-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-coral-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl">🤖</span>
                    </div>
                    <h4 className="text-base md:text-lg font-semibold text-neutral-800 mb-2">AI 케어 상담</h4>
                    <p className="text-sm md:text-base text-neutral-600">보험 상담 특화 AI 모델이 상담 내용 기반으로 고객 니즈를 정확히 분석합니다</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-coral-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl">🎯</span>
                    </div>
                    <h4 className="text-base md:text-lg font-semibold text-neutral-800 mb-2">맞춤 케어 플랜</h4>
                    <p className="text-sm md:text-base text-neutral-600">부모님의 라이프스타일, 건강 상태, 연령에 최적화된 보험을 추천합니다</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-coral-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl">⚡</span>
                    </div>
                    <h4 className="text-base md:text-lg font-semibold text-neutral-800 mb-2">간편한 절차</h4>
                    <p className="text-sm md:text-base text-neutral-600">상담 후 간단한 절차로 가입까지 바로 할 수 있습니다</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'chat' && (
          <ConsultationChat 
            onComplete={(info) => {
              setMotherInfo(info)
              setCurrentStep('recommendation')
            }}
            onBack={() => setCurrentStep('intro')}
          />
        )}

        {currentStep === 'recommendation' && (
          <ProductRecommendation 
            motherInfo={motherInfo}
            onProductSelect={(product) => {
              setSelectedProduct(product)
              setCurrentStep('application')
            }}
            onBack={() => setCurrentStep('chat')}
          />
        )}

        {currentStep === 'application' && (
          <ApplicationFlow 
            motherInfo={motherInfo}
            selectedProduct={selectedProduct}
            onComplete={() => setCurrentStep('completion')}
            onBack={() => setCurrentStep('recommendation')}
          />
        )}

        {currentStep === 'completion' && (
          <CompletionEvent 
            onRestart={() => {
              setCurrentStep('intro')
              setMotherInfo(null)
              setSelectedProduct(null)
            }}
          />
        )}

        {/* Fixed Floating Button - only show on intro step */}
        {currentStep === 'intro' && (
          <div
            style={{
              position: 'fixed',
              bottom: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              maxWidth: '320px',
              zIndex: 9999,
              padding: '0 16px'
            }}
          >
            <button
              onClick={() => setCurrentStep('chat')}
              style={{
                width: '100%',
                minHeight: '56px',
                fontSize: '16px',
                fontWeight: 'bold',
                border: '2px solid #FF6600',
                backgroundColor: '#FF6600',
                color: '#FFFFFF',
                padding: '16px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = '#E55A00';
                target.style.borderColor = '#E55A00';
                target.style.transform = 'translateY(-1px)';
                target.style.boxShadow = '0 4px 12px rgba(255, 102, 0, 0.3)';
              }}
              onMouseOut={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = '#FF6600';
                target.style.borderColor = '#FF6600';
                target.style.transform = 'none';
                target.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1)';
              }}
            >
              CARE+ 맞춤 상담 시작하기
            </button>
          </div>
        )}
      </main>
    </>
  )
}