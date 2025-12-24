import { useState } from 'react';
import { useAppStore } from '../lib/store';
import { getStartTime } from '../lib/holodex';
import { liveToCalendarEvent, createCalendarEvent, generateEventKey } from '../lib/calendar';
import { addSyncedEventId, getStorageData } from '../lib/storage';
import type { HolodexLive } from '../types';

export function ScheduleList() {
  const { schedules, vtubers, loading, settings } = useAppStore();
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncedIds, setSyncedIds] = useState<string[]>([]);

  // 初期化時に同期済みIDを取得
  useState(() => {
    getStorageData().then(data => setSyncedIds(data.syncedEventIds));
  });

  const sortedSchedules = [...schedules].sort((a, b) => {
    const timeA = getStartTime(a).getTime();
    const timeB = getStartTime(b).getTime();
    return timeA - timeB;
  });

  const handleAddToCalendar = async (live: HolodexLive) => {
    const vtuber = vtubers.find(v => v.channelId === live.channel.id);
    if (!vtuber) return;

    setSyncing(live.id);
    try {
      const event = liveToCalendarEvent(live, vtuber, settings.reminderMinutes);
      await createCalendarEvent(event, settings.calendarId);
      
      const eventKey = generateEventKey(live);
      await addSyncedEventId(eventKey);
      setSyncedIds(prev => [...prev, eventKey]);
    } catch (error) {
      console.error('Failed to add to calendar:', error);
      alert('カレンダーへの追加に失敗しました');
    } finally {
      setSyncing(null);
    }
  };

  const handleAddAllToCalendar = async () => {
    for (const schedule of sortedSchedules) {
      const eventKey = generateEventKey(schedule);
      if (!syncedIds.includes(eventKey)) {
        await handleAddToCalendar(schedule);
      }
    }
  };

  const isSynced = (live: HolodexLive) => 
    syncedIds.includes(generateEventKey(live));

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getVTuberColor = (channelId: string) => {
    const vtuber = vtubers.find(v => v.channelId === channelId);
    return vtuber?.color || '#666';
  };

  if (loading) {
    return <div className="schedule-list loading">読み込み中...</div>;
  }

  if (schedules.length === 0) {
    return (
      <div className="schedule-list empty">
        <p>📅 今週の配信予定はありません</p>
        {vtubers.length === 0 && <p>VTuberを追加してください</p>}
      </div>
    );
  }

  const unsyncedCount = sortedSchedules.filter(s => !isSynced(s)).length;

  return (
    <div className="schedule-list">
      <div className="schedule-header">
        <h3>配信予定 ({schedules.length}件)</h3>
        {unsyncedCount > 0 && (
          <button 
            className="sync-all-btn"
            onClick={handleAddAllToCalendar}
          >
            📅 全て追加 ({unsyncedCount})
          </button>
        )}
      </div>

      {sortedSchedules.map((schedule) => (
        <div 
          key={schedule.id} 
          className="schedule-item"
          style={{ borderLeftColor: getVTuberColor(schedule.channel.id) }}
        >
          <div className="schedule-time">
            {schedule.status === 'live' ? (
              <span className="live-badge">🔴 LIVE</span>
            ) : (
              formatDateTime(getStartTime(schedule))
            )}
          </div>
          
          <div className="schedule-info">
            <span className="channel-name">{schedule.channel.name}</span>
            <span className="title">{schedule.title}</span>
          </div>

          <div className="schedule-actions">
            <a
              href={`https://www.youtube.com/watch?v=${schedule.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="youtube-link"
              title="YouTubeで開く"
            >
              ▶️
            </a>
            <button
              onClick={() => handleAddToCalendar(schedule)}
              disabled={syncing === schedule.id || isSynced(schedule)}
              title={isSynced(schedule) ? '追加済み' : 'カレンダーに追加'}
            >
              {syncing === schedule.id ? '⏳' : isSynced(schedule) ? '✓' : '📅'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
