import type { CalendarEvent, HolodexLive, VTuberChannel } from '../types';
import { getStartTime, getEndTime } from './holodex';

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

/**
 * OAuth トークンを取得
 */
export async function getAuthToken(interactive = true): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (token) {
        resolve(token);
      } else {
        reject(new Error('Failed to get auth token'));
      }
    });
  });
}

/**
 * トークンを削除（再認証用）
 */
export async function revokeAuthToken(): Promise<void> {
  const token = await getAuthToken(false).catch(() => null);
  if (token) {
    await new Promise<void>((resolve) => {
      chrome.identity.removeCachedAuthToken({ token }, resolve);
    });
  }
}

/**
 * カレンダーイベントを作成
 */
export async function createCalendarEvent(
  event: CalendarEvent,
  calendarId = 'primary'
): Promise<CalendarEvent> {
  const token = await getAuthToken();

  const response = await fetch(
    `${CALENDAR_API_BASE}/calendars/${calendarId}/events`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create event');
  }

  return response.json();
}

/**
 * カレンダーイベントを削除
 */
export async function deleteCalendarEvent(
  eventId: string,
  calendarId = 'primary'
): Promise<void> {
  const token = await getAuthToken();

  const response = await fetch(
    `${CALENDAR_API_BASE}/calendars/${calendarId}/events/${eventId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok && response.status !== 404) {
    throw new Error('Failed to delete event');
  }
}

/**
 * HolodexLive から CalendarEvent に変換
 */
export function liveToCalendarEvent(
  live: HolodexLive,
  vtuber: VTuberChannel,
  reminderMinutes = 30
): CalendarEvent {
  const start = getStartTime(live);
  const end = getEndTime(live);
  const videoUrl = `https://www.youtube.com/watch?v=${live.id}`;

  return {
    summary: `🎭 ${vtuber.name} 配信: ${live.title}`,
    description: `配信URL: ${videoUrl}

チャンネル: ${live.channel.name}`,
    start: {
      dateTime: start.toISOString(),
      timeZone: 'Asia/Tokyo',
    },
    end: {
      dateTime: end.toISOString(),
      timeZone: 'Asia/Tokyo',
    },
    colorId: getColorId(vtuber.org),
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: reminderMinutes },
      ],
    },
  };
}

/**
 * 組織別のGoogle Calendar カラーID
 */
function getColorId(org?: VTuberChannel['org']): string {
  switch (org) {
    case 'hololive': return '9';  // 青
    case 'nijisanji': return '11'; // 赤
    case 'indie': return '3';     // 紫
    default: return '8';          // グレー
  }
}

/**
 * イベントIDを生成（重複防止用）
 */
export function generateEventKey(live: HolodexLive): string {
  return `vtuber_${live.id}_${live.start_scheduled || live.available_at}`;
}
