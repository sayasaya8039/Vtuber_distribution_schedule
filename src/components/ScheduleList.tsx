import { useState, useEffect } from 'react';
import { useAppStore } from '../lib/store';
import { getStartTime } from '../lib/holodex';
import { liveToCalendarEvent, createCalendarEvent, generateEventKey } from '../lib/calendar';
import { addSyncedEventId, getStorageData } from '../lib/storage';
import type { HolodexLive, VTuberChannel } from '../types';

type FilterType = 'all' | 'today' | 'tomorrow' | 'week';
type OrgFilter = 'all' | 'hololive' | 'nijisanji' | 'indie';

// .icsファイル生成
function generateICS(schedules: HolodexLive[], vtubers: VTuberChannel[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VTuber Schedule Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const schedule of schedules) {
    const vtuber = vtubers.find(v => v.channelId === schedule.channel.id);
    const start = getStartTime(schedule);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

    const formatDate = (d: Date) => {
      return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${schedule.id}@vtuber-schedule`);
    lines.push(`DTSTART:${formatDate(start)}`);
    lines.push(`DTEND:${formatDate(end)}`);
    lines.push(`SUMMARY:${vtuber?.name || schedule.channel.name} - ${schedule.title}`);
    lines.push(`DESCRIPTION:https://www.youtube.com/watch?v=${schedule.id}`);
    lines.push(`URL:https://www.youtube.com/watch?v=${schedule.id}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function ScheduleList() {
  const { schedules, vtubers, loading, settings } = useAppStore();
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncedIds, setSyncedIds] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<FilterType>('all');
  const [orgFilter, setOrgFilter] = useState<OrgFilter>('all');

  useEffect(() => {
    getStorageData().then(data => setSyncedIds(data.syncedEventIds));
  }, []);

  // フィルター適用
  const filteredSchedules = schedules.filter(schedule => {
    const startTime = getStartTime(schedule);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    // 日付フィルター
    let passDate = true;
    if (dateFilter === 'today') {
      passDate = startTime >= today && startTime < tomorrow;
    } else if (dateFilter === 'tomorrow') {
      const dayAfter = new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
      passDate = startTime >= tomorrow && startTime < dayAfter;
    } else if (dateFilter === 'week') {
      passDate = startTime >= today && startTime < weekEnd;
    }

    // 組織フィルター
    let passOrg = true;
    if (orgFilter !== 'all') {
      const vtuber = vtubers.find(v => v.channelId === schedule.channel.id);
      passOrg = vtuber?.org === orgFilter;
    }

    return passDate && passOrg;
  });

  const sortedSchedules = [...filteredSchedules].sort((a, b) => {
    return getStartTime(a).getTime() - getStartTime(b).getTime();
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
    const unsynced = sortedSchedules.filter(s => !isSynced(s));
    if (unsynced.length === 0) return;

    setSyncingAll(true);
    try {
      for (const schedule of unsynced) {
        await handleAddToCalendar(schedule);
      }
      alert(`${unsynced.length}件の配信をカレンダーに追加しました!`);
    } finally {
      setSyncingAll(false);
    }
  };

  const handleExportICS = () => {
    const icsContent = generateICS(sortedSchedules, vtubers);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `vtuber-schedule-${new Date().toISOString().split('T')[0]}.ics`;
    a.click();
    URL.revokeObjectURL(url);
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
        <p>配信予定がありません</p>
        {vtubers.length === 0 && <p>VTuberを追加してください</p>}
      </div>
    );
  }

  const unsyncedCount = sortedSchedules.filter(s => !isSynced(s)).length;

  return (
    <div className="schedule-list">
      {/* フィルター */}
      <div className="filter-section">
        <div className="filter-row">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as FilterType)}
            className="filter-select"
          >
            <option value="all">全期間</option>
            <option value="today">今日</option>
            <option value="tomorrow">明日</option>
            <option value="week">今週</option>
          </select>

          <select
            value={orgFilter}
            onChange={(e) => setOrgFilter(e.target.value as OrgFilter)}
            className="filter-select"
          >
            <option value="all">全グループ</option>
            <option value="hololive">hololive</option>
            <option value="nijisanji">にじさんじ</option>
            <option value="indie">インディー</option>
          </select>
        </div>
      </div>

      {/* ヘッダー */}
      <div className="schedule-header">
        <h3>配信予定 ({sortedSchedules.length}件)</h3>
        <div className="header-actions">
          <button
            className="export-btn"
            onClick={handleExportICS}
            title="Outlook/Apple Calendar用"
          >
            .ics
          </button>
          {unsyncedCount > 0 && (
            <button
              className="sync-all-btn"
              onClick={handleAddAllToCalendar}
              disabled={syncingAll}
            >
              {syncingAll ? '追加中...' : `全て追加 (${unsyncedCount})`}
            </button>
          )}
        </div>
      </div>

      {sortedSchedules.length === 0 ? (
        <div className="no-results">
          <p>該当する配信がありません</p>
        </div>
      ) : (
        sortedSchedules.map((schedule) => (
          <div
            key={schedule.id}
            className="schedule-item"
            style={{ borderLeftColor: getVTuberColor(schedule.channel.id) }}
          >
            <div className="schedule-time">
              {schedule.status === 'live' ? (
                <span className="live-badge">LIVE</span>
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
                ▶
              </a>
              <button
                onClick={() => handleAddToCalendar(schedule)}
                disabled={syncing === schedule.id || isSynced(schedule)}
                title={isSynced(schedule) ? '追加済み' : 'カレンダーに追加'}
              >
                {syncing === schedule.id ? '...' : isSynced(schedule) ? 'v' : '+'}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
