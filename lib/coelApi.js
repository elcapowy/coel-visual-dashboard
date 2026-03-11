export const fetchDeviceHistory = async (deviceId, period = "24h") => {
  try {
    const res = await fetch(`/api/coel/history?deviceId=${deviceId}&period=${period}`);
    if (!res.ok) throw new Error("Error al obtener datos");
    return await res.json();
  } catch (error) {
    console.error("API Error:", error);
    return { ok: false, message: error.message };
  }
};
