import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Building } from 'lucide-react';

export default function Personnel({ user }) {
  const [users, setUsers] = useState([]);
  const [bases, setBases] = useState([]);
  
  // Base Form State
  const [baseName, setBaseName] = useState('');
  const [baseLocation, setBaseLocation] = useState('');
  const [baseMessage, setBaseMessage] = useState({ text: '', type: '' });

  // User Form State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('COMMANDER');
  const [assignBaseId, setAssignBaseId] = useState('');
  const [userMessage, setUserMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [uRes, bRes] = await Promise.all([
        axios.get('/users'),
        axios.get('/bases')
      ]);
      setUsers(uRes.data);
      setBases(bRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBase = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/bases', { name: baseName, location: baseLocation });
      setBaseMessage({ text: 'Deployment base established successfully.', type: 'success' });
      setBaseName('');
      setBaseLocation('');
      fetchData(); // Refresh lists
    } catch (err) {
      setBaseMessage({ text: err.response?.data?.error || 'Failed to create base.', type: 'error' });
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/users', { 
        username: newUsername, 
        password: newPassword, 
        role: newRole, 
        baseId: assignBaseId 
      });
      setUserMessage({ text: 'Personnel registered successfully.', type: 'success' });
      setNewUsername('');
      setNewPassword('');
      setNewRole('COMMANDER');
      setAssignBaseId('');
      fetchData(); // Refresh lists
    } catch (err) {
      setUserMessage({ text: err.response?.data?.error || 'Registration failed.', type: 'error' });
    }
  };

  return (
    <div className="animate-in fade-in duration-700 max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="tactical-header-1 mb-1 italic">PERSONNEL & COMMAND</h1>
        <p className="text-slate-400 text-sm font-medium">Manage operational bases and authorized personnel credentials.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Establish Base Form */}
        <div className="tactical-card relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Building size={120} />
          </div>
          <h2 className="tactical-header-2 border-b border-slate-700 pb-4 mb-6 uppercase tracking-widest text-sm font-black flex items-center gap-2">
            <Building size={18} className="text-[#60A5FA]" /> Establish Deployment Base
          </h2>
          
          {baseMessage.text && (
            <div className={`mb-6 p-3 rounded border flex items-center gap-3 text-xs 
              ${baseMessage.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${baseMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-bold uppercase tracking-wide">{baseMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleCreateBase} className="space-y-4">
            <div>
              <label className="tactical-label">Base Designation</label>
              <input type="text" className="tactical-input w-full" value={baseName} onChange={e => setBaseName(e.target.value)} placeholder="e.g. Base Delta" required />
            </div>
            <div>
              <label className="tactical-label">Sector Location</label>
              <input type="text" className="tactical-input w-full" value={baseLocation} onChange={e => setBaseLocation(e.target.value)} placeholder="e.g. Western Sector" required />
            </div>
            <button type="submit" className="tactical-btn tactical-btn-primary w-full py-3 text-xs font-black uppercase tracking-widest">
              Establish Infrastructure
            </button>
          </form>
        </div>

        {/* Register Personnel Form */}
        <div className="tactical-card relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Users size={120} />
          </div>
          <h2 className="tactical-header-2 border-b border-slate-700 pb-4 mb-6 uppercase tracking-widest text-sm font-black flex items-center gap-2">
            <Users size={18} className="text-[#60A5FA]" /> Register Personnel
          </h2>
          
          {userMessage.text && (
            <div className={`mb-6 p-3 rounded border flex items-center gap-3 text-xs 
              ${userMessage.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${userMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-bold uppercase tracking-wide">{userMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="tactical-label">Username</label>
                <input type="text" className="tactical-input w-full" value={newUsername} onChange={e => setNewUsername(e.target.value)} required />
              </div>
              <div>
                <label className="tactical-label">Password</label>
                <input type="password" className="tactical-input w-full" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="tactical-label">Access Role</label>
                <select className="tactical-input w-full" value={newRole} onChange={e => setNewRole(e.target.value)}>
                  <option value="COMMANDER">COMMANDER</option>
                  <option value="LOGISTICS">LOGISTICS</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div>
                <label className="tactical-label">Base Assignment</label>
                <select className="tactical-input w-full disabled:opacity-50" value={assignBaseId} onChange={e => setAssignBaseId(e.target.value)} disabled={newRole === 'ADMIN'}>
                  <option value="">NONE (Global)</option>
                  {bases.map(b => (
                    <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="tactical-btn tactical-btn-secondary w-full py-3 mt-2 text-xs font-black uppercase tracking-widest border-[#60A5FA] text-[#60A5FA] hover:bg-[#60A5FA] hover:text-slate-900 transition-colors">
              Authorize Personnel
            </button>
          </form>
        </div>
      </div>

      <div className="tactical-card p-0 overflow-hidden mt-8 shadow-2xl">
        <div className="bg-slate-800/50 px-8 py-5 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Active Personnel Roster</h3>
          <span className="tactical-badge bg-[#60A5FA]/20 text-[#60A5FA] border border-[#60A5FA]/30">
            {users.length} Authorized
          </span>
        </div>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-slate-900 z-10 shadow-md">
              <tr>
                <th className="tactical-table-header px-8">Identifier</th>
                <th className="tactical-table-header">Access Level</th>
                <th className="tactical-table-header">Operational Base</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="tactical-table-cell px-8 text-white font-bold">{u.username.toUpperCase()}</td>
                  <td className="tactical-table-cell">
                     <span className={`tactical-badge border ${
                        u.role === 'ADMIN' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                        u.role === 'COMMANDER' ? 'bg-[#60A5FA]/10 border-[#60A5FA]/30 text-[#60A5FA]' :
                        'bg-blue-500/10 border-blue-500/30 text-blue-400'
                     }`}>
                       {u.role}
                     </span>
                  </td>
                  <td className="tactical-table-cell text-slate-400 font-medium">
                    {u.base ? `${u.base.name.toUpperCase()} (${u.base.location})` : 'GLOBAL OVERSIGHT'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
