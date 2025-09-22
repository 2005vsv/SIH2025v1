# 🎓 Student Portal - Backend API

Express.js + MongoDB + TypeScript backend for the Student Portal application.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- MongoDB Atlas account or local MongoDB
- Git

### Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Copy `.env.example` to `.env` and update values:
   ```bash
   cp .env.example .env
   ```

4. **Update environment variables in `.env`**
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   ```

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at:
- **API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/health

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # MongoDB connection
│   │   ├── logger.ts    # Winston logger setup
│   │   └── swagger.ts   # API documentation
│   ├── controllers/     # Route controllers
│   │   └── authController.ts
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts      # JWT authentication
│   │   ├── errorHandler.ts
│   │   └── notFound.ts
│   ├── models/          # Mongoose models
│   │   ├── User.ts
│   │   ├── Book.ts
│   │   └── Fee.ts
│   ├── routes/          # API routes
│   │   ├── auth.ts
│   │   ├── fees.ts
│   │   ├── library.ts
│   │   └── ...
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   ├── helpers.ts
│   │   └── seed.ts
│   └── server.ts        # Express app setup
├── .env.example         # Environment variables template
├── package.json
└── tsconfig.json
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get current user profile

### Student Services
- `GET /api/fees` - View fee details
- `POST /api/fees/pay` - Process payment
- `GET /api/hostel` - Hostel allocation
- `POST /api/hostel/request-change` - Request room change
- `GET /api/library/books` - List books
- `POST /api/library/borrow` - Borrow book
- `GET /api/exams` - Exam timetable
- `GET /api/placements/jobs` - Job listings

### Advanced Features
- `POST /api/certificates/issue` - Issue certificate
- `GET /api/certificates/verify/:id` - Verify certificate
- `GET /api/gamification/leaderboard` - View leaderboard
- `GET /api/analytics/score` - Risk assessment

### Chatbot Webhooks
- `POST /api/webhooks/whatsapp` - WhatsApp integration
- `POST /api/webhooks/telegram` - Telegram integration

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start with nodemon
npm run build        # TypeScript compilation
npm run start        # Start production server
npm run seed         # Seed database with sample data
npm run test         # Run tests
npm run lint         # ESLint check
npm run lint:fix     # Fix ESLint errors
```

### Default Seeded Users

After running `npm run seed`:

**Admin User**
- Email: admin@studentportal.com
- Password: admin123

**Student User**
- Email: student@studentportal.com
- Password: student123

## 🔒 Authentication

Uses JWT (JSON Web Tokens) with:
- Access tokens (1 hour expiry)
- Refresh tokens (7 days expiry)
- Role-based access control (Student, Admin)

## 📊 Database Models

### User Model
- Authentication & profile information
- Role-based permissions
- Gamification points & badges

### Fee Model
- Fee types (tuition, hostel, library, etc.)
- Payment status & history
- Due dates & notifications

### Book Model
- Library book information
- QR code for easy identification
- Availability tracking

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_REFRESH_SECRET` | Refresh token secret | Required |
| `BCRYPT_ROUNDS` | Password hashing rounds | 12 |

### Security Features

- Helmet.js for security headers
- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Input validation with Joi
- Password hashing with bcrypt

## 📝 Logging

Winston logger with:
- Console output (development)
- File logging (`logs/error.log`, `logs/combined.log`)
- Different log levels (error, warn, info, debug)

## 🧪 Testing

```bash
npm test        # Run all tests
npm run test:watch  # Watch mode
```

## 🚀 Deployment

### Production Setup

1. **Set environment variables**
   ```bash
   NODE_ENV=production
   MONGODB_URI=your_production_mongodb_uri
   JWT_SECRET=your_production_jwt_secret
   ```

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Start production server**
   ```bash
   npm start
   ```

### Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.