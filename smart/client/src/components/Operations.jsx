import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield } from 'lucide-react';

export default function Operations({ user }) {
  const [activeTab, setActiveTab] = useState('PURCHASE');
  
  const [bases, setBases] = useState([]);
  const [assets, setAssets] = useState([]);
  
  // Form State
  const [assetId, setAssetId] = useState('');
  const [fromBaseId, setFromBaseId] = useState(user && user.role !== 'ADMIN' && user.baseId ? user.baseId : '');
  const [toBaseId, setToBaseId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reference, setReference] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    try {
      const bRes = await axios.get('/bases');
      setBases(bRes.data);
      const aRes = await axios.get('/assets');
      setAssets(aRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    try {
      let endpoint = '';
      let payload = {
        assetId: parseInt(assetId),
        quantity: parseInt(quantity),
        reference
      };

      if (activeTab === 'PURCHASE') {
        endpoint = '/transactions/purchase';
        payload.toBaseId = parseInt(toBaseId);
      } else if (activeTab === 'TRANSFER') {
        endpoint = '/transactions/transfer';
        payload.fromBaseId = parseInt(fromBaseId);
        payload.toBaseId = parseInt(toBaseId);
      } else if (activeTab === 'ASSIGN' || activeTab === 'EXPEND') {
        endpoint = '/transactions/assign';
        payload.fromBaseId = parseInt(fromBaseId);
        payload.type = activeTab;
      }

      await axios.post(endpoint, payload);
      setMessage({ text: 'Transaction recorded successfully!', type: 'success' });
      setQuantity('');
      setReference('');
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Transaction failed', type: 'error' });
    }
  };

  return (
    <div className="animate-in fade-in duration-700 max-w-4xl mx-auto">
      <div className="mb-12">
        <h1 className="tactical-header-1 mb-1 italic">STRATEGIC OPERATIONS</h1>
        <p className="text-slate-400 text-sm font-medium">Execute asset procurement, transfer, and deployment protocols</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        {['PURCHASE', 'TRANSFER', 'ASSIGN', 'EXPEND'].map(tab => {
          // RBAC for tabs
          if (tab === 'PURCHASE' && user.role === 'COMMANDER') return null;
          if (tab === 'ASSIGN' && user.role === 'LOGISTICS') return null;
          if (tab === 'EXPEND' && user.role === 'LOGISTICS') return null;

          const isActive = activeTab === tab;
          return (
            <button 
              key={tab}
              className={`tactical-btn text-xs tracking-[0.15em] font-black border uppercase transition-all
                ${isActive 
                  ? 'bg-[#60A5FA] text-slate-900 border-[#60A5FA] shadow-[0_0_15px_rgba(96,165,250,0.25)]' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white'}`}
              onClick={() => { setActiveTab(tab); setMessage({ text: '', type: ''}); }}
            >
              {tab}
            </button>
          )
        })}
      </div>

      <div className="tactical-card relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Shield size={120} />
        </div>

        <h2 className="tactical-header-2 border-b border-slate-700 pb-4 mb-8 uppercase tracking-widest text-sm font-black">
          INITIATE {activeTab.replace('_', ' ')} PROTOCOL
        </h2>
        
        {message.text && (
          <div className={`mb-8 p-4 rounded border flex items-center gap-3 animate-in slide-in-from-top-2 duration-300
            ${message.type === 'success' 
              ? 'bg-green-500/10 border-green-500/30 text-green-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
            <span className="text-sm font-bold tracking-wide uppercase">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleTransaction} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="tactical-label">Target Asset Specifications</label>
            <select className="tactical-input w-full" value={assetId} onChange={e => setAssetId(e.target.value)} required>
              <option value="">SELECT CLASSIFIED ASSET...</option>
              {assets.map(a => <option key={a.id} value={a.id}>{a.name.toUpperCase()} [{a.type}]</option>)}
            </select>
          </div>

          {(activeTab === 'TRANSFER' || activeTab === 'ASSIGN' || activeTab === 'EXPEND') && (
            <div className="space-y-2">
              <label className="tactical-label">Origin Deployment Base</label>
              <select 
                className="tactical-input w-full disabled:bg-slate-900/50 disabled:text-slate-500"
                value={fromBaseId} 
                onChange={e => setFromBaseId(e.target.value)} 
                required 
                disabled={user.role !== 'ADMIN' && user.baseId}
              >
                <option value="">IDENTIFY ORIGIN...</option>
                {bases.map(b => (
                   <option key={b.id} value={b.id} hidden={user.role !== 'ADMIN' && b.id !== user.baseId}>{b.name.toUpperCase()}</option>
                ))}
              </select>
            </div>
          )}

          {(activeTab === 'PURCHASE' || activeTab === 'TRANSFER') && (
            <div className="space-y-2">
              <label className="tactical-label">Destination Deployment Base</label>
              <select className="tactical-input w-full" value={toBaseId} onChange={e => setToBaseId(e.target.value)} required>
                 <option value="">IDENTIFY DESTINATION...</option>
                {bases.map(b => <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>)}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="tactical-label">Unit Quantity</label>
            <input 
              type="number" 
              className="tactical-input w-full font-mono"
              min="1" 
              value={quantity} 
              onChange={e => setQuantity(e.target.value)} 
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="tactical-label">
              {activeTab === 'ASSIGN' ? 'Personnel IC / Identification' : 'Mission Reference Code'}
            </label>
            <input 
              type="text" 
              className="tactical-input w-full"
              value={reference} 
              onChange={e => setReference(e.target.value)} 
              placeholder="e.g. ALPHA-9-LEAD"
            />
          </div>

          <div className="col-span-1 md:col-span-2 pt-6">
            <button 
              type="submit" 
              className="tactical-btn tactical-btn-primary w-full py-4 text-xs font-black uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-3"
            >
              EXECUTE {activeTab} PROTOCOL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
