# 🎓 Unified Student Companion Portal

A comprehensive MERN stack monorepo for student management with advanced features including blockchain credentials, AI analytics, and multi-platform support.

## 🏗️ Architecture

```
student-portal/
├── backend/           # Node.js + Express + MongoDB + TypeScript
├── frontend-web/      # React + Vite + TypeScript + TailwindCSS
├── mobile/           # React Native + Expo + TypeScript
└── package.json      # Monorepo configuration
```

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Student, Admin)
- Secure session management

### 📚 Core Modules
- **Fees Management** - View dues, payment processing
- **Hostel Management** - Room allocation, change requests
- **Library System** - Book management, QR code integration
- **Exam Management** - Timetables, results
- **Placements** - Job postings, applications, resume parsing
- **Certificates** - Blockchain-verified credentials with QR codes
- **Gamification** - Points, badges, leaderboards
- **Analytics** - Dropout risk assessment

### 🤖 AI & Automation
- WhatsApp & Telegram chatbot integration
- Predictive analytics for student success
- Automated resume parsing

### 🔗 Blockchain Integration
- SHA256-hashed certificate verification
- QR code generation for credentials
- Immutable record keeping

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd student-portal
   ```

2. **Install dependencies for all workspaces**
   ```bash
   npm run install:all
   ```

3. **Environment Setup**
   
   Create `.env` files in each workspace:
   
   **Backend (.env)**
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb+srv://vernekarvaishnav05_db_user:6xICmoaWQwhAtIyR@cluster0.hkzjy6p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=your_jwt_secret_here
   JWT_REFRESH_SECRET=your_refresh_secret_here
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TELEGRAM_BOT_TOKEN=your_telegram_token
   ```
   
   **Frontend Web (.env)**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
   
   **Mobile (.env)**
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Seed the database**
   ```bash
   npm run seed
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

   Or start individually:
   ```bash
   npm run dev:backend    # Backend on http://localhost:5000
   npm run dev:frontend   # Frontend on http://localhost:3000
   npm run dev:mobile     # Mobile on Expo Go
   ```

## 📱 Platform Access

- **Web App**: http://localhost:3000
- **API Documentation**: http://localhost:5000/api-docs
- **Mobile App**: Use Expo Go app and scan QR code

## 👥 Default Users

After seeding, you can login with:

**Admin User**
- Email: admin@studentportal.com
- Password: admin123

**Student User**
- Email: student@studentportal.com
- Password: student123

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev          # Start with nodemon
npm run build        # TypeScript compilation
npm run test         # Run tests
npm run lint         # ESLint check
```

### Frontend Development
```bash
cd frontend-web
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run preview      # Preview build
npm run test         # Run tests
```

### Mobile Development
```bash
cd mobile
npm start            # Start Expo dev server
npm run android      # Run on Android
npm run ios          # Run on iOS
npm run web          # Run on web
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token

### Student Services
- `GET /api/fees` - View fee details
- `POST /api/fees/pay` - Process payment
- `GET /api/hostel` - Hostel allocation
- `POST /api/hostel/request-change` - Request room change
- `GET /api/library/books` - List books
- `POST /api/library/borrow` - Borrow book
- `GET /api/exams` - Exam timetable
- `GET /api/placements/jobs` - Job listings
- `POST /api/placements/apply` - Apply for job

### Advanced Features
- `POST /api/certificates/issue` - Issue certificate
- `GET /api/certificates/verify/:id` - Verify certificate
- `GET /api/gamification/leaderboard` - View leaderboard
- `GET /api/analytics/score` - Risk assessment

### Chatbot Webhooks
- `POST /api/webhooks/whatsapp` - WhatsApp integration
- `POST /api/webhooks/telegram` - Telegram integration

## 🏗️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Language**: TypeScript
- **Authentication**: JWT
- **Validation**: Joi
- **Logging**: Winston
- **Documentation**: Swagger
- **Testing**: Jest

### Frontend Web
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **State Management**: React Context/Hooks
- **HTTP Client**: Axios
- **Testing**: Vitest

### Mobile
- **Framework**: React Native
- **Platform**: Expo
- **Language**: TypeScript
- **Navigation**: Expo Router
- **QR Scanner**: Expo Barcode Scanner
- **Notifications**: Expo Notifications
- **Testing**: Jest

## 🔒 Security Features

- JWT authentication with refresh tokens
- Role-based access control
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Environment variable protection
- Blockchain certificate verification

## 📊 Monitoring & Analytics

- Winston logging with multiple transports
- Performance monitoring
- User activity tracking
- Predictive analytics for student success
- Real-time notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation in each workspace

## 🚀 Deployment

### Backend Deployment
- Deploy to services like Railway, Render, or AWS
- Set environment variables
- Configure MongoDB Atlas whitelist

### Frontend Deployment
- Deploy to Vercel, Netlify, or AWS S3
- Update API URLs for production
- Configure build settings

### Mobile Deployment
- Build with EAS Build
- Submit to App Store/Google Play
- Configure push notification certificates

---

Built with ❤️ using the MERN stack