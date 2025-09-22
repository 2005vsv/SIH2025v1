# 🌐 Student Portal - Frontend Web

React + Vite + TypeScript + TailwindCSS frontend for the Student Portal application.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Backend API running on http://localhost:5000

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Update `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_NAME=Student Portal
   VITE_APP_VERSION=1.0.0
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The application will be available at http://localhost:3000

## 📁 Project Structure

```
frontend-web/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable React components
│   │   ├── Navbar.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   ├── contexts/        # React contexts
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── pages/           # Page components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Profile.tsx
│   │   └── AdminPanel.tsx
│   ├── services/        # API service functions
│   │   ├── api.ts
│   │   └── index.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main App component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## ✨ Features

### 🔐 Authentication
- User login/register
- JWT token management
- Automatic token refresh
- Protected routes

### 🎨 UI/UX
- Responsive design (mobile-first)
- Dark/light mode toggle
- Smooth animations with Framer Motion
- Modern UI with TailwindCSS
- Loading states and error handling

### 📱 Pages & Components

#### Login/Register
- Form validation
- Error handling
- Demo account credentials display

#### Dashboard
- Overview cards for all modules
- Quick stats and notifications
- Responsive grid layout

#### Profile
- User information display
- Profile editing
- Gamification stats

#### Admin Panel
- Administrative functions
- User management
- System settings

### 🎯 Modules

#### Fees Management
- View fee dues
- Payment processing
- Payment history

#### Library System
- Book search and browsing
- Borrowing history
- QR code integration

#### Exam Management
- Exam schedules
- Results viewing
- Timetable display

#### Placements
- Job listings
- Application management
- Resume upload

#### Gamification
- Points and badges
- Leaderboard
- Achievement tracking

#### Analytics
- Risk score display
- Progress tracking
- Data visualization

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # ESLint check
npm run lint:fix     # Fix ESLint errors
```

### Technology Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **Lucide React** - Icon library

### Code Style

- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Functional components with hooks

## 🎨 Styling

### TailwindCSS Configuration

Custom theme with:
- Primary color palette (blue variants)
- Dark mode support
- Custom animations
- Responsive breakpoints

### Component Classes

```css
.btn           # Base button styles
.btn-primary   # Primary button
.btn-secondary # Secondary button
.card          # Card container
.input         # Form input
.label         # Form label
```

### Dark Mode

Implemented using TailwindCSS `dark:` variants and React context for state management.

## 🔄 State Management

### React Context

- **AuthContext** - User authentication state
- **ThemeContext** - Dark/light mode toggle

### Local Storage

- User session data
- Theme preferences
- JWT tokens

## 🌐 API Integration

### Service Layer

Centralized API calls in `src/services/`:
- Authentication services
- Feature-specific services
- Error handling
- Token management

### HTTP Client (Axios)

- Request/response interceptors
- Automatic token attachment
- Error handling
- Base URL configuration

## 📱 Responsive Design

Mobile-first approach with breakpoints:
- `sm:` 640px and up
- `md:` 768px and up
- `lg:` 1024px and up
- `xl:` 1280px and up

## 🧪 Testing

```bash
npm test                 # Run tests
npm run test:ui         # Run tests with UI
npm run coverage        # Generate coverage report
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Build the project
npm run build

# Deploy dist folder to Netlify
```

### Environment Variables for Production

```env
VITE_API_URL=https://your-api-domain.com/api
VITE_APP_NAME=Student Portal
VITE_APP_VERSION=1.0.0
```

## 🔧 Configuration

### Vite Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})
```

### TypeScript Configuration

Strict mode enabled with path mapping for clean imports.

## 🤝 Contributing

1. Follow the existing code style
2. Write meaningful commit messages
3. Add tests for new features
4. Update documentation as needed

## 📄 License

This project is licensed under the MIT License.