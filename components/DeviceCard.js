import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getStatusForProfile } from '../lib/config';

export default function DeviceCard({ deviceConfig, profile, data, loading, tvHeightClass = 'min-h-[300px]', layoutMode }) {
  const [displayTemp, setDisplayTemp] = useState(0);

  useEffect(() => {
    if (data?.temperature !== undefined && data?.temperature !== null) {
      const target = data.temperature;
      const step = (target - displayTemp) / 10;
      if (Math.abs(step) > 0.01) {
        const timer = setTimeout(() => setDisplayTemp(prev => prev + step), 30);
        return () => clearTimeout(timer);
      } else {
        setDisplayTemp(target);
      }
    }
  }, [data?.temperature, displayTemp]);

  const currentTemp = data?.temperature;
  const status = getStatusForProfile(currentTemp, profile);

  // TV Enhancements for Alert Visibility
  const isWarning = status === 'warning';
  const isCritical = status === 'critical';
  const bgClass = isCritical 
    ? 'critical-active bg-red-600' 
    : isWarning 
      ? 'alert-active' 
      : 'bg-white border-slate-200';
    
  const textClass = isCritical ? 'text-white' : 'text-[#1e293b]';
  const labelClass = isCritical ? 'text-red-200' : 'text-slate-400';
  const iconColor = isCritical ? 'text-white' : 'text-slate-400';
  const statusBadgeBg = isCritical ? 'bg-red-500 border-red-400 text-white' : isWarning ? 'bg-orange-100 border-orange-200 text-orange-700' : 'bg-slate-50 border-slate-100 text-slate-700';

  const statusObj = {
    ok: { label: 'OPERATIVO', dot: 'bg-green-500', color: isCritical ? 'text-white' : 'text-green-600' },
    warning: { label: 'ALERTA', dot: 'bg-amber-500', color: isCritical ? 'text-white' : 'text-amber-600' },
    critical: { label: 'CRÍTICO', dot: 'bg-white', color: 'text-white' },
    offline: { label: 'OFFLINE', dot: 'bg-slate-400', color: isCritical ? 'text-white' : 'text-slate-500' }
  };
  const theme = statusObj[status];

  // SVG Icon Mapper for Profiles to ensure TV rendering
  const ProfileIcon = ({ name, className }) => {
    switch(name) {
      case 'flatware': return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11 4v5a2 2 0 01-2 2H7a2 2 0 01-2-2V4m6 0v16M17 4v16M17 4c-2 0-3 1.5-3 3v4h6V7c0-1.5-1-3-3-3z" /></svg>;
      case 'icecream': return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M7 11l4.08 10.35a1 1 0 001.84 0L17 11M17 7a5 5 0 00-10 0c0 2 2 4 2 4l3-3 3 3s2-2 2-4z" /></svg>;
      case 'shopping_cart': return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
      case 'inventory_2': return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
      default: return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>; // storefront fallback
    }
  };
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`sensor-card @container ${bgClass} border rounded-[16px] relative overflow-hidden group flex flex-col @4xl:flex-row ${tvHeightClass} @4xl:min-h-[160px] px-6 @md:px-8 py-5 @md:py-6 transition-colors duration-500 @4xl:items-center justify-between gap-6 @4xl:gap-8 w-full`}
    >
      {/* Watermark Logo */}
      <div className="absolute inset-0 flex items-center justify-end pr-4 @4xl:pr-12 overflow-hidden pointer-events-none select-none z-0">
        <div className={`font-black text-[max(4rem,min(12cqw,7rem))] italic opacity-[0.03] leading-none whitespace-nowrap tracking-tighter ${textClass}`}>
          {profile.name.toLowerCase()}
        </div>
      </div>

      <div className="relative z-10 flex flex-col @4xl:flex-row items-start @4xl:items-center justify-between w-full h-full gap-6 @4xl:gap-10 overflow-hidden">
        
        {/* Left Area: Profile Badge, Status */}
        <div className="flex flex-col justify-center flex-[1.2] w-full @4xl:w-auto @4xl:pr-4">
          <div className="flex items-center gap-2 @md:gap-3 mb-3 @4xl:mb-2 flex-wrap">
            <span 
              className="text-[10px] @md:text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-white shadow-sm flex-shrink-0"
              style={{ backgroundColor: profile.color }}
            >
              {profile.name} <span className="opacity-50 ml-1">•</span> {deviceConfig.id.replace('DEV-', '')}
            </span>
            <div className={`px-2 py-1 rounded-full flex items-center gap-1.5 border shadow-sm ${statusBadgeBg} flex-shrink-0`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
              <span className="text-[9px] font-black uppercase tracking-widest mt-[1px]">
                {status === 'offline' ? 'INACTIVO' : 'ACTIVO'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${theme.dot} ${status === 'ok' ? 'animate-pulse' : ''} ${isCritical ? 'animate-ping' : ''}`}></span>
            <p className={`text-[12px] @4xl:text-[13px] font-black uppercase tracking-widest ${theme.color}`}>
              {theme.label}
            </p>
          </div>
        </div>

        {/* Middle Area: Temperature & Alias */}
        <div className="flex flex-col items-start @4xl:items-center justify-center flex-[1.5] shrink-0 @4xl:border-l @4xl:border-r border-slate-200/50 @4xl:px-6 py-4 @4xl:py-0 w-full @4xl:w-auto mt-4 @4xl:mt-0 @4xl:min-h-[100px]">
          <div className="flex items-baseline justify-start @4xl:justify-center">
            {loading ? (
               <span className={`text-6xl @md:text-7xl @2xl:text-[5rem] @4xl:text-7xl font-bold leading-none tracking-tighter animate-pulse tabular-nums font-sans blur-[2px] opacity-70 ${textClass}`}>
                 4.0
               </span>
            ) : (
              <>
                <span className={`text-6xl @md:text-7xl @2xl:text-[5rem] @4xl:text-7xl font-bold leading-none tracking-tighter tabular-nums font-sans ${textClass}`}>
                  {status === 'offline' ? '--' : displayTemp.toFixed(1)}
                </span>
                <span className={`text-3xl @md:text-4xl @2xl:text-4xl @4xl:text-4xl font-light ml-2 opacity-50 ${labelClass}`}>
                  °C
                </span>
              </>
            )}
          </div>
          <h2 className={`text-xl @md:text-2xl font-serif font-black uppercase tracking-tight mt-3 @4xl:mt-2 leading-[1.2] text-left @4xl:text-center w-full break-words ${textClass}`}>
            {deviceConfig.alias || 'Controlador'}
          </h2>
        </div>

        {/* Right Area: Range & Settings */}
        <div className="flex items-center justify-between @4xl:justify-end flex-1 @4xl:pl-4 gap-4 @md:gap-6 w-full @4xl:w-auto mt-2 @4xl:mt-0 pt-4 @4xl:pt-0 border-t @4xl:border-t-0 border-slate-200/50">
          <div className="flex items-center gap-3">
            <ProfileIcon name={profile.icon} className={`w-8 h-8 @4xl:w-10 @4xl:h-10 ${iconColor} flex-shrink-0 opacity-80`} />
            <div className="flex flex-col">
              <span className={`text-[9px] @4xl:text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1 ${labelClass}`}>
                RANGO IDEAL
              </span>
              <span className={`text-[12px] @4xl:text-[14px] font-black uppercase tracking-widest leading-none italic ${textClass}`}>
                {profile.range.min}°C \~ {profile.range.max}°C
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-3 @md:gap-5">
            <div className="flex flex-col items-end">
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] leading-none mb-1 ${labelClass}`}>
                ÚLTIMO REGISTRO
              </span>
              <span className={`text-[11px] @4xl:text-[12px] font-bold leading-none ${isCritical ? 'text-white' : 'text-slate-600'}`}>
                {loading ? 'Actualizando...' : 'Reciente'}
              </span>
            </div>
            
            <a 
              href={`/settings?deviceId=${deviceConfig.id}`}
              className={`w-12 h-12 @4xl:w-14 @4xl:h-14 rounded-[12px] @4xl:rounded-[14px] flex items-center justify-center transition-colors shrink-0 cursor-pointer ${isCritical ? 'bg-red-500 hover:bg-red-400 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600'}`}
              title="Tuya Cloud Link"
            >
              <svg className="w-6 h-6 @4xl:w-7 @4xl:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </a>
          </div>
        </div>

      </div>
    </motion.section>
  );
}
