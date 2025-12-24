import { useState } from 'react';
import { useAppStore } from '../lib/store';
import { searchChannels } from '../lib/holodex';
import type { VTuberChannel } from '../types';

// YouTube URLからチャンネルIDを抽出
function extractChannelId(input: string): string | null {
  const trimmed = input.trim();
  
  // UCで始まるチャンネルID
  if (trimmed.startsWith('UC') && trimmed.length >= 24) {
    return trimmed.split(/[^a-zA-Z0-9_-]/)[0];
  }
  
  // youtube.com/channel/UC...
  const channelMatch = trimmed.match(/youtube\.com\/channel\/(UC[a-zA-Z0-9_-]+)/);
  if (channelMatch) {
    return channelMatch[1];
  }
  
  // youtube.com/@handle は直接検索に使用
  return null;
}

export function VTuberSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VTuberChannel[]>([]);
  const [searching, setSearching] = useState(false);
  
  
  const { holodexApiKey, addVTuber, vtubers } = useAppStore();

  const handleSearch = async () => {
    if (!query.trim() || !holodexApiKey) return;
    
    // チャンネルID直接入力チェック
    const channelId = extractChannelId(query);
    
    setSearching(true);
    try {
      if (channelId) {
        // チャンネルID直接追加
        
        const res = await fetch(
          `https://holodex.net/api/v2/channels/${channelId}`,
          { headers: { 'X-APIKEY': holodexApiKey } }
        );
        if (res.ok) {
          const ch = await res.json();
          const vtuber: VTuberChannel = {
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
          setResults([vtuber]);
        } else {
          setResults([]);
        }
      } else {
        // 名前検索
        
        const channels = await searchChannels(holodexApiKey, query);
        setResults(channels);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
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
