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
 * チャンネル情報を検索（autocompleteエンドポイント使用）
 */
export async function searchChannels(
  apiKey: string,
  query: string
): Promise<VTuberChannel[]> {
  // autocompleteエンドポイントで検索
  const response = await fetch(
    `${HOLODEX_API_BASE}/search/autocomplete?q=${encodeURIComponent(query)}`,
    {
      headers: {
        'X-APIKEY': apiKey,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Holodex API error: ${response.status}`);
  }

  const results = await response.json();

  // チャンネル結果のみ抽出（typeが"channel"のもの）
  const channels = results
    .filter((r: { type: string }) => r.type === 'channel')
    .slice(0, 10);

  // 各チャンネルの詳細を取得
  const channelDetails = await Promise.all(
    channels.map(async (ch: { value: string; text: string }) => {
      try {
        const detailRes = await fetch(
          `${HOLODEX_API_BASE}/channels/${ch.value}`,
          { headers: { 'X-APIKEY': apiKey } }
        );
        if (detailRes.ok) {
          return detailRes.json();
        }
      } catch {
        // 詳細取得失敗時はスキップ
      }
      return null;
    })
  );

  return channelDetails
    .filter((ch): ch is NonNullable<typeof ch> => ch !== null)
    .map((ch) => ({
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
