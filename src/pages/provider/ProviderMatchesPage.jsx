import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { matchesAPI } from '../../services/api';
import { Layers, CheckCircle2, Clock, XCircle, Building, MapPin } from 'lucide-react';

export const ProviderMatchesPage = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await matchesAPI.getAll();
        if (res.data.success) {
          setMatches(res.data.matches || []);
        }
      } catch (err) {
        console.error('Failed to fetch matches:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Recipient Matches & Responses</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Track organizations matched to your surplus food and their acceptance responses
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading recipient matches...</div>
      ) : matches.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-2">
          <Layers className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500">No active match records found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((m) => (
            <div
              key={m._id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{m.donation?.title}</span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {m.donation?.quantity} {m.donation?.unit}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-semibold">{m.recipient?.name}</span>
                  <span>•</span>
                  <span>{m.recipient?.address}</span>
                </div>

                <p className="text-[11px] text-slate-500">{m.eligibilityExplanation}</p>
              </div>

              <div className="flex items-center gap-6 md:text-right border-t md:border-t-0 pt-3 md:pt-0">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Match Score</span>
                  <span className="text-lg font-extrabold text-emerald-700">{m.score}%</span>
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
          ))}
        </div>
      )}
    </div>
  );
};
