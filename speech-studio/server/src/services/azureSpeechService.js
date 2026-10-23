const sdk = require('microsoft-cognitiveservices-speech-sdk');

/**
 * Escapes characters for safe inclusion in SSML XML.
 */
function escapeXml(unsafe) {
  if (typeof unsafe !== 'string') return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Official fallback Azure Neural Voice list for primary locales.
 * Used when Azure key is pending configuration or as an instant cache.
 */
const OFFICIAL_VOICE_CATALOG = [
  // English (India)
  { name: 'en-IN-NeerjaNeural', displayName: 'Neerja (Neural)', localName: 'नीरजा', locale: 'en-IN', localeName: 'English (India)', gender: 'Female', styleList: ['cheerful', 'empathetic', 'newscast'] },
  { name: 'en-IN-PrabhatNeural', displayName: 'Prabhat (Neural)', localName: 'प्रभात', locale: 'en-IN', localeName: 'English (India)', gender: 'Male', styleList: [] },
  { name: 'en-IN-KavyaNeural', displayName: 'Kavya (Neural)', localName: 'काव्या', locale: 'en-IN', localeName: 'English (India)', gender: 'Female', styleList: [] },
  { name: 'en-IN-RehaanNeural', displayName: 'Rehaan (Neural)', localName: 'रेहान', locale: 'en-IN', localeName: 'English (India)', gender: 'Male', styleList: [] },

  // English (United States)
  { name: 'en-US-JennyNeural', displayName: 'Jenny (Neural)', localName: 'Jenny', locale: 'en-US', localeName: 'English (United States)', gender: 'Female', styleList: ['assistant', 'chat', 'customerservice', 'newscast', 'cheerful', 'empathetic'] },
  { name: 'en-US-GuyNeural', displayName: 'Guy (Neural)', localName: 'Guy', locale: 'en-US', localeName: 'English (United States)', gender: 'Male', styleList: ['newscast', 'angry', 'cheerful', 'sad', 'excited', 'friendly'] },
  { name: 'en-US-AriaNeural', displayName: 'Aria (Neural)', localName: 'Aria', locale: 'en-US', localeName: 'English (United States)', gender: 'Female', styleList: ['chat', 'customerservice', 'empathetic', 'cheerful', 'narration-professional'] },
  { name: 'en-US-DavisNeural', displayName: 'Davis (Neural)', localName: 'Davis', locale: 'en-US', localeName: 'English (United States)', gender: 'Male', styleList: ['chat', 'angry', 'cheerful', 'excited', 'sad'] },

  // Hindi (India)
  { name: 'hi-IN-SwaraNeural', displayName: 'Swara (Neural)', localName: 'स्वरा', locale: 'hi-IN', localeName: 'Hindi (India)', gender: 'Female', styleList: ['cheerful', 'empathetic', 'newscast'] },
  { name: 'hi-IN-MadhurNeural', displayName: 'Madhur (Neural)', localName: 'मधुर', locale: 'hi-IN', localeName: 'Hindi (India)', gender: 'Male', styleList: [] },
  { name: 'hi-IN-AnanyaNeural', displayName: 'Ananya (Neural)', localName: 'अनन्या', locale: 'hi-IN', localeName: 'Hindi (India)', gender: 'Female', styleList: [] },
  { name: 'hi-IN-AaravNeural', displayName: 'Aarav (Neural)', localName: 'आरव', locale: 'hi-IN', localeName: 'Hindi (India)', gender: 'Male', styleList: [] },

  // Punjabi (India)
  { name: 'pa-IN-OjasNeural', displayName: 'Ojas (Neural)', localName: 'ਓਜਸ', locale: 'pa-IN', localeName: 'Punjabi (India)', gender: 'Male', styleList: [] },
  { name: 'pa-IN-VaaniNeural', displayName: 'Vaani (Neural)', localName: 'ਵਾਣੀ', locale: 'pa-IN', localeName: 'Punjabi (India)', gender: 'Female', styleList: [] },

  // French (France)
  { name: 'fr-FR-DeniseNeural', displayName: 'Denise (Neural)', localName: 'Denise', locale: 'fr-FR', localeName: 'French (France)', gender: 'Female', styleList: ['cheerful', 'sad'] },
  { name: 'fr-FR-HenriNeural', displayName: 'Henri (Neural)', localName: 'Henri', locale: 'fr-FR', localeName: 'French (France)', gender: 'Male', styleList: ['cheerful', 'sad'] },
  { name: 'fr-FR-EloiseNeural', displayName: 'Eloise (Neural)', localName: 'Eloise', locale: 'fr-FR', localeName: 'French (France)', gender: 'Female', styleList: [] },

  // Spanish (Spain)
  { name: 'es-ES-ElviraNeural', displayName: 'Elvira (Neural)', localName: 'Elvira', locale: 'es-ES', localeName: 'Spanish (Spain)', gender: 'Female', styleList: [] },
  { name: 'es-ES-AlvaroNeural', displayName: 'Alvaro (Neural)', localName: 'Alvaro', locale: 'es-ES', localeName: 'Spanish (Spain)', gender: 'Male', styleList: [] },

  // German (Germany)
  { name: 'de-DE-KatjaNeural', displayName: 'Katja (Neural)', localName: 'Katja', locale: 'de-DE', localeName: 'German (Germany)', gender: 'Female', styleList: ['cheerful'] },
  { name: 'de-DE-ConradNeural', displayName: 'Conrad (Neural)', localName: 'Conrad', locale: 'de-DE', localeName: 'German (Germany)', gender: 'Male', styleList: ['cheerful'] },

  // Japanese (Japan)
  { name: 'ja-JP-NanamiNeural', displayName: 'Nanami (Neural)', localName: '七海', locale: 'ja-JP', localeName: 'Japanese (Japan)', gender: 'Female', styleList: ['chat', 'cheerful', 'customerservice'] },
  { name: 'ja-JP-KeitaNeural', displayName: 'Keita (Neural)', localName: '圭太', locale: 'ja-JP', localeName: 'Japanese (Japan)', gender: 'Male', styleList: [] },
  { name: 'ja-JP-AoiNeural', displayName: 'Aoi (Neural)', localName: '葵', locale: 'ja-JP', localeName: 'Japanese (Japan)', gender: 'Female', styleList: ['chat'] }
];

class AzureSpeechService {
  constructor() {
    this.refreshConfig();
  }

  refreshConfig() {
    this.speechKey = process.env.AZURE_SPEECH_KEY?.trim() || '';
    this.speechRegion = process.env.AZURE_SPEECH_REGION?.trim() || '';
    this.foundryApiKey = process.env.FOUNDRY_API_KEY?.trim() || '';
    this.foundryEndpoint = process.env.FOUNDRY_ENDPOINT?.trim() || '';

    // If Azure key is a placeholder or empty, but FOUNDRY_API_KEY is available, use it
    if ((!this.speechKey || this.speechKey === 'your_actual_key' || this.speechKey === 'your_azure_speech_key') && this.foundryApiKey) {
      this.speechKey = this.foundryApiKey;
    }
  }

  isConfigured() {
    this.refreshConfig();
    const hasFoundry = Boolean(this.foundryEndpoint && this.foundryApiKey && this.foundryApiKey !== 'your_actual_key');
    const hasAzure = Boolean(this.speechKey && this.speechRegion && this.speechKey !== 'your_actual_key' && this.speechKey !== 'your_azure_speech_key');
    return hasFoundry || hasAzure;
  }

  getConfigStatus() {
    this.refreshConfig();
    return {
      configured: this.isConfigured(),
      region: this.speechRegion || null,
      hasKey: Boolean(this.speechKey || this.foundryApiKey),
      provider: this.foundryEndpoint ? 'Microsoft Foundry Endpoint' : 'Azure Speech Subscription'
    };
  }

  /**
   * Helper to create SpeechConfig from either Microsoft Foundry endpoint or Azure Subscription
   */
  createSpeechConfig() {
    this.refreshConfig();

    // 1. Prefer Microsoft Foundry endpoint if provided
    if (this.foundryEndpoint && this.foundryApiKey && this.foundryApiKey !== 'your_actual_key') {
      try {
        const url = new URL(this.foundryEndpoint);
        return sdk.SpeechConfig.fromEndpoint(url, this.foundryApiKey);
      } catch (err) {
        console.warn('[AzureSpeechService] Failed to create SpeechConfig from Foundry endpoint:', err.message);
      }
    }

    // 2. Use Azure Speech key and region
    if (this.speechKey && this.speechRegion && this.speechKey !== 'your_actual_key' && this.speechKey !== 'your_azure_speech_key') {
      return sdk.SpeechConfig.fromSubscription(this.speechKey, this.speechRegion);
    }

    return null;
  }

  /**
   * Retrieves voices from Azure Speech SDK dynamically.
   * If credentials are not yet set or SDK call fails, falls back gracefully to official list.
   */
  async getVoices(locale) {
    if (!this.isConfigured()) {
      let voices = OFFICIAL_VOICE_CATALOG;
      if (locale) {
        voices = voices.filter(v => v.locale.toLowerCase() === locale.toLowerCase());
      }
      return voices;
    }

    try {
      const speechConfig = this.createSpeechConfig();
      if (!speechConfig) {
        let voices = OFFICIAL_VOICE_CATALOG;
        if (locale) {
          voices = voices.filter(v => v.locale.toLowerCase() === locale.toLowerCase());
        }
        return voices;
      }

      const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);

      return await new Promise((resolve) => {
        synthesizer.getVoicesAsync(locale || '')
          .then((result) => {
            synthesizer.close();
            if (result.reason === sdk.ResultReason.VoicesListRetrieved && Array.isArray(result.voices)) {
              let voices = result.voices.map(v => ({
                name: v.name || v.shortName,
                displayName: v.displayName || v.localName || v.name,
                localName: v.localName || v.displayName || v.name,
                locale: v.locale,
                localeName: v.localeName || v.locale,
                gender: v.gender === 1 ? 'Female' : v.gender === 2 ? 'Male' : 'Neutral',
                styleList: Array.isArray(v.styleList) ? v.styleList : [],
                voiceType: v.voiceType
              }));

              if (locale) {
                voices = voices.filter(v => v.locale.toLowerCase() === locale.toLowerCase());
              }

              if (voices.length === 0) {
                const catalogFallback = OFFICIAL_VOICE_CATALOG.filter(v => !locale || v.locale.toLowerCase() === locale.toLowerCase());
                resolve(catalogFallback);
              } else {
                resolve(voices);
              }
            } else {
              console.warn('[AzureSpeechService] getVoicesAsync returned non-success:', result.errorDetails);
              let fallback = OFFICIAL_VOICE_CATALOG;
              if (locale) {
                fallback = fallback.filter(v => v.locale.toLowerCase() === locale.toLowerCase());
              }
              resolve(fallback);
            }
          })
          .catch((err) => {
            synthesizer.close();
            console.warn('[AzureSpeechService] getVoicesAsync error, using catalog fallback:', err.message);
            let fallback = OFFICIAL_VOICE_CATALOG;
            if (locale) {
              fallback = fallback.filter(v => v.locale.toLowerCase() === locale.toLowerCase());
            }
            resolve(fallback);
          });
      });
    } catch (err) {
      console.warn('[AzureSpeechService] Exception initializing synthesizer for getVoices:', err.message);
      let fallback = OFFICIAL_VOICE_CATALOG;
      if (locale) {
        fallback = fallback.filter(v => v.locale.toLowerCase() === locale.toLowerCase());
      }
      return fallback;
    }
  }

  /**
   * Synthesizes text into natural speech using Azure Speech SDK.
   * Returns a Buffer containing the WAV audio.
   */
  async synthesizeSpeech({ text, voiceName, locale, style }) {
    if (!this.isConfigured()) {
      const error = new Error('Azure Speech credentials are not configured. Please add your Key and Endpoint / Region in server/.env.');
      error.statusCode = 401;
      error.code = 'CREDENTIALS_MISSING';
      throw error;
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      const error = new Error('Text to convert is empty. Please enter some text.');
      error.statusCode = 400;
      error.code = 'EMPTY_TEXT';
      throw error;
    }

    const targetVoice = voiceName || 'en-IN-NeerjaNeural';
    const targetLocale = locale || 'en-IN';
    const escapedText = escapeXml(text.trim());

    // Build standard SSML for Azure Text-to-Speech
    let ssml;
    if (style && style.trim().length > 0) {
      ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${targetLocale}">` +
        `<voice name="${targetVoice}">` +
        `<mstts:express-as style="${escapeXml(style.trim())}">` +
        `${escapedText}` +
        `</mstts:express-as>` +
        `</voice>` +
        `</speak>`;
    } else {
      ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${targetLocale}">` +
        `<voice name="${targetVoice}">` +
        `${escapedText}` +
        `</voice>` +
        `</speak>`;
    }

    let speechConfig;
    try {
      speechConfig = this.createSpeechConfig();
      if (!speechConfig) {
        throw new Error('Unable to construct Azure Speech configuration from environment.');
      }
      // Generate clean 24kHz 16-bit mono PCM WAV (standard high-fidelity playback in all browsers)
      speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Riff24Khz16BitMonoPcm;
    } catch (err) {
      const error = new Error(`Failed to initialize Azure Speech configuration: ${err.message}`);
      error.statusCode = 500;
      throw error;
    }

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);

    return new Promise((resolve, reject) => {
      // Set a 30s timeout safety guard
      const timeoutHandle = setTimeout(() => {
        try { synthesizer.close(); } catch (_) {}
        const timeoutErr = new Error('Speech synthesis request timed out after 30 seconds.');
        timeoutErr.statusCode = 504;
        timeoutErr.code = 'TIMEOUT';
        reject(timeoutErr);
      }, 30000);

      synthesizer.speakSsmlAsync(
        ssml,
        (result) => {
          try {
            clearTimeout(timeoutHandle);
            synthesizer.close();

            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
              if (!result.audioData || result.audioData.byteLength === 0) {
                const emptyAudioErr = new Error('Azure Speech returned an empty audio stream.');
                emptyAudioErr.statusCode = 502;
                return reject(emptyAudioErr);
              }
              const buffer = Buffer.from(result.audioData);
              resolve({
                buffer,
                mimeType: 'audio/wav',
                format: 'riff-24khz-16bit-mono-pcm',
                length: buffer.length
              });
            } else if (result.reason === sdk.ResultReason.Canceled) {
              let errorDetails = result.errorDetails || '';
              let cancellationReason = '';

              try {
                if (sdk.CancellationDetails && typeof sdk.CancellationDetails.fromResult === 'function') {
                  const cancellation = sdk.CancellationDetails.fromResult(result);
                  errorDetails = cancellation.errorDetails || errorDetails;
                  cancellationReason = cancellation.Reason || cancellation.reason || '';
                }
              } catch (detErr) {
                console.warn('[AzureSpeechService] Could not parse CancellationDetails:', detErr);
              }

              let message = `Azure Speech synthesis canceled: ${errorDetails || cancellationReason || 'Unknown error'}`;
              let statusCode = 500;
              let code = 'SYNTHESIS_CANCELED';

              const details = errorDetails || '';
              if (details.includes('401') || details.includes('Unauthorized') || details.includes('Authentication failed')) {
                message = 'Invalid Azure Speech API Key. Please verify your credentials in server/.env.';
                statusCode = 401;
                code = 'INVALID_KEY';
              } else if (details.includes('404') || details.includes('Region') || details.includes('Not Found')) {
                message = `Azure Speech service not found at region or endpoint. Please verify server/.env.`;
                statusCode = 404;
                code = 'INVALID_REGION';
              } else if (details.includes('429') || details.includes('TooManyRequests') || details.includes('quota')) {
                message = 'Azure Speech service rate limit or quota exceeded. Please try again in a few moments.';
                statusCode = 429;
                code = 'RATE_LIMIT_EXCEEDED';
              } else if (details.includes('Voice') || details.includes('SSML')) {
                message = `Speech synthesis failed for voice "${targetVoice}": ${details}`;
                statusCode = 400;
                code = 'VOICE_OR_SSML_ERROR';
              }

              const cancelErr = new Error(message);
              cancelErr.statusCode = statusCode;
              cancelErr.code = code;
              cancelErr.details = errorDetails;
              reject(cancelErr);
            } else {
              const unknownErr = new Error(`Speech synthesis ended with unexpected status: ${result.reason}`);
              unknownErr.statusCode = 500;
              reject(unknownErr);
            }
          } catch (innerErr) {
            reject(innerErr);
          }
        },
        (error) => {
          clearTimeout(timeoutHandle);
          try { synthesizer.close(); } catch (_) {}
          const err = new Error(`Azure Speech SDK error: ${error}`);
          err.statusCode = 500;
          reject(err);
        }
      );
    });
  }
}

module.exports = new AzureSpeechService();
