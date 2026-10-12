import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { donationsAPI } from '../../services/api';
import {
  Package,
  ShieldCheck,
  MapPin,
  Clock,
  Thermometer,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Info
} from 'lucide-react';

export const NewDonationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const orgCoords = user?.organization?.location?.coordinates || [-73.9851, 40.7488];

  // Default collection deadline: 4 hours from now
  const defaultDeadline = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16);
  const defaultPrepTime = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    title: '',
    category: 'prepared_meals',
    description: '',
    quantity: 20,
    unit: 'portions',
    preparationTime: defaultPrepTime,
    collectionDeadline: defaultDeadline,
    storageConditions: 'hot_holding',
    allergenInfo: '',
    dietaryType: 'vegetarian',
    pickupAddress: user?.organization?.address || '100 Grand Avenue, Metro City',
    latitude: orgCoords[1] || 40.7488,
    longitude: orgCoords[0] || -73.9851,
    pickupInstructions: 'Enter through back loading dock. Inquire with kitchen manager.',
    contactPerson: user?.name || '',
    contactPhone: user?.phone || '',
    specialHandlingRequirements: 'Insulated transport carrier recommended',
    foodSafetyDeclaration: {
      isSafeForConsumption: false,
      preparedUnderHygieneStandards: false,
      temperatureMaintained: false
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMatch, setSuccessMatch] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSafetyToggle = (field) => {
    setFormData((prev) => ({
      ...prev,
      foodSafetyDeclaration: {
        ...prev.foodSafetyDeclaration,
        [field]: !prev.foodSafetyDeclaration[field]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate Safety Declaration
    const { isSafeForConsumption, preparedUnderHygieneStandards, temperatureMaintained } = formData.foodSafetyDeclaration;
    if (!isSafeForConsumption || !preparedUnderHygieneStandards || !temperatureMaintained) {
      setError('You must confirm all three mandatory food safety declarations before submitting surplus food.');
      return;
    }

    // Validate future deadline
    const deadlineDate = new Date(formData.collectionDeadline);
    if (deadlineDate <= new Date()) {
      setError('Collection deadline must be a future time.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        allergenInfo: formData.allergenInfo ? formData.allergenInfo.split(',').map((s) => s.trim()) : []
      };

      const res = await donationsAPI.create(payload);
      if (res.data.success) {
        setSuccessMatch(res.data.donation);
        setTimeout(() => {
          navigate('/provider/donations');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to list surplus food. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Donate Surplus Food</h1>
        <p className="text-xs text-slate-500 mt-1">
          List surplus edible meals or bakery products before safe-use expiration. The AI matching engine will immediately evaluate verified recipient organizations.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMatch && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Surplus Food Listed & AI Matching Initiated!</span>
          </div>
          <p>
            Donation "{successMatch.title}" has been registered. The matching engine is screening verified recipient NGOs within service range. Redirecting to your listings...
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        {/* Section 1: Food Details */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            1. Food Identification & Quantities
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Food Title / Description Summary *
            </label>
            <input
              type="text"
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Steamed Rice, Dal & Mixed Vegetable Curry"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="prepared_meals">Prepared Meals</option>
                <option value="bakery">Bakery / Bread</option>
                <option value="produce">Fresh Produce</option>
                <option value="dairy">Dairy & Chilled</option>
                <option value="packaged">Packaged Goods</option>
                <option value="beverages">Beverages</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                min={0.1}
                step="any"
                required
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit *
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="portions">Portions / Servings</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="boxes">Boxes</option>
                <option value="liters">Liters</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description & Packaging
            </label>
            <textarea
              rows={2}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. Unserved buffet trays stored in insulated warmers. Ready for portioning into containers."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Section 2: Safety & Deadlines */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            2. Safety Window & Storage Conditions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preparation Time *
              </label>
              <input
                type="datetime-local"
                required
                name="preparationTime"
                value={formData.preparationTime}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Permitted Collection Deadline *
              </label>
              <input
                type="datetime-local"
                required
                name="collectionDeadline"
                value={formData.collectionDeadline}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-amber-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Storage Conditions *
              </label>
              <select
                name="storageConditions"
                value={formData.storageConditions}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="hot_holding">Hot Holding (≥ 60°C)</option>
                <option value="refrigerated">Refrigerated (≤ 4°C)</option>
                <option value="ambient">Ambient / Room Temp</option>
                <option value="frozen">Frozen (≤ -18°C)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dietary Classification
              </label>
              <select
                name="dietaryType"
                value={formData.dietaryType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="non_vegetarian">Non-Vegetarian</option>
                <option value="any">General / Any</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Allergen Disclosures
              </label>
              <input
                type="text"
                name="allergenInfo"
                value={formData.allergenInfo}
                onChange={handleChange}
                placeholder="e.g. dairy, gluten, nuts"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Pickup Location */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            3. Pickup Location & Logistics
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pickup Address *
            </label>
            <input
              type="text"
              required
              name="pickupAddress"
              value={formData.pickupAddress}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Person *
              </label>
              <input
                type="text"
                required
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone *
              </label>
              <input
                type="tel"
                required
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pickup Instructions
            </label>
            <input
              type="text"
              name="pickupInstructions"
              value={formData.pickupInstructions}
              onChange={handleChange}
              placeholder="e.g. Loading dock access, security sign-in required"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Section 4: Mandatory Safety Declaration */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Mandatory Food Safety Attestation</span>
          </div>
          <p className="text-[11px] text-slate-600">
            Federal and municipal food redistribution standards require provider attestation prior to matching:
          </p>

          <div className="space-y-2 pt-1 text-xs text-slate-800">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.foodSafetyDeclaration.isSafeForConsumption}
                onChange={() => handleSafetyToggle('isSafeForConsumption')}
                className="mt-0.5 w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
              />
              <span>I certify this surplus food is wholesome, edible, unadulterated, and safe for human consumption.</span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.foodSafetyDeclaration.preparedUnderHygieneStandards}
                onChange={() => handleSafetyToggle('preparedUnderHygieneStandards')}
                className="mt-0.5 w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
              />
              <span>I confirm the food was prepared and handled under certified commercial hygiene standards.</span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.foodSafetyDeclaration.temperatureMaintained}
                onChange={() => handleSafetyToggle('temperatureMaintained')}
                className="mt-0.5 w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
              />
              <span>I verify compliant temperature control (hot ≥ 60°C or cold ≤ 4°C) was maintained without temperature abuse.</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span>{loading ? 'Submitting & Triggering Matching Engine...' : 'Publish Surplus Donation'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
