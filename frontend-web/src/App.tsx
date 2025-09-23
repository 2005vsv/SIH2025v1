import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Admin Pages
import AdminPanel from './pages/AdminPanel';
import UserManagement from './pages/admin/UserManagement';
import FeesManagement from './pages/admin/FeesManagement';
import LibraryManagement from './pages/admin/LibraryManagement';
import SystemConfig from './pages/admin/SystemConfig';
import HostelManagement from './pages/admin/HostelManagement';
import AcademicManagement from './pages/admin/AcademicManagement';
import PlacementManagement from './pages/admin/PlacementManagement';
import NotificationManagement from './pages/admin/NotificationManagement';

// Student Pages
import StudentDashboard from './pages/student/Dashboard.tsx';
import StudentAcademics from './pages/student/Academics_Enhanced';
import StudentFees from './pages/student/Fees.tsx';
import StudentLibrary from './pages/student/Library_Enhanced';
import StudentHostel from './pages/student/Hostel_Enhanced';
import StudentPlacements from './pages/student/Placements_Enhanced';
import StudentCertificates from './pages/student/Certificates_Enhanced';
import StudentGamification from './pages/student/Gamification_Enhanced';
import StudentChatbot from './pages/student/Chatbot_Enhanced';
import StudentNotifications from './pages/student/Notifications.tsx';

// Shared Pages
import Login from './pages/Login';
import Profile from './pages/Profile';
import Register from './pages/Register';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" />;
    } else {
      return <Navigate to="/student/dashboard" />;
    }
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {isAuthenticated && <Navbar />}
      <main className={isAuthenticated ? 'pt-16' : ''}>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <Register /> : <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} />} 
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/fees"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <FeesManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/library"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <LibraryManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/system"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SystemConfig />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hostel"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <HostelManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/academics"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AcademicManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/placements"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PlacementManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <NotificationManagement />
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/academics"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentAcademics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/fees"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentFees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/library"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLibrary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/hostel"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentHostel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/placements"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentPlacements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/certificates"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentCertificates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/gamification"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentGamification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/chatbot"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentChatbot />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/notifications"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentNotifications />
              </ProtectedRoute>
            }
          />

          {/* Shared Routes (accessible by all authenticated users) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Legacy Routes - Redirect based on role */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                {user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/student/dashboard" />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/fees"
            element={
              <ProtectedRoute>
                {user?.role === 'admin' ? <Navigate to="/admin/fees" /> : <Navigate to="/student/fees" />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                {user?.role === 'admin' ? <Navigate to="/admin/library" /> : <Navigate to="/student/library" />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/grades"
            element={
              <ProtectedRoute>
                {user?.role === 'admin' ? <Navigate to="/admin/academics" /> : <Navigate to="/student/academics" />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/hostel"
            element={
              <ProtectedRoute>
                {user?.role === 'admin' ? <Navigate to="/admin/hostel" /> : <Navigate to="/student/hostel" />}
              </ProtectedRoute>
            }
          />

          {/* Default Routes */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/student/dashboard" />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
        </Routes>
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'white',
            color: 'black',
          },
          success: {
            style: {
              background: 'green',
              color: 'white',
            },
          },
          error: {
            style: {
              background: 'red',
              color: 'white',
            },
          },
        }}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;