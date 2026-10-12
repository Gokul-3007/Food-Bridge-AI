import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Bell,
  MapPin,
  User,
  LogOut,
  Shield,
  HeartHandshake,
  CheckCircle,
  Menu,
  X
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'provider': return '/provider/dashboard';
      case 'ngo': return '/ngo/dashboard';
      case 'volunteer': return '/volunteer/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/';
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'provider':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Food Provider</span>;
      case 'ngo':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Recipient NGO</span>;
      case 'volunteer':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Volunteer</span>;
      case 'admin':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">Administrator</span>;
      default:
        return null;
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-forest-800 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                  FoodBridge <span className="text-emerald-600 font-extrabold">AI</span>
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">
                  Surplus Food Rescue
                </span>
              </div>
            </Link>

            {/* Desktop Public Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/map" className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Live Map
              </Link>
              <Link to="/how-it-works" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
                How It Works
              </Link>
              <Link to="/food-safety" className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
                <Shield className="w-4 h-4 text-emerald-600" />
                Food Safety
              </Link>
              <Link to="/about" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
                About
              </Link>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Dashboard Shortcut */}
                <Link
                  to={getDashboardPath()}
                  className="hidden sm:inline-flex items-center px-3.5 py-1.5 text-sm font-medium rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                >
                  Dashboard
                </Link>

                {/* Notifications Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative focus:outline-none transition-colors"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-soft">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-800">Notifications</span>
                        <Link
                          to="/notifications"
                          onClick={() => setShowNotifications(false)}
                          className="text-xs text-emerald-600 hover:underline font-medium"
                        >
                          View all
                        </Link>
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-xs text-slate-500">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => {
                                markAsRead(notif._id);
                                setShowNotifications(false);
                                navigate('/notifications');
                              }}
                              className={`p-3 text-left hover:bg-slate-50 cursor-pointer transition-colors ${
                                !notif.isRead ? 'bg-emerald-50/50' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-semibold text-slate-800">{notif.title}</p>
                                {!notif.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0 mt-1"></span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 mt-1 line-clamp-2">{notif.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Info / Role */}
                <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="flex flex-col text-right">
                    <span className="text-sm font-semibold text-slate-800 leading-tight">
                      {user.name}
                    </span>
                    <div className="mt-0.5">{getRoleBadge(user.role)}</div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-emerald-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm hover:shadow transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <Link
            to="/map"
            onClick={() => setShowMobileMenu(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <MapPin className="w-4 h-4 text-emerald-600" />
            Live Food Rescue Map
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setShowMobileMenu(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100"
          >
            How It Works
          </Link>
          <Link
            to="/food-safety"
            onClick={() => setShowMobileMenu(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100"
          >
            Food Safety Guidelines
          </Link>
          <Link
            to="/about"
            onClick={() => setShowMobileMenu(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100"
          >
            About Us
          </Link>

          {isAuthenticated ? (
            <Link
              to={getDashboardPath()}
              onClick={() => setShowMobileMenu(false)}
              className="block px-3 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-lg"
            >
              Go to Dashboard
            </Link>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setShowMobileMenu(false)}
                className="w-full text-center px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg text-slate-700"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setShowMobileMenu(false)}
                className="w-full text-center px-4 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg"
              >
                Join FoodBridge AI
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
