"use client";

import { useState } from "react";
import type { TVDevice } from "@/hooks/use-devices";
import {
  MagnifyingGlass,
  Television,
  CircleNotch,
  CaretRight,
  Plus,
  TerminalWindow,
} from "@phosphor-icons/react";
import Link from "next/link";

interface DeviceScannerProps {
  devices: TVDevice[];
  scanning: boolean;
  onScan: () => void;
  serverOnline: boolean;
}

const protocolMeta: Record<
  string,
  { label: string; badge: string }
> = {
  "lg-webos": {
    label: "LG webOS",
    badge: "webOS",
  },
  samsung: {
    label: "Samsung Smart TV",
    badge: "Tizen",
  },
  "android-tv": {
    label: "Android TV",
    badge: "ADB",
  },
  roku: {
    label: "Roku",
    badge: "Roku",
  },
  unknown: {
    label: "Smart TV",
    badge: "IP",
  },
};

export function DeviceScanner({
  devices,
  scanning,
  onScan,
  serverOnline,
}: DeviceScannerProps) {
  const [manualIp, setManualIp] = useState("");
  const [manualProtocol, setManualProtocol] = useState<TVDevice["protocol"]>("lg-webos");
  const [showManual, setShowManual] = useState(false);

  if (!serverOnline) {
    return (
      <div className="py-12 px-6 rounded-xl bg-zinc-900/40 border border-zinc-800 text-center">
        <h2 className="text-sm font-semibold text-zinc-200 mb-1">
          Bridge Server Offline
        </h2>
        <p className="text-xs text-zinc-400 max-w-xs mx-auto mb-5 leading-relaxed">
          Browser dibatasi sandbox keamanan dan butuh companion bridge lokal untuk memindai subnet WiFi.
        </p>

        <div className="p-3 rounded-lg bg-black border border-zinc-800 font-mono text-xs text-left max-w-xs mx-auto">
          <div className="flex items-center gap-1.5 text-zinc-500 mb-1.5 text-[10px] uppercase font-semibold">
            <TerminalWindow size={13} />
            <span>Terminal</span>
          </div>
          <code className="text-emerald-400 font-mono">npm run server</code>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
        <div>
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400">
            Detected Displays ({devices.length})
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowManual(!showManual)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 font-mono transition-colors"
          >
            <Plus size={13} />
            <span>Direct IP</span>
          </button>

          <button
            onClick={onScan}
            disabled={scanning}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold font-mono transition-colors disabled:opacity-50"
          >
            {scanning ? (
              <>
                <CircleNotch size={13} className="animate-spin" />
                <span>Scanning</span>
              </>
            ) : (
              <>
                <MagnifyingGlass size={13} weight="bold" />
                <span>Scan Subnet</span>
              </>
            )}
          </button>
        </div>
      </div>

      {showManual && (
        <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-300 font-medium">
              Manual Device Target
            </span>
            <button
              onClick={() => setShowManual(false)}
              className="text-xs text-zinc-500 hover:text-zinc-300 font-mono"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="192.168.1.100"
              value={manualIp}
              onChange={(e) => setManualIp(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md bg-black border border-zinc-800 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
            />
            <select
              value={manualProtocol}
              onChange={(e) => setManualProtocol(e.target.value as TVDevice["protocol"])}
              className="w-full px-2.5 py-1.5 rounded-md bg-black border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
            >
              <option value="lg-webos">LG webOS (3000)</option>
              <option value="samsung">Samsung (8001)</option>
              <option value="android-tv">Android TV (5555)</option>
              <option value="roku">Roku (8060)</option>
            </select>
          </div>
          {manualIp && (
            <Link
              href={`/remote/manual-${manualIp.replace(/\./g, "-")}`}
              className="block w-full text-center py-1.5 rounded-md bg-zinc-200 hover:bg-white text-zinc-950 text-xs font-semibold font-mono transition-colors"
            >
              Connect to {manualIp}
            </Link>
          )}
        </div>
      )}

      {devices.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-xl bg-zinc-900/30 border border-zinc-800/60">
          <Television size={28} className="text-zinc-600 mx-auto mb-2" />
          <p className="text-xs font-medium text-zinc-300">
            {scanning ? "Scanning local subnet via SSDP/mDNS..." : "No displays detected"}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto">
            Pastikan Smart TV menyala dan berada pada jaringan WiFi yang sama.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/80 rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
          {devices.map((device) => (
            <DeviceRow key={device.id} device={device} />
          ))}
        </div>
      )}
    </div>
  );
}

function DeviceRow({ device }: { device: TVDevice }) {
  const meta = protocolMeta[device.protocol] ?? protocolMeta.unknown;

  return (
    <Link
      href={`/remote/${device.id}`}
      className="flex items-center justify-between p-3.5 hover:bg-zinc-800/50 transition-colors group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-8 rounded-md bg-zinc-800 flex items-center justify-center text-zinc-300 shrink-0">
          <Television size={16} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
              {device.name}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
              {meta.badge}
            </span>
          </div>
          <p className="font-mono text-[11px] text-zinc-500 mt-0.5">
            {device.ip}:{device.port}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.5 rounded">
          READY
        </span>
        <CaretRight size={14} className="text-zinc-600 group-hover:text-zinc-300 transition-colors" />
      </div>
    </Link>
  );
}
