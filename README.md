# Student Portal & Admin Panel

A comprehensive full-stack student management system with separate portals for students and administrators.

## 🏗️ Architecture

- **Backend**: Node.js + Express + TypeScript + MongoDB
- **Frontend Student**: React + TypeScript + TailwindCSS + Framer Motion
- **Frontend Admin**: React + TypeScript + TailwindCSS + Framer Motion  
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + Refresh Tokens
- **Documentation**: Swagger UI
- **Container**: Docker + Docker Compose

## 📋 Features

### Student Portal (`http://localhost:3000`)
- **Dashboard**: Profile overview, notifications, recent activity
- **Fees**: View dues, payment processing, receipt downloads, payment history
- **Library**: Browse books, search, borrowing system, QR codes
- **Hostel**: Room allocation, service requests, room change requests
- **Academics**: Timetable, results, transcript downloads
- **Placements**: Job listings, application tracking, resume uploads
- **Certificates**: Certificate requests, downloads, verification
- **Gamification**: Points, badges, leaderboard, achievements
- **Chatbot**: WhatsApp/Telegram integration

### Admin Panel (`http://localhost:3001/admin`)
- **Dashboard**: System overview, statistics, alerts
- **User Management**: CRUD operations, bulk import/export, role management
- **Fee Management**: Create fees, payment tracking, reports, refunds
- **Library Management**: Book management, borrowing tracking, fines
- **Hostel Management**: Room allocation, occupancy reports, service requests
- **Academic Management**: Timetable creation, result uploads, course management
- **Placement Management**: Job posting, application reviews, company management
- **Certificate Management**: Issuance, verification, QR codes, blockchain hashes
- **Gamification**: Award points/badges, leaderboard management
- **Analytics**: Comprehensive reporting and predictive analytics
- **System Tools**: File uploads, health monitoring, backup/restore

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- MongoDB (or use Docker)

### Installation

1. **Clone the repository**
```bash
git clone <repo-url>
cd student-portal
```

2. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Docker Setup (Recommended)**
```bash
docker-compose up -d
```

4. **Manual Setup**
```bash
# Install dependencies
cd backend && npm install
cd ../frontend-student && npm install
cd ../frontend-admin && npm install

# Start MongoDB (if not using Docker)
# mongod

# Seed database
cd backend && npm run seed

# Start services
npm run dev # Backend (port 5000)
cd ../frontend-student && npm run dev # Student portal (port 3000)
cd ../frontend-admin && npm run dev # Admin panel (port 3001)
```

### Default Admin Credentials
- **Email**: `admin@studentportal.com`
- **Password**: `admin123`
- **Role**: `admin`

## � API Documentation

- **Swagger UI**: `http://localhost:5000/api-docs`
- **API JSON**: `http://localhost:5000/api-docs.json`
- **Health Check**: `http://localhost:5000/api/health`

## � Authentication

### JWT Token Configuration
- **Access Token Lifetime**: 1 hour
- **Refresh Token Lifetime**: 7 days
- **Roles**: `student`, `admin`

### API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `POST /api/auth/refresh` - Token refresh

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend-student && npm test
cd frontend-admin && npm test

# E2E tests
npm run test:e2e
```

## 📂 Project Structure

```
/
├─ backend/                 # Node.js API server
│  ├─ src/
│  │  ├─ controllers/      # Route controllers
│  │  ├─ middleware/       # Auth, validation, error handling
│  │  ├─ models/          # MongoDB models
│  │  ├─ routes/          # API routes
│  │  ├─ services/        # Business logic
│  │  └─ utils/           # Helpers, seed scripts
│  └─ tests/              # Jest tests
├─ frontend-student/        # Student portal React app
│  ├─ src/
│  │  ├─ components/      # Reusable UI components
│  │  ├─ contexts/        # React contexts
│  │  ├─ pages/          # Page components
│  │  ├─ services/       # API services
│  │  └─ utils/          # Helper functions
│  └─ tests/             # React testing library
├─ frontend-admin/          # Admin panel React app
│  └─ src/               # Similar structure to student
├─ docker-compose.yml       # Container orchestration
├─ .env.example            # Environment template
└─ .github/workflows/      # CI/CD pipelines
```

## 🔧 Scripts

### Backend
- `npm run dev` - Development server with hot reload
- `npm run build` - TypeScript compilation
- `npm run start` - Production server
- `npm run seed` - Database seeding
- `npm test` - Jest tests
- `npm run lint` - ESLint

### Frontend
- `npm run dev` - Vite development server
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm test` - Vitest tests
- `npm run lint` - ESLint

## 🐳 Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild images
docker-compose up --build
```

## 📈 Acceptance Criteria

✅ Seed script creates admin user (admin@studentportal.com / admin123)  
✅ GET /api/health returns success  
✅ Swagger at /api-docs lists all endpoints  
✅ Admin can create users, bulk import CSV, manage fees  
✅ Student can login, view fees, pay fees, borrow/return books  
✅ Certificate issuance creates PDF and verification works  
✅ Leaderboard displays awarded badges & points  
✅ Analytics endpoints return aggregated data  
✅ All tests pass (unit + E2E)

## 🛠️ Development

### Adding New Features
1. Create database models in `backend/src/models/`
2. Add API routes in `backend/src/routes/`
3. Implement controllers in `backend/src/controllers/`
4. Create frontend pages in respective `src/pages/`
5. Add tests in `tests/` directories

### Environment Variables
See `.env.example` for all required configuration variables.

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For support, email support@studentportal.com or create an issue on GitHub.