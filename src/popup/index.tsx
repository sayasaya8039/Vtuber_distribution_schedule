import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useAppStore } from '../lib/store';
import './styles.css';

function Popup() {
  const { schedules, initialize, loading } = useAppStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const openSidePanel = () => {
    chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
    window.close();
  };

  const todaySchedules = schedules.filter(s => {
    const startTime = new Date(s.start_scheduled || s.available_at || '');
    const today = new Date();
    return startTime.toDateString() === today.toDateString();
  });

  return (
    <div className="popup">
      <header>
        <h1>🎭 VTuber Schedule</h1>
      </header>
      
      <main>
        {loading ? (
          <p>読み込み中...</p>
        ) : (
          <div className="quick-stats">
            <div className="stat">
              <span className="number">{todaySchedules.length}</span>
              <span className="label">今日の配信</span>
            </div>
            <div className="stat">
              <span className="number">{schedules.length}</span>
              <span className="label">今週の配信</span>
            </div>
          </div>
        )}
      </main>

      <button className="open-panel-btn" onClick={openSidePanel}>
        📅 サイドパネルを開く
      </button>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Popup />
  </StrictMode>
);
