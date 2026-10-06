"use client";

import { useState, useEffect, useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function getIsStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches;
}

const standaloneSubscribe = (cb: () => void) => {
  const mq = window.matchMedia("(display-mode: standalone)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export function useInstallPrompt() {
  const isStandalone = useSyncExternalStore(standaloneSubscribe, getIsStandalone, () => false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const installedHandler = () => setInstalled(true);

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const isInstalled = isStandalone || installed;

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return outcome === "accepted";
  };

  return { canInstall: !!deferredPrompt && !isInstalled, isInstalled, install };
}
