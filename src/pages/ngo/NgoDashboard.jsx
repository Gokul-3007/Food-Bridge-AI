import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { donationsAPI, matchesAPI, pickupsAPI } from '../../services/api';
import {
  Package,
  Layers,
  Truck,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertTriangle,
  MapPin,
  TrendingUp
} from 'lucide-react';

export const NgoDashboard = () => {
  const { user } = useAuth();
  const [incomingOffers, setIncomingOffers] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [availableCount, setAvailableCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const org = user?.organization;
  const isVerified = org?.isVerified;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [offersRes, pickupsRes, donRes] = await Promise.all([
          matchesAPI.getAll({ status: 'offered' }),
          pickupsAPI.getAll(),
          donationsAPI.getAll({ status: 'available' })
        ]);

        if (offersRes.data.success) setIncomingOffers(offersRes.data.matches || []);
        if (pickupsRes.data.success) setPickups(pickupsRes.data.pickups || []);
        if (donRes.data.success) setAvailableCount(donRes.data.total || 0);
      } catch (err) {
        console.error('Failed to load NGO dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const maxCap = org?.maxCapacity || 250;
  const usedCap = org?.currentCapacityUsed || 0;
  const capacityPercent = Math.min(100, Math.round((usedCap / maxCap) * 100));

  return (
    <div className="space-y-6">
      {/* Verification Alert Banner if unverified */}
      {!isVerified && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-bold text-sm block">Account Verification Pending</span>
            Your organization ({org?.name}) has registered successfully but is awaiting administrator verification. During this review period, you can explore the live map and public feeds, but you cannot accept donation match offers until approved.
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <span className="text-xs uppercase font-bold tracking-wider text-blue-300">
            Recipient Organization Portal
          </span>
          <h1 className="text-2xl font-extrabold">{org?.name || user?.name}</h1>
          <p className="text-xs text-slate-200">
            {org?.address} • Service Radius: {org?.serviceAreaKm || 15} km
          </p>
        </div>

        <Link
          to="/ngo/available-donations"
          className="px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
        >
          <Package className="w-4 h-4" />
          <span>Browse Available Surplus</span>
        </Link>
      </div>

      {/* KPI Stats + Capacity Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Capacity Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Intake Capacity</span>
            <Building className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">{usedCap}</span>
            <span className="text-xs font-semibold text-slate-400">of {maxCap} max</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                capacityPercent > 80 ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${capacityPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Incoming Offers</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-extrabold text-amber-600">{incomingOffers.length}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Active Pickups</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-extrabold text-blue-600">{pickups.length}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Available Nearby</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-extrabold text-emerald-600">{availableCount}</span>
        </div>
      </div>

      {/* Incoming Match Offers Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Priority AI Match Offers</h2>
          </div>
          <Link
            to="/ngo/matches"
            className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Checking matching engine for offers...</div>
        ) : incomingOffers.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No pending offers at this moment. You will be notified when surplus matches your location and capacity.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {incomingOffers.map((m) => (
              <div key={m._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{m.donation?.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Score: {m.score}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Provider: <strong>{m.donation?.providerOrg?.name}</strong> • {m.geographicDistanceKm} km away
                  </p>
                  <p className="text-[11px] text-emerald-700 font-semibold">
                    {m.donation?.quantity} {m.donation?.unit} ({m.donation?.category.replace('_', ' ')})
                  </p>
                </div>

                <Link
                  to="/ngo/matches"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors self-start sm:self-auto"
                >
                  Review Offer
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
