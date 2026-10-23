import React from 'react';

const SAMPLE_TEXTS = {
  'en-IN': 'Welcome to Microsoft Speech Studio. Azure Neural voices deliver fluid, natural-sounding speech across diverse Indian and global languages.',
  'en-US': 'Welcome to Microsoft Speech Studio. Azure AI Speech provides rich, human-like voice synthesis powered by state-of-the-art neural models.',
  'hi-IN': 'माइक्रोसॉफ्ट स्पीच स्टूडियो में आपका स्वागत है। एज्यूर न्यूरल वॉयस तकनीक से अपनी आवाज़ को प्राकृतिक और सजीव बनाएं।',
  'pa-IN': 'ਮਾਈਕ੍ਰੋਸਾਫਟ ਸਪੀਚ ਸਟੂਡੀਓ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ। ਆਪਣੀ ਲਿਖਤ ਨੂੰ ਕੁਦਰਤੀ ਅਤੇ ਸਪੱਸ਼ਟ ਆਵਾਜ਼ ਵਿੱਚ ਬਦਲੋ।',
  'fr-FR': 'Bienvenue dans Speech Studio. Convertissez facilement votre texte en une voix naturelle grâce à la technologie Azure AI Speech.',
  'es-ES': 'Bienvenido a Speech Studio. Convierta texto en voz de alta fidelidad con las voces neuronales de Microsoft Azure.',
  'de-DE': 'Willkommen im Speech Studio. Konvertieren Sie Ihren Text mit den neuronalen Stimmen von Microsoft Azure in natürliche Sprache.',
  'ja-JP': 'スピーチスタジオへようこそ。Microsoft Azure のニューラル音声で、テキストを自然で高品質な音声に変換します。'
};

export default function TextInput({ text, onChange, onClear, selectedLocale, isGenerating }) {
  const handleSampleClick = () => {
    const sample = SAMPLE_TEXTS[selectedLocale] || SAMPLE_TEXTS['en-IN'];
    onChange(sample);
  };

  return (
    <section className="card input-card">
      <div className="card-header">
        <label htmlFor="speech-text" className="card-title">
          Text Input
        </label>
        <div className="card-actions">
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={handleSampleClick}
            disabled={isGenerating}
            title="Load sample text for current language"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Sample Text
          </button>
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={onClear}
            disabled={!text || isGenerating}
            title="Clear text input"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Clear Text
          </button>
        </div>
      </div>

      <div className="textarea-wrapper">
        <textarea
          id="speech-text"
          className="speech-textarea"
          rows={6}
          placeholder="Enter the text you want to convert into speech..."
          value={text}
          onChange={(e) => onChange(e.target.value)}
          disabled={isGenerating}
          maxLength={5000}
        />
        <div className="textarea-footer">
          <span className="character-counter">
            <span className={text.length > 4500 ? 'text-warning' : ''}>
              {text.length.toLocaleString()}
            </span>{' '}
            / 5,000 characters
          </span>
        </div>
      </div>
    </section>
  );
}
