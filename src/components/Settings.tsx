import { useState, useEffect } from 'react';
import { useAppStore } from '../lib/store';
import { getAuthToken, revokeAuthToken } from '../lib/calendar';

export function Settings() {
  const { holodexApiKey, settings, setApiKey, updateSettings } = useAppStore();
  const [apiKeyInput, setApiKeyInput] = useState(holodexApiKey);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Google接続状態をチェック
  useEffect(() => {
    checkGoogleConnection();
  }, []);

  const checkGoogleConnection = async () => {
    try {
      await getAuthToken(false); // non-interactive
      setIsGoogleConnected(true);
    } catch {
      setIsGoogleConnected(false);
    }
  };

  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    try {
      await getAuthToken(true); // interactive
      setIsGoogleConnected(true);
      alert('Googleカレンダーに接続しました！');
    } catch (error) {
      alert('接続に失敗しました: ' + (error as Error).message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      await revokeAuthToken();
      setIsGoogleConnected(false);
      alert('接続を解除しました');
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const handleSaveApiKey = async () => {
    await setApiKey(apiKeyInput);
    alert('APIキーを保存しました');
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
        <h4>Google カレンダー連携</h4>

        {isGoogleConnected ? (
          <>
            <div className="connected">
              <span>✅ Googleに接続済み</span>
              <button className="disconnect-btn" onClick={handleDisconnectGoogle}>
                接続解除
              </button>
            </div>

            <label className="checkbox-label" style={{ marginTop: '12px' }}>
              <input
                type="checkbox"
                checked={settings.autoAddToCalendar ?? false}
                onChange={(e) => updateSettings({ autoAddToCalendar: e.target.checked })}
              />
              新しい配信を自動でカレンダーに追加
            </label>
            <p className="help-text" style={{ fontSize: '11px' }}>
              ゲリラ配信などが検出されると自動でカレンダーに追加されます
            </p>
          </>
        ) : (
          <>
            <p className="help-text">
              Googleアカウントに接続すると、配信スケジュールをカレンダーに追加できます。
            </p>
            <button
              className="connect-btn"
              onClick={handleConnectGoogle}
              disabled={isConnecting}
            >
              {isConnecting ? '接続中...' : '🔗 Googleカレンダーに接続'}
            </button>
          </>
        )}

        <p className="help-text" style={{ fontSize: '11px', color: '#999', marginTop: '12px' }}>
          ※ .icsファイルでエクスポートも可能（スケジュール画面の「.ics」ボタン）
        </p>
      </section>

      <section className="settings-section">
        <h4>データソース</h4>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.useHololiveScraper ?? true}
            onChange={(e) => updateSettings({ useHololiveScraper: e.target.checked })}
          />
          ホロジュールから取得（公式スケジュール）
        </label>

        {settings.useHololiveScraper && (
          <label className="checkbox-label" style={{ marginLeft: '20px' }}>
            <input
              type="checkbox"
              checked={settings.showAllHololive ?? false}
              onChange={(e) => updateSettings({ showAllHololive: e.target.checked })}
            />
            全ホロライブ配信を表示
          </label>
        )}

        <label className="checkbox-label" style={{ marginTop: '12px' }}>
          <input
            type="checkbox"
            checked={settings.useNijisanjiScraper ?? true}
            onChange={(e) => updateSettings({ useNijisanjiScraper: e.target.checked })}
          />
          にじさんじ公式から取得
        </label>

        {settings.useNijisanjiScraper && (
          <label className="checkbox-label" style={{ marginLeft: '20px' }}>
            <input
              type="checkbox"
              checked={settings.showAllNijisanji ?? false}
              onChange={(e) => updateSettings({ showAllNijisanji: e.target.checked })}
            />
            全にじさんじ配信を表示
          </label>
        )}

        <p className="help-text" style={{ fontSize: '11px' }}>
          {(settings.showAllHololive || settings.showAllNijisanji)
            ? '全メンバーの配信を表示します'
            : '登録したVTuberの配信のみ表示します'}
        </p>
      </section>

      <section className="settings-section">
        <h4>通知設定</h4>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.notifyOnNewStream}
            onChange={(e) => updateSettings({ notifyOnNewStream: e.target.checked })}
          />
          新しい配信予定を通知
        </label>

        <div className="input-group">
          <label>更新間隔（分）</label>
          <input
            type="number"
            min="15"
            max="360"
            value={settings.syncIntervalMinutes}
            onChange={(e) => updateSettings({ syncIntervalMinutes: Number(e.target.value) })}
          />
        </div>
      </section>
    </div>
  );
}
