"use client";

import { useState } from "react";
import {
  X,
  Radio,
  Check,
  Warning,
  Copy,
  CheckCircle,
} from "@phosphor-icons/react";

interface ServerStatusProps {
  online: boolean;
  latency?: number | null;
}

export function ServerStatus({ online, latency }: ServerStatusProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyCommand = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText("npm run server");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 transition-colors active:scale-[0.98]"
        aria-label="Server status bridge"
      >
        <span
          className={`size-1.5 rounded-full ${
            online ? "bg-emerald-400" : "bg-amber-500"
          }`}
        />
        <span className="font-mono text-[11px] font-medium tracking-tight text-zinc-300">
          {online ? "BRIDGE ON" : "BRIDGE OFF"}
        </span>
        {online && latency !== null && latency !== undefined && (
          <span className="font-mono text-[10px] text-zinc-500">
            {latency}ms
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Dropdown Popover */}
          <div
            className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-zinc-800 bg-[#141416] p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <Radio size={15} className="text-zinc-400" />
                <h3 className="text-xs font-mono font-semibold tracking-wider uppercase text-zinc-200">
                  Bridge Telemetry
                </h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="size-6 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                <X size={13} />
              </button>
            </div>

            <div className="mt-3 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                <span className="text-zinc-500 text-[11px]">Status</span>
                <span
                  className={`font-semibold flex items-center gap-1 text-[11px] ${
                    online ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {online ? (
                    <>
                      <Check size={12} weight="bold" /> Connected
                    </>
                  ) : (
                    <>
                      <Warning size={12} weight="bold" /> Disconnected
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                <span className="text-zinc-500 text-[11px]">Host</span>
                <span className="text-zinc-300 text-[11px]">127.0.0.1:3001</span>
              </div>

              <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                <span className="text-zinc-500 text-[11px]">RTT Latency</span>
                <span className="text-zinc-300 text-[11px]">
                  {online && latency !== null ? `${latency} ms` : "—"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                <span className="text-zinc-500 text-[11px]">Engine</span>
                <span className="text-zinc-400 text-[11px]">SSDP · WS · ADB</span>
              </div>

              {!online && (
                <div className="mt-3 pt-2.5 border-t border-zinc-800/80">
                  <p className="font-sans text-[11px] text-zinc-400 mb-1.5">
                    Jalankan companion daemon di terminal:
                  </p>
                  <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-200">
                    <code className="text-emerald-400 font-mono text-[10px]">npm run server</code>
                    <button
                      onClick={copyCommand}
                      className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors"
                    >
                      {copied ? (
                        <>
                          <CheckCircle size={11} className="text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
