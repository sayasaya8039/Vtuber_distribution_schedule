import { create } from 'zustand';
import type { VTuberChannel, HolodexLive, AppSettings } from '../types';
import { getStorageData, saveVTubers, saveHolodexApiKey, saveSettings } from './storage';
import { fetchSchedules } from './holodex';
import { fetchHololiveSchedule } from './hololive-scraper';
import { fetchNijisanjiSchedule } from './nijisanji-scraper';

// ホロライブメンバーの日本語名⇔英語名マッピング
const HOLOLIVE_NAME_MAP: Record<string, string[]> = {
  // DEV_IS / ReGLOSS
  '一条莉々華': ['ririka', 'ichijou'],
  '火威青': ['ao', 'hiodoshi'],
  '音乃瀬奏': ['kanade', 'otonose'],
  '儒烏風亭らでん': ['raden', 'juufuutei'],
  '轟はじめ': ['hajime', 'todoroki'],
  // hololive JP Gen 0-5
  'ときのそら': ['sora', 'tokino'],
  'ロボ子さん': ['roboco', 'robocosan'],
  'さくらみこ': ['miko', 'sakura'],
  '星街すいせい': ['suisei', 'hoshimachi'],
  'AZKi': ['azki'],
  '夜空メル': ['mel', 'yozora'],
  '白上フブキ': ['fubuki', 'shirakami'],
  '夏色まつり': ['matsuri', 'natsuiro'],
  '赤井はあと': ['haato', 'haachama', 'akai'],
  'アキ・ローゼンタール': ['aki', 'rosenthal'],
  '湊あくあ': ['aqua', 'minato'],
  '紫咲シオン': ['shion', 'murasaki'],
  '百鬼あやめ': ['ayame', 'nakiri'],
  '癒月ちょこ': ['choco', 'yuzuki'],
  '大空スバル': ['subaru', 'oozora'],
  '大神ミオ': ['mio', 'ookami'],
  '猫又おかゆ': ['okayu', 'nekomata'],
  '戌神ころね': ['korone', 'inugami'],
  '兎田ぺこら': ['pekora', 'usada'],
  '潤羽るしあ': ['rushia', 'uruha'],
  '不知火フレア': ['flare', 'shiranui'],
  '白銀ノエル': ['noel', 'shirogane'],
  '宝鐘マリン': ['marine', 'houshou'],
  '天音かなた': ['kanata', 'amane'],
  '桐生ココ': ['coco', 'kiryu'],
  '角巻わため': ['watame', 'tsunomaki'],
  '常闘トワ': ['towa', 'tokoyami'],
  '姫森ルーナ': ['luna', 'himemori'],
  '雪花ラミィ': ['lamy', 'yukihana'],
  '桃鈴ねね': ['nene', 'momosuzu'],
  '獅白ぼたん': ['botan', 'shishiro'],
  '尾丸ポルカ': ['polka', 'omaru'],
  'ラプラス・ダークネス': ['laplus', 'darknesss'],
  '鷹嶺ルイ': ['lui', 'takane'],
  '博衣こより': ['koyori', 'hakui'],
  '沙花叉クロヱ': ['chloe', 'sakamata'],
  '風真いろは': ['iroha', 'kazama'],
  // hololive EN
  '森カリオペ': ['calli', 'calliope', 'mori'],
  '小鳥遊キアラ': ['kiara', 'takanashi'],
  '一伊那尓栖': ['ina', 'ninomae'],
  'がうる・ぐら': ['gura', 'gawr'],
  'ワトソン・アメリア': ['amelia', 'watson', 'ame'],
  'IRyS': ['irys'],
  'セレス・ファウナ': ['fauna', 'ceres'],
  'オーロ・クロニー': ['kronii', 'ouro'],
  '七詩ムメイ': ['mumei', 'nanashi'],
  'ハコス・ベールズ': ['baelz', 'hakos', 'bae'],
  '獅子神レオナ': ['leona', 'shishigami'],
  'シオリ・ノヴェラ': ['shiori', 'novella'],
  'ビジュー・ル・シーフ': ['bijou', 'koseki'],
  'ネリッサ・レイヴンクロフト': ['nerissa', 'ravencroft'],
  'フワワ・アビスガード': ['fuwawa', 'abyssgard', 'fuwamoco'],
  'モココ・アビスガード': ['mococo', 'abyssgard', 'fuwamoco'],
  'エリザベス・ローズ・ブラッドフレイム': ['elizabeth', 'rose', 'bloodflame'],
  'ジジ・ムリン': ['gigi', 'murin'],
  'セシリア・イマーグリーン': ['cecilia', 'immergreen'],
  'ラオーラ・パンテーラ': ['raora', 'panthera'],
  // hololive ID
  'アユンダ・リス': ['risu', 'ayunda'],
  'ムーナ・ホシノヴァ': ['moona', 'hoshinova'],
  'アイラニ・イオフィフティーン': ['iofi', 'airani'],
  'クレイジー・オリー': ['ollie', 'kureiji'],
  'アーニャ・メルフィッサ': ['anya', 'melfissa'],
  'パヴォリア・レイネ': ['reine', 'pavolia'],
  'ベスティア・ゼータ': ['zeta', 'vestia'],
  'カエラ・コヴァルスキア': ['kaela', 'kovalskia'],
  'こぼ・かなえる': ['kobo', 'kanaeru'],
};

/**
 * 名前がマッチするかチェック（日本語/英語対応）
 */
function isNameMatch(registeredName: string, scheduleName: string): boolean {
  const regLower = registeredName.toLowerCase();
  const schLower = scheduleName.toLowerCase();

  // 直接一致チェック
  if (regLower.includes(schLower) || schLower.includes(regLower)) {
    return true;
  }

  // マッピングを使ってチェック
  for (const [jpName, aliases] of Object.entries(HOLOLIVE_NAME_MAP)) {
    const jpLower = jpName.toLowerCase();

    // スケジュール名が日本語名に一致
    if (schLower.includes(jpLower) || jpLower.includes(schLower)) {
      // 登録名がエイリアスに一致するか
      if (aliases.some(alias => regLower.includes(alias))) {
        return true;
      }
      // 登録名が日本語名に一致するか
      if (regLower.includes(jpLower) || jpLower.includes(regLower)) {
        return true;
      }
    }

    // 登録名が日本語名に一致
    if (regLower.includes(jpLower)) {
      // スケジュール名がエイリアスに一致するか
      if (aliases.some(alias => schLower.includes(alias))) {
        return true;
      }
    }

    // 登録名がエイリアスに一致
    if (aliases.some(alias => regLower.includes(alias))) {
      // スケジュール名が日本語名に一致するか
      if (schLower.includes(jpLower)) {
        return true;
      }
    }
  }

  return false;
}

interface AppState {
  // データ
  vtubers: VTuberChannel[];
  schedules: HolodexLive[];
  holodexApiKey: string;
  settings: AppSettings;

  // UI状態
  loading: boolean;
  error: string | null;
  selectedVTuberId: string | null; // 選択中のVTuber

  // アクション
  initialize: () => Promise<void>;
  addVTuber: (vtuber: VTuberChannel) => Promise<void>;
  removeVTuber: (channelId: string) => Promise<void>;
  setApiKey: (key: string) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  refreshSchedules: () => Promise<void>;
  selectVTuber: (channelId: string | null) => void;
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
    useHololiveScraper: true,
    showAllHololive: false,
    useNijisanjiScraper: true,
    showAllNijisanji: false,
    autoAddToCalendar: false,
  },
  loading: false,
  error: null,
  selectedVTuberId: null,

  initialize: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getStorageData();
      set({
        vtubers: data.vtubers,
        holodexApiKey: data.holodexApiKey,
        settings: { ...get().settings, ...data.settings },
      });

      // スケジュール取得
      await get().refreshSchedules();
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
    const { holodexApiKey, vtubers, settings } = get();

    set({ loading: true, error: null });
    try {
      const allSchedules: HolodexLive[] = [];

      // Holodex APIからの取得（VTuber登録がある場合）
      if (holodexApiKey && vtubers.length > 0) {
        const holodexSchedules = await fetchSchedules(
          holodexApiKey,
          vtubers.map(v => v.channelId)
        );
        allSchedules.push(...holodexSchedules);
      }

      // ホロジュールからのスクレイピング（設定が有効な場合）
      if (settings.useHololiveScraper) {
        console.log('[Store] Fetching from Hololive Schedule...');
        const hololiveSchedules = await fetchHololiveSchedule();

        if (settings.showAllHololive) {
          // 全ホロライブ配信を表示
          for (const schedule of hololiveSchedules) {
            if (!allSchedules.find(s => s.id === schedule.id)) {
              allSchedules.push(schedule);
            }
          }
        } else if (vtubers.length > 0) {
          // 登録済みVTuberの配信のみフィルタリング
          for (const schedule of hololiveSchedules) {
            const isRegistered = vtubers.some(v =>
              isNameMatch(v.name, schedule.channel.name)
            );

            if (isRegistered && !allSchedules.find(s => s.id === schedule.id)) {
              allSchedules.push(schedule);
            }
          }
        }
      }

      // にじさんじ公式からのスクレイピング（設定が有効な場合）
      if (settings.useNijisanjiScraper) {
        console.log('[Store] Fetching from Nijisanji...');
        const nijisanjiSchedules = await fetchNijisanjiSchedule();

        if (settings.showAllNijisanji) {
          // 全にじさんじ配信を表示
          for (const schedule of nijisanjiSchedules) {
            if (!allSchedules.find(s => s.id === schedule.id)) {
              allSchedules.push(schedule);
            }
          }
        } else if (vtubers.length > 0) {
          // 登録済みVTuberの配信のみフィルタリング
          for (const schedule of nijisanjiSchedules) {
            const isRegistered = vtubers.some(v =>
              isNameMatch(v.name, schedule.channel.name)
            );

            if (isRegistered && !allSchedules.find(s => s.id === schedule.id)) {
              allSchedules.push(schedule);
            }
          }
        }
      }

      set({ schedules: allSchedules });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  selectVTuber: (channelId) => {
    set({ selectedVTuberId: channelId });
  },
}));
