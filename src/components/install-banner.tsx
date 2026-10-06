"use client";

import { DownloadSimple } from "@phosphor-icons/react";

export function InstallBanner({ onInstall }: { onInstall: () => void }) {
  return (
    <div className="mb-6 p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
          <span>Install Web App (PWA)</span>
        </p>
        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
          Jalankan mode layar penuh seperti remote fisik
        </p>
      </div>

      <button
        onClick={onInstall}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold tracking-tight transition-all active:scale-95 shrink-0"
      >
        <DownloadSimple size={14} weight="bold" />
        <span>Install</span>
      </button>
    </div>
  );
}
