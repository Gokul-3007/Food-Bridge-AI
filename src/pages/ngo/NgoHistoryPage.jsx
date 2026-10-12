import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { donationsAPI } from '../../services/api';
import { History, Award, CheckCircle2, Clock, Building } from 'lucide-react';

export const NgoHistoryPage = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await donationsAPI.getAll({
          acceptedBy: user?.organization?._id,
          status: 'completed'
        });
        if (res.data.success) {
          setHistory(res.data.donations || []);
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  const totalRescued = history.reduce((sum, d) => sum + (d.quantity || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Food Collection History</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Audited log of meals successfully received and redistributed to community members
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-6 rounded-2xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-blue-300">Total Inflow Rescued</span>
          <h2 className="text-3xl font-extrabold mt-1">{totalRescued} Units Received</h2>
          <p className="text-xs text-slate-200 mt-1">
            Across {history.length} verified handovers from local commercial food providers.
          </p>
        </div>
        <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-center">
          <Award className="w-6 h-6 text-blue-300 mx-auto mb-1" />
          <span className="text-xs font-bold text-white block">Community Shield</span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading collection history...</div>
      ) : history.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-2">
          <History className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500">No completed collections recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((d) => (
            <div
              key={d._id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{d.title}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Completed
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  <span>Provider: <strong>{d.providerOrg?.name}</strong></span>
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>Quantity: {d.quantity} {d.unit}</span>
                  <span>•</span>
                  <span>Date: {new Date(d.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

              <div className="text-right flex items-center gap-2 text-xs text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Handover</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
