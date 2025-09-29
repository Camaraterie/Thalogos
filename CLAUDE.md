# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (Thalamus)
```bash
npm run dev      # Start development server (Vite)
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend Service
```bash
# From ../backend-service directory
pip install -r requirements.txt  # Install dependencies
uvicorn main:app --reload         # Start development server
python main.py                    # Alternative start method

# Docker deployment
docker build -t thalamus-backend .
docker run -p 8000:8000 thalamus-backend
```

### Environment Setup
- **Frontend**: Requires `GEMINI_API_KEY` environment variable
- **Backend**: Requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` in `.env` file

## Architecture Overview

### System Architecture
Thalamus is a full-stack AI agent orchestration platform consisting of:

1. **Frontend (Thalamus)**: React/TypeScript application with simulated multi-agent orchestration
2. **Backend Service**: FastAPI Python service providing Google Workspace integration and user authentication

### Frontend Architecture (Current Directory)

#### Core Concept
React application that simulates multi-agent AI orchestration through sophisticated prompting of a single Gemini API call. Features modular UI with draggable windows and persistent state.

#### Key Components
- **State Management**: Zustand store with localStorage persistence (`store/chatStore.ts`)
- **Agent System**: Simulated orchestration with predefined specialist agents (`constants/agents.ts`)
- **Modular UI**: Draggable/resizable windows (ChatWindow, IdeaWindow, EditorWindow)
- **Session Management**: `AWAITING_GOAL` → `AGENT_SESSION_ACTIVE` workflow

#### Agent Simulation
- **Single API Strategy**: One Gemini call with system prompts instructing model to behave as orchestrator
- **Delegation Format**: `[Delegating to <Agent Name>]: <instruction>`
- **Dynamic Selection**: AI analyzes goals to activate relevant specialist agents

### Backend Service Architecture (../backend-service)

#### Core Technologies
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: Database ORM with SQLite
- **OAuth2**: Google authentication with Workspace scopes
- **Docker**: Containerized deployment

#### Key Features
- **Google OAuth Integration**: Complete authentication flow with token management
- **Gmail API Integration**: Read emails, send messages, access user profile
- **User Management**: SQLite database with user sessions and token refresh
- **Workspace Scopes**: Gmail read/send, profile access (extensible for Calendar, Drive, etc.)

#### API Endpoints
```
GET  /                              # Welcome message
GET  /health                        # Health check
GET  /auth/google                   # Initiate OAuth flow
GET  /auth/google/callback          # OAuth callback handler
GET  /users/me                      # Current user profile
GET  /google/gmail/profile          # Gmail profile info
GET  /google/gmail/messages         # List Gmail messages
GET  /google/gmail/messages/{id}    # Get specific message
POST /google/gmail/send-message     # Send email
```

#### Database Schema
- **Users Table**: `google_sub`, `email`, `name`, `picture`, `access_token`, `refresh_token`, `expires_at`
- **Token Management**: Automatic refresh handling for expired tokens

### Integration Architecture

#### Current State
- Frontend operates independently with direct Gemini API calls
- Backend provides separate Google Workspace integration

#### Integration Path
To connect frontend and backend:
1. **Update Frontend Service**: Replace direct Gemini calls with backend API calls
2. **Backend Agent Endpoint**: Add `/api/chat` endpoint that orchestrates between Gemini and Google Workspace
3. **Unified Authentication**: Frontend authenticates through backend OAuth flow
4. **Real Agent Delegation**: Backend intercepts simulated delegation and makes real API calls to appropriate services

### File Organization

#### Frontend Structure
```
/components/     # React components (ChatWindow, EditorWindow, etc.)
/constants/      # Agent definitions and app constants
/contexts/       # React contexts (ErrorContext)
/hooks/          # Custom React hooks (usePersistentState, useSpeechRecognition)
/services/       # API services (geminiService)
/store/          # Zustand state management
/types.ts        # TypeScript type definitions
```

#### Backend Structure
```
../backend-service/
├── main.py           # FastAPI application with all endpoints
├── requirements.txt  # Python dependencies
├── Dockerfile        # Container configuration
├── .env             # Environment variables
└── sql_app.db       # SQLite database (auto-created)
```

### Development Workflow

#### Working with Frontend
- Use Vite dev server for hot reload
- All state persists in localStorage
- Component-based architecture with TypeScript
- Environment variables injected via Vite config

#### Working with Backend
- FastAPI with automatic OpenAPI docs at `/docs`
- SQLAlchemy models auto-create database tables
- OAuth flow requires Google Cloud Console setup
- CORS configured for local development

#### Full-Stack Development
- Run both services independently during development
- Frontend: `http://localhost:5173` (Vite default)
- Backend: `http://localhost:8000` (FastAPI default)
- Integration requires updating frontend service layer