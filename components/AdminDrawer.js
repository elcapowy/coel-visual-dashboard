import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROFILES, AVAILABLE_DEVICES, DEFAULT_STORES_CONFIG } from '../lib/config';

// SVG Icon Mapper for Profiles to ensure TV rendering (Same as DeviceCard)
const ProfileIcon = ({ name, className }) => {
  switch(name) {
    case 'flatware': return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11 4v5a2 2 0 01-2 2H7a2 2 0 01-2-2V4m6 0v16M17 4v16M17 4c-2 0-3 1.5-3 3v4h6V7c0-1.5-1-3-3-3z" /></svg>;
    case 'icecream': return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M7 11l4.08 10.35a1 1 0 001.84 0L17 11M17 7a5 5 0 00-10 0c0 2 2 4 2 4l3-3 3 3s2-2 2-4z" /></svg>;
    case 'shopping_cart': return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
    case 'inventory_2': return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
    default: return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
  }
};

export default function AdminDrawer({ isOpen, onClose, onSave }) {
  const [config, setConfig] = useState(DEFAULT_STORES_CONFIG);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // Load from LocalStorage on mount
  useEffect(() => {
    if (isOpen) {
      const savedConfig = localStorage.getItem('coel_tv_config');
      if (savedConfig) {
        try {
          const parsedConfig = JSON.parse(savedConfig);
          if (parsedConfig && Array.isArray(parsedConfig.stores)) {
            setConfig({ ...DEFAULT_STORES_CONFIG, ...parsedConfig });
          } else {
            setConfig(DEFAULT_STORES_CONFIG);
          }
        } catch (e) {
          setConfig(DEFAULT_STORES_CONFIG);
        }
      } else {
        setConfig(DEFAULT_STORES_CONFIG);
      }
      setActiveTabIndex(0);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('coel_tv_config', JSON.stringify(config));
    onSave(config);
    onClose();
  };

  const activeStore = config.stores[activeTabIndex] || config.stores[0];

  const updateActiveStore = (updater) => {
    const updatedStores = [...config.stores];
    updatedStores[activeTabIndex] = { ...updatedStores[activeTabIndex], ...updater };
    setConfig({ ...config, stores: updatedStores });
  };

  const handleDeviceToggle = (deviceId) => {
    let devices = [...activeStore.devices];
    const exists = devices.find(d => d.id === deviceId);
    
    if (exists) {
      devices = devices.filter(d => d.id !== deviceId);
    } else {
      devices.push({ id: deviceId, alias: '' });
    }
    updateActiveStore({ devices });
  };

  const handleAliasChange = (deviceId, newAlias) => {
    const devices = activeStore.devices.map(d => 
      d.id === deviceId ? { ...d, alias: newAlias } : d
    );
    updateActiveStore({ devices });
  };

  const handleAddStore = () => {
    const newStore = {
      id: `store_${Date.now()}`,
      name: `Nueva Tienda ${config.stores.length + 1}`,
      profileId: 'storefront',
      devices: []
    };
    setConfig({ ...config, stores: [...config.stores, newStore] });
    setActiveTabIndex(config.stores.length);
  };

  const handleRemoveStore = (indexToRemove) => {
    if (config.stores.length <= 1) return; // Must have at least one store
    
    const newStores = config.stores.filter((_, idx) => idx !== indexToRemove);
    setConfig({ ...config, stores: newStores });
    
    if (activeTabIndex >= newStores.length) {
      setActiveTabIndex(newStores.length - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200]"
      />

      {/* Drawer */}
      <motion.div 
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-[450px] bg-white border-l border-slate-200 shadow-2xl z-[210] flex flex-col font-sans"
      >
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 className="text-[18px] font-black tracking-tight text-[#1e293b] leading-none mb-0.5 uppercase">
              Admin TV Dashboard
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Global Settings */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white space-y-4">
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-slate-800">Rotación Automática</span>
              <span className="text-[11px] text-slate-500">Alternar tiendas cada 30 segundos</span>
            </div>
            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${config.autoRotate ? 'bg-green-500' : 'bg-slate-200'}`}>
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${config.autoRotate ? 'translate-x-4' : ''}`} />
            </div>
            <input type="checkbox" className="hidden" checked={config.autoRotate} onChange={(e) => setConfig({...config, autoRotate: e.target.checked})} />
          </label>

          <div className="flex flex-col pt-2 border-t border-slate-100 gap-2">
            <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Modo de Visualización (TV)</span>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {['auto', 'grid', 'list'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setConfig({...config, layoutMode: mode})}
                  className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all ${
                    (config.layoutMode || 'auto') === mode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {mode === 'auto' ? 'Adaptativo' : mode === 'grid' ? 'Cuadrícula' : 'Lista'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Store Tabs */}
        <div className="flex z-10 sticky top-0 bg-white border-b border-slate-200 overflow-x-auto no-scrollbar pt-2">
          {config.stores.map((store, index) => (
            <button
              key={store.id}
              onClick={() => setActiveTabIndex(index)}
              className={`flex-shrink-0 px-6 py-4 font-black uppercase tracking-widest text-[11px] border-b-2 transition-colors flex items-center gap-2 ${
                activeTabIndex === index 
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              {store.name}
            </button>
          ))}
          <button
            onClick={handleAddStore}
            className="flex-shrink-0 px-4 py-4 text-slate-400 hover:text-blue-600 transition-colors flex items-center justify-center border-b-2 border-transparent"
            title="Agregar Tienda"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50">
          <div className="p-6 space-y-8">
            
            {/* Store Name & Delete Button */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Nombre de la Sucursal</span>
                {config.stores.length > 1 && (
                  <button 
                    onClick={() => handleRemoveStore(activeTabIndex)}
                    className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    Eliminar Tienda
                  </button>
                )}
              </div>
              <input 
                type="text" 
                value={activeStore.name}
                onChange={(e) => updateActiveStore({ name: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-[8px] px-4 py-3 text-[14px] font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="Ej: Tienda Centro"
              />
            </div>

            {/* Profile Selection */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Perfil Operativo (Rangos Automáticos)</span>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(PROFILES).map(profile => (
                  <button 
                    key={profile.id}
                    onClick={() => updateActiveStore({ profileId: profile.id })}
                    className={`flex items-center gap-2 p-2 rounded-[6px] border text-[11px] font-bold text-left transition-colors ${
                      activeStore.profileId === profile.id 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ProfileIcon name={profile.icon} className="w-5 h-5 shrink-0" />
                    <span className="leading-tight">{profile.name}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Device Selection & Aliases */}
            <div className="flex flex-col gap-3 mt-8">
              <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Controladores Asignados (Máx 10)</span>
              
              <div className="bg-white border border-slate-200 rounded-[12px] overflow-hidden divide-y divide-slate-100 shadow-sm">
                {AVAILABLE_DEVICES.map(device => {
                  const assignedDevice = activeStore.devices.find(d => d.id === device.id);
                  const isAssigned = !!assignedDevice;
                  
                  return (
                    <div key={device.id} className={`p-4 transition-colors ${isAssigned ? 'bg-blue-50/20' : ''}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 4H4v4h4V4zm0 12H4v4h4v-4zm12-12h-4v4h4V4zm-7 7H9v2h2v-2zm-2 4h4v2H9v-2zm7-4h-2v2h2v-2zm-7-4H9v2h2V9zm7 0h-2v2h2V9zm-5 4H9v2h2v-2z" />
                          </svg>
                          <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-slate-800">{device.id}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{device.tuyaId}</span>
                          </div>
                        </div>
                        
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={isAssigned}
                            onChange={() => handleDeviceToggle(device.id)}
                            disabled={!isAssigned && activeStore.devices.length >= 10}
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      {/* Alias Input (Only shows if assigned) */}
                      <AnimatePresence>
                        {isAssigned && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="pl-9 overflow-hidden"
                          >
                            <input 
                              type="text" 
                              value={assignedDevice.alias || ''}
                              onChange={(e) => handleAliasChange(device.id, e.target.value)}
                              placeholder="Alias (Ej: Mostrador 1)"
                              className="w-full text-[12px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-[6px] outline-none focus:border-blue-400 transition-colors"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-[8px] text-[12px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 py-3 bg-[#3c82f6] text-white rounded-[8px] text-[12px] font-black uppercase tracking-widest shadow-sm hover:bg-blue-600 transition-colors"
          >
            Aplicar Cambios
          </button>
        </div>
      </motion.div>
    </>
  );
}
