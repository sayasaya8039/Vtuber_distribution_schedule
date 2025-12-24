import { useEffect, useState } from 'react';
import { useAppStore } from '../lib/store';
import { VTuberSearch } from './VTuberSearch';
import { VTuberList } from './VTuberList';
import { ScheduleList } from './ScheduleList';
import { Settings } from './Settings';

type Tab = 'schedule' | 'vtubers' | 'settings';

export function SidePanel() {
  const [activeTab, setActiveTab] = useState<Tab>('schedule');
  const { initialize, refreshSchedules, error, selectedVTuberId } = useAppStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // VTuber選択時に自動でスケジュールタブへ
  useEffect(() => {
    if (selectedVTuberId) {
      setActiveTab('schedule');
    }
  }, [selectedVTuberId]);

  const handleRefresh = () => {
    refreshSchedules();
  };

  return (
    <div className="side-panel">
      <header className="header">
        <h1>🎭 VTuber Schedule</h1>
        <button onClick={handleRefresh} className="refresh-btn" title="更新">
          🔄
        </button>
      </header>

      {error && <div className="error-banner">⚠️ {error}</div>}

      <nav className="tab-nav">
        <button
          className={activeTab === 'schedule' ? 'active' : ''}
          onClick={() => setActiveTab('schedule')}
        >
          📅 スケジュール
        </button>
        <button
          className={activeTab === 'vtubers' ? 'active' : ''}
          onClick={() => setActiveTab('vtubers')}
        >
          🎭 VTuber
        </button>
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ 設定
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'schedule' && <ScheduleList />}
        {activeTab === 'vtubers' && (
          <>
            <VTuberSearch />
            <VTuberList />
          </>
        )}
        {activeTab === 'settings' && <Settings />}
      </main>

      <footer className="footer">
        <span>VTuber Schedule Calendar v1.2.0</span>
      </footer>
    </div>
  );
}
