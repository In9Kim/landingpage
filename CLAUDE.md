# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a landing page for "효도보험선물" (Insurance Gift for Parents) - a mobile-first web application that helps 30-40 year old women purchase Hanwha Life insurance products for their elderly mothers through AI-powered consultation. The project focuses on emotional UX writing and a "filial piety" concept to bridge the gap between wanting to care for parents and the complexity of insurance selection.

## Current Status

This project is now **fully implemented** based on the PRD specifications. All core features have been developed including AI consultation, product recommendation, application flow, and completion event system.

## Commands

- `npm run dev`: Start development server (localhost:3001 - Note: port 3001 used when 3000 is occupied)
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run lint`: Run linting

## Architecture

### Target Product Scope
- **Primary Users**: 30-40 year old women (working professionals and housewives)
- **Insurance Products**: Hanwha Life e-series only (e시그니처암보험, e건강보험, e정기보험)
- **Core Flow**: AI consultation → personalized insurance recommendation → 3-minute simplified application
- **Key Differentiator**: Emotional "filial piety" messaging and AI-powered consultation experience
- **Design Philosophy**: Anthropic-inspired modern design with coral accent colors

### Tech Stack (Implemented)
- **Frontend**: Next.js 15.5.2 + React 19.1.1 + TypeScript 5.9.2
- **Styling**: Custom CSS with Anthropic-inspired design system (Tailwind dependency removed)
- **Colors**: Coral primary (#E67E22), neutral grays, white-based clean layout
- **Typography**: Noto Sans KR, mobile-first responsive design
- **State Management**: React useState hooks
- **Data**: Mock data (ready for API integration)

### Implemented Features
1. **AI Filial Consultation System**: ✅ Multi-step chat interface with emotional messaging
2. **Hanwha Life e-Product Recommendation Engine**: ✅ Smart recommendation based on user inputs
3. **Emotional UX Writing System**: ✅ Consistent warm messaging throughout
4. **3-Minute Simplified Application Process**: ✅ Three-step application with validation
5. **Filial Gift Event System**: ✅ Gift selection with animated completion flow

### Component Structure
- `pages/index.tsx`: Main application with step routing and Anthropic-style hero section
- `components/ConsultationChat.tsx`: AI consultation interface with chat bubbles and progress tracking
- `components/ProductRecommendation.tsx`: Product comparison with modern card design
- `components/ApplicationFlow.tsx`: Three-step application process with step indicators
- `components/CompletionEvent.tsx`: Celebration with confetti animation and gift selection
- `styles/globals.css`: Custom CSS with all utility classes and design system

### Product Recommendation Logic
- **e시그니처암보험**: Recommended for family cancer history, 50+ age, irregular health checkups
- **e건강보험**: For chronic conditions (diabetes, hypertension), lifestyle disease concerns  
- **e정기보험**: For economically active, family support responsibilities, death benefit needs

### Success Metrics Focus
- 3-minute application completion rate 80%+
- e-product series conversion rate 150% improvement
- Emotional satisfaction score 4.5/5+
- Service triggers word-of-mouth sharing on SNS

## Current Implementation Status

### Design System
- **Visual Style**: Anthropic-inspired clean modern design
- **Color Palette**: Coral (#E67E22) primary, neutral grays, white backgrounds
- **Typography**: Noto Sans KR, bold headings, readable body text
- **Layout**: Mobile-first responsive grid, generous white space
- **Interactive Elements**: Subtle shadows, smooth transitions, hover effects

### Key Features Working
- **Hero Section**: Large typography with network visualization graphics
- **AI Chat**: Real-time message interface with emotional messaging
- **Product Cards**: Modern card-based product comparison
- **Application Flow**: Multi-step form with progress indicators
- **Completion Event**: Animated celebration with gift selection

### Development Guidelines
- All components use TypeScript for type safety
- Custom CSS utility classes instead of Tailwind for better control
- React hooks for state management (no external state library needed)
- Mock data structure ready for API integration
- Responsive design tested across mobile and desktop

### Integration Requirements
- Hanwha Life e-product API connectivity (data models ready)
- Payment gateway integration (UI components ready)
- SMS/notification service integration (flow implemented)
- Identity verification service integration (UI ready)

### Performance Considerations
- Next.js SSG for fast loading
- Optimized images and fonts
- Minimal JavaScript bundle size
- CSS-in-CSS for better caching