import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Settings() {
  const router = useRouter();
  const { deviceId } = router.query;

  const [formData, setFormData] = useState({
    accessId: '',
    accessSecret: '',
    deviceId: ''
  });

  useEffect(() => {
    if (deviceId) {
      setFormData(prev => ({ ...prev, deviceId: deviceId }));
    }
  }, [deviceId]);

  
  const [connectionState, setConnectionState] = useState({
    status: 'IDLE',
    gateway: 'Waiting for credentials...'
  });
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setConnectionState({ status: 'CONNECTING...', gateway: 'Authenticating...' });

    try {
      const response = await fetch('/api/coel/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      setConnectionState({
        status: data.status,
        gateway: data.gateway
      });
      
    } catch (error) {
      setConnectionState({
        status: 'ERROR',
        gateway: 'Connection failed'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans selection:bg-orange-100 flex flex-col items-center">
      <Head>
        <title>COEL - Settings</title>
      </Head>

      {/* --- TOP HEADER --- */}
      <header className="w-full bg-[#f8fafc] border-b border-orange-100/50 px-8 py-5 flex justify-between items-center relative z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#ea580c] rounded-[10px] text-white flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[24px]">ac_unit</span>
          </div>
          <div>
            <h1 className="text-[16px] font-black tracking-tight text-[#1e293b] leading-none mb-0.5">
              COEL
            </h1>
            <p className="text-slate-500 font-medium text-[11px] leading-none">
              Monitoring Systems
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 text-red-500 rounded-full">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="text-[10px] font-black tracking-widest uppercase mt-0.5">Disconnected</span>
          </div>
          <button className="w-10 h-10 bg-slate-200/50 text-slate-600 rounded-[10px] flex items-center justify-center hover:bg-slate-200 transition-colors">
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow w-full max-w-[1000px] mt-12 px-6 pb-20">
        
        {/* HERO BANNER */}
        <div className="relative w-full h-[220px] rounded-[16px] overflow-hidden shadow-sm mb-6 border border-slate-200/60">
          <div className="absolute inset-0 bg-slate-900">
             {/* Instead of actual image, simulating the industrial pipes background */}
             <div className="absolute inset-0 opacity-40" 
                  style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #475569 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
             <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          </div>
          <div className="absolute inset-0 p-10 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-[#ea580c] mb-3">
              <span className="material-symbols-outlined text-[16px]">cloud</span>
              <span className="text-[10px] font-black tracking-widest uppercase">CLOUD LINK PROTOCOL</span>
            </div>
            <h2 className="text-white text-4xl font-black font-sans tracking-tight mb-2">
              Tuya API Connection
            </h2>
            <p className="text-slate-300 text-[13px] max-w-[500px] leading-relaxed">
              Integrate your industrial refrigeration units with the Tuya IoT cloud for real-time telemetry and alerts.
            </p>
          </div>
        </div>

        {/* CONNECTION PANEL */}
        <div className="w-full bg-white border border-slate-200 shadow-sm rounded-[16px] p-10 flex gap-12">
          
          {/* LEFT: FORM */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-[#1e293b] tracking-widest uppercase">Access ID</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-slate-400 text-[18px]">key</span>
                <input 
                  type="text" 
                  value={formData.accessId}
                  onChange={(e) => setFormData({...formData, accessId: e.target.value})}
                  placeholder="Ex: xt7...34j"
                  className="w-full bg-[#f8fafc] border border-slate-200 text-slate-700 text-[14px] rounded-[10px] py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-[#1e293b] tracking-widest uppercase">Access Secret</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-slate-400 text-[18px]">lock</span>
                <input 
                  type="password" 
                  value={formData.accessSecret}
                  onChange={(e) => setFormData({...formData, accessSecret: e.target.value})}
                  placeholder="•••••••••••••"
                  className="w-full bg-[#f8fafc] border border-slate-200 text-slate-700 text-[14px] rounded-[10px] py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400 font-mono tracking-widest"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-2">
              <label className="text-[10px] font-black text-[#1e293b] tracking-widest uppercase">Device ID</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-slate-400 text-[18px]">router</span>
                <input 
                  type="text" 
                  value={formData.deviceId}
                  onChange={(e) => setFormData({...formData, deviceId: e.target.value})}
                  placeholder="Ex: dev_982...xyz"
                  className="w-full bg-[#f8fafc] border border-slate-200 text-slate-700 text-[14px] rounded-[10px] py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#ea580c] hover:bg-[#d9460a] text-white rounded-[10px] py-3.5 flex items-center justify-center gap-2 transition-colors active:scale-[0.98] font-bold shadow-sm disabled:opacity-70"
            >
              <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>
                {loading ? 'progress_activity' : 'bolt'}
              </span>
              <span>Establish Connection</span>
            </button>
          </form>

          {/* RIGHT: DETAILS & STATUS */}
          <div className="flex-1 bg-[#f8fafc] rounded-[12px] p-8 border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-6 rounded-full bg-[#ea580c] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                </div>
                <h3 className="text-[15px] font-bold text-[#1e293b]">Connection Details</h3>
              </div>
              
              <ul className="space-y-5">
                <li className="flex gap-3 items-start">
                  <span className="material-symbols-outlined text-slate-400 text-[16px] mt-0.5">check_circle</span>
                  <p className="text-[12px] text-slate-600 leading-relaxed">
                    Ensure your Tuya project is set up in the <span className="text-[#ea580c]">Cloud Development</span> section.
                  </p>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="material-symbols-outlined text-slate-400 text-[16px] mt-0.5">check_circle</span>
                  <p className="text-[12px] text-slate-600 leading-relaxed">
                    Whitelist the monitoring server IP in your Access Control settings.
                  </p>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="material-symbols-outlined text-slate-400 text-[16px] mt-0.5">check_circle</span>
                  <p className="text-[12px] text-slate-600 leading-relaxed">
                    Data is synced via MQTT every 60 seconds by default.
                  </p>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">Current Status</span>
                <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-1 rounded bg-slate-200 text-slate-600`}>
                  {connectionState.status}
                </span>
              </div>
              
              <div className="bg-white border text-center text-slate-500 py-6 text-sm border-slate-200 rounded-[8px] flex items-center gap-4 px-5">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${connectionState.status === 'CONNECTED' ? 'bg-green-50 text-green-500' : 'bg-slate-100 text-slate-400'}`}>
                    <span className="material-symbols-outlined">{connectionState.status === 'CONNECTED' ? 'wifi' : 'wifi_off'}</span>
                 </div>
                 <div className="flex flex-col items-start gap-1">
                    <span className="text-[13px] font-bold text-[#1e293b] leading-none">{connectionState.status === 'CONNECTED' ? 'Gateway Online' : 'Gateway Offline'}</span>
                    <span className="text-[11px] text-slate-400 leading-none">{connectionState.gateway}</span>
                 </div>
              </div>
            </div>

          </div>
        </div>

      </main>

      <footer className="w-full max-w-[1000px] flex items-center justify-between px-6 pb-8">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-400">
               <span className="material-symbols-outlined text-[14px]">shield</span>
               <span className="text-[9px] font-black tracking-widest uppercase mt-0.5">AES-256 Encrypted</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
               <span className="material-symbols-outlined text-[14px]">cloud</span>
               <span className="text-[9px] font-black tracking-widest uppercase mt-0.5">Tuya Certified</span>
            </div>
         </div>
         <div className="text-[10px] text-slate-400">
            © 2024 COEL Industrial Automation. All rights reserved.
         </div>
      </footer>
    </div>
  );
}
