import React, { useState } from 'react';
import axios from 'axios';
import { Shield } from 'lucide-react';

export default function Auth({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/login', { username, password });
      onLogin(res.data.user, res.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0F172A]">
      <div className="tactical-card w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center mb-10">
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700 mb-6 shadow-2xl">
            <Shield size={48} className="text-[#60A5FA]" />
          </div>
          <h2 className="tactical-header-1 mb-1">M.A.M.S LOGIN</h2>
          <p className="text-slate-400 font-medium tracking-wide">Military Asset Management System</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-md mb-8 text-sm font-medium flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-sm shadow-red-400" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="tactical-label">Username</label>
            <input 
              type="text" 
              className="tactical-input w-full"
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="e.g., admin or commander_alpha"
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="tactical-label">Password</label>
            <input 
              type="password" 
              className="tactical-input w-full"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>
          <button 
            type="submit" 
            className="tactical-btn tactical-btn-primary w-full py-3.5 mt-4 uppercase tracking-[0.2em] text-xs font-black"
          >
            Secure Login
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-slate-700/50 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            Authorized Personnel Only • Sector Alpha 7
          </p>
        </div>
      </div>
    </div>
  );
}
