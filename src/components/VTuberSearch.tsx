import { useState } from 'react';
import { useAppStore } from '../lib/store';
import { searchChannels } from '../lib/holodex';
import type { VTuberChannel } from '../types';

export function VTuberSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VTuberChannel[]>([]);
  const [searching, setSearching] = useState(false);
  
  const { holodexApiKey, addVTuber, vtubers } = useAppStore();

  const handleSearch = async () => {
    if (!query.trim() || !holodexApiKey) return;
    
    setSearching(true);
    try {
      const channels = await searchChannels(holodexApiKey, query);
      setResults(channels);
    } catch (error) {
      console.error('Search failed:', error);
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
          placeholder="VTuber名で検索..."
          disabled={!holodexApiKey}
        />
        <button onClick={handleSearch} disabled={searching || !holodexApiKey}>
          {searching ? '検索中...' : '🔍'}
        </button>
      </div>
      
      {!holodexApiKey && (
        <p className="warning">⚠️ 設定からHolodex APIキーを入力してください</p>
      )}
      
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
                {isAdded(vtuber.channelId) ? '✓' : '＋'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
