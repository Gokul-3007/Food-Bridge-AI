import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, organizationsAPI } from '../../services/api';
import {
  Users,
  Building,
  Package,
  CheckCircle2,
  AlertCircle,
  Truck,
  TrendingUp,
  ShieldCheck,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, anaRes] = await Promise.all([
          analyticsAPI.getSummary(),
          analyticsAPI.getDonations()
        ]);
        if (sumRes.data.success) setSummary(sumRes.data.summary);
        if (anaRes.data.success) setAnalytics(anaRes.data.data);
      } catch (err) {
        console.error('Failed to load admin summary:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

  const categoryData = analytics?.categoryBreakdown?.map((c) => ({
    name: c._id.replace('_', ' '),
    count: c.count
  })) || [];

  const statusData = analytics?.statusDistribution?.map((s) => ({
    name: s._id,
    value: s.count
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-amber-600 block">
            Administrative Control Panel
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">Platform Analytics & Operations</h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/organizations"
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Organizations</span>
          </Link>
          <Link
            to="/admin/audit-logs"
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Audit Logs</span>
          </Link>
        </div>
      </div>

      {/* Main KPI Aggregation Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Estimated Meals Supported</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 block">
            {summary?.foodRescued?.estimatedMealsSupported || 0}
          </span>
          <span className="text-[10px] text-slate-400 leading-tight block">
            Measured: {summary?.foodRescued?.totalPortionsMeasured || 0} portions + {summary?.foodRescued?.totalKgMeasured || 0} kg
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Verified Partner NGOs</span>
            <Building className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-blue-700 block">
            {summary?.verifiedNGOs || 0}
          </span>
          <span className="text-[10px] text-amber-600 font-semibold block">
            {summary?.pendingNGOs || 0} pending admin review
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Completed Handovers</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 block">
            {summary?.completedHandovers || 0}
          </span>
          <span className="text-[10px] text-slate-400 block">
            Completion Rate: {summary?.completionRate || 0}%
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Registered Users</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 block">
            {summary?.totalUsers || 0}
          </span>
          <span className="text-[10px] text-slate-400 block">
            Across Providers, NGOs, Volunteers
          </span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Food Surplus by Category</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Listing Status Distribution</h2>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
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
            {statusData.map((entry, idx) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="capitalize">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent System Activities / Audit Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Recent Platform Activities</h2>
          <Link to="/admin/audit-logs" className="text-xs text-amber-600 hover:underline font-semibold flex items-center gap-1">
            <span>View all audits</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {summary?.recentActivities?.slice(0, 5).map((act) => (
            <div key={act._id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 font-mono text-[11px]">{act.action}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {act.entityType}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  By: {act.performedByName || 'System'}
                </p>
              </div>

              <span className="text-[10px] text-slate-400">
                {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
