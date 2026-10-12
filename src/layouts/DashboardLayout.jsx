import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  MapPin,
  Bell,
  Truck
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user } = useAuth();

  const getMobileDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'provider': return '/provider/dashboard';
      case 'ngo': return '/ngo/dashboard';
      case 'volunteer': return '/volunteer/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full mb-16 md:mb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 px-2 py-1.5 flex justify-around items-center shadow-lg">
        <NavLink
          to={getMobileDashboardPath()}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 text-[11px] font-medium transition-colors ${
              isActive ? 'text-emerald-700 font-bold' : 'text-slate-500'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/map"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 text-[11px] font-medium transition-colors ${
              isActive ? 'text-emerald-700 font-bold' : 'text-slate-500'
            }`
          }
        >
          <MapPin className="w-5 h-5" />
          <span>Map</span>
        </NavLink>

        {user?.role === 'provider' && (
          <NavLink
            to="/provider/donations/new"
            className="flex flex-col items-center gap-1 p-2 text-[11px] font-medium text-emerald-700 font-bold"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center -mt-3 shadow-md">
              +
            </div>
            <span>Donate</span>
          </NavLink>
        )}

        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 text-[11px] font-medium transition-colors ${
              isActive ? 'text-emerald-700 font-bold' : 'text-slate-500'
            }`
          }
        >
          <Bell className="w-5 h-5" />
          <span>Alerts</span>
        </NavLink>
      </div>
    </div>
  );
};
