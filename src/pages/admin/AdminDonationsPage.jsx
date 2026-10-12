import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Package, Search, Filter, ShieldCheck, Clock, MapPin, Building } from 'lucide-react';

export const AdminDonationsPage = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;

      const res = await adminAPI.getDonations(params);
      if (res.data.success) {
        setDonations(res.data.donations || []);
      }
    } catch (err) {
      console.error('Failed to load admin donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [statusFilter, categoryFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Platform Donations Overview</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Audited log of all surplus food listings, provider attestations, and lifecycle states
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex gap-3 text-xs">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
        >
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="matching">Matching</option>
          <option value="accepted">Accepted</option>
          <option value="completed">Completed</option>
          <option value="expired">Expired</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
        >
          <option value="">All Categories</option>
          <option value="prepared_meals">Prepared Meals</option>
          <option value="bakery">Bakery</option>
          <option value="produce">Produce</option>
          <option value="dairy">Dairy</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading platform listings...</div>
        ) : donations.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No donations found.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {donations.map((d) => (
              <div key={d._id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{d.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                      {d.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    Provider: <strong>{d.providerOrg?.name}</strong> • {d.quantity} {d.unit} ({d.category.replace('_', ' ')})
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>Deadline: {new Date(d.collectionDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" /> Safety Declared
                    </span>
                  </div>
                </div>

                <div className="text-right text-xs">
                  {d.acceptedBy ? (
                    <span className="text-blue-700 font-semibold block">
                      Accepted by: {d.acceptedBy.name}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic block">No recipient yet</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
