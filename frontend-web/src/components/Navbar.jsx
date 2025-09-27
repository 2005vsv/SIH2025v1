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
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';


const Navbar = () => {
  const navigate=useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const location = useLocation();

  const handleLogout = () => {
  logout();
  navigate('/login');
  };

  const isActive = (path) => {
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
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Academics', href: '/academics', icon: GraduationCap },
    { name: 'Fees', href: '/fees', icon: DollarSign },
    { name: 'Library', href: '/library', icon: BookOpen },
    { name: 'Hostel', href: '/hostel', icon: Building },
    { name: 'Placements', href: '/placements', icon: Award },
    { name: 'Certificates', href: '/certificates', icon: FileText },
    { name: 'Notifications', href: '/notifications', icon: Bell },
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
                       user?.role === 'faculty' ? '/faculty/dashboard' : '/dashboard';

  return (
  <nav className="bg-white dark:bg-gray-900 shadow px-4 py-2 flex items-center justify-between relative z-20">
      {/* Logo and portal name */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">SP</span>
        </div>
        <div className="text-gray-700 dark:text-gray-300">
          {user?.role === 'admin' ? 'Admin Portal' : 
           user?.role === 'faculty' ? 'Faculty Portal' : 'Student Portal'}
        </div>
      </div>

      {/* Desktop Navigation */}
  <div className="hidden md:flex items-center space-x-2">
        {navigation.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ` +
                (isActive
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700')
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}

        {navigation.length > 5 && (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span>More</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <button onClick={()=>navigate('/student/change-password')}>change password</button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-30">
                {navigation.slice(5).map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsDropdownOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center space-x-2 px-4 py-2 text-sm transition-colors ` +
                        (isActive
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700')
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
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
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User Menu */}
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-700 dark:text-gray-300">{user?.name}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</span>
        </div>
        <Link
          to="/profile"
          className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="View Profile"
        >
          <User className="w-5 h-5" />
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-1 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Mobile menu button */}
  <div className="md:hidden flex items-center">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-900 shadow-md z-40 md:hidden">
          <div className="flex flex-col py-2">
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
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <Link
              to="/profile"
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;