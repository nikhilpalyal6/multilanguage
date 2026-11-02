import React, { useEffect } from 'react';

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export default function AudioOutput({
  audioUrl,
  audioBlob,
  fileName,
  voiceName,
  locale,
  audioRef,
  playbackSpeed = 1,
  onSpeedChange,
  onPlay,
  onPause,
  onEnded,
  onClearAudio
}) {
  if (!audioUrl) return null;

  // Ensure audio element playback rate stays in sync with playbackSpeed state
  useEffect(() => {
    if (audioRef?.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, audioUrl, audioRef]);

  const handleSpeedSelect = (speed) => {
    if (onSpeedChange) {
      onSpeedChange(speed);
    }
    if (audioRef?.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef?.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  };

  const handlePlayInternal = (e) => {
    if (audioRef?.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
    if (onPlay) {
      onPlay(e);
    }
  };

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
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={handlePlayInternal}
          onPause={onPause}
          onEnded={onEnded}
        />

        {/* Audio Playback Speed Selector */}
        <div className="speed-controller">
          <div className="speed-controller-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="speed-icon">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Playback Speed:</span>
          </div>
          <div className="speed-options" role="group" aria-label="Audio playback speed">
            {PLAYBACK_SPEEDS.map((speed) => (
              <button
                key={speed}
                type="button"
                className={`speed-btn ${playbackSpeed === speed ? 'active' : ''}`}
                onClick={() => handleSpeedSelect(speed)}
                title={`Set audio playback speed to ${speed}x`}
                aria-pressed={playbackSpeed === speed}
              >
                {speed === 1 ? '1x (Normal)' : `${speed}x`}
              </button>
            ))}
          </div>
        </div>

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
