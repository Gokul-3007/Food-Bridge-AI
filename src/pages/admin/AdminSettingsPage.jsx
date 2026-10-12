import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Sliders, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const AdminSettingsPage = () => {
  const [weights, setWeights] = useState({
    proximity: 0.40,
    compatibility: 0.25,
    capacity: 0.20,
    availability: 0.15
  });

  const [minDeadlineBufferMinutes, setMinDeadlineBufferMinutes] = useState(30);
  const [maxServiceRadiusKm, setMaxServiceRadiusKm] = useState(50);
  const [mealConversionRateKg, setMealConversionRateKg] = useState(2.5);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await adminAPI.getSettings();
        if (res.data.success && res.data.settings) {
          const s = res.data.settings;
          if (s.matchingWeights) setWeights(s.matchingWeights);
          if (s.minDeadlineBufferMinutes) setMinDeadlineBufferMinutes(s.minDeadlineBufferMinutes);
          if (s.maxServiceRadiusKm) setMaxServiceRadiusKm(s.maxServiceRadiusKm);
          if (s.mealConversionRateKg) setMealConversionRateKg(s.mealConversionRateKg);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const totalWeightPercent = Math.round(
    (weights.proximity + weights.compatibility + weights.capacity + weights.availability) * 100
  );

  const handleWeightChange = (key, val) => {
    const num = parseFloat(val) / 100;
    setWeights((prev) => ({ ...prev, [key]: num }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (totalWeightPercent !== 100) {
      setError(`Matching weights must sum to exactly 100%. Current sum: ${totalWeightPercent}%`);
      return;
    }

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      await adminAPI.updateSettings({
        matchingWeights: weights,
        minDeadlineBufferMinutes: Number(minDeadlineBufferMinutes),
        maxServiceRadiusKm: Number(maxServiceRadiusKm),
        mealConversionRateKg: Number(mealConversionRateKg)
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update platform settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Platform Matching & Operational Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tune the multi-criteria AI recipient matching engine weights and operational thresholds
        </p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Settings saved! New weights will apply to all subsequent surplus donations.</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        {/* Section: Matching Engine Weights */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              AI Weighted Matching Formula
            </h2>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              totalWeightPercent === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              Total Weight: {totalWeightPercent}%
            </span>
          </div>

          <div className="space-y-4 pt-1 text-xs">
            {/* Proximity */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Geographic Proximity (Road / Haversine distance)</span>
                <span>{Math.round(weights.proximity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={Math.round(weights.proximity * 100)}
                onChange={(e) => handleWeightChange('proximity', e.target.value)}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Food Compatibility */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Food Compatibility (Dietary & Storage match)</span>
                <span>{Math.round(weights.compatibility * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={Math.round(weights.compatibility * 100)}
                onChange={(e) => handleWeightChange('compatibility', e.target.value)}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Recipient Capacity */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Recipient Capacity (Volume headroom)</span>
                <span>{Math.round(weights.capacity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={Math.round(weights.capacity * 100)}
                onChange={(e) => handleWeightChange('capacity', e.target.value)}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
            </div>

            {/* Availability */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Availability (Active operating schedule)</span>
                <span>{Math.round(weights.availability * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={Math.round(weights.availability * 100)}
                onChange={(e) => handleWeightChange('availability', e.target.value)}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>
          </div>
        </div>

        {/* Section: Operational Limits */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Operational Benchmarks
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Min. Deadline Buffer (Minutes)
              </label>
              <input
                type="number"
                min={15}
                max={360}
                value={minDeadlineBufferMinutes}
                onChange={(e) => setMinDeadlineBufferMinutes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Max Service Radius (km)
              </label>
              <input
                type="number"
                min={5}
                max={150}
                value={maxServiceRadiusKm}
                onChange={(e) => setMaxServiceRadiusKm(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meal Conversion (Meals / kg)
              </label>
              <input
                type="number"
                step="0.1"
                min={1}
                max={5}
                value={mealConversionRateKg}
                onChange={(e) => setMealConversionRateKg(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || totalWeightPercent !== 100}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
        >
          {saving ? 'Updating Settings...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
};
