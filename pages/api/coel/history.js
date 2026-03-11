export default async function handler(req, res) {
  try {
    const { deviceId, period = "24h" } = req.query;

    if (!deviceId) {
      return res.status(400).json({ ok: false, message: "Falta deviceId" });
    }

    const now = Date.now();
    let from = now - 24 * 60 * 60 * 1000;

    if (period === "3d") from = now - 3 * 24 * 60 * 60 * 1000;
    if (period === "7d") from = now - 7 * 24 * 60 * 60 * 1000;

    // Fallback for mock data if token is missing
    if (!process.env.COEL_BEARER_TOKEN || process.env.COEL_BEARER_TOKEN === "YOUR_TOKEN_HERE") {
      const mockReadings = [];
      const steps = period === "24h" ? 24 : period === "3d" ? 72 : 168;
      const baseTemp = deviceId.includes("003") || deviceId.includes("004") || deviceId.includes("006") ? -180 : 40;
      
      for (let i = 0; i < steps; i++) {
        const time = from + i * (60 * 60 * 1000);
        const noise = (Math.random() - 0.5) * 5;
        mockReadings.push({
          code: "temp_current",
          eventTime: new Date(time).toISOString(),
          value: baseTemp + noise
        });
      }

      const temps = mockReadings.map(r => r.value / 10);
      const latest = mockReadings[mockReadings.length - 1];

      return res.json({
        ok: true,
        deviceId,
        status: (latest.value / 10) > 8 ? "critical" : (latest.value / 10) > 5 ? "warning" : "ok",
        temperature: latest.value / 10,
        min: Math.min(...temps),
        max: Math.max(...temps),
        avg: temps.reduce((a, b) => a + b, 0) / temps.length,
        lastEventTime: latest.eventTime,
        readings: mockReadings.map(r => ({ ...r, value: r.value / 10 })),
        isMock: true
      });
    }

    const params = new URLSearchParams({
      codes: "temp_current",
      startTime: String(from),
      endTime: String(now),
    });

    const apiUrl = process.env.COEL_API_URL || "https://us-central1-app-coel-online-e4a8b.cloudfunctions.net/obtainInstrumentsHistoricalData";
    
    const response = await fetch(
      `${apiUrl}?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.COEL_BEARER_TOKEN}`,
        },
      }
    );

    const text = await response.text();

    let raw;
    try {
      raw = JSON.parse(text);
    } catch {
      return res.status(500).json({
        ok: false,
        message: "La API devolvió una respuesta no JSON",
        raw: text,
      });
    }

    const readings = raw?.[deviceId] || [];

    if (!Array.isArray(readings) || readings.length === 0) {
      return res.json({
        ok: true,
        deviceId,
        status: "offline",
        temperature: null,
        min: null,
        max: null,
        avg: null,
        lastEventTime: null,
        readings: [],
      });
    }

    const temps = readings
      .map((r) => Number(r.value) / 10)
      .filter((n) => Number.isFinite(n));

    const latest = readings[readings.length - 1];
    const lastTemp = Number(latest.value) / 10;
    const min = temps.length > 0 ? Math.min(...temps) : null;
    const max = temps.length > 0 ? Math.max(...temps) : null;
    const avg = temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : null;

    return res.json({
      ok: true,
      deviceId,
      status: "online",
      temperature: lastTemp,
      min,
      max,
      avg,
      lastEventTime: latest.eventTime,
      readings: readings.map((r) => ({
        code: r.code,
        eventTime: r.eventTime,
        value: Number(r.value) / 10,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}
