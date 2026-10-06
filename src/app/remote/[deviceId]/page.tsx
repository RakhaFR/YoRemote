"use client";

import { useDevices } from "@/hooks/use-devices";
import { TVRemote } from "@/components/remote/tv-remote";
import { ServerStatus } from "@/components/server-status";
import { ArrowLeft, CircleNotch, Warning } from "@phosphor-icons/react";
import Link from "next/link";
import { use } from "react";

export default function RemotePage(props: { params: Promise<{ deviceId: string }> }) {
  const { deviceId } = use(props.params);
  const { devices, sendCommand, serverOnline, latency } = useDevices();

  const isManual = deviceId.startsWith("manual-");
  const manualIp = isManual ? deviceId.replace("manual-", "").replace(/-/g, ".") : null;

  const device = devices.find((d) => d.id === deviceId) ?? (isManual ? {
    id: deviceId,
    name: `Smart TV (${manualIp})`,
    ip: manualIp!,
    port: 3000,
    protocol: "lg-webos" as const,
    status: "online" as const,
  } : undefined);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0d0d0f] text-foreground">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-[#0d0d0f]/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 h-14 max-w-md mx-auto">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="flex items-center justify-center size-8 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors shrink-0"
              aria-label="Back to device list"
            >
              <ArrowLeft size={16} weight="bold" />
            </Link>

            <div className="min-w-0">
              <h1 className="text-xs font-semibold text-zinc-200 truncate">
                {device?.name ?? "Controller"}
              </h1>
              <p className="font-mono text-[10px] text-zinc-500 truncate">
                {device?.ip} · {device?.protocol ?? "DISCONNECTED"}
              </p>
            </div>
          </div>

          <ServerStatus online={serverOnline} latency={latency} />
        </div>
      </header>

      {/* Main Remote Viewport */}
      <main className="flex-1 px-4 py-4 max-w-md mx-auto w-full flex flex-col justify-center">
        {!serverOnline ? (
          <div className="py-12 px-6 rounded-xl bg-zinc-900/40 border border-zinc-800 text-center">
            <Warning size={28} className="text-amber-400 mx-auto mb-2" />
            <h2 className="text-xs font-semibold text-zinc-200 mb-1">
              Bridge Connection Lost
            </h2>
            <p className="text-[11px] text-zinc-400 max-w-xs mx-auto mb-4">
              Jalankan <code className="text-emerald-400 font-mono">npm run server</code> di komputer kamu.
            </p>
            <Link
              href="/"
              className="inline-block py-1.5 px-3 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300"
            >
              Back to list
            </Link>
          </div>
        ) : !device ? (
          <div className="py-16 text-center">
            <CircleNotch size={24} className="animate-spin text-zinc-500 mx-auto mb-2" />
            <p className="font-mono text-xs text-zinc-500">Connecting channel...</p>
          </div>
        ) : (
          <TVRemote
            deviceName={device.name}
            onCommand={(cmd) => sendCommand(device.id, cmd)}
          />
        )}
      </main>
    </div>
  );
}
