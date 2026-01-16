import ShioriLogo from '@/assets/icon.png';
import './App.css';
import { useCurrentTab } from './hooks/useCurrentTab';

function App() {
  const { tab, loading, error } = useCurrentTab();

  return (
    <>
      <h1>Shiori Chan</h1>
      <img src={ShioriLogo} alt="Shiori Chan Logo" width={32} height={32} />
      
      <div className="card">
        <h3>Current Tab Information</h3>
        
        {loading && <p>Loading tab info...</p>}
        
        {error && (
          <p style={{ color: 'red' }}>
            Error: {error.message}
          </p>
        )}
        
        {tab && !loading && (
          <div style={{ textAlign: 'left', marginTop: '1rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Title:</strong>
              <p style={{ margin: '0.25rem 0', wordBreak: 'break-word' }}>
                {tab.title || 'No title'}
              </p>
            </div>
            
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>URL:</strong>
              <p style={{ margin: '0.25rem 0', wordBreak: 'break-all', fontSize: '0.9rem' }}>
                {tab.url || 'No URL'}
              </p>
            </div>
            
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Favicon URL:</strong>
              <p style={{ margin: '0.25rem 0', wordBreak: 'break-all', fontSize: '0.9rem' }}>
                {!tab.favIconUrl 
                  ? 'No favicon' 
                  : tab.favIconUrl.startsWith('data:') 
                    ? '(Base64 data)' 
                    : tab.favIconUrl
                }
              </p>
            </div>
            
            {tab.favIconUrl && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Favicon Image:</strong>
                <div style={{ marginTop: '0.25rem' }}>
                  <img 
                    src={tab.favIconUrl} 
                    alt="Page favicon" 
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default App;
