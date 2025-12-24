import type { StorageData, VTuberChannel, AppSettings } from '../types';

const DEFAULT_SETTINGS: AppSettings = {
  autoSync: true,
  syncIntervalMinutes: 60,
  reminderMinutes: 30,
  notifyOnNewStream: true,
  calendarId: 'primary',
};

/**
 * ストレージからデータを取得
 */
export async function getStorageData(): Promise<StorageData> {
  const result = await chrome.storage.sync.get([
    'vtubers',
    'holodexApiKey',
    'syncedEventIds',
    'settings',
  ]);

  return {
    vtubers: result.vtubers || [],
    holodexApiKey: result.holodexApiKey || '',
    syncedEventIds: result.syncedEventIds || [],
    settings: { ...DEFAULT_SETTINGS, ...result.settings },
  };
}

/**
 * VTuberリストを保存
 */
export async function saveVTubers(vtubers: VTuberChannel[]): Promise<void> {
  await chrome.storage.sync.set({ vtubers });
}

/**
 * VTuberを追加
 */
export async function addVTuber(vtuber: VTuberChannel): Promise<void> {
  const { vtubers } = await getStorageData();
  if (!vtubers.find(v => v.channelId === vtuber.channelId)) {
    await saveVTubers([...vtubers, vtuber]);
  }
}

/**
 * VTuberを削除
 */
export async function removeVTuber(channelId: string): Promise<void> {
  const { vtubers } = await getStorageData();
  await saveVTubers(vtubers.filter(v => v.channelId !== channelId));
}

/**
 * Holodex APIキーを保存
 */
export async function saveHolodexApiKey(apiKey: string): Promise<void> {
  await chrome.storage.sync.set({ holodexApiKey: apiKey });
}

/**
 * 同期済みイベントIDを保存
 */
export async function saveSyncedEventIds(ids: string[]): Promise<void> {
  await chrome.storage.sync.set({ syncedEventIds: ids });
}

/**
 * 同期済みイベントIDを追加
 */
export async function addSyncedEventId(id: string): Promise<void> {
  const { syncedEventIds } = await getStorageData();
  if (!syncedEventIds.includes(id)) {
    await saveSyncedEventIds([...syncedEventIds, id]);
  }
}

/**
 * 設定を保存
 */
export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  const { settings: current } = await getStorageData();
  await chrome.storage.sync.set({
    settings: { ...current, ...settings },
  });
}
