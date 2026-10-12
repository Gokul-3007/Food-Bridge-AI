import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { pickupsAPI, handoverAPI } from '../../services/api';
import { Truck, Clock, CheckCircle2, Key, MapPin, User, AlertCircle } from 'lucide-react';

export const ProviderPickupsPage = () => {
  const { user } = useAuth();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Verification PIN modal
  const [activePickupForVerify, setActivePickupForVerify] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState('');
  const [verifyError, setVerifyError] = useState('');

  const fetchPickups = async () => {
    try {
      const res = await pickupsAPI.getAll();
      if (res.data.success) {
        setPickups(res.data.pickups || []);
      }
    } catch (err) {
      console.error('Failed to fetch pickups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, [user]);

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setVerifyLoading(true);
    setVerifyError('');
    setVerifyMessage('');

    try {
      const res = await handoverAPI.verify(activePickupForVerify._id, verificationCode);
      if (res.data.success) {
        setVerifyMessage('Handover verified successfully! Donation marked as completed.');
        setTimeout(() => {
          setActivePickupForVerify(null);
          setVerificationCode('');
          setVerifyMessage('');
          fetchPickups();
        }, 1800);
      }
    } catch (err) {
      setVerifyError(err.response?.data?.message || 'Verification failed. Please check the 6-digit code.');
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Scheduled Pickups & Handover</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Track volunteer arrivals and verify recipient collection codes
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading pickups...</div>
      ) : pickups.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-2">
          <Truck className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500">No scheduled pickups at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pickups.map((p) => (
            <div
              key={p._id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{p.donation?.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    p.status === 'handover_verified'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {p.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Recipient Org: <strong>{p.recipientOrg?.name}</strong></span>
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Destination: {p.destinationAddress}</span>
                  </p>
                </div>

                {p.volunteer ? (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-800 rounded-lg text-xs font-medium border border-purple-200">
                    <User className="w-3.5 h-3.5" />
                    <span>Assigned Volunteer: {p.volunteer.name} ({p.volunteer.phone})</span>
                  </div>
                ) : (
                  <span className="text-xs text-amber-600 font-medium italic block">
                    Awaiting volunteer driver assignment or direct recipient pickup
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {p.status !== 'handover_verified' ? (
                  <button
                    onClick={() => {
                      setActivePickupForVerify(p);
                      setVerificationCode('');
                      setVerifyError('');
                      setVerifyMessage('');
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Key className="w-4 h-4" />
                    <span>Verify Handover PIN</span>
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                    Handover Verified
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Verify Modal */}
      {activePickupForVerify && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Key className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Verify Recipient PIN</h3>
            </div>

            <p className="text-xs text-slate-500">
              Enter the 6-digit secure PIN presented by the authorized recipient driver for "{activePickupForVerify.donation?.title}".
            </p>

            {verifyError && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{verifyError}</span>
              </div>
            )}

            {verifyMessage && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{verifyMessage}</span>
              </div>
            )}

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 text-center">
                  6-Digit Verification PIN
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="e.g. 742918"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full text-center text-xl font-mono tracking-widest py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActivePickupForVerify(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyLoading || verificationCode.length < 6}
                  className="px-4 py-1.5 text-xs bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  {verifyLoading ? 'Verifying...' : 'Confirm Handover'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
