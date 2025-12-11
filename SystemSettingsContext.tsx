import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';

export interface WallpaperOption {
  id: string;
  name: string;
  type: 'gradient' | 'image' | 'custom';
  value: string;
  thumbnail?: string;
}

export interface InstalledApp {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  size: string;
  installedAt: number;
}

export interface DisplaySettings {
  brightness: number;
  nightLight: boolean;
  nightLightStrength: number;
  scale: number;
}

export interface SoundSettings {
  masterVolume: number;
  systemSounds: boolean;
  notificationSounds: boolean;
  isMuted: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  doNotDisturb: boolean;
  showOnLockScreen: boolean;
  playSounds: boolean;
}

export interface SystemSettings {
  wallpaper: WallpaperOption;
  accentColor: string;
  isDarkMode: boolean;
  transparency: number;
  userName: string;
  userInitials: string;
  profilePicture: string | null;
  display: DisplaySettings;
  sound: SoundSettings;
  notifications: NotificationSettings;
}

interface SystemSettingsContextType {
  settings: SystemSettings;
  wallpapers: WallpaperOption[];
  installedApps: InstalledApp[];
  setWallpaper: (wallpaper: WallpaperOption) => void;
  setAccentColor: (color: string) => void;
  setDarkMode: (isDark: boolean) => void;
  setTransparency: (level: number) => void;
  setUserName: (name: string) => void;
  setUserInitials: (initials: string) => void;
  setProfilePicture: (imageUrl: string | null) => void;
  addCustomWallpaper: (name: string, imageUrl: string) => void;
  removeCustomWallpaper: (id: string) => void;
  setDisplaySettings: (display: Partial<DisplaySettings>) => void;
  setSoundSettings: (sound: Partial<SoundSettings>) => void;
  setNotificationSettings: (notifications: Partial<NotificationSettings>) => void;
  installApp: (app: Omit<InstalledApp, 'installedAt'>) => void;
  uninstallApp: (appId: string) => void;
  isAppInstalled: (appId: string) => boolean;
  isSaving: boolean;
}

const defaultWallpapers: WallpaperOption[] = [
  { id: 'image-abstract-futuristic', name: 'Abstract Futuristic', type: 'image', value: '/wallpapers/abstract-futuristic.png' },
  { id: 'image-chatgpt-liquid', name: 'Liquid Glass', type: 'image', value: '/wallpapers/chatgpt-liquid.png' },
  { id: 'image-neon-waves', name: 'Neon Waves', type: 'image', value: '/wallpapers/neon_purple_blue_waves_wallpaper.png' },
  { id: 'image-chrome-spheres', name: 'Chrome Spheres', type: 'image', value: '/wallpapers/chrome_liquid_metal_spheres_wallpaper.png' },
  { id: 'image-cosmic-aurora', name: 'Cosmic Aurora', type: 'image', value: '/wallpapers/cosmic_aurora_nebula_wallpaper.png' },
  { id: 'image-crystal-prisms', name: 'Crystal Prisms', type: 'image', value: '/wallpapers/geometric_crystal_prisms_wallpaper.png' },
  { id: 'gradient-blue-purple', name: 'Future', type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'gradient-cyan-blue', name: 'Flow', type: 'gradient', value: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' },
  { id: 'gradient-orange-red', name: 'Sunset', type: 'gradient', value: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)' },
  { id: 'gradient-green', name: 'Forest', type: 'gradient', value: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)' },
  { id: 'gradient-dark', name: 'Midnight', type: 'gradient', value: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' },
  { id: 'gradient-neon', name: 'Neon', type: 'gradient', value: 'linear-gradient(135deg, #ec4899 0%, #eab308 100%)' },
  { id: 'gradient-ocean', name: 'Ocean', type: 'gradient', value: 'linear-gradient(135deg, #0077b6 0%, #00b4d8 50%, #90e0ef 100%)' },
  { id: 'gradient-aurora', name: 'Aurora', type: 'gradient', value: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #06b6d4 100%)' },
  { id: 'gradient-rose', name: 'Rose', type: 'gradient', value: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)' },
  { id: 'gradient-emerald', name: 'Emerald', type: 'gradient', value: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)' },
  { id: 'gradient-lavender', name: 'Lavender', type: 'gradient', value: 'linear-gradient(135deg, #c084fc 0%, #a78bfa 50%, #818cf8 100%)' },
  { id: 'gradient-sunset-beach', name: 'Sunset Beach', type: 'gradient', value: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 50%, #ffcb80 100%)' },
  { id: 'gradient-northern-lights', name: 'Northern Lights', type: 'gradient', value: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)' },
  { id: 'gradient-deep-space', name: 'Deep Space', type: 'gradient', value: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { id: 'gradient-cherry', name: 'Cherry', type: 'gradient', value: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)' },
  { id: 'gradient-royal', name: 'Royal', type: 'gradient', value: 'linear-gradient(135deg, #141e30 0%, #243b55 100%)' },
  { id: 'gradient-tropical', name: 'Tropical', type: 'gradient', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { id: 'gradient-candy', name: 'Candy', type: 'gradient', value: 'linear-gradient(135deg, #d53369 0%, #cbad6d 100%)' },
  { id: 'gradient-aqua', name: 'Aqua', type: 'gradient', value: 'linear-gradient(135deg, #13547a 0%, #80d0c7 100%)' },
  { id: 'solid-black', name: 'Black', type: 'gradient', value: '#000000' },
  { id: 'solid-white', name: 'White', type: 'gradient', value: '#ffffff' },
  { id: 'solid-navy', name: 'Navy', type: 'gradient', value: '#1e3a5f' },
  { id: 'solid-slate', name: 'Slate', type: 'gradient', value: '#475569' },
  { id: 'solid-charcoal', name: 'Charcoal', type: 'gradient', value: '#36454f' },
];

const defaultDisplaySettings: DisplaySettings = {
  brightness: 100,
  nightLight: false,
  nightLightStrength: 50,
  scale: 100,
};

const defaultSoundSettings: SoundSettings = {
  masterVolume: 80,
  systemSounds: true,
  notificationSounds: true,
  isMuted: false,
};

const defaultNotificationSettings: NotificationSettings = {
  enabled: true,
  doNotDisturb: false,
  showOnLockScreen: true,
  playSounds: true,
};

const defaultSettings: SystemSettings = {
  wallpaper: defaultWallpapers[0],
  accentColor: '#3b82f6',
  isDarkMode: true,
  transparency: 85,
  userName: 'User',
  userInitials: 'U',
  profilePicture: '/profile-picture.png',
  display: defaultDisplaySettings,
  sound: defaultSoundSettings,
  notifications: defaultNotificationSettings,
};

const SystemSettingsContext = createContext<SystemSettingsContextType | null>(null);

const STABLE_SESSION_ID = 'windows13-main-user';

function applyDisplayEffects(display: DisplaySettings) {
  const root = document.documentElement;
  
  const brightness = display.brightness / 100;
  let filter = `brightness(${brightness})`;
  
  if (display.nightLight) {
    const warmth = display.nightLightStrength / 100;
    filter += ` sepia(${warmth * 0.3}) saturate(${1 - warmth * 0.2})`;
  }
  
  root.style.filter = display.brightness === 100 && !display.nightLight ? '' : filter;
  root.style.setProperty('--system-scale', `${display.scale / 100}`);
}

export function SystemSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [customWallpapers, setCustomWallpapers] = useState<WallpaperOption[]>([]);
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionId = useRef(STABLE_SESSION_ID);

  const saveToServer = useCallback(async (settingsToSave: SystemSettings, apps: InstalledApp[]) => {
    try {
      setIsSaving(true);
      localStorage.setItem('windows13-settings', JSON.stringify({ settings: settingsToSave, apps }));
      await fetch(`/api/settings/${sessionId.current}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            ...settingsToSave,
            installedApps: apps,
          },
        }),
      });
    } catch (e) {
      console.error('Failed to save to server:', e);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const debouncedSave = useCallback((settingsToSave: SystemSettings, apps: InstalledApp[]) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveToServer(settingsToSave, apps);
    }, 1000);
  }, [saveToServer]);

  useEffect(() => {
    const loadFromServer = async () => {
      try {
        const cachedSettings = localStorage.getItem('windows13-settings');
        if (cachedSettings) {
          try {
            const parsed = JSON.parse(cachedSettings);
            setSettings(parsed.settings || defaultSettings);
            setInstalledApps(parsed.apps || []);
          } catch (e) {
            console.log('Failed to parse cached settings');
          }
        }

        const [settingsRes, wallpapersRes] = await Promise.all([
          fetch(`/api/settings/${sessionId.current}`),
          fetch(`/api/wallpapers/${sessionId.current}`),
        ]);

        if (settingsRes.ok) {
          const { settings: serverSettings } = await settingsRes.json();
          if (serverSettings) {
            const loadedSettings = {
              ...defaultSettings,
              userName: serverSettings.userName || defaultSettings.userName,
              userInitials: serverSettings.userInitials || defaultSettings.userInitials,
              profilePicture: serverSettings.profilePicture,
              wallpaper: serverSettings.wallpaper || defaultSettings.wallpaper,
              accentColor: serverSettings.accentColor || defaultSettings.accentColor,
              isDarkMode: serverSettings.isDarkMode === 'true',
              transparency: serverSettings.transparency || defaultSettings.transparency,
              display: serverSettings.displaySettings || defaultDisplaySettings,
              sound: serverSettings.soundSettings || defaultSoundSettings,
              notifications: serverSettings.notificationSettings || defaultNotificationSettings,
            };
            setSettings(loadedSettings);
            const loadedApps = serverSettings.installedApps || [];
            if (loadedApps.length > 0) {
              setInstalledApps(loadedApps);
            }
            localStorage.setItem('windows13-settings', JSON.stringify({ settings: loadedSettings, apps: loadedApps }));
          }
        }

        if (wallpapersRes.ok) {
          const { wallpapers } = await wallpapersRes.json();
          if (wallpapers?.length) {
            setCustomWallpapers(
              wallpapers.map((w: any) => ({
                id: w.id,
                name: w.name,
                type: 'custom' as const,
                value: w.imageData,
                thumbnail: w.imageData,
              }))
            );
          }
        }
      } catch (e) {
        console.error('Failed to load from server:', e);
      } finally {
        setIsInitialized(true);
      }
    };

    loadFromServer();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      debouncedSave(settings, installedApps);
    }
  }, [settings, installedApps, isInitialized, debouncedSave]);

  useEffect(() => {
    if (settings.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.isDarkMode]);

  useEffect(() => {
    applyDisplayEffects(settings.display);
  }, [settings.display]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', settings.accentColor);
  }, [settings.accentColor]);

  const setWallpaper = useCallback((wallpaper: WallpaperOption) => {
    setSettings(prev => ({ ...prev, wallpaper }));
  }, []);

  const setAccentColor = useCallback((color: string) => {
    setSettings(prev => ({ ...prev, accentColor: color }));
  }, []);

  const setDarkMode = useCallback((isDark: boolean) => {
    setSettings(prev => ({ ...prev, isDarkMode: isDark }));
  }, []);

  const setTransparency = useCallback((level: number) => {
    setSettings(prev => ({ ...prev, transparency: level }));
  }, []);

  const setUserName = useCallback((name: string) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    setSettings(prev => ({ ...prev, userName: name, userInitials: initials }));
  }, []);

  const setUserInitials = useCallback((initials: string) => {
    setSettings(prev => ({ ...prev, userInitials: initials.toUpperCase().slice(0, 2) }));
  }, []);

  const setProfilePicture = useCallback((imageUrl: string | null) => {
    setSettings(prev => ({ ...prev, profilePicture: imageUrl }));
  }, []);

  const setDisplaySettings = useCallback((display: Partial<DisplaySettings>) => {
    setSettings(prev => ({ ...prev, display: { ...prev.display, ...display } }));
  }, []);

  const setSoundSettings = useCallback((sound: Partial<SoundSettings>) => {
    setSettings(prev => ({ ...prev, sound: { ...prev.sound, ...sound } }));
  }, []);

  const setNotificationSettings = useCallback((notifications: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, ...notifications } }));
  }, []);

  const addCustomWallpaper = useCallback(async (name: string, imageUrl: string) => {
    try {
      const res = await fetch(`/api/wallpapers/${sessionId.current}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, imageData: imageUrl }),
      });
      
      if (res.ok) {
        const { wallpaper } = await res.json();
        const newWallpaper: WallpaperOption = {
          id: wallpaper.id,
          name,
          type: 'custom',
          value: imageUrl,
          thumbnail: imageUrl,
        };
        setCustomWallpapers(prev => [...prev, newWallpaper]);
      }
    } catch (e) {
      console.error('Failed to save wallpaper:', e);
      const newWallpaper: WallpaperOption = {
        id: `custom-${Date.now()}`,
        name,
        type: 'custom',
        value: imageUrl,
        thumbnail: imageUrl,
      };
      setCustomWallpapers(prev => [...prev, newWallpaper]);
    }
  }, []);

  const removeCustomWallpaper = useCallback(async (id: string) => {
    try {
      await fetch(`/api/wallpapers/${sessionId.current}/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error('Failed to delete wallpaper:', e);
    }
    
    setCustomWallpapers(prev => prev.filter(w => w.id !== id));
    if (settings.wallpaper.id === id) {
      setWallpaper(defaultWallpapers[0]);
    }
  }, [settings.wallpaper.id, setWallpaper]);

  const installApp = useCallback((app: Omit<InstalledApp, 'installedAt'>) => {
    setInstalledApps(prev => {
      if (prev.some(a => a.id === app.id)) return prev;
      return [...prev, { ...app, installedAt: Date.now() }];
    });
  }, []);

  const uninstallApp = useCallback((appId: string) => {
    setInstalledApps(prev => prev.filter(a => a.id !== appId));
  }, []);

  const isAppInstalled = useCallback((appId: string) => {
    return installedApps.some(a => a.id === appId);
  }, [installedApps]);

  const allWallpapers = [...defaultWallpapers, ...customWallpapers];

  return (
    <SystemSettingsContext.Provider
      value={{
        settings,
        wallpapers: allWallpapers,
        installedApps,
        setWallpaper,
        setAccentColor,
        setDarkMode,
        setTransparency,
        setUserName,
        setUserInitials,
        setProfilePicture,
        addCustomWallpaper,
        removeCustomWallpaper,
        setDisplaySettings,
        setSoundSettings,
        setNotificationSettings,
        installApp,
        uninstallApp,
        isAppInstalled,
        isSaving,
      }}
    >
      {children}
    </SystemSettingsContext.Provider>
  );
}

export function useSystemSettings() {
  const context = useContext(SystemSettingsContext);
  if (!context) {
    throw new Error('useSystemSettings must be used within a SystemSettingsProvider');
  }
  return context;
}
