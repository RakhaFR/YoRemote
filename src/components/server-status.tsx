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

  const copyCommand = () => {
    navigator.clipboard.writeText("npm run server");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 text-zinc-300 transition-colors active:scale-[0.98]"
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <Radio size={16} className="text-zinc-400" />
                <h3 className="text-xs font-mono font-semibold tracking-wider uppercase text-zinc-200">
                  Local Bridge Telemetry
                </h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="size-6 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-zinc-900/50 border border-zinc-800/60">
                <span className="text-zinc-500">Status</span>
                <span
                  className={`font-semibold flex items-center gap-1.5 ${
                    online ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {online ? (
                    <>
                      <Check size={13} weight="bold" /> Connected
                    </>
                  ) : (
                    <>
                      <Warning size={13} weight="bold" /> Disconnected
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-zinc-900/50 border border-zinc-800/60">
                <span className="text-zinc-500">Host</span>
                <span className="text-zinc-300">127.0.0.1:3001</span>
              </div>

              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-zinc-900/50 border border-zinc-800/60">
                <span className="text-zinc-500">RTT Latency</span>
                <span className="text-zinc-300">
                  {online && latency !== null ? `${latency} ms` : "—"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-zinc-900/50 border border-zinc-800/60">
                <span className="text-zinc-500">Protocols</span>
                <span className="text-zinc-400">SSDP · WebSocket · ADB</span>
              </div>

              {!online && (
                <div className="mt-4 pt-3 border-t border-zinc-800/80">
                  <p className="font-sans text-[11px] text-zinc-400 mb-2">
                    Jalankan companion daemon di terminal:
                  </p>
                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-200">
                    <code>npm run server</code>
                    <button
                      onClick={copyCommand}
                      className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors"
                    >
                      {copied ? (
                        <>
                          <CheckCircle size={12} className="text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setOpen(false)}
              className="mt-5 w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-mono font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
