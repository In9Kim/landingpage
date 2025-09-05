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
        <title>CARE+ - 엄마를 위한 맞춤 케어 보험</title>
        <meta name="description" content="CARE+로 엄마 건강을 더 세심하게 케어하세요" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-white">
        {currentStep === 'intro' && (
          <div className="container mx-auto px-6 py-16">
            {/* Hero Section */}
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Left Content */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="text-6xl font-bold text-coral mr-2">CARE</div>
                    <div className="text-6xl font-bold text-coral">+</div>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-6 leading-tight">
                    엄마 건강을 더 <span className="text-coral">세심하게</span><br />
                    케어하는 맞춤 보험
                  </h1>
                  <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
                    AI 케어 상담으로 어머님의 건강 상태를 정확히 분석하고<br />
                    가장 적합한 맞춤 보험을 추천해드립니다.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setCurrentStep('chat')}
                      className="btn-filled text-lg"
                    >
                      CARE+ 맞춤 상담 시작하기
                    </button>
                    <button className="btn-outlined text-lg">
                      케어 서비스 알아보기
                    </button>
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
              <div className="mt-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-coral-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl">🤖</span>
                    </div>
                    <h4 className="text-lg font-semibold text-neutral-800 mb-2">AI 케어 상담</h4>
                    <p className="text-neutral-600">Claude 기반 지능형 상담으로 어머님 건강 상태를 정확히 분석합니다</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-coral-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl">🎯</span>
                    </div>
                    <h4 className="text-lg font-semibold text-neutral-800 mb-2">맞춤 케어 플랜</h4>
                    <p className="text-neutral-600">개인별 건강 상태와 연령에 최적화된 케어 보험을 추천합니다</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-coral-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl">⚡</span>
                    </div>
                    <h4 className="text-lg font-semibold text-neutral-800 mb-2">간편한 절차</h4>
                    <p className="text-neutral-600">CARE+ 플랫폼에서 간단한 절차로 맞춤 보험 가입이 완료됩니다</p>
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
      </main>
    </>
  )
}