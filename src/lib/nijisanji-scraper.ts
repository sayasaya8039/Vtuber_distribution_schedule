import type { HolodexLive } from '../types';

const NIJISANJI_STREAMS_URL = 'https://www.nijisanji.jp/streams';

interface NijisanjiStream {
  title: string;
  url: string;
  'thumbnail-url': string;
  'start-at': string;
  'end-at'?: string;
  status: 'on_air' | 'not_on_air' | string;
  id: string;
  'youtube-channel': {
    name: string;
    'thumbnail-url': string;
    main: boolean;
    id: string;
    liver?: {
      'external-id': string;
      id: string;
    };
  };
}

/**
 * にじさんじ公式サイトから配信予定を取得
 */
export async function fetchNijisanjiSchedule(): Promise<HolodexLive[]> {
  console.log('[Nijisanji Scraper] Fetching schedule from:', NIJISANJI_STREAMS_URL);

  try {
    const response = await fetch(NIJISANJI_STREAMS_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,en;q=0.9',
      },
    });

    console.log('[Nijisanji Scraper] Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    console.log('[Nijisanji Scraper] HTML length:', html.length);

    // __NEXT_DATA__ からJSONを抽出
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
    if (!nextDataMatch) {
      console.log('[Nijisanji Scraper] __NEXT_DATA__ not found');
      return [];
    }

    const nextData = JSON.parse(nextDataMatch[1]);
    const streams: NijisanjiStream[] = nextData?.props?.pageProps?.streams || [];

    console.log(`[Nijisanji Scraper] Found ${streams.length} streams`);

    // HolodexLive形式に変換
    const now = new Date();
    return streams.map((stream) => {
      const videoIdMatch = stream.url.match(/v=([a-zA-Z0-9_-]{11})/);
      const videoId = videoIdMatch ? videoIdMatch[1] : stream.id;

      const startTime = new Date(stream['start-at']);
      const timeDiff = startTime.getTime() - now.getTime();

      // ステータス判定
      let status: 'upcoming' | 'live' | 'past';
      if (stream.status === 'on_air') {
        status = 'live';
      } else if (timeDiff > 0) {
        status = 'upcoming';
      } else if (timeDiff > -2 * 60 * 60 * 1000) {
        // 2時間以内の過去 → live扱い
        status = 'live';
      } else {
        status = 'upcoming'; // 終了済みでも表示
      }

      // チャンネル名から「【にじさんじ】」などを除去
      let channelName = stream['youtube-channel'].name;
      channelName = channelName.replace(/【にじさんじ】/g, '').replace(/\s*[-/]\s*$/, '').trim();

      return {
        id: videoId,
        title: stream.title,
        type: 'stream' as const,
        start_scheduled: startTime.toISOString(),
        status,
        channel: {
          id: stream['youtube-channel'].liver?.['external-id'] || stream['youtube-channel'].id,
          name: channelName,
          org: 'Nijisanji',
          photo: stream['youtube-channel']['thumbnail-url'],
        },
      };
    });
  } catch (error) {
    console.error('[Nijisanji Scraper] Error:', error);
    return [];
  }
}
