"use client";

import { X, Backspace } from "@phosphor-icons/react";

interface NumPadProps {
  onCommand: (command: string) => void;
  onClose: () => void;
}

const numRows = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "DEL"],
];

export function NumPad({ onCommand, onClose }: NumPadProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <span className="font-mono text-xs font-semibold uppercase text-zinc-400">
          Keypad Input
        </span>
        <button
          onClick={onClose}
          className="size-6 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
        >
          <X size={14} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {numRows.flat().map((key) => {
          const isDel = key === "DEL";
          return (
            <button
              key={key}
              onClick={() => onCommand(isDel ? "DELETE" : `NUM_${key}`)}
              className="h-12 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 font-mono text-sm font-semibold flex items-center justify-center active:scale-95 transition-all"
            >
              {isDel ? <Backspace size={18} /> : key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
