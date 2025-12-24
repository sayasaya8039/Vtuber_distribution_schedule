import { useAppStore } from '../lib/store';

export function VTuberList() {
  const { vtubers, removeVTuber } = useAppStore();

  if (vtubers.length === 0) {
    return (
      <div className="vtuber-list empty">
        <p>🎭 まだVTuberが登録されていません</p>
        <p>上の検索から推しを追加しよう！</p>
      </div>
    );
  }

  return (
    <div className="vtuber-list">
      <h3>登録済みVTuber ({vtubers.length})</h3>
      {vtubers.map((vtuber) => (
        <div key={vtuber.channelId} className="vtuber-item">
          <img 
            src={vtuber.avatarUrl || '/icons/icon48.png'} 
            alt={vtuber.name}
            className="avatar"
          />
          <div className="info">
            <span className="name">{vtuber.name}</span>
            <span 
              className="org-badge"
              style={{ backgroundColor: vtuber.color }}
            >
              {vtuber.org || 'indie'}
            </span>
          </div>
          <button 
            className="remove-btn"
            onClick={() => removeVTuber(vtuber.channelId)}
            title="削除"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
