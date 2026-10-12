import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { donationsAPI } from '../../services/api';
import {
  Package,
  PlusCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  ArrowRight,
  TrendingUp,
  Layers
} from 'lucide-react';

export const ProviderDashboard = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyDonations = async () => {
    try {
      const res = await donationsAPI.getAll({
        providerOrg: user?.organization?._id
      });
      if (res.data.success) {
        setDonations(res.data.donations || []);
      }
    } catch (err) {
      console.error('Failed to fetch provider donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDonations();
  }, [user]);

  const activeDonations = donations.filter((d) => ['available', 'matching'].includes(d.status));
  const acceptedDonations = donations.filter((d) => ['accepted', 'scheduled', 'picked_up'].includes(d.status));
  const completedDonations = donations.filter((d) => d.status === 'completed');
  const expiredDonations = donations.filter((d) => ['expired', 'cancelled'].includes(d.status));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-forest-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-300">
            Food Provider Portal
          </span>
          <h1 className="text-2xl font-extrabold">{user?.organization?.name || user?.name}</h1>
          <p className="text-xs text-slate-200">
            {user?.organization?.address || 'Ready to redistribute surplus edible food'}
          </p>
        </div>

        <Link
          to="/provider/donations/new"
          className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-900 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Donate Surplus Food</span>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Listings</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900">{donations.length}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Active & Matching</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-extrabold text-blue-600">{activeDonations.length}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Accepted / Transit</span>
            <Truck className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-extrabold text-amber-600">{acceptedDonations.length}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-extrabold text-emerald-600">{completedDonations.length}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Expired / Cancelled</span>
            <AlertCircle className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-2xl font-extrabold text-slate-600">{expiredDonations.length}</span>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Recent Surplus Donations</h2>
          <Link
            to="/provider/donations"
            className="text-xs text-emerald-600 hover:underline font-semibold flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading your listings...</div>
        ) : donations.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">No donations listed yet.</p>
            <Link
              to="/provider/donations/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Your First Donation</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {donations.slice(0, 5).map((d) => (
              <div key={d._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{d.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      d.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : d.status === 'accepted'
                        ? 'bg-blue-100 text-blue-800'
                        : d.status === 'matching'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {d.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{d.description}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-600">
                    <span className="font-semibold text-emerald-700">{d.quantity} {d.unit}</span>
                    <span>•</span>
                    <span>Deadline: {new Date(d.collectionDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/provider/donations/${d._id}`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
