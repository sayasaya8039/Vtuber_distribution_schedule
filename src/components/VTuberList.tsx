import { useAppStore } from '../lib/store';

export function VTuberList() {
  const { vtubers, removeVTuber, selectVTuber, selectedVTuberId } = useAppStore();

  if (vtubers.length === 0) {
    return (
      <div className="vtuber-list empty">
        <p>🎭 まだVTuberが登録されていません</p>
        <p>上の検索から推しを追加しよう！</p>
      </div>
    );
  }

  const handleDoubleClick = (channelId: string) => {
    // 同じVTuberをダブルクリックしたら解除
    if (selectedVTuberId === channelId) {
      selectVTuber(null);
    } else {
      selectVTuber(channelId);
    }
  };

  return (
    <div className="vtuber-list">
      <h3>登録済みVTuber ({vtubers.length})</h3>
      <p className="help-text-small">💡 ダブルクリックでその人だけ表示</p>
      {vtubers.map((vtuber) => (
        <div
          key={vtuber.channelId}
          className={`vtuber-item ${selectedVTuberId === vtuber.channelId ? 'selected' : ''}`}
          onDoubleClick={() => handleDoubleClick(vtuber.channelId)}
          style={{ cursor: 'pointer' }}
        >
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
            onClick={(e) => {
              e.stopPropagation();
              removeVTuber(vtuber.channelId);
            }}
            title="削除"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
