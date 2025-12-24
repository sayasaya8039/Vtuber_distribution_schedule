// VTuberチャンネル情報
export interface VTuberChannel {
  id: string;
  name: string;
  channelId: string;
  org?: 'hololive' | 'nijisanji' | 'indie' | 'other';
  color: string;
  avatarUrl?: string;
}

// Holodex APIからの配信情報
export interface HolodexLive {
  id: string;
  title: string;
  type: 'stream' | 'video';
  topic_id?: string;
  published_at?: string;
  available_at?: string;
  start_scheduled?: string;
  start_actual?: string;
  end_actual?: string;
  live_viewers?: number;
  status: 'upcoming' | 'live' | 'past';
  channel: {
    id: string;
    name: string;
    english_name?: string;
    org?: string;
    photo?: string;
  };
}

// カレンダーイベント
export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  colorId?: string;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

// ストレージ保存データ
export interface StorageData {
  vtubers: VTuberChannel[];
  holodexApiKey: string;
  syncedEventIds: string[];
  settings: AppSettings;
}

// アプリ設定
export interface AppSettings {
  autoSync: boolean;
  syncIntervalMinutes: number;
  reminderMinutes: number;
  notifyOnNewStream: boolean;
  calendarId: string;
}

// メッセージング
export type MessageType = 
  | 'SYNC_SCHEDULES'
  | 'GET_SCHEDULES'
  | 'ADD_TO_CALENDAR'
  | 'REMOVE_FROM_CALENDAR'
  | 'GET_AUTH_TOKEN'
  | 'UPDATE_SETTINGS';

export interface Message {
  type: MessageType;
  payload?: unknown;
}

export interface MessageResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}
