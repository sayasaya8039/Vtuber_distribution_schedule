import type { HolodexLive, VTuberChannel } from '../types';

const HOLODEX_API_BASE = 'https://holodex.net/api/v2';

/**
 * Holodex APIからライブ/予定配信を取得
 */
export async function fetchSchedules(
  apiKey: string,
  channelIds: string[]
): Promise<HolodexLive[]> {
  if (!apiKey || channelIds.length === 0) {
    return [];
  }

  const params = new URLSearchParams({
    channels: channelIds.join(','),
    status: 'upcoming,live',
    type: 'stream',
    max_upcoming_hours: '168', // 1週間先まで
    limit: '50',
  });

  const response = await fetch(`${HOLODEX_API_BASE}/live?${params}`, {
    headers: {
      'X-APIKEY': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Holodex API error: ${response.status}`);
  }

  return response.json();
}

/**
 * チャンネル情報を検索
 */
export async function searchChannels(
  apiKey: string,
  query: string
): Promise<VTuberChannel[]> {
  const params = new URLSearchParams({
    q: query,
    type: 'vtuber',
    limit: '20',
  });

  const response = await fetch(`${HOLODEX_API_BASE}/channels?${params}`, {
    headers: {
      'X-APIKEY': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Holodex API error: ${response.status}`);
  }

  const channels = await response.json();
  
  return channels.map((ch: {
    id: string;
    name: string;
    english_name?: string;
    org?: string;
    photo?: string;
  }) => ({
    id: ch.id,
    name: ch.english_name || ch.name,
    channelId: ch.id,
    org: mapOrg(ch.org),
    color: getOrgColor(ch.org),
    avatarUrl: ch.photo,
  }));
}

/**
 * 組織名をマッピング
 */
function mapOrg(org?: string): VTuberChannel['org'] {
  if (!org) return 'indie';
  const lower = org.toLowerCase();
  if (lower.includes('hololive')) return 'hololive';
  if (lower.includes('nijisanji')) return 'nijisanji';
  return 'other';
}

/**
 * 組織別のカラーを取得
 */
function getOrgColor(org?: string): string {
  const orgLower = org?.toLowerCase() || '';
  if (orgLower.includes('hololive')) return '#00bfff';
  if (orgLower.includes('nijisanji')) return '#ff6b6b';
  return '#a855f7'; // インディー: パープル
}

/**
 * 配信予定の開始時刻を取得
 */
export function getStartTime(live: HolodexLive): Date {
  const timeStr = live.start_scheduled || live.available_at || live.published_at;
  return timeStr ? new Date(timeStr) : new Date();
}

/**
 * 配信の終了時刻を推定（デフォルト2時間）
 */
export function getEndTime(live: HolodexLive): Date {
  if (live.end_actual) {
    return new Date(live.end_actual);
  }
  const start = getStartTime(live);
  return new Date(start.getTime() + 2 * 60 * 60 * 1000);
}
