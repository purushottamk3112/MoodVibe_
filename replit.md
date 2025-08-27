# MoodVibe - Mood-Based Music Recommender

## Overview

MoodVibe is a full-stack, single-page web application that provides personalized music recommendations based on user mood input. The application leverages AI-powered mood analysis to interpret user emotions and delivers curated Spotify track suggestions through an elegant, award-winning UI with advanced animations. Built as a stateless system without database persistence, it focuses on real-time mood-to-music matching using modern web technologies.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and component-based architecture
- **Styling**: Tailwind CSS with CSS variables for theming, providing a clean and responsive design system
- **Animation**: Framer Motion for physics-based animations including stagger effects, spring transitions, and interactive button states
- **UI Components**: Radix UI primitives with shadcn/ui components for accessibility and consistent design
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express server providing RESTful API endpoints
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Request Handling**: Express middleware for JSON parsing, CORS, and error handling
- **Validation**: Zod schemas for runtime type checking and API validation
- **Development**: Hot reloading with Vite integration for seamless development experience

### Data Flow & Business Logic
- **Stateless Design**: No database persistence - all data flows through API calls
- **Mood Analysis Pipeline**: User input → Gemini AI analysis → genre/keyword extraction → Spotify search → formatted response
- **API Structure**: Single `/api/recommendations` endpoint handling POST requests with mood analysis workflow
- **Error Handling**: Comprehensive error boundaries with user-friendly messaging and proper HTTP status codes

### Theme System
- **Dynamic Theming**: Light/dark mode toggle with smooth transitions
- **Persistence**: LocalStorage for theme preference retention
- **CSS Variables**: Custom properties enabling seamless theme switching
- **Color Palette**: Carefully curated colors optimized for both accessibility and aesthetic appeal

### Responsive Design
- **Mobile-First**: Tailwind breakpoints ensuring optimal experience across all device sizes
- **Flexible Layouts**: CSS Grid and Flexbox for adaptive component positioning
- **Touch Interactions**: Optimized button sizes and hover states for touch devices

## External Dependencies

### AI Integration
- **Google Gemini API**: Mood analysis and genre recommendation using advanced language models
- **Configuration**: JSON response schema with structured genre output for consistent processing

### Music Service Integration
- **Spotify Web API**: Track search and metadata retrieval
- **Authentication**: Client Credentials flow for application-level access
- **Data Processing**: Track filtering and formatting for frontend consumption

### Development Tools
- **Drizzle ORM**: Database toolkit configured for PostgreSQL (currently unused but ready for future persistence)
- **ESBuild**: Fast bundling for production server builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer plugins

### UI/UX Libraries
- **React Hook Form**: Form state management with validation
- **Date-fns**: Date manipulation utilities
- **Lucide React**: Consistent icon system
- **Class Variance Authority**: Type-safe component variant management

### Infrastructure
- **Neon Database**: PostgreSQL-compatible serverless database (configured but not actively used)
- **Environment Variables**: Secure API key management for production deployment