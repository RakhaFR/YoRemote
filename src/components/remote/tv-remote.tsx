"use client";

import { DPad } from "./dpad";
import { VolumeControl } from "./volume-control";
import { ChannelControl } from "./channel-control";
import { PowerButton } from "./power-button";
import { SourcePicker } from "./source-picker";
import { NumPad } from "./numpad";
import { MediaControls } from "./media-controls";
import { useState } from "react";
import {
  DotsNine,
} from "@phosphor-icons/react";

interface TVRemoteProps {
  onCommand: (command: string) => void;
  deviceName?: string;
}

export function TVRemote({ onCommand, deviceName }: TVRemoteProps) {
  const [showNumpad, setShowNumpad] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const haptic = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(12);
    }
  };

  const send = (cmd: string) => {
    haptic();
    setActiveKey(cmd);
    onCommand(cmd);
    setTimeout(() => setActiveKey((prev) => (prev === cmd ? null : prev)), 800);
  };

  return (
    <div className="mx-auto w-full max-w-xs rounded-2xl bg-[#141416] p-4 border border-zinc-800 shadow-xl select-none">
      {/* Remote Status Header */}
      <div className="mb-4 pb-3 border-b border-zinc-800/80 flex items-center justify-between font-mono text-[11px]">
        <span className="text-zinc-400 font-medium truncate max-w-[150px]">
          {deviceName ?? "TARGET DISPLAY"}
        </span>
        <span className="text-zinc-500 uppercase tracking-wider">
          {activeKey ? `TX: ${activeKey}` : "READY"}
        </span>
      </div>

      {/* Top Controls: Power & Input & Numpad */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <PowerButton onCommand={send} />
        <SourcePicker onCommand={send} />
        <button
          onClick={() => setShowNumpad(!showNumpad)}
          className={`h-11 rounded-lg border flex items-center justify-center font-mono text-xs font-medium transition-colors active:scale-[0.97] ${
            showNumpad
              ? "bg-zinc-200 text-zinc-950 border-zinc-200 font-semibold"
              : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
          }`}
          title="Toggle 123 Numpad"
        >
          <DotsNine size={18} weight="bold" />
        </button>
      </div>

      {showNumpad ? (
        <NumPad onCommand={send} onClose={() => setShowNumpad(false)} />
      ) : (
        <div className="space-y-4">
          {/* Navigation D-Pad */}
          <DPad onCommand={send} />

          {/* Volume & Channel Rockers */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <VolumeControl onCommand={send} />
            <ChannelControl onCommand={send} />
          </div>

          {/* Media Playback */}
          <div className="pt-1">
            <MediaControls onCommand={send} />
          </div>

          {/* Smart TV Color Key Functions */}
          <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-center gap-3">
            <button
              onClick={() => send("RED")}
              className="h-2.5 w-7 rounded-sm bg-red-600 hover:bg-red-500 active:scale-95 transition-transform"
              aria-label="Red button"
            />
            <button
              onClick={() => send("GREEN")}
              className="h-2.5 w-7 rounded-sm bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-transform"
              aria-label="Green button"
            />
            <button
              onClick={() => send("YELLOW")}
              className="h-2.5 w-7 rounded-sm bg-amber-500 hover:bg-amber-400 active:scale-95 transition-transform"
              aria-label="Yellow button"
            />
            <button
              onClick={() => send("BLUE")}
              className="h-2.5 w-7 rounded-sm bg-blue-600 hover:bg-blue-500 active:scale-95 transition-transform"
              aria-label="Blue button"
            />
          </div>
        </div>
      )}
    </div>
  );
}
