import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import TextInput from './components/TextInput';
import SpeechSettings, { SUPPORTED_LANGUAGES } from './components/SpeechSettings';
import SpeechControls from './components/SpeechControls';
import AudioOutput from './components/AudioOutput';
import { API_BASE_URL } from './config/api';

export default function App() {
  const [text, setText] = useState(
    'Welcome to Microsoft Speech Studio. Convert any text into lifelike natural speech across global languages using Azure AI.'
  );
  const [selectedLocale, setSelectedLocale] = useState('en-IN');
  const [voices, setVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState('en-IN-NeerjaNeural');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);

  // Speech generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioFileName, setAudioFileName] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  // Backend / Azure status
  const [backendStatus, setBackendStatus] = useState({
    checked: false,
    online: false,
    configured: false,
    region: null,
  });

  const audioRef = useRef(null);

  // Check backend health on mount
  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      if (res.ok) {
        const data = await res.json();
        setBackendStatus({
          checked: true,
          online: true,
          configured: Boolean(data.azure?.configured),
          region: data.azure?.region,
        });
      } else {
        setBackendStatus({ checked: true, online: false, configured: false, region: null });
      }
    } catch (err) {
      console.warn('Backend connection error:', err);
      setBackendStatus({ checked: true, online: false, configured: false, region: null });
    }
  };

  // Fetch voices whenever selected locale changes
  useEffect(() => {
    let isMounted = true;

    async function loadVoices() {
      setIsLoadingVoices(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/voices?locale=${encodeURIComponent(selectedLocale)}`);
        if (!res.ok) {
          throw new Error(`Failed to load voices (HTTP ${res.status})`);
        }
        const data = await res.json();
        if (isMounted && data.voices && data.voices.length > 0) {
          setVoices(data.voices);
          // Check if current voice belongs to new list; if not, pick first
          const exists = data.voices.some((v) => v.name === selectedVoiceName);
          if (!exists) {
            setSelectedVoiceName(data.voices[0].name);
            setSelectedStyle('');
          }
        }
      } catch (err) {
        console.error('Error fetching voices for locale', selectedLocale, err);
      } finally {
        if (isMounted) {
          setIsLoadingVoices(false);
        }
      }
    }

    loadVoices();

    return () => {
      isMounted = false;
    };
  }, [selectedLocale]);

  // Clean up previous audio object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (audioUrl) {
        window.URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Handle language change
  const handleLocaleChange = (newLocale) => {
    setSelectedLocale(newLocale);
    setSelectedStyle('');
  };

  // Handle voice selection change
  const handleVoiceChange = (newVoiceName) => {
    setSelectedVoiceName(newVoiceName);
    setSelectedStyle('');
  };

  // Handle Stop button
  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  // Clear Text
  const handleClearText = () => {
    setText('');
    setErrorMessage('');
  };

  // Clear Audio Result
  const handleClearAudio = () => {
    if (audioUrl) {
      window.URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setAudioFileName('');
    setIsPlaying(false);
  };

  // Generate Speech handler
  const handleGenerateSpeech = async () => {
    if (!text || text.trim().length === 0) {
      setErrorMessage('Please enter or paste text to convert into speech.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voiceName: selectedVoiceName,
          locale: selectedLocale,
          style: selectedStyle || undefined,
          outputFormat: 'riff-24khz-16bit-mono-pcm',
        }),
      });

      if (!response.ok) {
        let errMessage = `Generation failed (HTTP ${response.status})`;
        try {
          const errData = await response.json();
          errMessage = errData.message || errData.error || errMessage;
        } catch (_) {
          // Response was not JSON
        }
        throw new Error(errMessage);
      }

      // Read audio binary as Blob
      const blob = await response.blob();
      if (!blob || blob.size === 0) {
        throw new Error('Received an empty audio response from the server.');
      }

      // Revoke old URL if existing
      if (audioUrl) {
        window.URL.revokeObjectURL(audioUrl);
      }

      const newUrl = window.URL.createObjectURL(blob);
      const fileName = `speech-${selectedLocale}.wav`;

      setAudioBlob(blob);
      setAudioUrl(newUrl);
      setAudioFileName(fileName);

      // Refresh health status in background in case user just configured keys
      checkHealth();

      // Trigger playback smoothly
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch((playErr) => {
            // Autoplay may be restricted by browser until user gesture, which is normal
            console.log('Autoplay deferred for user gesture:', playErr.message);
          });
        }
      }, 100);
    } catch (err) {
      console.error('Speech generation error:', err);
      let userMsg = err.message || 'Speech generation failed.';
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        userMsg = `Cannot reach backend server at ${API_BASE_URL}. Please verify that the backend is running.`;
      }
      setErrorMessage(userMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app-layout">
      <Header backendStatus={backendStatus} />

      <main className="app-main">
        {/* Credentials configuration banner if not configured yet */}
        {backendStatus.checked && backendStatus.online && !backendStatus.configured && (
          <div className="setup-banner" role="status">
            <div className="setup-banner-icon">💡</div>
            <div className="setup-banner-content">
              <strong>Azure Speech Key Pending:</strong> To generate real speech, open{' '}
              <code>speech-studio/server/.env</code> and set your <code>AZURE_SPEECH_KEY</code> and{' '}
              <code>AZURE_SPEECH_REGION</code>. Voices and UI are ready to explore.
            </div>
          </div>
        )}

        <div className="content-stack">
          {/* Text Input Section */}
          <TextInput
            text={text}
            onChange={setText}
            onClear={handleClearText}
            selectedLocale={selectedLocale}
            isGenerating={isGenerating}
          />

          {/* Speech Settings: Language, Voice, and Emotion Style */}
          <SpeechSettings
            selectedLocale={selectedLocale}
            onLocaleChange={handleLocaleChange}
            voices={voices}
            selectedVoiceName={selectedVoiceName}
            onVoiceChange={handleVoiceChange}
            selectedStyle={selectedStyle}
            onStyleChange={setSelectedStyle}
            isLoadingVoices={isLoadingVoices}
            disabled={isGenerating}
          />

          {/* Speech Generation and Controls */}
          <SpeechControls
            onGenerate={handleGenerateSpeech}
            onStop={handleStopAudio}
            isGenerating={isGenerating}
            isPlaying={isPlaying}
            hasText={text.trim().length > 0}
            errorMessage={errorMessage}
            onDismissError={() => setErrorMessage('')}
          />

          {/* Audio Player and Download Section */}
          <AudioOutput
            audioUrl={audioUrl}
            audioBlob={audioBlob}
            fileName={audioFileName}
            voiceName={selectedVoiceName}
            locale={selectedLocale}
            audioRef={audioRef}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onClearAudio={handleClearAudio}
          />
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Speech Studio &bull; Powered by Microsoft Azure AI Speech Services &bull; High-Fidelity
          Neural Audio
        </p>
      </footer>
    </div>
  );
}
