import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { donationsAPI, matchesAPI } from '../../services/api';
import {
  Package,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  ShieldCheck,
  AlertCircle,
  Building,
  Key
} from 'lucide-react';

export const NgoAvailableDonationsPage = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [dietaryType, setDietaryType] = useState('');

  // Action status modal
  const [acceptResult, setAcceptResult] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const isVerified = user?.organization?.isVerified;

  const fetchAvailable = async () => {
    setLoading(true);
    try {
      const params = {
        status: 'available,matching'
      };
      if (category) params.category = category;
      if (dietaryType) params.dietaryType = dietaryType;
      if (search) params.search = search;

      const res = await donationsAPI.getAll(params);
      if (res.data.success) {
        setDonations(res.data.donations || []);
      }
    } catch (err) {
      console.error('Failed to load available donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailable();
  }, [category, dietaryType, search]);

  const handleAccept = async (donation) => {
    if (!isVerified) {
      alert('Your organization is pending verification and cannot accept donations yet.');
      return;
    }

    setActionLoading(true);
    setActionError('');

    try {
      // Find or create match response
      let matchId = donation.currentMatch?._id;
      if (!matchId) {
        // Trigger matching evaluation
        const matchRes = await donationsAPI.triggerMatching(donation._id);
        const matchFound = matchRes.data.matchResult?.matches?.find(
          (m) => m.recipientId === user.organization._id
        );
        if (matchFound) {
          matchId = matchFound.matchId;
        }
      }

      // Call respond API if matchId exists or respond directly
      if (matchId) {
        const res = await matchesAPI.respond(matchId, 'accept');
        if (res.data.success) {
          setAcceptResult({
            donation: res.data.donation,
            pickup: res.data.pickup,
            pin: res.data.verificationPin
          });
          fetchAvailable();
        }
      } else {
        // Direct accept fallback via match endpoint
        const res = await matchesAPI.respond(donation._id, 'accept');
        if (res.data.success) {
          setAcceptResult({
            donation: res.data.donation,
            pickup: res.data.pickup,
            pin: res.data.verificationPin
          });
          fetchAvailable();
        }
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Acceptance failed. Listing may have been claimed by another organization.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Available Surplus Food Feed</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time surplus food listings eligible for rescue and redistribution
        </p>
      </div>

      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Acceptance Success Modal with Verification PIN */}
      {acceptResult && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Donation Accepted Successfully!</h3>
              <p className="text-xs text-slate-600">
                A pickup has been scheduled for "{acceptResult.donation?.title}".
              </p>
            </div>

            {/* Secret PIN Box */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                <Key className="w-4 h-4 text-emerald-600" />
                <span>Your Cryptographic Handover PIN</span>
              </div>
              <div className="text-3xl font-mono font-extrabold text-emerald-800 tracking-widest py-1 bg-white rounded-lg border border-emerald-200">
                {acceptResult.pin}
              </div>
              <p className="text-[11px] text-emerald-700 leading-tight">
                Present this 6-digit PIN to the food provider or volunteer driver at pickup time to complete digital verification.
              </p>
            </div>

            <button
              onClick={() => setAcceptResult(null)}
              className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
            >
              Done & Continue
            </button>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search food by title, provider, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs flex-wrap">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="">All Categories</option>
            <option value="prepared_meals">Prepared Meals</option>
            <option value="bakery">Bakery</option>
            <option value="produce">Produce</option>
            <option value="dairy">Dairy</option>
            <option value="packaged">Packaged</option>
          </select>

          <select
            value={dietaryType}
            onChange={(e) => setDietaryType(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="">All Diets</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="non_vegetarian">Non-Vegetarian</option>
          </select>
        </div>
      </div>

      {/* Feed Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading available surplus donations...</div>
      ) : donations.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-2">
          <Package className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500">No surplus food available matching your filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {donations.map((d) => (
            <div
              key={d._id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{d.title}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex-shrink-0">
                    {d.quantity} {d.unit}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">{d.description}</p>

                <div className="space-y-1 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    <span>Provider: <strong>{d.providerOrg?.name || 'Commercial Kitchen'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{d.pickupAddress}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-700">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Collect by: {new Date(d.collectionDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                  <span className="capitalize">Storage: {d.storageConditions.replace('_', ' ')}</span>
                  <span>•</span>
                  <span className="capitalize">Diet: {d.dietaryType}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  Atomic concurrency protection enabled
                </span>

                <button
                  onClick={() => handleAccept(d)}
                  disabled={actionLoading || !isVerified}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept Donation</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
