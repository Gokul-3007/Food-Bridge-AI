import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { organizationsAPI } from '../../services/api';
import { Building, ShieldCheck, MapPin, Sliders, CheckCircle2 } from 'lucide-react';

export const NgoProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const org = user?.organization;

  const [formData, setFormData] = useState({
    name: org?.name || '',
    address: org?.address || '',
    serviceAreaKm: org?.serviceAreaKm || 15,
    maxCapacity: org?.maxCapacity || 250,
    operatingHours: org?.operatingHours || '08:00 - 20:00',
    contactPerson: org?.contactPerson || user?.name || '',
    contactPhone: org?.contactPhone || user?.phone || '',
    dietaryAccepted: org?.dietaryAccepted || ['vegetarian', 'vegan', 'non_vegetarian']
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDietaryToggle = (diet) => {
    setFormData((prev) => {
      const current = prev.dietaryAccepted;
      if (current.includes(diet)) {
        return { ...prev, dietaryAccepted: current.filter((d) => d !== diet) };
      } else {
        return { ...prev, dietaryAccepted: [...current, diet] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!org) return;

    setLoading(true);
    setSuccess(false);

    try {
      await organizationsAPI.update(org._id, {
        ...formData,
        serviceAreaKm: Number(formData.serviceAreaKm),
        maxCapacity: Number(formData.maxCapacity)
      });
      await refreshUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Organization Capacity & Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure intake volume, service radius, and dietary acceptance for AI matching
        </p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Organization settings updated successfully! AI matching parameters adjusted.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Name</label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Operating Hours</label>
              <input
                type="text"
                name="operatingHours"
                value={formData.operatingHours}
                onChange={handleChange}
                placeholder="e.g. 08:00 - 21:00"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Physical Address</label>
            <input
              type="text"
              required
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        {/* Capacity & Radius Section */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Matching Constraints
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Maximum Intake Capacity (Portions / kg)
              </label>
              <input
                type="number"
                min={1}
                required
                name="maxCapacity"
                value={formData.maxCapacity}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                The matching engine will exclude surplus offers larger than your available capacity headroom.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Service Radius (km)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                required
                name="serviceAreaKm"
                value={formData.serviceAreaKm}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Maximum pickup travel distance you can feasible service.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Dietary Profiles Accepted
            </label>
            <div className="flex gap-4 text-xs">
              {['vegetarian', 'vegan', 'non_vegetarian'].map((diet) => (
                <label key={diet} className="flex items-center gap-2 cursor-pointer capitalize">
                  <input
                    type="checkbox"
                    checked={formData.dietaryAccepted.includes(diet)}
                    onChange={() => handleDietaryToggle(diet)}
                    className="w-4 h-4 text-blue-600 rounded-sm"
                  />
                  <span>{diet.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving Changes...' : 'Save Organization Settings'}
        </button>
      </form>
    </div>
  );
};
