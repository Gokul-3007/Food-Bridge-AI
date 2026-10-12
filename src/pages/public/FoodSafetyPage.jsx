import React from 'react';
import { ShieldCheck, Thermometer, AlertOctagon, CheckCircle2, Clock, FileText } from 'lucide-react';

export const FoodSafetyPage = () => {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          Mandatory Safety Protocol
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Food Safety & Redistribution Guidelines
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          Surplus edible food redistribution must strictly protect recipient health. Food safety is an uncompromised requirement on FoodBridge AI.
        </p>
      </div>

      {/* Temperature Control Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-emerald-600" />
          Temperature Control Standards
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
            <span className="text-xs font-bold text-orange-900 block mb-1">Hot-Holding Food</span>
            <span className="text-2xl font-extrabold text-orange-700">≥ 60°C (140°F)</span>
            <p className="text-[11px] text-orange-800 mt-2 leading-relaxed">
              Maintained under continuous heat. Must be transferred using insulated thermal containers within 2 hours.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <span className="text-xs font-bold text-blue-900 block mb-1">Refrigerated Food</span>
            <span className="text-2xl font-extrabold text-blue-700">≤ 4°C (40°F)</span>
            <p className="text-[11px] text-blue-800 mt-2 leading-relaxed">
              Chilled meals, dairy, and salads must remain below 4°C until handover and immediate transfer to cold storage.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
            <span className="text-xs font-bold text-indigo-900 block mb-1">Frozen Food</span>
            <span className="text-2xl font-extrabold text-indigo-700">≤ -18°C (0°F)</span>
            <p className="text-[11px] text-indigo-800 mt-2 leading-relaxed">
              Frozen items must show no signs of prior thawing or refreezing crystallisation.
            </p>
          </div>
        </div>
      </div>

      {/* Eligible vs Prohibited Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Eligible */}
        <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Eligible for Redistribution
          </h2>
          <ul className="space-y-2.5 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1 flex-shrink-0"></span>
              <span><strong>Banquet and Catering Surplus:</strong> Prepared foods kept under proper temperature holding that were not served directly on guest plates.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1 flex-shrink-0"></span>
              <span><strong>Fresh Bakery Items:</strong> Daily bread, baguettes, bagels, and pastries without cream fillings.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1 flex-shrink-0"></span>
              <span><strong>Whole Fresh Produce:</strong> Unblemished fruits, vegetables, and greens suitable for community kitchen preparation.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1 flex-shrink-0"></span>
              <span><strong>Packaged & Canned Goods:</strong> Intact factory packaging prior to official best-before expiry.</span>
            </li>
          </ul>
        </div>

        {/* Prohibited */}
        <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-red-900 flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-red-600" />
            Strictly Prohibited Items
          </h2>
          <ul className="space-y-2.5 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1 flex-shrink-0"></span>
              <span><strong>Plate Waste:</strong> Food that was previously served directly to individual customers or dining tables.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1 flex-shrink-0"></span>
              <span><strong>Temperature Abused Items:</strong> Perishable foods that sat at ambient temperature (4°C–60°C) for longer than 2 hours.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1 flex-shrink-0"></span>
              <span><strong>Unpasteurized Juices & Raw Shellfish:</strong> High-risk raw animal products requiring specialized lab oversight.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1 flex-shrink-0"></span>
              <span><strong>Dented Cans or Compromised Packaging:</strong> Bulging cans, unsealed vacuum packs, or broken seals.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Mandatory Declaration Policy */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-600" />
          The Three-Point Mandatory Declaration
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Before any surplus listing is accepted into the matching engine, providers must digitally attest to:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 bg-white rounded-xl border border-slate-200 font-medium text-slate-800">
            1. Safe for consumption & non-hazardous
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 font-medium text-slate-800">
            2. Prepared under certified hygiene standards
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 font-medium text-slate-800">
            3. Compliant temperature history maintained
          </div>
        </div>
      </div>
    </div>
  );
};
