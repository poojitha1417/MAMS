import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard({ user }) {
  const [data, setData] = useState([]);
  const [filterBase, setFilterBase] = useState('');
  const [bases, setBases] = useState([]);
  const [selectedPopup, setSelectedPopup] = useState(null);

  useEffect(() => {
    fetchBases();
    fetchDashboard();
  }, [filterBase]);

  const fetchBases = async () => {
    try {
      const res = await axios.get('/bases');
      setBases(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDashboard = async () => {
    try {
      const url = filterBase ? `/inventory/dashboard?baseId=${filterBase}` : '/inventory/dashboard';
      const res = await axios.get(url);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const totals = data.reduce((acc, curr) => {
    acc.closing += curr.closingBalance;
    acc.net += curr.netMovement;
    acc.expended += curr.expended;
    acc.assigned += curr.assigned;
    return acc;
  }, { closing: 0, net: 0, expended: 0, assigned: 0 });

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="tactical-header-1 mb-1 italic">MISSION OVERVIEW</h1>
          <p className="text-slate-400 text-sm font-medium">Real-time asset movement and inventory analysis</p>
        </div>
        
        {user.role === 'ADMIN' && (
          <div className="w-full md:w-auto min-w-[280px]">
            <label className="tactical-label text-[10px]">Filter by Deployment Base</label>
            <select 
              className="tactical-input w-full"
              value={filterBase} 
              onChange={e => setFilterBase(e.target.value)}
            >
              <option value="">ALL GLOBAL BASES</option>
              {bases.map(b => (
                <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="tactical-card group hover:border-[#60A5FA]/30 transition-all cursor-default">
          <div className="flex justify-between items-start mb-4">
            <span className="tactical-label">Closing Balance</span>
            <div className="w-2 h-2 rounded-full bg-[#60A5FA] shadow-[0_0_8px_#60A5FA]" />
          </div>
          <span className="text-4xl font-black text-white">{totals.closing}</span>
        </div>
        
        <div 
          className="tactical-card border-[#60A5FA]/40 group hover:bg-slate-800/80 transition-all cursor-pointer"
          onClick={() => setSelectedPopup('netMovement')}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="tactical-label">Net Movement</span>
            <span className="text-[10px] font-bold text-[#60A5FA]">VIEW SPECS ↗</span>
          </div>
          <span className={`text-4xl font-black ${totals.net >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
            {totals.net >= 0 ? '+' : ''}{totals.net}
          </span>
        </div>

        <div className="tactical-card group hover:border-[#22C55E]/30 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="tactical-label">Total Assigned</span>
            <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
          </div>
          <span className="text-4xl font-black text-white">{totals.assigned}</span>
        </div>

        <div className="tactical-card group hover:border-[#EF4444]/30 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="tactical-label">Total Expended</span>
            <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
          </div>
          <span className="text-4xl font-black text-white">{totals.expended}</span>
        </div>
      </div>

      <div className="tactical-card mb-10 p-8 h-[450px]">
        <h3 className="tactical-header-2 mb-8 uppercase tracking-widest text-xs font-black text-slate-500">Asset Distribution Analytics</h3>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="assetName" 
              stroke="#94a3b8" 
              fontSize={10} 
              tick={{ fontWeight: 600 }}
              axisLine={{ stroke: '#475569' }}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={10} 
              tick={{ fontWeight: 600 }}
              axisLine={{ stroke: '#475569' }}
            />
            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 800 }} />
            <Bar dataKey="closingBalance" name="Closing" fill="#60A5FA" radius={[2, 2, 0, 0]} barSize={24} />
            <Bar dataKey="assigned" name="Assigned" fill="#22C55E" radius={[2, 2, 0, 0]} barSize={24} />
            <Bar dataKey="expended" name="Expended" fill="#EF4444" radius={[2, 2, 0, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="tactical-card p-0 overflow-hidden shadow-2xl">
        <div className="bg-slate-800/50 px-8 py-5 border-b border-slate-700">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Live Inventory Ledger</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900/40">
                <th className="tactical-table-header px-8">Deployment Base</th>
                <th className="tactical-table-header">Asset Specification</th>
                <th className="tactical-table-header text-center">Purchases</th>
                <th className="tactical-table-header text-center whitespace-nowrap">T-IN / T-OUT</th>
                <th className="tactical-table-header text-center">Assigned</th>
                <th className="tactical-table-header text-center">Expended</th>
                <th className="tactical-table-header text-center">Movement</th>
                <th className="tactical-table-header text-right px-8">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="tactical-table-cell px-8 font-bold text-slate-300 uppercase tracking-tight">{row.base}</td>
                  <td className="tactical-table-cell">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white uppercase">{row.assetName}</span>
                      <span className="tactical-badge bg-slate-700 text-slate-300 text-[9px] border border-slate-600">
                        {row.assetType}
                      </span>
                    </div>
                  </td>
                  <td className="tactical-table-cell text-center font-mono text-slate-400">{row.purchases}</td>
                  <td className="tactical-table-cell text-center">
                    <div className="flex items-center justify-center gap-1 font-mono text-[11px]">
                      <span className="text-[#22C55E]">+{row.transfersIn}</span>
                      <span className="text-slate-600">/</span>
                      <span className="text-[#EF4444]">-{row.transfersOut}</span>
                    </div>
                  </td>
                  <td className="tactical-table-cell text-center font-mono text-slate-400">{row.assigned}</td>
                  <td className="tactical-table-cell text-center font-mono text-slate-400">{row.expended}</td>
                  <td className={`tactical-table-cell text-center font-black ${row.netMovement >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                    {row.netMovement > 0 ? '+' : ''}{row.netMovement}
                  </td>
                  <td className="tactical-table-cell text-right px-8">
                    <span className="bg-slate-900/60 px-3 py-1 rounded border border-slate-700 font-black text-[#60A5FA]">
                      {row.closingBalance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPopup === 'netMovement' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm shadow-2xl animate-in fade-in duration-300">
          <div 
            className="fixed inset-0" 
            onClick={() => setSelectedPopup(null)} 
          />
          <div className="tactical-card w-full max-w-4xl relative z-[101] p-0 overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl shadow-black/50">
            <div className="bg-slate-800 px-8 py-5 flex justify-between items-center border-b border-slate-700">
              <h2 className="text-lg font-black uppercase tracking-widest text-[#60A5FA]">Net Movement Specifications</h2>
              <button 
                className="tactical-btn tactical-btn-secondary py-1.5 px-3 text-xs" 
                onClick={() => setSelectedPopup(null)}
              >
                DISMISS
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-900 sticky top-0">
                    <th className="tactical-table-header px-8">Asset Identifier</th>
                    <th className="tactical-table-header text-center text-[#22C55E]">Purchases (+)</th>
                    <th className="tactical-table-header text-center text-[#22C55E]">T-In (+)</th>
                    <th className="tactical-table-header text-center text-[#EF4444]">T-Out (-)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                      <td className="tactical-table-cell px-8 text-white font-bold">{row.assetName} <span className="text-[10px] text-slate-500 uppercase ml-2">@{row.base}</span></td>
                      <td className="tactical-table-cell text-center font-mono text-[#22C55E]">+{row.purchases}</td>
                      <td className="tactical-table-cell text-center font-mono text-[#22C55E]">+{row.transfersIn}</td>
                      <td className="tactical-table-cell text-center font-mono text-[#EF4444]">{row.transfersOut > 0 ? `-${row.transfersOut}` : '0'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
