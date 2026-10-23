import React from 'react';

export default function AudioOutput({
  audioUrl,
  audioBlob,
  fileName,
  voiceName,
  locale,
  audioRef,
  onPlay,
  onPause,
  onEnded,
  onClearAudio
}) {
  if (!audioUrl) return null;

  const handleDownload = () => {
    if (!audioBlob) return;
    const downloadUrl = window.URL.createObjectURL(audioBlob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName || `speech-${locale || 'output'}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 1000);
  };

  return (
    <section className="card output-card">
      <div className="card-header">
        <div className="card-title-group">
          <h2 className="card-title">Generated Audio</h2>
          <span className="badge-format">WAV • 24kHz 16-bit PCM</span>
        </div>
        <button
          type="button"
          className="btn-secondary btn-sm"
          onClick={onClearAudio}
          title="Clear current audio"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Clear Audio
        </button>
      </div>

      <div className="player-container">
        {/* Native HTML5 Audio Player */}
        <audio
          ref={audioRef}
          src={audioUrl}
          controls
          className="html5-audio-player"
          onPlay={onPlay}
          onPause={onPause}
          onEnded={onEnded}
        />

        <div className="output-details-bar">
          <div className="file-meta">
            <span className="file-name-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
              {fileName}
            </span>
            <span className="voice-tag">{voiceName}</span>
          </div>

          <button
            type="button"
            className="btn-download"
            onClick={handleDownload}
            title="Download full quality WAV audio file"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download Audio (.wav)</span>
          </button>
        </div>
      </div>
    </section>
  );
}
