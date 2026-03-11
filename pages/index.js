import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { PROFILES, DEFAULT_STORES_CONFIG } from '../lib/config';
import { fetchDeviceHistory } from '../lib/coelApi';
import DeviceCard from '../components/DeviceCard';
import AdminDrawer from '../components/AdminDrawer';

// SVG Icon Mapper for Profiles (Shared from DeviceCard to avoid font loading bugs)
const ProfileIcon = ({ name, className }) => {
  switch(name) {
    case 'flatware': return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11 4v5a2 2 0 01-2 2H7a2 2 0 01-2-2V4m6 0v16M17 4v16M17 4c-2 0-3 1.5-3 3v4h6V7c0-1.5-1-3-3-3z" /></svg>;
    case 'icecream': return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M7 11l4.08 10.35a1 1 0 001.84 0L17 11M17 7a5 5 0 00-10 0c0 2 2 4 2 4l3-3 3 3s2-2 2-4z" /></svg>;
    case 'shopping_cart': return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
    case 'inventory_2': return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
    default: return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
  }
};

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [appConfig, setAppConfig] = useState(DEFAULT_STORES_CONFIG);
  
  // Store state: index for appConfig.stores array
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [devicesData, setDevicesData] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSwitchingStore, setIsSwitchingStore] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);

  // 1. Inactivity Timer for Auto-Hiding TV Header
  useEffect(() => {
    if (!mounted) return;
    let timeoutId;

    const wakeUp = () => {
      setHeaderVisible(true);
      clearTimeout(timeoutId);
      // Auto-hide after 10 seconds of inactivity
      timeoutId = setTimeout(() => {
        // Do not hide if the admin drawer is actively open
        if (!drawerOpen) {
          setHeaderVisible(false);
        }
      }, 10000);
    };

    // Initial trigger
    wakeUp();

    window.addEventListener('mousemove', wakeUp);
    window.addEventListener('keydown', wakeUp);
    window.addEventListener('touchstart', wakeUp);
    window.addEventListener('click', wakeUp);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', wakeUp);
      window.removeEventListener('keydown', wakeUp);
      window.removeEventListener('touchstart', wakeUp);
      window.removeEventListener('click', wakeUp);
    };
  }, [mounted, drawerOpen]);

  // 2. Load config from LocalStorage on mount
  const loadConfig = () => {
    const saved = localStorage.getItem('coel_tv_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.stores)) {
          setAppConfig({ ...DEFAULT_STORES_CONFIG, ...parsed });
        } else {
          console.warn("Legacy TV config detected. Resetting to defaults.");
          setAppConfig(DEFAULT_STORES_CONFIG);
          localStorage.setItem('coel_tv_config', JSON.stringify(DEFAULT_STORES_CONFIG));
        }
      } catch (e) {
        setAppConfig(DEFAULT_STORES_CONFIG);
      }
    } else {
      setAppConfig(DEFAULT_STORES_CONFIG);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadConfig();
  }, []);

  // 2. Auto-Rotate Logic
  useEffect(() => {
    if (!mounted || !appConfig.autoRotate || !appConfig.stores?.length) return;
    const interval = setInterval(() => {
      setActiveTabIndex(prev => (prev + 1) % appConfig.stores.length);
      setIsSwitchingStore(true);
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [mounted, appConfig.autoRotate, appConfig.stores?.length]);

  // 3. Data Fetching
  const refreshData = async (storeIndex) => {
    setLoading(true);
    const storeObj = appConfig.stores?.[storeIndex];
    if (!storeObj) return;

    const devicesToFetch = storeObj.devices;
    const newData = { ...devicesData };
    
    await Promise.all(
      devicesToFetch.map(async (dev) => {
        // Fetch last 24h by default for TV mode to show immediate trends
        const res = await fetchDeviceHistory(dev.id, '24h');
        newData[dev.id] = res;
      })
    );
    
    setDevicesData(newData);
    setLoading(false);
    setTimeout(() => setIsSwitchingStore(false), 500); // UI breathing room
  };

  useEffect(() => {
    if (mounted && appConfig.stores?.length > 0) {
      refreshData(activeTabIndex);
    }
  }, [activeTabIndex, mounted, appConfig]); // re-fetch if config changes (like assigned devices)

  if (!mounted || !appConfig.stores) return <div className="min-h-screen bg-[#f8fafc]" />;

  const currentStore = appConfig.stores[activeTabIndex] || appConfig.stores[0];
  const activeProfile = PROFILES[currentStore.profileId] || PROFILES.multitienda;
  const configuredDevices = currentStore.devices;
  
  // TV Mode Adaptive Layout Logic
  const count = configuredDevices.length;
  const layoutMode = appConfig.layoutMode || 'auto';
  
  // Decide Grid Columns
  let gridClass = 'grid-cols-1 gap-6 sm:gap-10'; // Default
  if (layoutMode === 'grid') {
    gridClass = 'grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6'; // Denser grid but safe
  } else if (layoutMode === 'auto') {
    if (count === 1) gridClass = 'grid-cols-1 gap-10';
    else if (count <= 4) gridClass = 'grid-cols-1 xl:grid-cols-2 gap-8';
    else gridClass = 'grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6';
  } else if (layoutMode === 'list') {
    gridClass = 'grid-cols-1 gap-6'; // Single column always
  }

  // Card Height Logic
  let cardHeightStyle = 'min-h-[350px] lg:min-h-[45vh]'; // Default tall card
  
  if (layoutMode === 'grid' || count >= 5) {
     // Denser grids need slightly shorter cards, but never squished
     cardHeightStyle = 'min-h-[250px] sm:min-h-[300px] lg:min-h-[28vh]';
  }
  
  if (layoutMode === 'list') {
    // Lists should always be tall enough to read easily
    cardHeightStyle = 'min-h-[300px] lg:min-h-[35vh]';
  }

  // Always allow scrolling if content overflows, but keep it clean
  const mainContainerStyle = "flex-1 w-full max-w-[2560px] mx-auto px-4 sm:px-8 py-6 sm:py-8 overflow-y-auto pb-32 no-scrollbar flex flex-col justify-start";

  return (
    <div className="h-screen w-screen bg-[#f8fafc] text-[#1e293b] font-sans flex flex-col relative select-none">
      <Head>
        <title>{currentStore.name} - TV Dashboard</title>
      </Head>

      {/* --- ADMIN DRAWER --- */}
      <AdminDrawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        onSave={loadConfig} 
      />

      {/* --- TV HEADER MASTER SWITCH (Auto-Hiding) --- */}
      <motion.div
        initial={false}
        animate={{ 
          height: headerVisible || drawerOpen ? 'auto' : 0, 
          opacity: headerVisible || drawerOpen ? 1 : 0 
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full shrink-0 z-40 origin-top overflow-hidden"
      >
        <header className="w-full bg-white border-b border-slate-200 px-10 py-5 flex justify-between items-center shadow-sm relative">
        {/* Profile Accent Color Line at Top */}
        <div className="absolute top-0 left-0 w-full h-1.5 transition-colors duration-1000" style={{ backgroundColor: activeProfile.color }} />
        
        <div className="flex items-center gap-8">
          {/* Main Master Switch Button for TV */}
          <button 
             onClick={() => {
               if (appConfig.stores.length > 1) {
                 setIsSwitchingStore(true);
                 setActiveTabIndex(prev => (prev + 1) % appConfig.stores.length);
               }
             }}
             className="flex items-center gap-5 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:shadow-md transition-all px-6 py-3 rounded-2xl group active:scale-[0.98]"
          >
             <div 
               className="w-14 h-14 rounded-xl text-white flex items-center justify-center shadow-sm transition-colors duration-500 shrink-0"
               style={{ backgroundColor: activeProfile.color }}
             >
                <ProfileIcon name={activeProfile.icon} className="w-8 h-8" />
             </div>
             <div className="flex flex-col items-start pr-4">
               <span className="text-[11px] font-black tracking-[0.2em] uppercase text-slate-400 mb-0.5">
                 {activeProfile.name}
               </span>
               <h1 className="text-3xl font-serif font-black tracking-tight text-[#1e293b] leading-none group-hover:text-blue-700 transition-colors">
                 {currentStore.name}
               </h1>
             </div>
             {/* Swap Icon SVG */}
             <svg className="w-8 h-8 text-slate-300 group-hover:text-slate-600 transition-colors ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
             </svg>
          </button>
        </div>
        
        <div className="flex items-center gap-10">
          {/* Auto Rotate Indicator */}
          {appConfig.autoRotate && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50/50 border border-blue-100 text-blue-600 rounded-full animate-pulse">
              {/* Autorenew Icon SVG */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-[10px] font-black tracking-widest uppercase">TV Auto-Rotate</span>
            </div>
          )}

          {/* Time & Sync Status */}
          <div className="text-right flex flex-col items-end">
            <div className="text-xl font-bold text-[#1e293b] uppercase tracking-widest flex items-baseline gap-2 leading-none">
              {new Date().toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' }).replace('.', '').toUpperCase()}
              <span className="text-slate-400 font-medium tabular-nums ml-2">
                 {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className={`w-2.5 h-2.5 rounded-full ${loading || isSwitchingStore ? 'bg-amber-400 animate-pulse' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'}`}></span>
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">
                 {isSwitchingStore ? 'CARGANDO SUCURSAL...' : loading ? 'Sincronizando...' : 'Online & Sync'}
              </span>
            </div>
          </div>

          <div className="w-px h-12 bg-slate-200 mx-2" />

          {/* Admin Toggle */}
          <button 
            onClick={() => setDrawerOpen(true)}
            className="w-14 h-14 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl flex items-center justify-center transition-all hover:rotate-90 shadow-sm"
          >
            {/* Settings Icon SVG */}
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>
      </motion.div>

      {/* --- MAIN TV CONTENT (Adaptive Grid) --- */}
      <main className={mainContainerStyle}>
        <AnimatePresence mode="popLayout">
          <motion.div 
            key={currentStore?.id || activeTabIndex} // Forces re-animation when store swaps
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className={`grid ${gridClass} w-full content-start pb-10 min-h-0`}
          >
             {configuredDevices.map(devConf => {
                const deviceData = devicesData[devConf.id];
                return (
                  <DeviceCard 
                    key={devConf.id} 
                    deviceConfig={devConf} 
                    profile={activeProfile}
                    data={deviceData} 
                    loading={loading || isSwitchingStore}
                    tvHeightClass={cardHeightStyle}
                    layoutMode={layoutMode}
                  />
                )
             })}
             
             {configuredDevices.length === 0 && (
               <div className="col-span-full h-full w-full flex flex-col items-center justify-center text-slate-400">
                 <svg className="w-24 h-24 mb-6 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                 </svg>
                 <p className="font-serif text-4xl text-[#1e293b] text-center">Sin Controladores Asignados</p>
                 <p className="font-sans text-xl mt-4 max-w-lg text-center">
                   Abre el Panel de Configuración (⚙️) para asignar canales de temperatura a esta sucursal.
                 </p>
               </div>
             )}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}
