import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Zap,
  Truck,
  ArrowRight,
  Award,
  CheckCircle2,
  Building2,
  Users,
  Compass
} from 'lucide-react';
import { analyticsAPI } from '../../services/api';

export const LandingPage = () => {
  const [stats, setStats] = useState({
    completedHandovers: 1,
    estimatedMealsSupported: 60,
    verifiedNGOs: 2,
    activeListings: 2
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await analyticsAPI.getSummary();
        if (res.data.success && res.data.summary) {
          const s = res.data.summary;
          setStats({
            completedHandovers: s.completedHandovers || 0,
            estimatedMealsSupported: s.foodRescued?.estimatedMealsSupported || 0,
            verifiedNGOs: s.verifiedNGOs || 0,
            activeListings: s.activeListings || 0
          });
        }
      } catch (err) {
        console.error('Failed to load summary stats:', err);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-emerald-900 via-forest-900 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Intelligent Surplus Food Redistribution Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Rescue Surplus Food Before Its Safe-Use Deadline with <span className="text-emerald-400">FoodBridge AI</span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed">
            Connecting restaurants, hotels, canteens, bakeries, and grocery stores with verified NGOs, shelters, and volunteers. Powered by explainable weighted matching, interactive road routing, and cryptographic handover verification.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/register?role=provider"
              className="px-6 py-3.5 rounded-xl font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <span>Donate Surplus Food</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/map"
              className="px-6 py-3.5 rounded-xl font-bold text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 backdrop-blur-md transition-all flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Explore Live Map</span>
            </Link>

            <Link
              to="/register?role=ngo"
              className="px-6 py-3.5 rounded-xl font-bold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800 transition-all"
            >
              Join as Recipient NGO
            </Link>
          </div>
        </div>
      </section>

      {/* Live Impact Counters */}
      <section className="bg-white border-b border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-700 block">
                {stats.estimatedMealsSupported}+
              </span>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider mt-1 block">
                Estimated Meals Supported
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-800 block">
                {stats.completedHandovers}
              </span>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider mt-1 block">
                Verified Handovers
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-3xl sm:text-4xl font-extrabold text-blue-700 block">
                {stats.verifiedNGOs}
              </span>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider mt-1 block">
                Verified Partner NGOs
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-3xl sm:text-4xl font-extrabold text-amber-600 block">
                {stats.activeListings}
              </span>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider mt-1 block">
                Active Surplus Listings
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-2">
              Architecture & Trust
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Built for Real-World Food Rescue Operations
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              FoodBridge AI replaces messy chat groups with structured, rule-based matching and verified digital handovers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Explainable AI Matching</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Multi-criteria scoring evaluates 40% proximity, 25% compatibility, 20% capacity, and 15% availability. Unverified NGOs are automatically excluded to safeguard compliance.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <Compass className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Interactive OpenStreetMap Navigation</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Real-time road distances and duration estimates via OSRM routing. Distinct marker pins for providers, available food, shelters, and drivers with "Use My Location" support.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Cryptographic Handover Verification</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Short-lived 6-digit PIN codes hashed with SHA-256 in the database. Dual provider-recipient confirmation prevents double-collection and guarantees auditable records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Commitment Banner */}
      <section className="bg-emerald-800 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              Strict Food Safety Standards
            </div>
            <h3 className="text-2xl font-bold">Food Safety is Never Overridden by a High Match Score</h3>
            <p className="text-xs text-emerald-100 max-w-xl">
              Mandatory hygiene and temperature declarations are required for every listing. Expired or unverified food listings are immediately blocked from redistribution.
            </p>
          </div>
          <Link
            to="/food-safety"
            className="px-5 py-2.5 rounded-xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition-colors whitespace-nowrap"
          >
            Read Safety Guidelines
          </Link>
        </div>
      </section>
    </div>
  );
};
