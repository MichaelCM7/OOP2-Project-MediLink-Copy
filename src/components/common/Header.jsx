import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  User, 
  Heart,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES, ROUTES } from '../../utils/constants';
import { getInitials } from '../../utils/helpers';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  const { user, isAuthenticated, logout, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Navigation links based on user role
  const getNavigationLinks = () => {
    if (!isAuthenticated) {
      return [
        { label: 'Home', href: ROUTES.HOME },
        { label: 'About', href: ROUTES.ABOUT },
        { label: 'Contact', href: ROUTES.CONTACT }
      ];
    }

    switch (role) {
      case USER_ROLES.PATIENT:
        return [
          { label: 'Dashboard', href: ROUTES.USER_DASHBOARD },
          { label: 'Book Appointment', href: ROUTES.BOOK_APPOINTMENT },
          { label: 'Find Doctors', href: ROUTES.SEARCH_DOCTORS },
          { label: 'Medical History', href: ROUTES.MEDICAL_HISTORY }
        ];

      case USER_ROLES.DOCTOR:
        return [
          { label: 'Dashboard', href: ROUTES.DOCTOR_DASHBOARD },
          { label: 'Appointments', href: '/doctor/appointments' },
          { label: 'Patients', href: '/doctor/patients' },
          { label: 'Schedule', href: '/doctor/schedule' }
        ];

      case USER_ROLES.ADMIN:
        return [
          { label: 'Dashboard', href: ROUTES.ADMIN_DASHBOARD },
          { label: 'Staff', href: '/admin/staff' },
          { label: 'Analytics', href: '/admin/analytics' },
          { label: 'Settings', href: '/admin/settings' }
        ];

      default:
        return [];
    }
  };

  const navigationLinks = getNavigationLinks();

  return (
    <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={ROUTES.HOME} className="flex items-center space-x-2">
              <div className="bg-primary-blue rounded-lg p-2">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Medi-Link</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === link.href
                    ? 'text-primary-blue bg-primary-blue-lightest'
                    : 'text-gray-700 hover:text-primary-blue hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              /* Profile dropdown */
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-primary-blue hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-blue text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {user?.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      getInitials(user?.name || user?.firstName + ' ' + user?.lastName || 'User')
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {user?.name || user?.firstName || 'User'}
                  </span>
                </button>

                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.name || user?.firstName + ' ' + user?.lastName}
                      </p>
                      <p className="text-xs text-gray-600">{user?.email}</p>
                    </div>
                    
                    <Link
                      to={role === USER_ROLES.PATIENT ? ROUTES.USER_PROFILE : 
                          role === USER_ROLES.DOCTOR ? ROUTES.DOCTOR_PROFILE : 
                          ROUTES.ADMIN_PROFILE}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Login/Register buttons for non-authenticated users */
              <div className="flex items-center space-x-2">
                <Link
                  to={ROUTES.LOGIN}
                  className="btn btn-outline btn-sm"
                >
                  Login
                </Link>
                <Link
                  to={ROUTES.SIGNUP}
                  className="btn btn-primary btn-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-gray-600 hover:text-primary-blue hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="space-y-2">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === link.href
                      ? 'text-primary-blue bg-primary-blue-lightest'
                      : 'text-gray-700 hover:text-primary-blue hover:bg-gray-100'
                  }`}
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </Link>
              ))}
              
              {!isAuthenticated && (
                <div className="pt-4 space-y-2">
                  <Link
                    to={ROUTES.LOGIN}
                    className="block w-full btn btn-outline btn-sm text-center"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to={ROUTES.SIGNUP}
                    className="block w-full btn btn-primary btn-sm text-center"
                    onClick={closeMobileMenu}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;