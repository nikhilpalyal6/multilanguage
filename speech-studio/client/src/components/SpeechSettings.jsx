import React from 'react';

export const SUPPORTED_LANGUAGES = [
  { code: 'en-IN', name: 'English (India)', flag: '🇮🇳' },
  { code: 'en-US', name: 'English (United States)', flag: '🇺🇸' },
  { code: 'hi-IN', name: 'Hindi (India)', flag: '🇮🇳' },
  { code: 'pa-IN', name: 'Punjabi (India)', flag: '🇮🇳' },
  { code: 'fr-FR', name: 'French (France)', flag: '🇫🇷' },
  { code: 'es-ES', name: 'Spanish (Spain)', flag: '🇪🇸' },
  { code: 'de-DE', name: 'German (Germany)', flag: '🇩🇪' },
  { code: 'ja-JP', name: 'Japanese (Japan)', flag: '🇯🇵' },
];

export default function SpeechSettings({
  selectedLocale,
  onLocaleChange,
  voices,
  selectedVoiceName,
  onVoiceChange,
  selectedStyle,
  onStyleChange,
  isLoadingVoices,
  disabled
}) {
  const selectedVoice = voices.find((v) => v.name === selectedVoiceName) || voices[0];
  const styles = selectedVoice?.styleList || [];
  const hasStyles = styles.length > 0;

  return (
    <section className="card settings-card">
      <div className="card-header">
        <h2 className="card-title">Speech Settings</h2>
        <span className="badge-neural">Azure Neural Voices</span>
      </div>

      <div className="settings-grid">
        {/* Language Selection */}
        <div className="form-group">
          <label htmlFor="language-select" className="form-label">
            Language
          </label>
          <div className="select-container">
            <select
              id="language-select"
              className="form-select"
              value={selectedLocale}
              onChange={(e) => onLocaleChange(e.target.value)}
              disabled={disabled}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name} ({lang.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Voice Selection */}
        <div className="form-group">
          <label htmlFor="voice-select" className="form-label">
            Voice {isLoadingVoices && <span className="label-subtext">(Loading...)</span>}
          </label>
          <div className="select-container">
            <select
              id="voice-select"
              className="form-select"
              value={selectedVoiceName}
              onChange={(e) => onVoiceChange(e.target.value)}
              disabled={disabled || isLoadingVoices || voices.length === 0}
            >
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.displayName || v.name} ({v.gender})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Speaking Style (conditionally active only when voice supports it) */}
        <div className="form-group">
          <label htmlFor="style-select" className="form-label">
            Speaking Style / Emotion
            {!hasStyles && <span className="label-subtext">(Not supported by this voice)</span>}
          </label>
          <div className="select-container">
            <select
              id="style-select"
              className="form-select"
              value={hasStyles ? selectedStyle : ''}
              onChange={(e) => onStyleChange(e.target.value)}
              disabled={disabled || !hasStyles}
            >
              <option value="">Default (Natural)</option>
              {styles.map((style) => (
                <option key={style} value={style}>
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Voice Details Banner */}
      {selectedVoice && (
        <div className="voice-metadata-bar">
          <div className="metadata-item">
            <span className="metadata-label">Voice:</span>
            <span className="metadata-value highlight" title={selectedVoice.name}>
              {selectedVoice.displayName || selectedVoice.name}
            </span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Locale:</span>
            <span className="metadata-value">{selectedVoice.locale}</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Gender:</span>
            <span className="metadata-value">{selectedVoice.gender}</span>
          </div>
          {hasStyles && (
            <div className="metadata-item">
              <span className="metadata-label">Style:</span>
              <span className="metadata-value badge-style">
                {selectedStyle ? selectedStyle : 'Default'}
              </span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
