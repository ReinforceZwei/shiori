import ShioriLogo from '@/assets/icon.png';
import './App.css';
import { useSettings } from './hooks/useSettings';

function App() {
  const {
    settings,
    updateSetting,
    save,
    clear,
    loading,
    saving,
    saved,
    error,
  } = useSettings();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await save();
  };

  const handleClear = async () => {
    if (confirm('Are you sure you want to clear all settings?')) {
      await clear();
    }
  };

  if (loading) {
    return (
      <div className="options-container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="options-container">
      <header>
        <img src={ShioriLogo} alt="Shiori Chan Logo" width={48} height={48} />
        <h1>Shiori Chan Settings</h1>
      </header>

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label htmlFor="instanceUrl">
            Shiori Chan Instance URL
            <span className="required">*</span>
          </label>
          <input
            type="url"
            id="instanceUrl"
            value={settings.instanceUrl}
            onChange={(e) => updateSetting('instanceUrl', e.target.value)}
            placeholder="https://your-shiori-instance.com"
            required
          />
          <small>The URL of your self-hosted Shiori Chan instance</small>
        </div>

        <div className="form-group">
          <label htmlFor="apiKey">
            API Key
            <span className="required">*</span>
          </label>
          <input
            type="password"
            id="apiKey"
            value={settings.apiKey}
            onChange={(e) => updateSetting('apiKey', e.target.value)}
            placeholder="Enter your API key"
            required
          />
          <small>Your Shiori Chan API key for authentication</small>
        </div>

        <div className="button-group">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          <button type="button" onClick={handleClear} className="btn-secondary" disabled={saving}>
            Clear Settings
          </button>
        </div>

        {error && (
          <div className="error-message">
            ✗ {error}
          </div>
        )}

        {saved && (
          <div className="success-message">
            ✓ Settings saved successfully!
          </div>
        )}
      </form>

      <footer>
        <p>
          <strong>How to get your API key:</strong>
        </p>
        <ol>
          <li>Log in to your Shiori Chan instance</li>
          <li>Go to Settings → API Key</li>
          <li>Generate a new API key</li>
          <li>Copy and paste it here</li>
        </ol>
      </footer>
    </div>
  );
}

export default App;

