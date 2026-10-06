"use client";

import { Plus, Minus, SpeakerSimpleX } from "@phosphor-icons/react";

interface VolumeControlProps {
  onCommand: (command: string) => void;
}

export function VolumeControl({ onCommand }: VolumeControlProps) {
  return (
    <div className="flex flex-col">
      <div className="h-32 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between p-1">
        <button
          onClick={() => onCommand("VOLUME_UP")}
          className="h-11 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 flex items-center justify-center active:scale-95 transition-all"
          aria-label="Volume Up"
        >
          <Plus size={16} weight="bold" />
        </button>

        <button
          onClick={() => onCommand("MUTE")}
          className="h-7 flex items-center justify-center text-zinc-500 hover:text-zinc-200 active:scale-90 transition-all text-[10px] font-mono uppercase tracking-wider"
          title="Mute"
        >
          <SpeakerSimpleX size={14} />
        </button>

        <button
          onClick={() => onCommand("VOLUME_DOWN")}
          className="h-11 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 flex items-center justify-center active:scale-95 transition-all"
          aria-label="Volume Down"
        >
          <Minus size={16} weight="bold" />
        </button>
      </div>
      <span className="font-mono text-[10px] text-zinc-500 text-center uppercase tracking-widest mt-1.5 font-medium">
        VOL
      </span>
    </div>
  );
}
