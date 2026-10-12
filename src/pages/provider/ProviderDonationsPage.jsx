import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { donationsAPI } from '../../services/api';
import {
  Package,
  PlusCircle,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Edit,
  Eye
} from 'lucide-react';

export const ProviderDonationsPage = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Edit Modal State
  const [editingDonation, setEditingDonation] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editInstructions, setEditInstructions] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const params = { providerOrg: user?.organization?._id };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;

      const res = await donationsAPI.getAll(params);
      if (res.data.success) {
        setDonations(res.data.donations || []);
      }
    } catch (err) {
      console.error('Failed to fetch donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [statusFilter, search, user]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this surplus food listing?')) return;
    try {
      await donationsAPI.cancel(id, 'Cancelled by provider');
      fetchDonations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel listing');
    }
  };

  const openEditModal = (donation) => {
    setEditingDonation(donation);
    setEditTitle(donation.title);
    setEditQuantity(donation.quantity);
    setEditInstructions(donation.pickupInstructions || '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await donationsAPI.update(editingDonation._id, {
        title: editTitle,
        quantity: Number(editQuantity),
        pickupInstructions: editInstructions
      });
      setEditingDonation(null);
      fetchDonations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update donation');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Surplus Food Listings</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage active offers, track matches, and view history</p>
        </div>

        <Link
          to="/provider/donations/new"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Surplus Donation</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="matching">Matching</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Listings Cards */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading listings...</div>
      ) : donations.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
          <Package className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500">No surplus donations match current filters.</p>
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
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 ${
                    d.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : d.status === 'accepted'
                      ? 'bg-blue-100 text-blue-800'
                      : d.status === 'matching'
                      ? 'bg-amber-100 text-amber-800'
                      : d.status === 'available'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {d.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">{d.description}</p>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Quantity</span>
                    <span className="font-bold text-slate-800">{d.quantity} {d.unit}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Storage</span>
                    <span className="font-semibold text-slate-700 capitalize">{d.storageConditions.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Collection Deadline: {new Date(d.collectionDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                </div>

                {d.acceptedBy && (
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 mt-2">
                    <span className="font-semibold block">Accepted By:</span>
                    {d.acceptedBy.name} ({d.acceptedBy.address})
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <Link
                  to={`/provider/donations/${d._id}`}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </Link>

                <div className="flex items-center gap-2">
                  {['available', 'matching'].includes(d.status) && (
                    <>
                      <button
                        onClick={() => openEditModal(d)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleCancel(d._id)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-lg border border-red-200 transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Listing Modal */}
      {editingDonation && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Edit Surplus Listing</h3>
            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity ({editingDonation.unit})</label>
                <input
                  type="number"
                  required
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Instructions</label>
                <textarea
                  rows={2}
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDonation(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-1.5 text-xs bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
