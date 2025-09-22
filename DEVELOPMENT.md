# 🎓 Student Portal - Development Guide

## 📁 Project Structure

```
student-portal/
├── 📁 backend/                 # Node.js + Express + MongoDB + TypeScript
│   ├── 📁 src/
│   │   ├── 📁 config/          # Database, logger, swagger configs
│   │   ├── 📁 controllers/     # Route controllers
│   │   ├── 📁 middleware/      # Auth, error handling middleware
│   │   ├── 📁 models/          # Mongoose models
│   │   ├── 📁 routes/          # API routes
│   │   ├── 📁 types/           # TypeScript type definitions
│   │   ├── 📁 utils/           # Helper functions, seeding
│   │   └── 📄 index.ts         # Main application entry
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   ├── 📄 .env
│   └── 📄 .eslintrc.json
├── 📁 frontend-web/            # React + Vite + TypeScript + TailwindCSS
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable React components
│   │   ├── 📁 contexts/        # React contexts (Auth, Theme)
│   │   ├── 📁 pages/           # Page components
│   │   ├── 📁 services/        # API service layer
│   │   ├── 📁 types/           # TypeScript interfaces
│   │   ├── 📁 utils/           # Helper functions
│   │   ├── 📄 App.tsx          # Main app component
│   │   ├── 📄 main.tsx         # React entry point
│   │   └── 📄 index.css        # Global styles
│   ├── 📄 index.html
│   ├── 📄 package.json
│   ├── 📄 vite.config.ts
│   ├── 📄 tailwind.config.js
│   ├── 📄 tsconfig.json
│   └── 📄 .eslintrc.json
├── 📁 mobile/                  # React Native + Expo + TypeScript
│   ├── 📁 app/                 # Expo Router pages
│   ├── 📁 components/          # React Native components
│   ├── 📁 services/            # API services
│   ├── 📁 types/               # TypeScript types
│   ├── 📄 App.tsx              # Main app component
│   ├── 📄 package.json
│   ├── 📄 app.json             # Expo configuration
│   ├── 📄 tsconfig.json
│   └── 📄 .env
├── 📄 package.json             # Root monorepo configuration
├── 📄 README.md                # Main documentation
└── 📄 DEVELOPMENT.md           # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm 9+
- MongoDB Atlas account (provided connection string)
- Git

### Installation Steps

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd student-portal
   npm run install:all
   ```

2. **Environment Setup**
   
   Copy `.env.example` files and configure:
   
   **Backend (.env):**
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb+srv://vernekarvaishnav05_db_user:6xICmoaWQwhAtIyR@cluster0.hkzjy6p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=your_jwt_secret_here
   JWT_REFRESH_SECRET=your_refresh_secret_here
   ```
   
   **Frontend (.env):**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
   
   **Mobile (.env):**
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. **Database Seeding**
   ```bash
   npm run seed
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

## 🔧 Development Workflow

### Backend Development (Port 5000)
```bash
cd backend
npm run dev          # Start with nodemon
npm run build        # TypeScript compilation
npm run lint         # ESLint check
npm run test         # Run tests
```

### Frontend Development (Port 3000)
```bash
cd frontend-web
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run preview      # Preview build
```

### Mobile Development
```bash
cd mobile
npm start            # Start Expo dev server
npm run android      # Run on Android
npm run ios          # Run on iOS
```

## 📡 API Architecture

### Authentication Flow
1. **Register/Login** → Get access + refresh tokens
2. **API Requests** → Include Bearer token in Authorization header
3. **Token Refresh** → Automatic refresh when access token expires

### API Endpoints

#### 🔐 Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /refresh` - Refresh access token
- `GET /profile` - Get current user profile

#### 💰 Fees Management (`/api/fees`)
- `GET /` - Get user fees
- `POST /pay` - Process fee payment (mock)

#### 🏠 Hostel Management (`/api/hostel`)
- `GET /` - Get hostel allocation
- `POST /request-change` - Request room change

#### 📚 Library System (`/api/library`)
- `GET /books` - List all books
- `POST /borrow` - Borrow a book
- `POST /return` - Return a book

#### 📝 Exams (`/api/exams`)
- `GET /` - Get exam timetable
- `GET /results` - Get exam results

#### 💼 Placements (`/api/placements`)
- `GET /jobs` - List job openings
- `POST /apply` - Apply for a job

#### 🏆 Certificates (`/api/certificates`)
- `POST /issue` - Issue new certificate
- `GET /verify/:id` - Verify certificate

#### 🎮 Gamification (`/api/gamification`)
- `GET /leaderboard` - Get leaderboard
- `GET /badges` - Get user badges

#### 📊 Analytics (`/api/analytics`)
- `GET /score` - Get risk assessment score

#### 🤖 Webhooks (`/api/webhooks`)
- `POST /whatsapp` - WhatsApp bot webhook
- `POST /telegram` - Telegram bot webhook

## 🎨 Frontend Architecture

### State Management
- **React Context** for global state (Auth, Theme)
- **Local State** with React Hooks for component state
- **Form State** with React Hook Form

### Styling System
- **TailwindCSS** for utility-first styling
- **Dark Mode** support with class-based switching
- **Framer Motion** for animations
- **Custom Components** with consistent design system

### Key Components
- `Layout` - Main app layout with navigation
- `Navbar` - Top navigation with user menu
- `ProtectedRoute` - Route guard for authenticated users
- `ThemeToggle` - Dark/light mode switcher
- `DashboardCard` - Reusable dashboard cards

## 📱 Mobile Architecture

### Navigation
- **Expo Router** for file-based routing
- **Stack Navigation** for page transitions
- **Tab Navigation** for main sections

### Key Features
- **QR Code Scanner** for library books
- **Push Notifications** for updates
- **Offline Support** with AsyncStorage
- **Native UI** with React Native components

## 🔒 Security Features

### Backend Security
- **Helmet.js** for security headers
- **Rate Limiting** to prevent abuse
- **CORS** configuration for cross-origin requests
- **Input Validation** with Joi schemas
- **Password Hashing** with bcrypt
- **JWT Tokens** with automatic refresh

### Frontend Security
- **Token Storage** in localStorage (development)
- **Automatic Token Refresh** on API calls
- **Route Protection** based on authentication
- **XSS Prevention** with React's built-in protection

## 🧪 Testing Strategy

### Backend Testing
```bash
cd backend
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Frontend Testing
```bash
cd frontend-web
npm test                   # Run Vitest tests
npm run test:ui           # UI test runner
```

## 📦 Deployment

### Backend Deployment (Railway/Render/AWS)
1. Build the application: `npm run build`
2. Set environment variables
3. Configure MongoDB Atlas IP whitelist
4. Deploy from `dist/` folder

### Frontend Deployment (Vercel/Netlify)
1. Build the application: `npm run build`
2. Configure environment variables
3. Deploy from `dist/` folder
4. Set up custom domain (optional)

### Mobile Deployment
```bash
cd mobile
npm run build:android      # Build for Android
npm run build:ios          # Build for iOS
npm run submit            # Submit to app stores
```

## 🐛 Debugging

### Backend Debugging
- **Winston Logs** in `logs/` directory
- **Morgan** for HTTP request logging
- **Node.js Inspector** for step-through debugging

### Frontend Debugging
- **React DevTools** browser extension
- **Redux DevTools** for state inspection
- **Vite HMR** for hot module replacement

### Mobile Debugging
- **Expo DevTools** in browser
- **React Native Debugger** standalone app
- **Flipper** for advanced debugging

## 🔄 Common Commands

### Root Level
```bash
npm run dev                # Start all development servers
npm run build              # Build all projects
npm run install:all        # Install all dependencies
npm run seed               # Seed database
npm run lint               # Lint all projects
```

### Project Specific
```bash
npm run dev:backend        # Backend only
npm run dev:frontend       # Frontend only
npm run dev:mobile         # Mobile only
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   lsof -ti:5000 | xargs kill -9  # Kill process on port 5000
   lsof -ti:3000 | xargs kill -9  # Kill process on port 3000
   ```

2. **MongoDB Connection Issues**
   - Check if IP is whitelisted in MongoDB Atlas
   - Verify connection string in .env file
   - Ensure network connectivity

3. **Package Installation Issues**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **TypeScript Compilation Errors**
   ```bash
   npx tsc --noEmit          # Check types without building
   npm run lint:fix          # Auto-fix linting issues
   ```

## 📚 Learning Resources

### Backend Technologies
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB/Mongoose Guide](https://mongoosejs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [JWT.io](https://jwt.io/) for understanding JWTs

### Frontend Technologies
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

### Mobile Technologies
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Guide](https://reactnative.dev/docs/getting-started)
- [Expo Router](https://expo.github.io/router/docs/)

## 👥 Team Conventions

### Code Style
- Use **TypeScript** for type safety
- Follow **ESLint** rules consistently
- Use **Prettier** for code formatting
- Write **descriptive commit messages**

### File Naming
- **PascalCase** for React components
- **camelCase** for functions and variables
- **kebab-case** for file names (except components)
- **SCREAMING_SNAKE_CASE** for constants

### Git Workflow
```bash
git checkout -b feature/feature-name
git add .
git commit -m "feat: add new feature"
git push origin feature/feature-name
# Create pull request
```

## 🎯 Next Steps

### Phase 1 - Core Features Enhancement
- [ ] Complete CRUD operations for all modules
- [ ] Add real-time notifications
- [ ] Implement file upload functionality
- [ ] Add comprehensive testing

### Phase 2 - Advanced Features
- [ ] Real blockchain integration
- [ ] AI/ML features for analytics
- [ ] Advanced reporting system
- [ ] Multi-language support

### Phase 3 - Production Ready
- [ ] Performance optimization
- [ ] Security audit
- [ ] Load testing
- [ ] Production deployment

---

Happy coding! 🚀