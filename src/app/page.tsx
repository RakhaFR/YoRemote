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
} from "@phosphor-icons/react";
import { useState } from "react";

export default function Home() {
  const { canInstall, isInstalled, install } = useInstallPrompt();
  const { devices, scanning, scan, serverOnline, latency } = useDevices();
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
}: {
  isInstalled: boolean;
  serverOnline: boolean;
  latency: number | null;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400">
        System Overview
      </h2>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 divide-y divide-zinc-800/80 font-mono text-xs">
        <div className="flex items-center justify-between p-3">
          <span className="text-zinc-400">Bridge Address</span>
          <span className="text-zinc-200 font-semibold">127.0.0.1:3001</span>
        </div>
        <div className="flex items-center justify-between p-3">
          <span className="text-zinc-400">Daemon Heartbeat</span>
          <span className={serverOnline ? "text-emerald-400" : "text-amber-400"}>
            {serverOnline && latency !== null ? `${latency} ms` : "OFFLINE"}
          </span>
        </div>
        <div className="flex items-center justify-between p-3">
          <span className="text-zinc-400">Display Standalone</span>
          <span className="text-zinc-300">{isInstalled ? "Yes" : "Browser Tab"}</span>
        </div>
        <div className="flex items-center justify-between p-3">
          <span className="text-zinc-400">Engine Build</span>
          <span className="text-zinc-400">v0.1.0</span>
        </div>
      </div>
    </div>
  );
}
