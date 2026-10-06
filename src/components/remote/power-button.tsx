"use client";

import { Power } from "@phosphor-icons/react";

interface PowerButtonProps {
  onCommand: (command: string) => void;
}

export function PowerButton({ onCommand }: PowerButtonProps) {
  return (
    <button
      onClick={() => onCommand("POWER")}
      className="h-11 rounded-lg bg-red-950/40 border border-red-800/60 hover:border-red-700 text-red-400 hover:text-red-300 flex items-center justify-center active:scale-95 transition-all shadow-sm"
      aria-label="Power Toggle"
      title="Power ON/OFF"
    >
      <Power size={18} weight="bold" />
    </button>
  );
}
