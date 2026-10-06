"use client";

import {
  Play,
  Pause,
  Stop,
  Rewind,
  FastForward,
} from "@phosphor-icons/react";

interface MediaControlsProps {
  onCommand: (command: string) => void;
}

const controls = [
  { icon: Rewind, cmd: "REWIND", label: "Rewind" },
  { icon: Play, cmd: "PLAY", label: "Play" },
  { icon: Pause, cmd: "PAUSE", label: "Pause" },
  { icon: Stop, cmd: "STOP", label: "Stop" },
  { icon: FastForward, cmd: "FAST_FORWARD", label: "Fast Forward" },
];

export function MediaControls({ onCommand }: MediaControlsProps) {
  return (
    <div className="flex items-center gap-1.5 p-1 rounded-lg bg-zinc-900 border border-zinc-800">
      {controls.map(({ icon: Icon, cmd, label }) => (
        <button
          key={cmd}
          onClick={() => onCommand(cmd)}
          className="flex-1 h-9 rounded-md bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-400 hover:text-zinc-100 flex items-center justify-center active:scale-90 transition-all"
          title={label}
        >
          <Icon size={14} weight="fill" />
        </button>
      ))}
    </div>
  );
}
