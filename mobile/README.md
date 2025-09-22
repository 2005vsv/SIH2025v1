# 📱 Student Portal - Mobile App

React Native + Expo + TypeScript mobile application for the Student Portal.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your mobile device
- Backend API running

### Installation

1. **Navigate to mobile directory**
   ```bash
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Update `.env` file:
   ```env
   EXPO_PUBLIC_API_URL=http://your-local-ip:5000/api
   EXPO_PUBLIC_APP_NAME=Student Portal Mobile
   EXPO_PUBLIC_APP_VERSION=1.0.0
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Run on device**
   - Scan QR code with Expo Go app
   - Or use `npm run android` / `npm run ios`

## 📁 Project Structure

```
mobile/
├── assets/              # Static assets (images, icons)
├── src/
│   ├── components/      # Reusable React Native components
│   ├── screens/         # Screen components
│   │   ├── LoginScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── QRScannerScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── navigation/      # Navigation configuration
│   ├── services/        # API service functions
│   ├── contexts/        # React contexts
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── App.tsx              # Main App component
├── app.json             # Expo configuration
├── package.json
└── tsconfig.json
```

## ✨ Features

### 🔐 Authentication
- User login/register
- Biometric authentication (planned)
- Secure token storage

### 📱 Navigation
- Tab navigation for main features
- Stack navigation for detailed views
- Gesture-based navigation

### 🏠 Dashboard
- Overview of all modules
- Quick access to features
- Push notifications

### 📚 Library Features
- QR code scanner for books
- Book search and borrowing
- Digital library card

### 💰 Fees & Payments
- Fee overview
- Payment integration
- Transaction history

### 📊 Analytics
- Performance tracking
- Risk assessment
- Progress visualization

### 🔔 Notifications
- Push notifications
- In-app messaging
- Real-time updates

## 🛠️ Development

### Available Scripts

```bash
npm start            # Start Expo dev server
npm run android      # Run on Android device/emulator
npm run ios          # Run on iOS device/simulator
npm run web          # Run on web browser
npm run build        # Export for production
npm test             # Run tests
npm run lint         # ESLint check
```

### Technology Stack

- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **React Navigation** - Navigation library
- **Expo Camera** - Camera access
- **Expo Barcode Scanner** - QR code scanning
- **Expo Notifications** - Push notifications
- **Expo Secure Store** - Secure storage
- **Axios** - HTTP client

### Expo Modules Used

```json
{
  "expo-barcode-scanner": "QR code scanning",
  "expo-camera": "Camera access",
  "expo-notifications": "Push notifications",
  "expo-secure-store": "Secure storage",
  "expo-permissions": "Permission handling"
}
```

## 📱 Screens

### Login Screen
- Email/password authentication
- Forgot password functionality
- Biometric login option

### Dashboard Screen
- Module overview cards
- Quick stats
- Recent activity

### QR Scanner Screen
- Library book scanning
- Certificate verification
- Asset tracking

### Profile Screen
- User information
- Settings
- Logout option

## 🔧 Configuration

### Expo Configuration (app.json)

```json
{
  "expo": {
    "name": "Student Portal",
    "slug": "student-portal-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "platforms": ["ios", "android", "web"],
    "plugins": [
      "expo-barcode-scanner",
      "expo-notifications"
    ]
  }
}
```

### Environment Variables

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:5000/api
EXPO_PUBLIC_APP_NAME=Student Portal Mobile
EXPO_PUBLIC_APP_VERSION=1.0.0
```

## 📷 Camera & QR Code Features

### QR Code Scanner
- Library book identification
- Certificate verification
- Quick data entry

### Permissions
- Camera access for QR scanning
- Notification permissions
- Storage permissions

## 🔔 Push Notifications

### Setup
1. Register for push notifications
2. Handle notification permissions
3. Configure notification handlers

### Features
- Fee due reminders
- Exam notifications
- Library book due dates
- General announcements

## 🔒 Security

### Secure Storage
- JWT tokens stored securely
- Biometric authentication
- Encrypted sensitive data

### API Security
- Token-based authentication
- Request signing
- HTTPS enforcement

## 🧪 Testing

```bash
npm test                 # Run Jest tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
```

### Testing Tools
- Jest for unit testing
- React Native Testing Library
- Detox for E2E testing (planned)

## 🚀 Building & Deployment

### Development Build

```bash
npm run build
```

### Production Build with EAS

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android
npm run build:android

# Build for iOS
npm run build:ios
```

### App Store Deployment

```bash
# Submit to Google Play
npm run submit:android

# Submit to App Store
npm run submit:ios
```

## 📊 Performance

### Optimization
- Image optimization
- Bundle size optimization
- Lazy loading
- Memory management

### Monitoring
- Crash reporting
- Performance metrics
- User analytics

## 🔧 Development Tips

### Local Development
1. Use your local IP address for API_URL
2. Ensure backend server is accessible
3. Test on real devices when possible

### Debugging
- React Native Debugger
- Flipper integration
- Console logging
- Performance monitoring

## 🤝 Contributing

1. Follow React Native best practices
2. Test on both iOS and Android
3. Use TypeScript for type safety
4. Follow naming conventions

## 📋 Todo Features

- [ ] Biometric authentication
- [ ] Offline support
- [ ] Dark mode
- [ ] Multiple language support
- [ ] Advanced analytics
- [ ] Social features

## 📄 License

This project is licensed under the MIT License.