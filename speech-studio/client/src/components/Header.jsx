import React from 'react';

export default function Header({ backendStatus }) {
  return (
    <header className="app-header">
      <div className="header-top">
        <div className="header-branding">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
              <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
              <line x1="12" y1="18" x2="12" y2="22" />
              <line x1="8" y1="22" x2="16" y2="22" />
            </svg>
          </div>
          <div>
            <div className="title-row">
              <h1 className="app-title">Speech Studio</h1>
              <span className="azure-badge">Microsoft Azure Speech</span>
            </div>
            <p className="app-subtitle">Convert text into natural speech with high-quality neural voices</p>
          </div>
        </div>

        <div className="status-indicator">
          <span
            className={`status-dot ${
              backendStatus.online ? (backendStatus.configured ? 'status-green' : 'status-amber') : 'status-red'
            }`}
          />
          <span className="status-text">
            {!backendStatus.checked
              ? 'Connecting...'
              : !backendStatus.online
              ? 'Backend Offline'
              : backendStatus.configured
              ? 'Azure Connected'
              : 'Azure Key Required'}
          </span>
        </div>
      </div>
    </header>
  );
}
