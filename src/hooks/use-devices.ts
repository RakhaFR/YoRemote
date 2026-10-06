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

const DEFAULT_PORT = "3001";

function getDefaultBridgeUrl(): string {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("yoremote_bridge_url");
    if (stored) return stored;

    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return `http://localhost:${DEFAULT_PORT}`;
    }
    if (/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(hostname)) {
      return `http://${hostname}:${DEFAULT_PORT}`;
    }
    return `http://localhost:${DEFAULT_PORT}`;
  }
  return `http://localhost:${DEFAULT_PORT}`;
}

export function useDevices() {
  const [bridgeUrl, setBridgeUrlState] = useState<string>(getDefaultBridgeUrl);
  const [devices, setDevices] = useState<TVDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const [serverOnline, setServerOnline] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setBridgeUrl = (url: string) => {
    let clean = url.trim();
    if (clean === "/api" || clean.startsWith("/api/")) {
      clean = clean.replace(/\/+$/, "");
    } else if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = `http://${clean}`.replace(/\/+$/, "");
    } else {
      clean = clean.replace(/\/+$/, "");
    }
    localStorage.setItem("yoremote_bridge_url", clean);
    setBridgeUrlState(clean);
  };

  const checkServer = useCallback(async () => {
    const startTime = performance.now();
    try {
      const res = await fetch(`${bridgeUrl}/health`, { signal: AbortSignal.timeout(2000) });
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
  }, [bridgeUrl]);

  const fetchDevices = useCallback(async () => {
    try {
      const res = await fetch(`${bridgeUrl}/devices`);
      if (res.ok) {
        const data = await res.json();
        setDevices(data);
      }
    } catch {
      // server offline
    }
  }, [bridgeUrl]);

  const scan = useCallback(async () => {
    setScanning(true);
    try {
      const res = await fetch(`${bridgeUrl}/devices/scan`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setDevices(data);
      }
    } catch {
      // server offline
    }
    setScanning(false);
  }, [bridgeUrl]);

  const sendCommand = useCallback(
    async (deviceId: string, command: string) => {
      try {
        const res = await fetch(`${bridgeUrl}/remote/${deviceId}/command`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command }),
        });
        return res.ok;
      } catch {
        return false;
      }
    },
    [bridgeUrl]
  );

  useEffect(() => {
    let mounted = true;

    const poll = async () => {
      const online = await checkServer();
      if (online && mounted) {
        await fetchDevices();
      }
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

  return {
    devices,
    scanning,
    scan,
    sendCommand,
    serverOnline,
    latency,
    lastChecked,
    bridgeUrl,
    setBridgeUrl,
  };
}
