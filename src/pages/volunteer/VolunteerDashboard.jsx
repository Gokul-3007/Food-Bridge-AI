import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { pickupsAPI, handoverAPI } from '../../services/api';
import { Truck, MapPin, Clock, CheckCircle2, Navigation, Key, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [myPickups, setMyPickups] = useState([]);
  const [availablePickups, setAvailablePickups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Handover Verification modal
  const [activeVerify, setActiveVerify] = useState(null);
  const [verifyPin, setVerifyPin] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState('');

  const fetchPickups = async () => {
    try {
      const [myRes, availRes] = await Promise.all([
        pickupsAPI.getAll(),
        pickupsAPI.getAll({ availableForVolunteers: 'true' })
      ]);

      if (myRes.data.success) setMyPickups(myRes.data.pickups || []);
      if (availRes.data.success) setAvailablePickups(availRes.data.pickups || []);
    } catch (err) {
      console.error('Failed to load volunteer deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, [user]);

  const handleClaim = async (pickupId) => {
    try {
      const res = await pickupsAPI.assignVolunteer(pickupId);
      if (res.data.success) {
        alert('Route claimed! You are now assigned to this food delivery.');
        fetchPickups();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to claim delivery route.');
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setVerifyLoading(true);
    setVerifyError('');
    setVerifySuccess('');

    try {
      const res = await handoverAPI.verify(activeVerify._id, verifyPin);
      if (res.data.success) {
        setVerifySuccess('Handover verified! Food rescue successfully delivered.');
        setTimeout(() => {
          setActiveVerify(null);
          setVerifyPin('');
          setVerifySuccess('');
          fetchPickups();
        }, 1800);
      }
    } catch (err) {
      setVerifyError(err.response?.data?.message || 'Incorrect verification PIN.');
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 rounded-2xl text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-purple-300">Volunteer Driver Portal</span>
          <h1 className="text-2xl font-extrabold">{user?.name}</h1>
          <p className="text-xs text-slate-200 mt-0.5">
            Thank you for bridging commercial surplus to community tables
          </p>
        </div>

        <Link
          to="/map"
          className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Navigation className="w-4 h-4" />
          <span>Open Live Navigation Map</span>
        </Link>
      </div>

      {/* Verification Modal */}
      {activeVerify && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mx-auto">
              <Key className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Verify Recipient Delivery</h3>
              <p className="text-xs text-slate-500">
                Enter the 6-digit PIN code provided by {activeVerify.recipientOrg?.name}
              </p>
            </div>

            {verifyError && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{verifyError}</span>
              </div>
            )}

            {verifySuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{verifySuccess}</span>
              </div>
            )}

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 text-center mb-1">
                  Recipient's 6-Digit PIN
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="e.g. 742918"
                  value={verifyPin}
                  onChange={(e) => setVerifyPin(e.target.value)}
                  className="w-full text-center text-xl font-mono tracking-widest py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveVerify(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyLoading || verifyPin.length < 6}
                  className="px-4 py-1.5 text-xs bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {verifyLoading ? 'Verifying...' : 'Complete Delivery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* My Active Assigned Deliveries */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-purple-600" />
            <span>My Active Assignments ({myPickups.length})</span>
          </h2>
        </div>

        {myPickups.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            You do not have any claimed deliveries currently. Browse available assignments below.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myPickups.map((p) => (
              <div key={p._id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{p.donation?.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 uppercase">
                      {p.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span>Origin: <strong>{p.pickupAddress}</strong></span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Destination: <strong>{p.destinationAddress}</strong></span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to="/map"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Map Route</span>
                  </Link>

                  {p.status !== 'handover_verified' ? (
                    <button
                      onClick={() => setActiveVerify(p)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Verify Handover PIN</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Completed</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Pickups Awaiting Drivers */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-0">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">
            Available Deliveries Needing Volunteer Drivers ({availablePickups.length})
          </h2>
        </div>

        {availablePickups.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No unclaimed pickups in queue right now.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {availablePickups.map((p) => (
              <div key={p._id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-900">{p.donation?.title}</span>
                  <p className="text-xs text-slate-500">
                    From: {p.pickupAddress} ➔ To: {p.destinationAddress}
                  </p>
                </div>

                <button
                  onClick={() => handleClaim(p._id)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  Claim Route
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
