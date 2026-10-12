import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  Layers,
  Truck,
  History,
  MapPin,
  Bell,
  User,
  ShieldCheck,
  Building,
  BarChart3,
  Sliders,
  AlertTriangle,
  FileText
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const isNgoUnverified = user.role === 'ngo' && user.organization && !user.organization.isVerified;

  const getNavItems = () => {
    switch (user.role) {
      case 'provider':
        return [
          { name: 'Dashboard', path: '/provider/dashboard', icon: LayoutDashboard },
          { name: 'Donate Food', path: '/provider/donations/new', icon: PlusCircle, highlight: true },
          { name: 'My Listings', path: '/provider/donations', icon: Package },
          { name: 'Recipient Matches', path: '/provider/matches', icon: Layers },
          { name: 'Pickups', path: '/provider/pickups', icon: Truck },
          { name: 'Donation History', path: '/provider/history', icon: History }
        ];
      case 'ngo':
        return [
          { name: 'Dashboard', path: '/ngo/dashboard', icon: LayoutDashboard },
          { name: 'Available Food', path: '/ngo/available-donations', icon: Package },
          { name: 'Match Offers', path: '/ngo/matches', icon: Layers },
          { name: 'Scheduled Pickups', path: '/ngo/pickups', icon: Truck },
          { name: 'Collection History', path: '/ngo/history', icon: History },
          { name: 'Capacity & Profile', path: '/ngo/profile', icon: Building }
        ];
      case 'volunteer':
        return [
          { name: 'Dashboard', path: '/volunteer/dashboard', icon: LayoutDashboard },
          { name: 'Assignments', path: '/volunteer/assignments', icon: Truck }
        ];
      case 'admin':
        return [
          { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Verify Organizations', path: '/admin/organizations', icon: ShieldCheck },
          { name: 'All Donations', path: '/admin/donations', icon: Package },
          { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
          { name: 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
          { name: 'Matching Settings', path: '/admin/settings', icon: Sliders }
        ];
      default:
        return [];
    }
  };

  const sharedNavItems = [
    { name: 'Live Map', path: '/map', icon: MapPin },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'My Profile', path: '/profile', icon: User }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Unverified NGO Notice */}
        {isNgoUnverified && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-snug">
              <span className="font-semibold block">Pending Verification</span>
              Your NGO is under review. An administrator must verify your profile before you can receive donations.
            </div>
          </div>
        )}

        {/* Role Specific Section */}
        <div>
          <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Operations
          </span>
          <nav className="space-y-1">
            {getNavItems().map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? item.highlight
                          ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                          : 'bg-emerald-50 text-emerald-800 font-semibold border-l-4 border-emerald-600'
                        : item.highlight
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Shared Section */}
        <div>
          <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Platform Tools
          </span>
          <nav className="space-y-1">
            {sharedNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 font-semibold border-l-4 border-emerald-600'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Organization Badge Footer */}
      {user.organization && (
        <div className="pt-4 border-t border-slate-100 mt-6">
          <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Active Organization
            </span>
            <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">
              {user.organization.name}
            </p>
            <span className="text-[10px] text-slate-500 capitalize">
              {user.organization.type?.replace('_', ' ')}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
};
