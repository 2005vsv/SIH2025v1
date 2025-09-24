import { Toaster } from 'react-hot-toast';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Admin Pages
import AdminPanel from './pages/AdminPanel';
import AcademicManagement from './pages/admin/AcademicManagement';
import FeesManagement from './pages/admin/FeesManagement';
import HostelManagement from './pages/admin/HostelManagement';
import LibraryManagement from './pages/admin/LibraryManagement';
import SystemConfig from './pages/admin/SystemConfig';
import UserManagement from './pages/admin/UserManagement';
import AdminNotificationManagement from './pages/admin/NotificationManagement';
import AdminPlacementManagement from './pages/admin/PlacementManagement';

// Student Pages
import Academics from './pages/student/Academics_Enhanced';
import Certificates from './pages/student/Certificates_Enhanced';
import Dashboard from './pages/student/Dashboard';
import Notifications from './pages/student/Notifications';
import Placements from './pages/student/Placements_Enhanced';
import StudentHostel from './pages/student/Hostel_Enhanced';
// Shared Pages
import Fees from './pages/Fees';
import Grades from './pages/Grades';
import Hostel from './pages/Hostel';
import Library from './pages/Library';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Register from './pages/Register';

// Route Protection Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Admin Route Protection
const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      {children}
    </ProtectedRoute>
  );
};

// Student Route Protection  
const StudentRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      {children}
    </ProtectedRoute>
  );
};

// Generic Protected Route (any authenticated user)
const AuthRoute = ({ children }) => {
  return <ProtectedRoute>{children}</ProtectedRoute>;
};

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {isAuthenticated && <Navbar />}
      <div className={isAuthenticated ? "pt-16" : ""}>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />} 
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />
          {/* Student More Section Routes */}
          <Route
            path="/placements"
            element={
              <StudentRoute>
                <Placements />
              </StudentRoute>
            }
          />
          <Route
            path="/certificates"
            element={
              <StudentRoute>
                <Certificates />
              </StudentRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <StudentRoute>
                <Notifications />
              </StudentRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <UserManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/fees"
            element={
              <AdminRoute>
                <FeesManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/library"
            element={
              <AdminRoute>
                <LibraryManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/hostel"
            element={
              <AdminRoute>
                <HostelManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/academics"
            element={
              <AdminRoute>
                <AcademicManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/placements"
            element={
              <AdminRoute>
                <AdminPlacementManagement/>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <AdminRoute>
                 <AdminNotificationManagement/>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/system"
            element={
              <AdminRoute>
                <SystemConfig />
              </AdminRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/dashboard"
            element={
              <AuthRoute>
                {user?.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <Dashboard />}
              </AuthRoute>
            }
          />
          <Route
            path="/academics"
            element={
              <StudentRoute>
                <Academics />
              </StudentRoute>
            }
          />

          {/* Shared Protected Routes */}
          <Route
            path="/profile"
            element={
              <AuthRoute>
                <Profile />
              </AuthRoute>
            }
          />
          <Route
            path="/fees"
            element={
              <AuthRoute>
                <Fees />
              </AuthRoute>
            }
          />
          <Route
            path="/grades"
            element={
              <StudentRoute>
                <Grades />
              </StudentRoute>
            }
          />
          <Route
            path="/library"
            element={
              <AuthRoute>
                <Library />
              </AuthRoute>
            }
          />
          <Route
            path="/hostel"
            element={
              <StudentRoute>
                <Hostel />
              </StudentRoute>
            }
          />

          {/* Default Routes */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          
          {/* Catch all route */}
          <Route
            path="*"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: 'green',
                  secondary: 'black',
                },
              },
            }}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

