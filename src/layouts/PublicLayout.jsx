import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { HeartHandshake, Shield, MapPin, Award } from 'lucide-react';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Public Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg text-white">FoodBridge AI</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Intelligent food redistribution and geospatial navigation platform connecting commercial food providers with verified NGOs, shelters, and volunteers.
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-[11px] text-emerald-300">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                Aligned with UN SDG 2 (Zero Hunger) & SDG 12
              </div>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Platform</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/map" className="hover:text-emerald-400 transition-colors">Live Rescue Map</Link></li>
                <li><Link to="/how-it-works" className="hover:text-emerald-400 transition-colors">How Matching Works</Link></li>
                <li><Link to="/food-safety" className="hover:text-emerald-400 transition-colors">Safety Standards & Policy</Link></li>
                <li><Link to="/about" className="hover:text-emerald-400 transition-colors">Our Mission</Link></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Get Involved</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/register?role=provider" className="hover:text-emerald-400 transition-colors">Register as Food Provider</Link></li>
                <li><Link to="/register?role=ngo" className="hover:text-emerald-400 transition-colors">Register as NGO / Shelter</Link></li>
                <li><Link to="/register?role=volunteer" className="hover:text-emerald-400 transition-colors">Sign Up as Volunteer</Link></li>
                <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Partner Sign In</Link></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Food Safety & Compliance</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                All donations are screened with mandatory safety declarations, temperature tracking, and cryptographic verification codes before collection.
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <Shield className="w-4 h-4" />
                <span>Zero Compromise on Edibility</span>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
            <p>© {new Date().getFullYear()} FoodBridge AI Platform. All rights reserved.</p>
            <div className="flex gap-4 mt-4 sm:mt-0">
              <Link to="/food-safety" className="hover:text-slate-400">Safety Policy</Link>
              <Link to="/about" className="hover:text-slate-400">Security & Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
