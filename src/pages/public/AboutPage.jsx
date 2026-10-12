import React from 'react';
import { HeartHandshake, Shield, Globe, Award, CheckCircle, Users } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
          Mission & Architecture
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          About FoodBridge AI
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          FoodBridge AI is an intelligent geospatial platform designed to solve the critical coordination bottleneck between commercial food surplus and vulnerable community organizations.
        </p>
      </div>

      {/* The Problem & Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
            !
          </div>
          <h2 className="text-lg font-bold text-slate-900">The Redistribution Challenge</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every day, commercial kitchens, bakeries, and hotel buffets discard edible food because collection coordination is too slow, unpredictable, or legally uncertain. Meanwhile, local shelters and community kitchens operate near capacity limits with tight intake windows.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            ✓
          </div>
          <h2 className="text-lg font-bold text-slate-900">The FoodBridge AI Solution</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            FoodBridge AI replaces ad-hoc messaging with real-time geospatial discovery, explainable multi-criteria matching, automatic cascade re-routing on decline, and cryptographic handover verification to guarantee food reaches verified recipients safely and on time.
          </p>
        </div>
      </div>

      {/* UN Sustainable Development Goals */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl space-y-6">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <Globe className="w-4 h-4" />
          Global Sustainable Impact
        </div>
        <h2 className="text-2xl font-bold">Aligned with United Nations Sustainable Development Goals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 space-y-2">
            <span className="text-xs font-extrabold text-amber-400 block">UN SDG 2 — Zero Hunger</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Targeted food transfers direct nutritious meals to verified food banks, shelters, and community kitchens serving individuals facing food insecurity.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 space-y-2">
            <span className="text-xs font-extrabold text-emerald-400 block">UN SDG 12 — Responsible Consumption</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Halving per-capita food waste through rapid-response redistribution prior to safe collection deadlines, reducing greenhouse gas emissions from landfills.
            </p>
          </div>
        </div>
      </div>

      {/* Core Principles */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Our Core Principles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <h3 className="font-bold text-xs text-slate-800 mb-1">Explainable AI</h3>
            <p className="text-xs text-slate-500">Every match score breaks down proximity, compatibility, capacity, and availability transparently.</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <h3 className="font-bold text-xs text-slate-800 mb-1">Open Geospatial Tech</h3>
            <p className="text-xs text-slate-500">Powered by OpenStreetMap, Leaflet, and OSRM routing without proprietary lock-in.</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <h3 className="font-bold text-xs text-slate-800 mb-1">Strict Verification</h3>
            <p className="text-xs text-slate-500">Recipients must be vetted by administrators and handovers are secured with cryptographic hashes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
