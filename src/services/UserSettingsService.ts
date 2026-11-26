import { UserSettings } from '../types/academy';

const SETTINGS_KEY = 'ela_user_settings_v1';

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  activeProfileId: null,
  speechRate: 0.9,
  preferredVoiceAccent: 'en-GB',
  arabicSupportMode: 'gradual',
};

export const UserSettingsService = {
  load(): UserSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return { ...DEFAULT_SETTINGS };
      const parsed = JSON.parse(raw) as Partial<UserSettings>;
      return {
        theme: parsed.theme === 'dark' ? 'dark' : 'light',
        activeProfileId:
          typeof parsed.activeProfileId === 'string' ? parsed.activeProfileId : null,
        speechRate:
          typeof parsed.speechRate === 'number' &&
          parsed.speechRate >= 0.5 &&
          parsed.speechRate <= 1.5
            ? parsed.speechRate
            : 0.9,
        preferredVoiceAccent:
          parsed.preferredVoiceAccent === 'en-US' ? 'en-US' : 'en-GB',
        arabicSupportMode:
          parsed.arabicSupportMode === 'full' ? 'full' : 'gradual',
      };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  },

  save(partial: Partial<UserSettings>): UserSettings {
    const current = this.load();
    const updated = { ...current, ...partial };
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    } catch {
      // Ignore quota errors cleanly
    }
    this.applyThemeToDocument(updated.theme);
    return updated;
  },

  applyThemeToDocument(theme: 'light' | 'dark'): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  },
};
