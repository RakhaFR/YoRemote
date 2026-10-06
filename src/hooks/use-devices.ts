"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface TVDevice {
  id: string;
  name: string;
  ip: string;
  port: number;
  protocol: "lg-webos" | "samsung" | "android-tv" | "roku" | "unknown";
  status: "online" | "offline" | "connecting";
  model?: string;
  mac?: string;
  signalStrength?: number;
}

const API_BASE = "http://localhost:3001";

export function useDevices() {
  const [devices, setDevices] = useState<TVDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const [serverOnline, setServerOnline] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkServer = useCallback(async () => {
    const startTime = performance.now();
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
      const elapsed = Math.round(performance.now() - startTime);
      const online = res.ok;
      setServerOnline(online);
      setLatency(online ? elapsed : null);
      setLastChecked(new Date());
      return online;
    } catch {
      setServerOnline(false);
      setLatency(null);
      setLastChecked(new Date());
      return false;
    }
  }, []);

  const fetchDevices = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/devices`);
      if (res.ok) {
        const data = await res.json();
        setDevices(data);
      }
    } catch { /* server offline */ }
  }, []);

  const scan = useCallback(async () => {
    setScanning(true);
    try {
      const res = await fetch(`${API_BASE}/devices/scan`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setDevices(data);
      }
    } catch { /* server offline */ }
    setScanning(false);
  }, []);

  const sendCommand = useCallback(async (deviceId: string, command: string) => {
    try {
      const res = await fetch(`${API_BASE}/remote/${deviceId}/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const poll = async () => {
      const online = await checkServer();
      if (online && mounted) await fetchDevices();
    };

    poll();

    intervalRef.current = setInterval(() => {
      if (mounted) poll();
    }, 4000);

    return () => {
      mounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkServer, fetchDevices]);

  return { devices, scanning, scan, sendCommand, serverOnline, latency, lastChecked };
}
