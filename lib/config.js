// 📋 Dynamic Profiles Configuration
export const PROFILES = {
  carniceria: {
    id: 'carniceria',
    name: 'Carnicería',
    range: { min: 0, max: 4 },
    criticalThreshold: 6, // > 6°C
    color: '#dc2626', // Red
    icon: 'flatware'
  },
  heladeria: {
    id: 'heladeria',
    name: 'Heladería',
    range: { min: -22, max: -18 },
    criticalThreshold: -14, // > -14°C
    color: '#0284c7', // Sky blue
    icon: 'icecream'
  },
  supermercado: {
    id: 'supermercado',
    name: 'Supermercado',
    range: { min: 2, max: 6 },
    criticalThreshold: 8, // > 8°C
    color: '#16a34a', // Green
    icon: 'shopping_cart'
  },
  almacen: {
    id: 'almacen',
    name: 'Almacén / Cava',
    range: { min: 12, max: 16 },
    criticalMin: 10,  // < 10°C
    criticalMax: 18,  // > 18°C
    color: '#ea580c', // Orange
    icon: 'inventory_2'
  },
  multitienda: {
    id: 'multitienda',
    name: 'Personalizable',
    range: { min: 0, max: 5 }, // Default
    color: '#475569', // Slate
    icon: 'storefront'
  }
};

// 🗄️ Available Devices Pool (DEV-001 to DEV-010)
export const AVAILABLE_DEVICES = Array.from({ length: 10 }, (_, i) => ({
  id: `DEV-${String(i + 1).padStart(3, '0')}`,
  alias: `Equipo ${i + 1}`
}));

// Default Store Configurations (Fallback if localStorage is empty)
export const DEFAULT_STORES_CONFIG = {
  stores: [
    {
      id: 'store_1',
      name: 'Tienda 1',
      profileId: 'carniceria',
      devices: [
        { id: 'DEV-001', alias: 'Cámara Principal' },
        { id: 'DEV-002', alias: 'Mostrador Carnes' }
      ]
    },
    {
      id: 'store_2',
      name: 'Tienda 2',
      profileId: 'heladeria',
      devices: [
        { id: 'DEV-003', alias: 'Exhibidora Helados' }
      ]
    }
  ],
  autoRotate: false,
  layoutMode: 'auto' // 'auto', 'grid', 'list'
};

export const getStatusForProfile = (temp, profileObj) => {
  if (temp === null || temp === undefined || isNaN(temp)) return 'offline';
  const profile = profileObj || PROFILES.multitienda;
  
  // Custom critical logic for Almacen (Min & Max)
  if (profile.criticalMin !== undefined && temp < profile.criticalMin) return 'critical';
  if (profile.criticalMax !== undefined && temp > profile.criticalMax) return 'critical';
  
  // Standard Critical Threshold (usually heat is bad)
  if (profile.criticalThreshold !== undefined && temp > profile.criticalThreshold) return 'critical';
  
  // Check against ideal range boundaries
  if (temp > profile.range.max || temp < profile.range.min) return 'warning';
  
  return 'ok';
};
