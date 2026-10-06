"use client";

import { useState } from "react";
import { MonitorPlay, CaretDown } from "@phosphor-icons/react";

interface SourcePickerProps {
  onCommand: (command: string) => void;
}

const sources = [
  { label: "HDMI 1", cmd: "INPUT_HDMI1" },
  { label: "HDMI 2", cmd: "INPUT_HDMI2" },
  { label: "HDMI 3", cmd: "INPUT_HDMI3" },
  { label: "Live TV", cmd: "INPUT_TV" },
  { label: "AV", cmd: "INPUT_AV" },
];

export function SourcePicker({ onCommand }: SourcePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full h-11 px-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 flex items-center justify-center gap-1.5 font-mono text-xs font-medium active:scale-95 transition-all"
      >
        <MonitorPlay size={15} />
        <span>INPUT</span>
        <CaretDown size={11} className="text-zinc-500" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-full mt-1.5 w-32 rounded-lg bg-zinc-900 border border-zinc-800 shadow-xl p-1 z-50 animate-in fade-in duration-100">
            {sources.map((source) => (
              <button
                key={source.cmd}
                onClick={() => {
                  onCommand(source.cmd);
                  setOpen(false);
                }}
                className="w-full text-left font-mono text-xs px-2.5 py-1.5 rounded-md text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                {source.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
