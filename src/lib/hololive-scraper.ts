import type { HolodexLive } from '../types';

const HOLOLIVE_SCHEDULE_URL = 'https://schedule.hololive.tv/';

interface ScrapedStream {
  videoId: string;
  channelName: string;
  dateTime: Date;
  title: string;
}

/**
 * ホロジュール（schedule.hololive.tv）から配信予定をスクレイピング
 */
export async function fetchHololiveSchedule(): Promise<HolodexLive[]> {
  console.log('[Hololive Scraper] Fetching schedule from:', HOLOLIVE_SCHEDULE_URL);

  try {
    const response = await fetch(HOLOLIVE_SCHEDULE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,en;q=0.9',
      },
    });

    console.log('[Hololive Scraper] Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    console.log('[Hololive Scraper] HTML length:', html.length);

    // デバッグ: HTMLの一部を表示
    console.log('[Hololive Scraper] HTML sample (first 500 chars):', html.substring(0, 500));

    const streams = parseHololiveScheduleHTML(html);
    console.log(`[Hololive Scraper] Found ${streams.length} streams`);

    // HolodexLive形式に変換
    // 注: スケジュールからのデータなので、基本的にupcomingとして扱う
    // 配信中かどうかは別途判定が必要（ここでは2時間以内の過去はliveとする）
    const now = new Date();
    return streams.map((stream) => {
      const timeDiff = stream.dateTime.getTime() - now.getTime();
      let status: 'upcoming' | 'live' | 'past';

      if (timeDiff > 0) {
        // 未来 → upcoming
        status = 'upcoming';
      } else if (timeDiff > -2 * 60 * 60 * 1000) {
        // 2時間以内の過去 → live（配信中の可能性）
        status = 'live';
      } else {
        // 2時間以上前 → upcoming扱いで表示（終了済みだが表示する）
        status = 'upcoming';
      }

      return {
        id: stream.videoId,
        title: stream.title || `${stream.channelName} の配信`,
        type: 'stream' as const,
        start_scheduled: stream.dateTime.toISOString(),
        status,
        channel: {
          id: `hololive_${stream.channelName}`,
          name: stream.channelName,
          org: 'Hololive',
        },
      };
    });
  } catch (error) {
    console.error('[Hololive Scraper] Error:', error);
    return [];
  }
}

/**
 * HTMLをパースして配信情報を抽出
 */
function parseHololiveScheduleHTML(html: string): ScrapedStream[] {
  const streams: ScrapedStream[] = [];
  const currentYear = new Date().getFullYear();

  console.log('[Hololive Scraper] Starting parse...');

  // YouTubeリンクを複数パターンで抽出
  const videoIds: string[] = [];
  let match;

  // パターン1: youtube.com/watch?v=
  const pattern1 = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/g;
  while ((match = pattern1.exec(html)) !== null) {
    if (!videoIds.includes(match[1])) {
      videoIds.push(match[1]);
    }
  }

  // パターン2: youtu.be/
  const pattern2 = /youtu\.be\/([a-zA-Z0-9_-]{11})/g;
  while ((match = pattern2.exec(html)) !== null) {
    if (!videoIds.includes(match[1])) {
      videoIds.push(match[1]);
    }
  }

  // パターン3: youtube.com/embed/
  const pattern3 = /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/g;
  while ((match = pattern3.exec(html)) !== null) {
    if (!videoIds.includes(match[1])) {
      videoIds.push(match[1]);
    }
  }

  console.log('[Hololive Scraper] Found video IDs:', videoIds.length);
  if (videoIds.length > 0) {
    console.log('[Hololive Scraper] Sample video IDs:', videoIds.slice(0, 5));
  }

  if (videoIds.length === 0) {
    console.log('[Hololive Scraper] No video IDs found in HTML');
    // デバッグ: HTMLにyoutubeが含まれているか確認
    console.log('[Hololive Scraper] Contains "youtube":', html.includes('youtube'));
    console.log('[Hololive Scraper] Contains "watch?v":', html.includes('watch?v'));
    return [];
  }

  // 日付情報を抽出（複数の形式に対応）
  const dateMatches = html.match(/(\d{1,2})\/(\d{1,2})\s*[\(（][日月火水木金土][\)）]/g) || [];
  console.log('[Hololive Scraper] Found dates:', dateMatches);

  // 最初の日付をデフォルトとして使用
  let defaultMonth = new Date().getMonth() + 1;
  let defaultDay = new Date().getDate();

  if (dateMatches.length > 0 && dateMatches[0]) {
    const firstDate = dateMatches[0].match(/(\d{1,2})\/(\d{1,2})/);
    if (firstDate) {
      defaultMonth = parseInt(firstDate[1], 10);
      defaultDay = parseInt(firstDate[2], 10);
    }
  }

  // 各動画IDに対して情報を構築
  for (const videoId of videoIds) {
    // HTML内での位置を特定
    const videoPos = html.indexOf(`v=${videoId}`);

    // 周辺のテキストを取得（前後2000文字）
    const start = Math.max(0, videoPos - 2000);
    const end = Math.min(html.length, videoPos + 500);
    const context = html.substring(start, end);

    // 日付を探す（動画の前にある最後の日付）
    let month = defaultMonth;
    let day = defaultDay;

    const contextBefore = html.substring(Math.max(0, videoPos - 5000), videoPos);
    const datesInContext = contextBefore.match(/(\d{1,2})\/(\d{1,2})\s*[\(（][日月火水木金土][\)）]/g);
    if (datesInContext && datesInContext.length > 0) {
      const lastDate = datesInContext[datesInContext.length - 1].match(/(\d{1,2})\/(\d{1,2})/);
      if (lastDate) {
        month = parseInt(lastDate[1], 10);
        day = parseInt(lastDate[2], 10);
      }
    }

    // 時刻を探す（リンクの後ろで検索 - 時間はビデオリンクの後にある）
    let hour = 12;
    let minute = 0;

    // リンクの後2000文字で時刻を探す
    const timeContext = html.substring(videoPos, Math.min(html.length, videoPos + 2000));
    const timeMatch = timeContext.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      hour = parseInt(timeMatch[1], 10);
      minute = parseInt(timeMatch[2], 10);
    }

    // 名前を探す
    let channelName = 'Unknown';

    // video IDを含むリンク周辺を取得
    // href="...v=XXX" の後に onclick="...event_category:'Name'..." がある
    const linkContext = html.substring(videoPos, Math.min(html.length, videoPos + 500));

    // メインパターン: onclick内のevent_category
    // onclick="gtag('event','movieClick',{'event_category':'Nerissa',...});"
    const eventCategoryMatch = linkContext.match(/event_category['"]?\s*:\s*['"]([^'"]+)['"]/);
    if (eventCategoryMatch) {
      channelName = eventCategoryMatch[1];
    }

    // フォールバック: alt属性
    if (channelName === 'Unknown') {
      const altMatch = context.match(/alt="([^"]{2,50})"/);
      if (altMatch && !altMatch[1].toLowerCase().includes('icon') && !altMatch[1].includes('http')) {
        channelName = altMatch[1];
      }
    }

    // デバッグ: 最初の数件だけ詳細を出力
    if (streams.length < 3) {
      console.log(`[Hololive Scraper] Video ${videoId}: name="${channelName}", date=${month}/${day}, time=${hour}:${minute}`);
    }

    // 日時を構築
    let dateTime = new Date(currentYear, month - 1, day, hour, minute);

    // 過去すぎる場合は来年
    if (dateTime < new Date(Date.now() - 48 * 60 * 60 * 1000)) {
      dateTime.setFullYear(currentYear + 1);
    }

    streams.push({
      videoId,
      channelName,
      dateTime,
      title: `${channelName} の配信`,
    });
  }

  console.log('[Hololive Scraper] Parsed streams:', streams.length);
  return streams;
}

/**
 * 特定のグループのみフィルタリング
 */
export function filterByBranch(
  streams: HolodexLive[],
  branches: ('hololive' | 'holostars' | 'indonesia' | 'english' | 'devis')[]
): HolodexLive[] {
  // ブランチ別のメンバー名パターン（必要に応じて拡張）
  const branchPatterns: Record<string, RegExp[]> = {
    english: [/gura/i, /calli/i, /kiara/i, /ina/i, /ame/i, /irys/i, /fauna/i, /kronii/i, /mumei/i, /baelz/i, /shiori/i, /bijou/i, /nerissa/i, /fuwamoco/i, /elizabeth/i, /gigi/i, /cecilia/i],
    indonesia: [/risu/i, /moona/i, /iofi/i, /ollie/i, /anya/i, /reine/i, /zeta/i, /kaela/i, /kobo/i],
    devis: [/ao/i, /kanade/i, /ririka/i, /raden/i, /hajime/i],
  };

  return streams.filter((stream) => {
    const name = stream.channel.name.toLowerCase();

    for (const branch of branches) {
      if (branch === 'hololive' || branch === 'holostars') {
        // デフォルトで含める
        return true;
      }

      const patterns = branchPatterns[branch];
      if (patterns?.some((p) => p.test(name))) {
        return true;
      }
    }

    return branches.includes('hololive'); // fallback
  });
}
