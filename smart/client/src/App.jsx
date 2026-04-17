import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, ArrowRightLeft, PackageOpen, LogOut, Activity, Users } from 'lucide-react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Operations from './components/Operations';
import Personnel from './components/Personnel';
import axios from 'axios';
import './index.css';

axios.defaults.baseURL = 'http://localhost:5000/api';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  useEffect(() => {
    if (user && localStorage.getItem('token')) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
    }
  }, [user]);

  const handleLogin = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0F172A] text-slate-100 selection:bg-[#60A5FA] selection:text-slate-900">
        <nav className="sticky top-0 z-50 bg-[#1E293B] border-b border-slate-700 px-6 py-4 flex justify-between items-center shadow-2xl">
          <div className="flex items-center gap-4">
            <Shield className="text-[#60A5FA]" size={32} />
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white m-0 leading-tight">M.A.M.S</h2>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">Military Asset Management</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-[#60A5FA] transition-colors">
              <LayoutDashboard size={18} /> DASHBOARD
            </Link>
            <Link to="/operations" className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-[#60A5FA] transition-colors">
              <ArrowRightLeft size={18} /> OPERATIONS
            </Link>
            {user.role === 'ADMIN' && (
              <Link to="/personnel" className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-[#60A5FA] transition-colors">
                <Users size={18} /> PERSONNEL
              </Link>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-white">{user.username}</span>
              <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300 font-bold uppercase tracking-wider">{user.role}</span>
            </div>
            <button 
              className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all active:scale-95" 
              onClick={handleLogout}
              title="Logout System"
            >
              <LogOut size={20} />
            </button>
          </div>
        </nav>

        <main className="max-w-[1600px] mx-auto p-4 sm:p-8 lg:p-10">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/operations" element={<Operations user={user} />} />
            <Route path="/personnel" element={user.role === 'ADMIN' ? <Personnel user={user} /> : <Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
