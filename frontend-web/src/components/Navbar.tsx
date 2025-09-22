import {
    Award,
    Bell,
    BookOpen,
    Building,
    Calendar,
    ChevronDown,
    DollarSign,
    FileText,
    GraduationCap,
    Home,
    LogOut,
    Menu,
    Moon,
    Settings,
    Sun,
    Trophy,
    User,
    Users,
    X
} from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const adminNavigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Fee Management', href: '/admin/fees', icon: DollarSign },
    { name: 'Library Management', href: '/admin/library', icon: BookOpen },
    { name: 'Academic Management', href: '/admin/academics', icon: GraduationCap },
    { name: 'Placement Management', href: '/admin/placements', icon: Award },
    { name: 'Hostel Management', href: '/admin/hostel', icon: Building },
    { name: 'Notification Management', href: '/admin/notifications', icon: Bell },
    { name: 'System Settings', href: '/admin/system', icon: Settings },
  ];

  const studentNavigation = [
    { name: 'Dashboard', href: '/student/dashboard', icon: Home },
    { name: 'Academics', href: '/student/academics', icon: GraduationCap },
    { name: 'Fees', href: '/student/fees', icon: DollarSign },
    { name: 'Library', href: '/student/library', icon: BookOpen },
    { name: 'Hostel', href: '/student/hostel', icon: Building },
    { name: 'Placements', href: '/student/placements', icon: Award },
    { name: 'Certificates', href: '/student/certificates', icon: FileText },
    { name: 'Notifications', href: '/student/notifications', icon: Bell },
  ];

  const facultyNavigation = [
    { name: 'Dashboard', href: '/faculty/dashboard', icon: Home },
    { name: 'Courses', href: '/faculty/courses', icon: BookOpen },
    { name: 'Attendance', href: '/faculty/attendance', icon: Calendar },
    { name: 'Exams', href: '/faculty/exams', icon: Trophy },
    { name: 'Grades', href: '/faculty/grades', icon: GraduationCap },
    { name: 'Notifications', href: '/faculty/notifications', icon: Bell },
  ];

  const getNavigationByRole = () => {
    switch (user?.role) {
      case 'admin':
        return adminNavigation;
      case 'faculty':
        return facultyNavigation;
      default:
        return studentNavigation;
    }
  };

  const navigation = getNavigationByRole();
  const dashboardPath = user?.role === 'admin' ? '/admin/dashboard' : 
                       user?.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={dashboardPath} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SP</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {user?.role === 'admin' ? 'Admin Portal' : 
                 user?.role === 'faculty' ? 'Faculty Portal' : 'Student Portal'}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navigation.slice(0, 5).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {navigation.length > 5 && (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span>More</span>
                  <ChevronDown size={16} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      {navigation.slice(5).map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setIsDropdownOpen(false)}
                            className={`flex items-center space-x-2 px-4 py-2 text-sm transition-colors ${
                              isActive(item.href)
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <Icon size={16} />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role}
                </p>
              </div>
              <Link
                to="/profile"
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="View Profile"
              >
                <User size={18} />
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={18} />
                  <span>Profile</span>
                </Link>

                <button
                  onClick={toggleTheme}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;