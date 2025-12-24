import type { HolodexLive, VTuberChannel, AppSettings } from '../types';

const HOLODEX_API_BASE = 'https://holodex.net/api/v2';

// 初期化
chrome.runtime.onInstalled.addListener(() => {
  console.log('VTuber Schedule Calendar installed');
  setupAlarm();
});

// アラーム設定
async function setupAlarm() {
  const { settings } = await chrome.storage.sync.get('settings');
  const intervalMinutes = settings?.syncIntervalMinutes || 60;
  
  chrome.alarms.create('syncSchedules', {
    periodInMinutes: intervalMinutes,
  });
}

// アラームハンドラ
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'syncSchedules') {
    await syncSchedules();
  }
});

// スケジュール同期
async function syncSchedules() {
  try {
    const storage = await chrome.storage.sync.get([
      'holodexApiKey',
      'vtubers',
      'settings',
      'syncedEventIds',
    ]);

    const apiKey = storage.holodexApiKey;
    const vtubers: VTuberChannel[] = storage.vtubers || [];
    const settings: AppSettings = storage.settings || {};
    const syncedEventIds: string[] = storage.syncedEventIds || [];

    if (!apiKey || vtubers.length === 0 || !settings.autoSync) {
      return;
    }

    // スケジュール取得
    const channelIds = vtubers.map(v => v.channelId).join(',');
    const response = await fetch(
      `${HOLODEX_API_BASE}/live?channels=${channelIds}&status=upcoming,live&type=stream&limit=50`,
      { headers: { 'X-APIKEY': apiKey } }
    );

    if (!response.ok) {
      throw new Error(`Holodex API error: ${response.status}`);
    }

    const schedules: HolodexLive[] = await response.json();
    const newSchedules = schedules.filter(s => {
      const eventKey = `vtuber_${s.id}_${s.start_scheduled || s.available_at}`;
      return !syncedEventIds.includes(eventKey);
    });

    // 新しい配信を通知
    if (settings.notifyOnNewStream && newSchedules.length > 0) {
      notifyNewStreams(newSchedules);
    }

    console.log(`Synced ${schedules.length} schedules, ${newSchedules.length} new`);
  } catch (error) {
    console.error('Sync error:', error);
  }
}

// 新しい配信を通知
function notifyNewStreams(schedules: HolodexLive[]) {
  const upcoming = schedules.filter(s => s.status === 'upcoming').slice(0, 3);
  
  if (upcoming.length === 0) return;

  const title = upcoming.length === 1
    ? `${upcoming[0].channel.name}の配信予定`
    : `${upcoming.length}件の新しい配信予定`;

  const message = upcoming
    .map(s => `${s.channel.name}: ${s.title}`)
    .join('\n');

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title,
    message,
    priority: 1,
  });
}

// メッセージハンドラ
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  handleMessage(message)
    .then(sendResponse)
    .catch(error => sendResponse({ success: false, error: error.message }));
  return true;
});

async function handleMessage(message: { type: string; payload?: unknown }) {
  switch (message.type) {
    case 'SYNC_SCHEDULES':
      await syncSchedules();
      return { success: true };
    
    case 'GET_AUTH_TOKEN':
      const token = await new Promise<string>((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (token) {
            resolve(token);
          } else {
            reject(new Error('No token'));
          }
        });
      });
      return { success: true, data: token };
    
    default:
      return { success: false, error: 'Unknown message type' };
  }
}

// Side Panel有効化
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: false })
  .catch((error) => console.error(error));

// 設定変更時にアラーム更新
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.settings) {
    setupAlarm();
  }
});

console.log('VTuber Schedule Calendar service worker started');
