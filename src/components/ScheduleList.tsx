import { useState, useEffect } from 'react';
import { useAppStore } from '../lib/store';
import { getStartTime } from '../lib/holodex';
import { createCalendarEvent, liveToCalendarEvent, getAuthToken } from '../lib/calendar';
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

// 組織名を取得
function getOrgLabel(org?: string): { label: string; className: string } | null {
  if (!org) return null;
  const orgLower = org.toLowerCase();
  if (orgLower.includes('hololive')) {
    return { label: 'ホロライブ', className: 'org-hololive' };
  }
  if (orgLower.includes('nijisanji')) {
    return { label: 'にじさんじ', className: 'org-nijisanji' };
  }
  return { label: org, className: 'org-other' };
}

export function ScheduleList() {
  const { schedules, vtubers, loading, selectedVTuberId, selectVTuber, addVTuber, settings } = useAppStore();
  const [dateFilter, setDateFilter] = useState<FilterType>('all');
  const [orgFilter, setOrgFilter] = useState<OrgFilter>('all');
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [syncedEventIds, setSyncedEventIds] = useState<Set<string>>(new Set());
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Google接続状態をチェック
  useEffect(() => {
    checkGoogleConnection();
    loadSyncedEvents();
  }, []);

  const checkGoogleConnection = async () => {
    try {
      await getAuthToken(false);
      setIsGoogleConnected(true);
    } catch {
      setIsGoogleConnected(false);
    }
  };

  const loadSyncedEvents = async () => {
    const result = await chrome.storage.sync.get(['syncedEventIds']);
    setSyncedEventIds(new Set(result.syncedEventIds || []));
  };

  const handleAddToCalendar = async (schedule: HolodexLive) => {
    if (syncedEventIds.has(schedule.id)) return;

    setSyncingId(schedule.id);
    try {
      // VTuber情報を取得（登録済みか、スケジュールから作成）
      let vtuber = vtubers.find(v => v.channelId === schedule.channel.id);
      if (!vtuber) {
        // 未登録の場合は仮のVTuber情報を作成
        const orgLower = (schedule.channel.org || '').toLowerCase();
        let org: 'hololive' | 'nijisanji' | 'indie' | 'other' = 'other';
        if (orgLower.includes('hololive')) org = 'hololive';
        else if (orgLower.includes('nijisanji')) org = 'nijisanji';

        vtuber = {
          id: schedule.channel.id,
          name: schedule.channel.name,
          channelId: schedule.channel.id,
          org,
          color: '#888',
        };
      }

      const event = liveToCalendarEvent(schedule, vtuber, settings.reminderMinutes);
      await createCalendarEvent(event);

      // 同期済みIDを保存
      const newSyncedIds = new Set(syncedEventIds);
      newSyncedIds.add(schedule.id);
      setSyncedEventIds(newSyncedIds);
      await chrome.storage.sync.set({ syncedEventIds: Array.from(newSyncedIds) });

      alert('カレンダーに追加しました！');
    } catch (error) {
      alert('追加に失敗しました: ' + (error as Error).message);
    } finally {
      setSyncingId(null);
    }
  };

  // 選択中のVTuber名を取得
  const selectedVTuber = selectedVTuberId
    ? vtubers.find(v => v.channelId === selectedVTuberId)
    : null;

  // フィルター適用
  const filteredSchedules = schedules.filter(schedule => {
    // VTuber個別フィルター（最優先）
    if (selectedVTuberId) {
      if (schedule.channel.id !== selectedVTuberId) {
        return false;
      }
    }

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

    // 組織フィルター（VTuber個別選択時は無視）
    let passOrg = true;
    if (!selectedVTuberId && orgFilter !== 'all') {
      // 登録済みVTuberのorgをチェック
      const vtuber = vtubers.find(v => v.channelId === schedule.channel.id);
      if (vtuber?.org === orgFilter) {
        passOrg = true;
      } else {
        // スクレイプデータのchannel.orgを直接チェック（大文字小文字無視）
        const scheduleOrg = (schedule.channel.org || '').toLowerCase();
        if (orgFilter === 'hololive' && scheduleOrg.includes('hololive')) {
          passOrg = true;
        } else if (orgFilter === 'nijisanji' && scheduleOrg.includes('nijisanji')) {
          passOrg = true;
        } else if (orgFilter === 'indie' && !scheduleOrg.includes('hololive') && !scheduleOrg.includes('nijisanji') && scheduleOrg !== '') {
          passOrg = true;
        } else {
          passOrg = false;
        }
      }
    }

    return passDate && passOrg;
  });

  const sortedSchedules = [...filteredSchedules].sort((a, b) => {
    return getStartTime(a).getTime() - getStartTime(b).getTime();
  });

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

  // VTuberが登録済みかチェック
  const isVTuberRegistered = (channelId: string) => {
    return vtubers.some(v => v.channelId === channelId);
  };

  // スケジュールからVTuberを登録
  const handleRegisterVTuber = async (schedule: HolodexLive) => {
    const orgLower = (schedule.channel.org || '').toLowerCase();
    let org: 'hololive' | 'nijisanji' | 'indie' | 'other' = 'other';
    if (orgLower.includes('hololive')) org = 'hololive';
    else if (orgLower.includes('nijisanji')) org = 'nijisanji';

    // ランダムカラー生成
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#a29bfe', '#fd79a8'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const vtuber: VTuberChannel = {
      id: schedule.channel.id,
      name: schedule.channel.name,
      channelId: schedule.channel.id,
      org,
      color,
      avatarUrl: schedule.channel.photo,
    };

    await addVTuber(vtuber);
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

      {/* 選択中VTuber表示 */}
      {selectedVTuber && (
        <div className="selected-vtuber-banner">
          <span>🎯 {selectedVTuber.name} の配信</span>
          <button onClick={() => selectVTuber(null)} className="clear-filter-btn">
            ✕ 解除
          </button>
        </div>
      )}

      {/* ヘッダー */}
      <div className="schedule-header">
        <h3>配信予定 ({sortedSchedules.length}件)</h3>
        <div className="header-actions">
          <button
            className="export-btn"
            onClick={handleExportICS}
            title="カレンダーにインポート"
            disabled={sortedSchedules.length === 0}
          >
            📅 .ics
          </button>
        </div>
      </div>

      {sortedSchedules.length === 0 ? (
        <div className="no-results">
          <p>該当する配信がありません</p>
        </div>
      ) : (
        sortedSchedules.map((schedule) => {
          const orgInfo = getOrgLabel(schedule.channel.org);
          const isRegistered = isVTuberRegistered(schedule.channel.id);

          return (
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
                <div className="channel-row">
                  <span className="channel-name">{schedule.channel.name}</span>
                  {orgInfo && (
                    <span className={`org-badge ${orgInfo.className}`}>
                      {orgInfo.label}
                    </span>
                  )}
                  {isRegistered && (
                    <span className="registered-badge" title="登録済み">✓</span>
                  )}
                </div>
                <span className="title">{schedule.title}</span>
              </div>

              <div className="schedule-actions">
                {!isRegistered && (
                  <button
                    className="register-btn"
                    onClick={() => handleRegisterVTuber(schedule)}
                    title="このVTuberを登録"
                  >
                    +
                  </button>
                )}
                {isGoogleConnected && (
                  <button
                    className={`calendar-btn ${syncedEventIds.has(schedule.id) ? 'synced' : ''}`}
                    onClick={() => handleAddToCalendar(schedule)}
                    disabled={syncingId === schedule.id || syncedEventIds.has(schedule.id)}
                    title={syncedEventIds.has(schedule.id) ? 'カレンダー追加済み' : 'カレンダーに追加'}
                  >
                    {syncingId === schedule.id ? '...' : syncedEventIds.has(schedule.id) ? '📅✓' : '📅'}
                  </button>
                )}
                <a
                  href={`https://www.youtube.com/watch?v=${schedule.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="youtube-link"
                  title="YouTubeで開く"
                >
                  ▶
                </a>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
