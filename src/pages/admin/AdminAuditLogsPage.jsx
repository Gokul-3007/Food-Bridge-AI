import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { FileText, Search, Filter, ShieldCheck, Clock, User } from 'lucide-react';

export const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (actionFilter) params.action = actionFilter;
      if (entityFilter) params.entityType = entityFilter;

      const res = await adminAPI.getAuditLogs(params);
      if (res.data.success) {
        setLogs(res.data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, entityFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Security & Operational Audit Logs</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable audit trail of user registrations, verifications, match decisions, and handovers
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex gap-3 text-xs">
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
        >
          <option value="">All Entity Types</option>
          <option value="User">User</option>
          <option value="Organization">Organization</option>
          <option value="Donation">Donation</option>
          <option value="Pickup">Pickup</option>
          <option value="Handover">Handover</option>
          <option value="System">System</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading audit log entries...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No audit logs found.</div>
        ) : (
          <div className="divide-y divide-slate-100 font-mono">
            {logs.map((log) => (
              <div key={log._id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-slate-50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{log.action}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-sans font-semibold">
                      {log.entityType}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-sans">
                    User: {log.performedByName || 'System'} {log.performedBy?.email ? `(${log.performedBy.email})` : ''}
                  </p>
                </div>

                <div className="text-right text-[11px] text-slate-400 font-sans">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
