import React from 'react';

export default function SpeechControls({
  onGenerate,
  onStop,
  isGenerating,
  isPlaying,
  hasText,
  errorMessage,
  onDismissError
}) {
  return (
    <div className="controls-container">
      {errorMessage && (
        <div className="error-banner" role="alert">
          <div className="error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="error-content">
            <p className="error-title">Speech Generation Issue</p>
            <p className="error-message">{errorMessage}</p>
          </div>
          {onDismissError && (
            <button
              type="button"
              className="error-dismiss-btn"
              onClick={onDismissError}
              aria-label="Dismiss error"
            >
              ✕
            </button>
          )}
        </div>
      )}

      <div className="controls-action-bar">
        <button
          type="button"
          className="btn-primary btn-generate"
          onClick={onGenerate}
          disabled={!hasText || isGenerating}
        >
          {isGenerating ? (
            <>
              <span className="spinner" />
              <span>Generating Speech with Azure...</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
              <span>Generate Speech</span>
            </>
          )}
        </button>

        {isPlaying && (
          <button
            type="button"
            className="btn-secondary btn-stop"
            onClick={onStop}
            title="Stop audio playback"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="btn-icon">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            <span>Stop Playback</span>
          </button>
        )}
      </div>
    </div>
  );
}
