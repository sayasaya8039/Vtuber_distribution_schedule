import { create } from 'zustand';
import type { VTuberChannel, HolodexLive, AppSettings } from '../types';
import { getStorageData, saveVTubers, saveHolodexApiKey, saveSettings } from './storage';
import { fetchSchedules } from './holodex';

interface AppState {
  // データ
  vtubers: VTuberChannel[];
  schedules: HolodexLive[];
  holodexApiKey: string;
  settings: AppSettings;
  
  // UI状態
  loading: boolean;
  error: string | null;
  
  // アクション
  initialize: () => Promise<void>;
  addVTuber: (vtuber: VTuberChannel) => Promise<void>;
  removeVTuber: (channelId: string) => Promise<void>;
  setApiKey: (key: string) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  refreshSchedules: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  vtubers: [],
  schedules: [],
  holodexApiKey: '',
  settings: {
    autoSync: true,
    syncIntervalMinutes: 60,
    reminderMinutes: 30,
    notifyOnNewStream: true,
    calendarId: 'primary',
  },
  loading: false,
  error: null,

  initialize: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getStorageData();
      set({
        vtubers: data.vtubers,
        holodexApiKey: data.holodexApiKey,
        settings: data.settings,
      });
      
      // スケジュールも取得
      if (data.holodexApiKey && data.vtubers.length > 0) {
        const schedules = await fetchSchedules(
          data.holodexApiKey,
          data.vtubers.map(v => v.channelId)
        );
        set({ schedules });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  addVTuber: async (vtuber) => {
    const { vtubers } = get();
    if (vtubers.find(v => v.channelId === vtuber.channelId)) {
      return;
    }
    const newVtubers = [...vtubers, vtuber];
    await saveVTubers(newVtubers);
    set({ vtubers: newVtubers });
    await get().refreshSchedules();
  },

  removeVTuber: async (channelId) => {
    const { vtubers } = get();
    const newVtubers = vtubers.filter(v => v.channelId !== channelId);
    await saveVTubers(newVtubers);
    set({ vtubers: newVtubers });
    await get().refreshSchedules();
  },

  setApiKey: async (key) => {
    await saveHolodexApiKey(key);
    set({ holodexApiKey: key });
    await get().refreshSchedules();
  },

  updateSettings: async (newSettings) => {
    const { settings } = get();
    const updated = { ...settings, ...newSettings };
    await saveSettings(updated);
    set({ settings: updated });
  },

  refreshSchedules: async () => {
    const { holodexApiKey, vtubers } = get();
    if (!holodexApiKey || vtubers.length === 0) {
      set({ schedules: [] });
      return;
    }
    
    set({ loading: true, error: null });
    try {
      const schedules = await fetchSchedules(
        holodexApiKey,
        vtubers.map(v => v.channelId)
      );
      set({ schedules });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
}));
