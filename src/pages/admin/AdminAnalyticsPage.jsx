import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, Award, Layers } from 'lucide-react';

export const AdminAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [anaRes, sumRes] = await Promise.all([
          analyticsAPI.getDonations(),
          analyticsAPI.getSummary()
        ]);
        if (anaRes.data.success) setAnalytics(anaRes.data.data);
        if (sumRes.data.success) setSummary(sumRes.data.summary);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

  const categoryData = analytics?.categoryBreakdown?.map((c) => ({
    name: c._id.replace('_', ' '),
    count: c.count,
    volume: c.totalQuantity
  })) || [];

  const orgData = analytics?.organizationDistribution?.map((o) => ({
    name: o._id.replace('_', ' '),
    value: o.count
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Platform Analytics & Metrics</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time MongoDB aggregation metrics for food recovery, redistribution trends, and partner capacities
        </p>
      </div>

      {/* Meals Metric Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-forest-900 p-6 rounded-2xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-emerald-300">Documented Impact Metric</span>
          <h2 className="text-3xl font-extrabold mt-1">
            {summary?.foodRescued?.estimatedMealsSupported || 0} Meals Supported
          </h2>
          <p className="text-xs text-slate-200 mt-1 max-w-xl">
            {summary?.foodRescued?.conversionNote || 'Based on 1.0 meal per portion and 2.5 meals per kg standard conversion benchmarks.'}
          </p>
        </div>
        <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-center">
          <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
          <span className="text-xs font-bold text-white block">Completion Rate: {summary?.completionRate || 0}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Surplus Listings by Food Category</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Listings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Organization Type Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Partner Organization Types</h2>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orgData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {orgData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-[11px] text-slate-600">
            {orgData.map((entry, idx) => (
              <div key={entry.name} className="flex items-center gap-1.5 capitalize">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span>{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
