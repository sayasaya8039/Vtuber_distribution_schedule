import type { HolodexLive, VTuberChannel, AppSettings } from '../types';

const HOLODEX_API_BASE = 'https://holodex.net/api/v2';
const HOLOLIVE_URL = 'https://schedule.hololive.tv/lives/all';
const NIJISANJI_URL = 'https://www.nijisanji.jp/streams';
const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

// 初期化（インストール時）
chrome.runtime.onInstalled.addListener(() => {
  console.log('VTuber Schedule Calendar installed');
  setupAlarm();
  // 初回チェック（5秒後）
  setTimeout(() => syncSchedules(), 5000);
});

// ブラウザ起動時
chrome.runtime.onStartup.addListener(() => {
  console.log('VTuber Schedule Calendar started');
  setupAlarm();
  // 起動時チェック（10秒後）
  setTimeout(() => syncSchedules(), 10000);
});

// アラーム設定
async function setupAlarm() {
  const { settings } = await chrome.storage.sync.get('settings');
  const intervalMinutes = settings?.syncIntervalMinutes || 60;

  // 既存のアラームをクリアして再作成
  await chrome.alarms.clear('syncSchedules');
  chrome.alarms.create('syncSchedules', {
    delayInMinutes: 1, // 最初のチェックは1分後
    periodInMinutes: intervalMinutes,
  });

  console.log('[Alarm] Set up: every ' + intervalMinutes + ' minutes');
}

// アラームハンドラ
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'syncSchedules') {
    await syncSchedules();
  }
});

// 名前マッチング（簡易版）
function isNameMatch(registeredName: string, scheduleName: string): boolean {
  const regLower = registeredName.toLowerCase();
  const schLower = scheduleName.toLowerCase();
  return regLower.includes(schLower) || schLower.includes(regLower);
}

// ホロライブスケジュール取得
async function fetchHololiveBg(): Promise<HolodexLive[]> {
  try {
    const response = await fetch(HOLOLIVE_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' },
    });
    if (!response.ok) return [];

    const html = await response.text();
    const schedules: HolodexLive[] = [];
    const videoIdRegex = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/g;
    let match;
    const seenIds = new Set<string>();

    while ((match = videoIdRegex.exec(html)) !== null) {
      const videoId = match[1];
      if (seenIds.has(videoId)) continue;
      seenIds.add(videoId);

      const videoPos = match.index;
      const linkContext = html.substring(videoPos, Math.min(html.length, videoPos + 500));
      const nameMatch = linkContext.match(/event_category['"]?\s*:\s*['"]([^'"]+)['"]/);
      const name = nameMatch ? nameMatch[1] : 'Unknown';
      if (name === 'Unknown') continue;

      const timeContext = html.substring(videoPos, Math.min(html.length, videoPos + 2000));
      const timeMatch = timeContext.match(/(\d{1,2}):(\d{2})/);
      const now = new Date();
      const startTime = new Date(now);
      if (timeMatch) {
        startTime.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]), 0, 0);
        if (startTime < now) startTime.setDate(startTime.getDate() + 1);
      }

      schedules.push({
        id: videoId,
        title: name + 'の配信',
        type: 'stream',
        start_scheduled: startTime.toISOString(),
        status: 'upcoming',
        channel: { id: videoId, name, org: 'Hololive' },
      });
    }
    return schedules;
  } catch {
    return [];
  }
}

// にじさんじスケジュール取得
async function fetchNijisanjiBg(): Promise<HolodexLive[]> {
  try {
    const response = await fetch(NIJISANJI_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' },
    });
    if (!response.ok) return [];

    const html = await response.text();
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
    if (!nextDataMatch) return [];

    const nextData = JSON.parse(nextDataMatch[1]);
    const streams = nextData?.props?.pageProps?.streams || [];

    return streams.map((stream: Record<string, unknown>) => {
      const url = stream.url as string || '';
      const videoIdMatch = url.match(/v=([a-zA-Z0-9_-]{11})/);
      const videoId = videoIdMatch ? videoIdMatch[1] : stream.id as string;
      const ytChannel = stream['youtube-channel'] as Record<string, unknown> || {};
      let channelName = (ytChannel.name as string) || 'Unknown';
      channelName = channelName.replace(/【にじさんじ】/g, '').trim();

      return {
        id: videoId,
        title: stream.title as string,
        type: 'stream' as const,
        start_scheduled: new Date(stream['start-at'] as string).toISOString(),
        status: stream.status === 'on_air' ? 'live' : 'upcoming',
        channel: { id: ytChannel.id as string || videoId, name: channelName, org: 'Nijisanji' },
      } as HolodexLive;
    });
  } catch {
    return [];
  }
}

// 自動カレンダー追加
async function autoAddToCalendar(schedules: HolodexLive[], vtubers: VTuberChannel[], settings: AppSettings) {
  try {
    const token = await new Promise<string>((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: false }, (token) => {
        if (chrome.runtime.lastError || !token) reject(new Error('Not authenticated'));
        else resolve(token);
      });
    });

    const syncedResult = await chrome.storage.sync.get(['syncedEventIds']);
    const syncedEventIds: string[] = syncedResult.syncedEventIds || [];
    const newSyncedIds = [...syncedEventIds];

    for (const schedule of schedules.slice(0, 5)) {
      if (syncedEventIds.includes(schedule.id)) continue;

      const vtuber = vtubers.find(v => isNameMatch(v.name, schedule.channel.name)) || {
        id: schedule.channel.id,
        name: schedule.channel.name,
        channelId: schedule.channel.id,
        org: 'other' as const,
        color: '#888',
      };

      const start = new Date(schedule.start_scheduled || schedule.available_at || Date.now());
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

      const event = {
        summary: '🎭 ' + vtuber.name + ' 配信: ' + schedule.title,
        description: '配信URL: https://www.youtube.com/watch?v=' + schedule.id,
        start: { dateTime: start.toISOString(), timeZone: 'Asia/Tokyo' },
        end: { dateTime: end.toISOString(), timeZone: 'Asia/Tokyo' },
        reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: settings.reminderMinutes || 30 }] },
      };

      const response = await fetch(CALENDAR_API + '/calendars/primary/events', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });

      if (response.ok) {
        newSyncedIds.push(schedule.id);
        console.log('[Background] Added to calendar:', schedule.channel.name);
      }
    }

    await chrome.storage.sync.set({ syncedEventIds: newSyncedIds });
  } catch {
    console.log('[Background] Auto calendar add skipped (not authenticated)');
  }
}

// スケジュール同期
async function syncSchedules() {
  try {
    const storage = await chrome.storage.sync.get(['holodexApiKey', 'vtubers', 'settings', 'knownScheduleIds']);
    const apiKey = storage.holodexApiKey;
    const vtubers: VTuberChannel[] = storage.vtubers || [];
    const settings: AppSettings = storage.settings || {};
    const knownScheduleIds: string[] = storage.knownScheduleIds || [];

    if (!settings.autoSync) return;

    const allSchedules: HolodexLive[] = [];

    // Holodex APIから取得
    if (apiKey && vtubers.length > 0) {
      try {
        const channelIds = vtubers.map(v => v.channelId).join(',');
        const response = await fetch(
          HOLODEX_API_BASE + '/live?channels=' + channelIds + '&status=upcoming,live&type=stream&limit=50',
          { headers: { 'X-APIKEY': apiKey } }
        );
        if (response.ok) {
          const schedules: HolodexLive[] = await response.json();
          allSchedules.push(...schedules);
        }
      } catch (e) {
        console.error('Holodex fetch error:', e);
      }
    }

    // ホロライブスクレイピング
    if (settings.useHololiveScraper) {
      const hololiveSchedules = await fetchHololiveBg();
      if (settings.showAllHololive) {
        allSchedules.push(...hololiveSchedules);
      } else {
        const filtered = hololiveSchedules.filter(s => vtubers.some(v => isNameMatch(v.name, s.channel.name)));
        allSchedules.push(...filtered);
      }
    }

    // にじさんじスクレイピング
    if (settings.useNijisanjiScraper) {
      const nijisanjiSchedules = await fetchNijisanjiBg();
      if (settings.showAllNijisanji) {
        allSchedules.push(...nijisanjiSchedules);
      } else {
        const filtered = nijisanjiSchedules.filter(s => vtubers.some(v => isNameMatch(v.name, s.channel.name)));
        allSchedules.push(...filtered);
      }
    }

    // 重複除去
    const uniqueSchedules = allSchedules.filter((s, i, arr) => arr.findIndex(x => x.id === s.id) === i);

    // 新しい配信を検出
    const newSchedules = uniqueSchedules.filter(s => !knownScheduleIds.includes(s.id));

    // 新しい配信を通知
    if (settings.notifyOnNewStream && newSchedules.length > 0) {
      notifyNewStreams(newSchedules, vtubers);

      // 自動カレンダー追加
      if (settings.autoAddToCalendar) {
        await autoAddToCalendar(newSchedules, vtubers, settings);
      }
    }

    // 既知のスケジュールIDを更新（最大500件）
    const updatedKnownIds = [...new Set([...knownScheduleIds, ...uniqueSchedules.map(s => s.id)])].slice(-500);
    await chrome.storage.sync.set({ knownScheduleIds: updatedKnownIds });

    console.log('[Background] Synced ' + uniqueSchedules.length + ' schedules, ' + newSchedules.length + ' new');
  } catch (error) {
    console.error('Sync error:', error);
  }
}

// 新しい配信を通知
function notifyNewStreams(schedules: HolodexLive[], _vtubers: VTuberChannel[]) {
  const upcoming = schedules.filter(s => s.status === 'upcoming').slice(0, 3);
  if (upcoming.length === 0) return;

  const title = upcoming.length === 1
    ? upcoming[0].channel.name + 'の配信予定'
    : upcoming.length + '件の新しい配信予定';

  const message = upcoming.map(s => s.channel.name + ': ' + s.title).join('\n');

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title,
    message,
    priority: 2,
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
          if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
          else if (token) resolve(token);
          else reject(new Error('No token'));
        });
      });
      return { success: true, data: token };

    default:
      return { success: false, error: 'Unknown message type' };
  }
}

// Side Panel有効化
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// 設定変更時にアラーム更新
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.settings) {
    setupAlarm();
  }
});

console.log('VTuber Schedule Calendar service worker started');
