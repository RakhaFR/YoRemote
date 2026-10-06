"use client";

import type { ComponentType } from "react";
import type { IconProps } from "@phosphor-icons/react";

interface NavItem {
  id: string;
  label: string;
  icon: ComponentType<IconProps>;
}

interface BottomNavProps {
  tab: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onTabChange: (tab: any) => void;
  items: NavItem[];
}

export function BottomNav({ tab, onTabChange, items }: BottomNavProps) {
  return (
    <div className="sticky bottom-0 z-40 border-t border-zinc-800/80 bg-[#0d0d0f]/95 backdrop-blur-md safe-bottom">
      <nav className="max-w-md mx-auto flex items-center justify-around h-14 px-2">
        {items.map((item) => {
          const active = tab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                active
                  ? "text-zinc-100 font-semibold"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon size={18} weight={active ? "fill" : "regular"} />
              <span className="text-[10px] font-mono tracking-tight mt-1">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
