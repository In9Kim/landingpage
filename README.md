# 효도보험선물 (Insurance Gift for Parents)

> AI 상담과 효도 that put 엄마의 건강 at the frontier

한화생명과 함께하는 AI 기반 효도보험 선물 플랫폼입니다. 30-40대 여성이 어머님을 위한 맞춤형 보험을 쉽고 빠르게 선물할 수 있도록 설계된 모바일 퍼스트 웹 애플리케이션입니다.

## ✨ 주요 특징

- **AI 효도 상담**: Claude 기반의 지능형 대화 시스템으로 어머님 정보 수집
- **맞춤형 보험 추천**: 연령, 건강상태, 가족력을 고려한 개인화 추천
- **3분 간편 가입**: 복잡한 절차 없이 빠른 온라인 가입 프로세스
- **감성적 UX**: 효도라는 감정적 가치를 중심으로 한 따뜻한 사용자 경험
- **완료 이벤트**: 가입 완료 후 건강검진권, 마사지권 등 추가 선물 제공

## 🚀 빠른 시작

### 필요 조건

- Node.js 18+ 
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:3001 접속
```

### 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 🎯 사용자 여정

### 1. 메인 페이지
- Anthropic 스타일의 모던한 랜딩 페이지
- AI 네트워크 시각화와 함께하는 임팩트 있는 메시지
- "지금 엄마 보험 찾아보기" CTA 버튼

### 2. AI 효도 상담 (3-5분)
```
AI: 안녕하세요! 한화생명 AI 효도 상담사입니다 😊
    어머님을 위한 든든한 보장을 준비해드리고 싶어요. 
    먼저 어머님 연세가 어떻게 되시나요?

사용자: 64세입니다

AI: 어머님께서 현재 직장을 다니고 계시거나 특별한 직업이 있으신가요?
    (예: 주부, 회사원, 자영업 등)

사용자: 주부입니다

AI: 어머님의 건강 상태는 어떠신가요?
    현재 복용 중인 약이나 치료받고 계신 질환이 있다면 알려주세요.
```

### 3. 맞춤 보험 추천
- **추천 로직**: 입력된 정보를 기반으로 한화생명 e상품군에서 최적 상품 선별
- **상품 비교**: 3개 상품 중 가장 적합한 상품 하이라이트
- **추천 이유**: 감성적 메시지와 함께 추천 근거 제시

### 4. 3분 간편 가입
**1단계: 신청자 정보**
- 성함, 휴대폰 번호, 이메일, 어머님과의 관계

**2단계: 결제 정보**  
- 신용카드 또는 계좌이체 선택
- 월 보험료 자동 결제 설정

**3단계: 약관 동의**
- 개인정보 수집/이용 동의 (필수)
- 보험약관 동의 (필수)  
- 마케팅 수신 동의 (선택)

### 5. 완료 이벤트
- 🎉 축하 애니메이션과 완료 메시지
- 🎁 추가 선물 선택 (건강검진권, 마사지권, 건강기능식품)
- 📱 어머님께 SMS 발송 안내
- 📋 보험증서 발송 일정 안내

## 🏗️ 기술 스택

### Frontend
- **Framework**: Next.js 15.5.2
- **Language**: TypeScript
- **UI Library**: React 19.1.1
- **Styling**: 커스텀 CSS (Anthropic 디자인 시스템 적용)

### Development Tools
- **Node.js**: 18+
- **Package Manager**: npm
- **Linting**: ESLint (Next.js 기본 설정)

### Design System
- **Primary Color**: Coral (#E67E22)
- **Neutral Colors**: 회색 톤 (#1F2937, #4B5563, #6B7280)
- **Typography**: Noto Sans KR
- **Layout**: Mobile-first responsive design

## 📁 프로젝트 구조

```
landingpage/
├── components/           # React 컴포넌트
│   ├── ConsultationChat.tsx    # AI 상담 채팅 인터페이스
│   ├── ProductRecommendation.tsx # 보험상품 추천 및 비교
│   ├── ApplicationFlow.tsx     # 3단계 가입 프로세스
│   └── CompletionEvent.tsx     # 완료 이벤트 및 선물 선택
├── pages/               # Next.js 페이지
│   ├── _app.tsx        # App 컴포넌트
│   └── index.tsx       # 메인 페이지
├── styles/             # 스타일 파일
│   └── globals.css     # 글로벌 스타일 및 유틸리티 클래스
├── PRD.md              # 제품 요구사항 명세서
├── CLAUDE.md           # Claude Code 개발 가이드
└── package.json        # 프로젝트 설정 및 의존성
```

## 🎨 디자인 시스템

### 컬러 팔레트
```css
/* Primary Colors */
--coral: #E67E22;        /* 메인 액센트 컬러 */
--coral-light: #F39C12;  /* 밝은 코랄 */
--coral-50: #FEF5F0;     /* 연한 배경 */

/* Neutral Colors */
--neutral-800: #1F2937;  /* 주요 텍스트 */
--neutral-600: #4B5563;  /* 보조 텍스트 */
--neutral-50: #F9FAFB;   /* 배경 */
```

### 타이포그래피
- **Primary Font**: Noto Sans KR
- **Heading Scale**: 4xl (2.25rem) → 6xl (3.75rem)
- **Body Text**: base (1rem), lg (1.125rem)
- **Small Text**: sm (0.875rem), xs (0.75rem)

## 🔧 개발 가이드

### 새 컴포넌트 추가
1. `components/` 디렉터리에 TypeScript 파일 생성
2. 함수형 컴포넌트로 작성, TypeScript 타입 정의 포함
3. 기존 스타일 클래스 활용 (globals.css 참조)

### 상태 관리
- React `useState` 훅 사용
- 복잡한 상태는 `useReducer` 고려
- 전역 상태 관리가 필요한 경우 Context API 활용

### 스타일링 규칙
- 커스텀 CSS 클래스 사용 (globals.css에 정의)
- 컴포넌트별 인라인 스타일 최소화
- 반응형 디자인: 모바일 퍼스트 접근

### API 연동 준비
현재는 mock 데이터를 사용하지만, 다음 API 연동 지점들이 준비되어 있습니다:

```typescript
// 보험상품 API
interface Product {
  id: string
  name: string
  monthlyPremium: number
  coverage: string[]
  // ...
}

// 가입 신청 API  
interface ApplicationData {
  customerName: string
  customerPhone: string
  motherInfo: MotherInfo
  selectedProduct: Product
  // ...
}
```

## 🚀 배포

### Vercel (권장)
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

### 기타 플랫폼
- **Netlify**: `npm run build` 후 `out` 폴더 배포
- **AWS S3**: 정적 사이트 호스팅 설정
- **Docker**: Dockerfile 추가 후 컨테이너 배포

## 📊 성과 목표 (PRD 기준)

- **완료율**: 3분 이내 가입 완료 80% 이상
- **전환율**: e상품군 가입 전환율 150% 향상  
- **만족도**: 서비스 감성적 만족도 4.5/5 이상
- **공유율**: SNS 자발적 공유율 15% 이상

## 🤝 기여 가이드

1. 이슈 생성 또는 기존 이슈 확인
2. feature/이슈번호 브랜치 생성
3. 코드 작성 및 테스트
4. PR 생성 및 리뷰 요청
5. 승인 후 메인 브랜치 병합

## 📄 라이선스

ISC License

---

**문의사항이나 기술 지원이 필요하시면 이슈를 생성해 주세요.**# landingpage
# landingpage
# landingpage
