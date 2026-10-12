import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { matchesAPI } from '../../services/api';
import {
  Layers,
  CheckCircle2,
  XCircle,
  Building,
  MapPin,
  Clock,
  Sparkles,
  Key,
  AlertCircle
} from 'lucide-react';

export const NgoMatchesPage = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Success Pin Modal
  const [acceptedPin, setAcceptedPin] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isVerified = user?.organization?.isVerified;

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await matchesAPI.getAll();
      if (res.data.success) {
        setMatches(res.data.matches || []);
      }
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [user]);

  const handleRespond = async (matchId, action, reason = '') => {
    if (!isVerified) {
      alert('Your organization must be verified by an administrator to respond to match offers.');
      return;
    }

    setActionLoading(true);
    setErrorMsg('');

    try {
      const res = await matchesAPI.respond(matchId, action, reason);
      if (res.data.success) {
        if (action === 'accept') {
          setAcceptedPin(res.data.verificationPin);
        } else {
          alert('Offer declined. The matching engine has re-routed the donation to the next eligible recipient.');
        }
        fetchMatches();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || `Failed to ${action} offer.`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Priority AI Match Offers</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Surplus food matched specifically to your organization's capacity, location, and dietary profile
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Secret PIN Modal */}
      {acceptedPin && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Key className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Offer Accepted!</h3>
              <p className="text-xs text-slate-600">
                Your cryptographic handover PIN is ready:
              </p>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                Verification PIN
              </span>
              <div className="text-3xl font-mono font-extrabold text-emerald-800 tracking-widest py-1 bg-white rounded-lg border border-emerald-200">
                {acceptedPin}
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">
                Provide this PIN to the driver or food provider during pickup.
              </p>
            </div>

            <button
              onClick={() => setAcceptedPin(null)}
              className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
            >
              Close & View Pickups
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Evaluating match offers...</div>
      ) : matches.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-2">
          <Layers className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500">No match offers available right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((m) => (
            <div
              key={m._id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{m.donation?.title}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {m.donation?.quantity} {m.donation?.unit}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    <span>Provider: <strong>{m.donation?.providerOrg?.name}</strong></span>
                    <span>•</span>
                    <span>{m.geographicDistanceKm} km away</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Match Score</span>
                    <span className="text-xl font-extrabold text-emerald-700">{m.score}%</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    m.status === 'accepted'
                      ? 'bg-emerald-100 text-emerald-800'
                      : m.status === 'offered'
                      ? 'bg-blue-100 text-blue-800'
                      : m.status === 'declined'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {m.status}
                  </span>
                </div>
              </div>

              {/* Explainable Score Breakdown Grid */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Proximity (40%)</span>
                  <span className="font-extrabold text-slate-800">{m.scoreBreakdown?.proximityScore || 90}/100</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Compatibility (25%)</span>
                  <span className="font-extrabold text-slate-800">{m.scoreBreakdown?.compatibilityScore || 100}/100</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Capacity (20%)</span>
                  <span className="font-extrabold text-slate-800">{m.scoreBreakdown?.capacityScore || 95}/100</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Availability (15%)</span>
                  <span className="font-extrabold text-slate-800">{m.scoreBreakdown?.availabilityScore || 95}/100</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 font-medium">
                {m.eligibilityExplanation}
              </p>

              {/* Action Buttons */}
              {m.status === 'offered' && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleRespond(m._id, 'decline', 'Declined by recipient organization')}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Decline & Re-route</span>
                  </button>

                  <button
                    onClick={() => handleRespond(m._id, 'accept')}
                    disabled={actionLoading || !isVerified}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept Offer</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
