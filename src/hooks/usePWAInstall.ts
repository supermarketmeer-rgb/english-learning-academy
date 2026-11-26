import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PWAInstallSnapshot {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
}

type Listener = () => void;

const listeners = new Set<Listener>();

function checkStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    window.matchMedia('(display-mode: window-controls-overlay)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    document.referrer.startsWith('android-app://')
  );
}

function detectDevicePlatform(): { isIOS: boolean; isAndroid: boolean } {
  if (typeof window === 'undefined') {
    return { isIOS: false, isAndroid: false };
  }
  const ua = window.navigator.userAgent.toLowerCase();
  const isIOS =
    /iphone|ipad|ipod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /android/.test(ua);
  return { isIOS, isAndroid };
}

const initialPlatform = detectDevicePlatform();

let snapshot: PWAInstallSnapshot = {
  deferredPrompt: null,
  isInstalled: checkStandaloneMode(),
  isIOS: initialPlatform.isIOS,
  isAndroid: initialPlatform.isAndroid,
};

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function updateSnapshot(partial: Partial<PWAInstallSnapshot>) {
  snapshot = { ...snapshot, ...partial };
  notifyListeners();
}

let initialized = false;

export function initPWAInstallListener() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  updateSnapshot({ isInstalled: checkStandaloneMode() });

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    updateSnapshot({
      deferredPrompt: e as BeforeInstallPromptEvent,
      isInstalled: false,
    });
  });

  window.addEventListener('appinstalled', () => {
    updateSnapshot({
      isInstalled: true,
      deferredPrompt: null,
    });
  });

  const standaloneMedia = window.matchMedia('(display-mode: standalone)');
  const handleDisplayModeChange = () => {
    if (checkStandaloneMode()) {
      updateSnapshot({ isInstalled: true, deferredPrompt: null });
    }
  };

  if (typeof standaloneMedia.addEventListener === 'function') {
    standaloneMedia.addEventListener('change', handleDisplayModeChange);
  }
}

// Initialize immediately on module load so beforeinstallprompt is never missed
initPWAInstallListener();

export function usePWAInstall() {
  const [state, setState] = useState<PWAInstallSnapshot>(snapshot);

  useEffect(() => {
    initPWAInstallListener();
    const sync = () => setState(snapshot);
    listeners.add(sync);
    sync();
    return () => {
      listeners.delete(sync);
    };
  }, []);

  const install = async (): Promise<boolean> => {
    const promptEvent = snapshot.deferredPrompt;
    if (!promptEvent) return false;

    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      updateSnapshot({
        isInstalled: true,
        deferredPrompt: null,
      });
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!state.deferredPrompt,
    isInstalled: state.isInstalled,
    isIOS: state.isIOS,
    isAndroid: state.isAndroid,
    install,
  };
}
