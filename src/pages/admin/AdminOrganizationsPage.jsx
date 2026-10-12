import React, { useState, useEffect } from 'react';
import { organizationsAPI } from '../../services/api';
import {
  Building,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock
} from 'lucide-react';

export const AdminOrganizationsPage = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterVerified, setFilterVerified] = useState('all');
  const [search, setSearch] = useState('');

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType !== 'all') params.type = filterType;
      if (filterVerified !== 'all') params.isVerified = filterVerified;
      if (search) params.search = search;

      const res = await organizationsAPI.getAll(params);
      if (res.data.success) {
        setOrganizations(res.data.organizations || []);
      }
    } catch (err) {
      console.error('Failed to load organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [filterType, filterVerified, search]);

  const handleVerify = async (id, isVerified) => {
    try {
      await organizationsAPI.verify(id, { isVerified });
      alert(`Organization ${isVerified ? 'verified' : 'rejected'} successfully.`);
      fetchOrganizations();
    } catch (err) {
      alert(err.response?.data?.message || 'Verification update failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Organization Verification & Oversight</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review credentials and approve recipient organizations for food redistribution eligibility
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs flex-wrap">
          <select
            value={filterVerified}
            onChange={(e) => setFilterVerified(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="false">Pending Verification</option>
            <option value="true">Verified Only</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="all">All Types</option>
            <option value="ngo">NGO</option>
            <option value="shelter">Shelter</option>
            <option value="community_kitchen">Community Kitchen</option>
            <option value="food_bank">Food Bank</option>
            <option value="restaurant">Restaurant</option>
            <option value="hotel">Hotel</option>
            <option value="bakery">Bakery</option>
          </select>
        </div>
      </div>

      {/* Organization Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading organizations...</div>
        ) : organizations.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No organizations found.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {organizations.map((org) => (
              <div key={org._id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{org.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                      {org.type.replace('_', ' ')}
                    </span>
                    {org.isVerified ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1 animate-pulse-soft">
                        <Clock className="w-3 h-3" /> Pending Review
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{org.address}</span>
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                    <span>Contact: {org.contactPerson} ({org.contactPhone})</span>
                    <span>•</span>
                    <span>Capacity: {org.maxCapacity}</span>
                    <span>•</span>
                    <span>Radius: {org.serviceAreaKm} km</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  {!org.isVerified ? (
                    <button
                      onClick={() => handleVerify(org._id, true)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Verify</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleVerify(org._id, false)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Revoke</span>
                    </button>
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
