import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { donationsAPI } from '../../services/api';
import {
  Package,
  Clock,
  ShieldCheck,
  MapPin,
  CheckCircle,
  Truck,
  Layers,
  ArrowLeft,
  RotateCw,
  Phone,
  User
} from 'lucide-react';

export const DonationDetailPage = () => {
  const { id } = useParams();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rematching, setRematching] = useState(false);

  const fetchDetails = async () => {
    try {
      const res = await donationsAPI.getById(id);
      if (res.data.success) {
        setDonation(res.data.donation);
      }
    } catch (err) {
      console.error('Failed to fetch donation details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleTriggerMatch = async () => {
    setRematching(true);
    try {
      const res = await donationsAPI.triggerMatching(id);
      if (res.data.success) {
        alert('AI matching re-evaluated successfully!');
        fetchDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Matching trigger failed');
    } finally {
      setRematching(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading donation details...</div>;
  }

  if (!donation) {
    return <div className="p-12 text-center text-xs text-red-500">Donation listing not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top back button */}
      <Link
        to="/provider/donations"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to listings</span>
      </Link>

      {/* Main Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Listing ID: {donation._id}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
              {donation.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
              donation.status === 'completed'
                ? 'bg-emerald-100 text-emerald-800'
                : donation.status === 'accepted'
                ? 'bg-blue-100 text-blue-800'
                : donation.status === 'matching'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-50 text-emerald-700'
            }`}>
              {donation.status}
            </span>

            {['available', 'matching'].includes(donation.status) && (
              <button
                onClick={handleTriggerMatch}
                disabled={rematching}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-xl border border-emerald-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${rematching ? 'animate-spin' : ''}`} />
                <span>Re-evaluate Matches</span>
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">{donation.description}</p>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Quantity</span>
            <span className="font-extrabold text-slate-900">{donation.quantity} {donation.unit}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Category</span>
            <span className="font-semibold text-slate-800 capitalize">{donation.category.replace('_', ' ')}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Dietary</span>
            <span className="font-semibold text-slate-800 capitalize">{donation.dietaryType}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Storage</span>
            <span className="font-semibold text-slate-800 capitalize">{donation.storageConditions.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      {/* Recipient Match Queue */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>AI Recipient Match Queue & Priority Offers</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            {donation.matchQueue?.length || 0} organizations screened
          </span>
        </div>

        {donation.matchQueue && donation.matchQueue.length > 0 ? (
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
            {donation.matchQueue.map((item, idx) => (
              <div key={idx} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.recipient?.name || 'Verified Recipient'}</span>
                    <span className="text-[10px] text-slate-400 capitalize">({item.recipient?.type?.replace('_', ' ')})</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{item.recipient?.address}</p>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Match Score</span>
                    <span className="font-extrabold text-emerald-700 text-sm">{item.score || 90}%</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    item.status === 'accepted'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'offered'
                      ? 'bg-blue-100 text-blue-800 animate-pulse-soft'
                      : item.status === 'declined'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
            No recipient organizations currently matched within radius. Listings remain active on the live map.
          </div>
        )}
      </div>

      {/* Safety Attestation Card */}
      <div className="bg-emerald-50/60 border border-emerald-200 p-5 rounded-2xl text-xs text-emerald-950 space-y-2">
        <span className="font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Verified Food Safety Attestation
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Declared safe for consumption</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Commercial hygiene certified</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Compliant temperature verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
