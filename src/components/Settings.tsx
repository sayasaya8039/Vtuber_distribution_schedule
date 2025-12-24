import { useState } from 'react';
import { useAppStore } from '../lib/store';
import { getAuthToken, revokeAuthToken } from '../lib/calendar';

export function Settings() {
  const { holodexApiKey, settings, setApiKey, updateSettings } = useAppStore();
  const [apiKeyInput, setApiKeyInput] = useState(holodexApiKey);
  const [googleConnected, setGoogleConnected] = useState(false);

  const handleSaveApiKey = async () => {
    await setApiKey(apiKeyInput);
    alert('APIキーを保存しました');
  };

  const handleConnectGoogle = async () => {
    try {
      await getAuthToken(true);
      setGoogleConnected(true);
      alert('Googleカレンダーに接続しました');
    } catch (error) {
      alert('接続に失敗しました: ' + (error as Error).message);
    }
  };

  const handleDisconnectGoogle = async () => {
    await revokeAuthToken();
    setGoogleConnected(false);
    alert('接続を解除しました');
  };

  return (
    <div className="settings">
      <h3>⚙️ 設定</h3>

      <section className="settings-section">
        <h4>Holodex API</h4>
        <p className="help-text">
          <a href="https://holodex.net/login" target="_blank" rel="noopener noreferrer">
            Holodex
          </a>でアカウント作成後、APIキーを取得してください
        </p>
        <div className="input-group">
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="Holodex APIキー"
          />
          <button onClick={handleSaveApiKey}>保存</button>
        </div>
      </section>

      <section className="settings-section">
        <h4>Google カレンダー</h4>
        {googleConnected ? (
          <div className="connected">
            <span>✅ 接続済み</span>
            <button onClick={handleDisconnectGoogle} className="disconnect-btn">
              接続解除
            </button>
          </div>
        ) : (
          <button onClick={handleConnectGoogle} className="connect-btn">
            🔗 Googleカレンダーに接続
          </button>
        )}
      </section>

      <section className="settings-section">
        <h4>同期設定</h4>
        
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.autoSync}
            onChange={(e) => updateSettings({ autoSync: e.target.checked })}
          />
          自動同期を有効にする
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.notifyOnNewStream}
            onChange={(e) => updateSettings({ notifyOnNewStream: e.target.checked })}
          />
          新しい配信予定を通知
        </label>

        <div className="input-group">
          <label>同期間隔（分）</label>
          <input
            type="number"
            min="15"
            max="360"
            value={settings.syncIntervalMinutes}
            onChange={(e) => updateSettings({ syncIntervalMinutes: Number(e.target.value) })}
          />
        </div>

        <div className="input-group">
          <label>リマインダー（分前）</label>
          <input
            type="number"
            min="5"
            max="120"
            value={settings.reminderMinutes}
            onChange={(e) => updateSettings({ reminderMinutes: Number(e.target.value) })}
          />
        </div>
      </section>
    </div>
  );
}
