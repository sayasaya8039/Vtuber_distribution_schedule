import { useState } from 'react';
import { useAppStore } from '../lib/store';

export function Settings() {
  const { holodexApiKey, settings, setApiKey, updateSettings } = useAppStore();
  const [apiKeyInput, setApiKeyInput] = useState(holodexApiKey);

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
        <h4>カレンダー連携</h4>
        <p className="help-text">
          .icsファイルをエクスポートして、Google Calendar / Outlook / Apple Calendarにインポートできます。
        </p>
        <p className="help-text" style={{ fontSize: '11px', color: '#999' }}>
          ※ スケジュール画面の「.ics」ボタンからダウンロード
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
