"use client";

import {
  CaretUp,
  CaretDown,
  CaretLeft,
  CaretRight,
  ArrowUUpLeft,
  House,
  List,
} from "@phosphor-icons/react";

interface DPadProps {
  onCommand: (command: string) => void;
}

export function DPad({ onCommand }: DPadProps) {
  return (
    <div className="flex flex-col items-center">
      {/* Precision D-Pad Grid */}
      <div className="relative size-52 rounded-2xl bg-zinc-900 border border-zinc-800 p-2 flex items-center justify-center shadow-inner">
        {/* UP */}
        <button
          onClick={() => onCommand("UP")}
          className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-12 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 active:bg-zinc-700 active:scale-95 transition-all"
          aria-label="Up"
        >
          <CaretUp size={22} weight="bold" />
        </button>

        {/* LEFT */}
        <button
          onClick={() => onCommand("LEFT")}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-16 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 active:bg-zinc-700 active:scale-95 transition-all"
          aria-label="Left"
        >
          <CaretLeft size={22} weight="bold" />
        </button>

        {/* RIGHT */}
        <button
          onClick={() => onCommand("RIGHT")}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-16 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 active:bg-zinc-700 active:scale-95 transition-all"
          aria-label="Right"
        >
          <CaretRight size={22} weight="bold" />
        </button>

        {/* DOWN */}
        <button
          onClick={() => onCommand("DOWN")}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-12 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 active:bg-zinc-700 active:scale-95 transition-all"
          aria-label="Down"
        >
          <CaretDown size={22} weight="bold" />
        </button>

        {/* CENTER ENTER */}
        <button
          onClick={() => onCommand("ENTER")}
          className="size-20 rounded-xl bg-zinc-800 border border-zinc-700/80 hover:bg-zinc-700 text-zinc-100 font-mono text-xs font-bold tracking-wider flex items-center justify-center active:scale-90 active:bg-zinc-600 transition-all shadow-md"
          aria-label="Select / OK"
        >
          OK
        </button>
      </div>

      {/* Auxiliary Nav Strip */}
      <div className="grid grid-cols-3 gap-2 w-full mt-3">
        <button
          onClick={() => onCommand("BACK")}
          className="h-9 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 flex items-center justify-center gap-1 text-[11px] font-mono active:scale-95 transition-all"
        >
          <ArrowUUpLeft size={14} weight="bold" />
          <span>Back</span>
        </button>

        <button
          onClick={() => onCommand("HOME")}
          className="h-9 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 flex items-center justify-center gap-1 text-[11px] font-mono active:scale-95 transition-all"
        >
          <House size={14} weight="bold" />
          <span>Home</span>
        </button>

        <button
          onClick={() => onCommand("MENU")}
          className="h-9 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 flex items-center justify-center gap-1 text-[11px] font-mono active:scale-95 transition-all"
        >
          <List size={14} weight="bold" />
          <span>Menu</span>
        </button>
      </div>
    </div>
  );
}
