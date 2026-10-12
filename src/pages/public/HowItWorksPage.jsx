import React from 'react';
import { PlusCircle, Cpu, CheckCircle2, ShieldCheck, Truck, ArrowDown, MapPin, Key } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HowItWorksPage = () => {
  const steps = [
    {
      num: '01',
      title: 'Food Provider Registers Surplus Food',
      icon: PlusCircle,
      desc: 'Restaurants, hotels, or bakeries submit details: quantity, dietary type, storage condition, preparation time, and a strict collection deadline. The provider must complete a mandatory food safety declaration confirming temperature compliance and hygienic preparation.',
      badge: 'Step 1: Listing & Safety Gate'
    },
    {
      num: '02',
      title: 'AI Recipient Matching & Scoring',
      icon: Cpu,
      desc: 'The backend invokes the rule-based matching engine. Unverified NGOs and expired donations are immediately excluded. Eligible recipients are ranked using a weighted formula: Geographic Proximity (40%), Food Compatibility (25%), Recipient Capacity (20%), and Availability (15%).',
      badge: 'Step 2: Multi-Factor AI Evaluation'
    },
    {
      num: '03',
      title: 'Notification, Atomic Acceptance & Auto-Cascade',
      icon: CheckCircle2,
      desc: 'The top-ranked verified NGO receives an in-app alert. Concurrency control ensures only one recipient can claim the donation atomically. If the recipient is unable to accept and declines, the engine automatically re-routes the offer to the next ranked recipient in the match queue.',
      badge: 'Step 3: Atomic Offer & Fallback'
    },
    {
      num: '04',
      title: 'Live Road Routing & Volunteer Assignment',
      icon: Truck,
      desc: 'An automated pickup record is scheduled. Authorized volunteers or recipient drivers view turn-by-turn road routes, travel duration estimates, and pickup markers using OpenStreetMap and Leaflet.',
      badge: 'Step 4: Geospatial Navigation'
    },
    {
      num: '05',
      title: 'Cryptographic Handover Verification',
      icon: Key,
      desc: 'A secure 6-digit PIN (and QR code) is generated for the recipient. Only the SHA-256 hash is stored in the database. At handover, the code is verified, recording dual confirmations, updating donation status to completed, and preventing code reuse.',
      badge: 'Step 5: Secure Digital Handoff'
    }
  ];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
      {/* Title */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
          End-to-End Workflow
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          How FoodBridge AI Works
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          A seamless, transparent workflow designed for speed, food safety compliance, and equitable redistribution.
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-6">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={s.num}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-6 items-start"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-lg flex-shrink-0">
                {s.num}
              </div>

              <div className="space-y-2 flex-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {s.badge}
                </span>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Icon className="w-5 h-5 text-emerald-600" />
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Box */}
      <div className="p-8 bg-gradient-to-r from-emerald-800 to-forest-900 rounded-2xl text-white text-center space-y-4 shadow-md">
        <h3 className="text-xl font-bold">Ready to Participate in Surplus Food Rescue?</h3>
        <p className="text-xs text-slate-200 max-w-md mx-auto">
          Join hotels, restaurants, food banks, and volunteers across the city.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            to="/register?role=provider"
            className="px-5 py-2.5 rounded-xl bg-emerald-400 text-slate-900 text-xs font-bold hover:bg-emerald-300 transition-colors"
          >
            Register as Provider
          </Link>
          <Link
            to="/register?role=ngo"
            className="px-5 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 border border-white/20 transition-colors"
          >
            Register as Recipient NGO
          </Link>
        </div>
      </div>
    </div>
  );
};
