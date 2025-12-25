import { useState } from 'react';
import { useAppStore } from '../lib/store';
import { searchChannels } from '../lib/holodex';
import type { VTuberChannel } from '../types';

// YouTube URLからチャンネルIDまたはハンドル名を抽出
function extractChannelInfo(input: string): { type: 'id' | 'handle' | 'search'; value: string } {
  const trimmed = input.trim();

  // UCで始まるチャンネルID（24文字）
  if (trimmed.startsWith('UC') && trimmed.length >= 24) {
    const id = trimmed.split(/[^a-zA-Z0-9_-]/)[0];
    console.log('[Search] Detected channel ID:', id);
    return { type: 'id', value: id };
  }

  // youtube.com/channel/UC...
  const channelMatch = trimmed.match(/youtube\.com\/channel\/(UC[a-zA-Z0-9_-]+)/);
  if (channelMatch) {
    console.log('[Search] Extracted channel ID from URL:', channelMatch[1]);
    return { type: 'id', value: channelMatch[1] };
  }

  // youtube.com/@handle
  const handleMatch = trimmed.match(/youtube\.com\/@([a-zA-Z0-9_-]+)/);
  if (handleMatch) {
    console.log('[Search] Extracted handle from URL:', handleMatch[1]);
    return { type: 'handle', value: handleMatch[1] };
  }

  // @handle形式
  if (trimmed.startsWith('@')) {
    console.log('[Search] Detected handle:', trimmed.slice(1));
    return { type: 'handle', value: trimmed.slice(1) };
  }

  // それ以外は名前検索
  console.log('[Search] Name search:', trimmed);
  return { type: 'search', value: trimmed };
}

export function VTuberSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VTuberChannel[]>([]);
  const [searching, setSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { holodexApiKey, addVTuber, vtubers } = useAppStore();

  // チャンネルIDからVTuber情報を取得
  const fetchChannelById = async (channelId: string): Promise<VTuberChannel | null> => {
    const res = await fetch(
      `https://holodex.net/api/v2/channels/${channelId}`,
      { headers: { 'X-APIKEY': holodexApiKey } }
    );
    if (res.ok) {
      const ch = await res.json();
      return {
        id: ch.id,
        name: ch.english_name || ch.name,
        channelId: ch.id,
        org: ch.org?.toLowerCase().includes('hololive') ? 'hololive'
           : ch.org?.toLowerCase().includes('nijisanji') ? 'nijisanji'
           : 'indie',
        color: ch.org?.toLowerCase().includes('hololive') ? '#00bfff'
             : ch.org?.toLowerCase().includes('nijisanji') ? '#ff6b6b'
             : '#a855f7',
        avatarUrl: ch.photo,
      };
    }
    return null;
  };

  const handleSearch = async () => {
    if (!query.trim() || !holodexApiKey) return;

    const info = extractChannelInfo(query);
    setSearching(true);
    setErrorMsg('');

    try {
      if (info.type === 'id') {
        // チャンネルID直接検索
        const vtuber = await fetchChannelById(info.value);
        if (vtuber) {
          setResults([vtuber]);
        } else {
          setResults([]);
          setErrorMsg('Holodexに登録されていないチャンネルです');
        }
      } else if (info.type === 'handle') {
        // ハンドル名で検索（ハンドルは名前と一致しないことが多い）
        const channels = await searchChannels(holodexApiKey, info.value);
        if (channels.length > 0) {
          setResults(channels);
        } else {
          setResults([]);
          setErrorMsg(`"@${info.value}" は見つかりませんでした。VTuber名（日本語名など）で検索してみてください`);
        }
      } else {
        // 名前検索
        const channels = await searchChannels(holodexApiKey, info.value);
        if (channels.length > 0) {
          setResults(channels);
        } else {
          setResults([]);
          setErrorMsg(`"${info.value}" は見つかりませんでした`);
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
      setErrorMsg('検索エラーが発生しました');
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async (vtuber: VTuberChannel) => {
    await addVTuber(vtuber);
    setResults(results.filter(r => r.channelId !== vtuber.channelId));
  };

  const isAdded = (channelId: string) => 
    vtubers.some(v => v.channelId === channelId);

  return (
    <div className="vtuber-search">
      <div className="search-input">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="VTuber名 or YouTube URL貼ってね!"
          disabled={!holodexApiKey}
        />
        <button onClick={handleSearch} disabled={searching || !holodexApiKey}>
          {searching ? '検索中...' : '追加する'}
        </button>
      </div>
      
      {!holodexApiKey && (
        <p className="warning">設定からHolodex APIキーを入力してね</p>
      )}

      {errorMsg && (
        <p className="warning">{errorMsg}</p>
      )}

      <p className="help-text-small">
        VTuber名で検索、またはYouTube URLやチャンネルID(UCで始まる)を直接入力
      </p>
      
      {results.length > 0 && (
        <div className="search-results">
          {results.map((vtuber) => (
            <div key={vtuber.channelId} className="search-result-item">
              <img 
                src={vtuber.avatarUrl || '/icons/icon48.png'} 
                alt={vtuber.name}
                className="avatar"
              />
              <div className="info">
                <span className="name">{vtuber.name}</span>
                <span className="org" style={{ color: vtuber.color }}>
                  {vtuber.org || 'indie'}
                </span>
              </div>
              <button
                onClick={() => handleAdd(vtuber)}
                disabled={isAdded(vtuber.channelId)}
              >
                {isAdded(vtuber.channelId) ? '追加済み' : '追加'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
