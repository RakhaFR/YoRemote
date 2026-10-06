"use client";

import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { useDevices } from "@/hooks/use-devices";
import { DeviceScanner } from "@/components/device-scanner";
import { InstallBanner } from "@/components/install-banner";
import { ServerStatus } from "@/components/server-status";
import { BottomNav } from "@/components/bottom-nav";
import {
  Television,
  Fan,
  Sliders,
  Check,
} from "@phosphor-icons/react";
import { useState } from "react";

export default function Home() {
  const { canInstall, isInstalled, install } = useInstallPrompt();
  const { devices, scanning, scan, serverOnline, latency, bridgeUrl, setBridgeUrl } = useDevices();
  const [tab, setTab] = useState<"devices" | "ac" | "settings">("devices");

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0d0d0f] text-foreground">
      {/* Clean Hardware Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-[#0d0d0f]/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 h-14 max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold tracking-tight text-white">
              YoRemote
            </span>
            <span className="font-mono text-[10px] text-zinc-500 uppercase">
              Mesh
            </span>
          </div>

          <ServerStatus online={serverOnline} latency={latency} />
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 px-4 py-5 max-w-md mx-auto w-full">
        {canInstall && <InstallBanner onInstall={install} />}

        {tab === "devices" && (
          <DeviceScanner
            devices={devices}
            scanning={scanning}
            onScan={scan}
            serverOnline={serverOnline}
          />
        )}

        {tab === "ac" && <ClimateSection />}

        {tab === "settings" && (
          <SettingsSection
            isInstalled={isInstalled}
            serverOnline={serverOnline}
            latency={latency}
            bridgeUrl={bridgeUrl}
            onSaveBridgeUrl={setBridgeUrl}
          />
        )}
      </main>

      <BottomNav
        tab={tab}
        onTabChange={setTab}
        items={[
          { id: "devices", label: "TV", icon: Television },
          { id: "ac", label: "Climate", icon: Fan },
          { id: "settings", label: "Bridge", icon: Sliders },
        ]}
      />
    </div>
  );
}

function ClimateSection() {
  return (
    <div className="py-16 px-4 text-center rounded-xl bg-zinc-900/30 border border-zinc-800">
      <Fan size={32} className="text-zinc-600 mx-auto mb-3 animate-spin" style={{ animationDuration: "8s" }} />
      <h2 className="text-sm font-semibold text-zinc-200">
        AC & Climate Module
      </h2>
      <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
        Modul kontrol pendingin ruangan (Tuya / SmartThings IR Bridge) dijadwalkan setelah pengujian remote TV stabil.
      </p>
    </div>
  );
}

function SettingsSection({
  isInstalled,
  serverOnline,
  latency,
  bridgeUrl,
  onSaveBridgeUrl,
}: {
  isInstalled: boolean;
  serverOnline: boolean;
  latency: number | null;
  bridgeUrl: string;
  onSaveBridgeUrl: (url: string) => void;
}) {
  const [urlInput, setUrlInput] = useState(bridgeUrl);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveBridgeUrl(urlInput);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400">
          Bridge Endpoint Configuration
        </h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Atur IP PC/Laptop lokal yang menjalankan companion server
        </p>
      </div>

      <form onSubmit={handleSave} className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3 font-mono text-xs">
        <div>
          <label className="text-[11px] text-zinc-400 block mb-1">
            Bridge Daemon URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="http://192.168.1.100:3001"
              className="flex-1 px-3 py-2 rounded-lg bg-black border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 text-xs"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold transition-all active:scale-95 text-xs flex items-center gap-1 shrink-0"
            >
              {saved ? (
                <>
                  <Check size={14} weight="bold" />
                  <span>Saved</span>
                </>
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </div>
        <p className="text-[11px] text-zinc-500 leading-relaxed font-sans">
          Buka terminal di PC lokal, ketik <code className="text-zinc-300 font-mono">ipconfig</code> (Windows) untuk melihat IP WiFi lokalmu.
        </p>
      </form>

      <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 pt-2">
        System Telemetry
      </h2>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 divide-y divide-zinc-800/80 font-mono text-xs">
        <div className="flex items-center justify-between p-3">
          <span className="text-zinc-400">Active Bridge</span>
          <span className="text-zinc-200 font-semibold truncate max-w-[180px]">{bridgeUrl}</span>
        </div>
        <div className="flex items-center justify-between p-3">
          <span className="text-zinc-400">Daemon Heartbeat</span>
          <span className={serverOnline ? "text-emerald-400 font-semibold" : "text-amber-400"}>
            {serverOnline && latency !== null ? `${latency} ms (LIVE)` : "DISCONNECTED"}
          </span>
        </div>
        <div className="flex items-center justify-between p-3">
          <span className="text-zinc-400">PWA Mode</span>
          <span className="text-zinc-300">{isInstalled ? "Standalone App" : "Browser Tab"}</span>
        </div>
        <div className="flex items-center justify-between p-3">
          <span className="text-zinc-400">Engine Build</span>
          <span className="text-zinc-400">v0.1.0</span>
        </div>
      </div>
    </div>
  );
}
