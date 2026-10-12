import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { pickupsAPI, handoverAPI } from '../../services/api';
import { Truck, MapPin, Clock, User, Key, CheckCircle2 } from 'lucide-react';

export const NgoPickupsPage = () => {
  const { user } = useAuth();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePinData, setActivePinData] = useState(null);

  const fetchPickups = async () => {
    try {
      const res = await pickupsAPI.getAll();
      if (res.data.success) {
        setPickups(res.data.pickups || []);
      }
    } catch (err) {
      console.error('Failed to load NGO pickups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, [user]);

  const handleShowPin = async (pickupId, donationTitle) => {
    try {
      const res = await handoverAPI.initiate(pickupId);
      if (res.data.success) {
        setActivePinData({
          title: donationTitle,
          pin: res.data.verificationPin,
          expiresAt: res.data.expiresAt
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to retrieve handover PIN');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Scheduled Collections & Pickups</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Track volunteer arrivals and present verification codes upon delivery
        </p>
      </div>

      {/* PIN Display Modal */}
      {activePinData && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl text-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Key className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Handover Verification PIN</h3>
              <p className="text-xs text-slate-500">For "{activePinData.title}"</p>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="text-3xl font-mono font-extrabold text-emerald-800 tracking-widest py-1 bg-white rounded-lg border border-emerald-200">
                {activePinData.pin}
              </div>
              <p className="text-[11px] text-emerald-700 leading-tight">
                Show this 6-digit PIN to the food provider or volunteer driver to verify safe handover.
              </p>
            </div>

            <button
              onClick={() => setActivePinData(null)}
              className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading pickups...</div>
      ) : pickups.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-2">
          <Truck className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500">No scheduled collections at this time.</p>
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
                  <h3 className="text-sm font-bold text-slate-900">{p.donation?.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    p.status === 'handover_verified'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {p.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Pickup Address: <strong>{p.pickupAddress}</strong></span>
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Scheduled Time: {new Date(p.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </p>
                </div>

                {p.volunteer && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-800 rounded-lg text-xs font-medium border border-purple-200">
                    <User className="w-3.5 h-3.5" />
                    <span>Volunteer: {p.volunteer.name} ({p.volunteer.phone})</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {p.status !== 'handover_verified' ? (
                  <button
                    onClick={() => handleShowPin(p._id, p.donation?.title)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Key className="w-4 h-4" />
                    <span>Show My Handover PIN</span>
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
    </div>
  );
};
