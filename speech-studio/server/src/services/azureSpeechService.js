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
 * Masks sensitive keys/tokens from error messages and logs.
 */
function sanitize(message, secret) {
  if (!message || typeof message !== 'string') return '';
  if (!secret || secret.length < 5) return message;
  return message.split(secret).join('[REDACTED_KEY]');
}

/**
 * Official fallback Azure Neural Voice list for primary locales.
 * Used when network is unreachable or as an initial baseline.
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
    this.speechKey = (process.env.AZURE_SPEECH_KEY || process.env.FOUNDRY_API_KEY || '').trim();
    this.speechRegion = (process.env.AZURE_SPEECH_REGION || '').trim();
    this.speechEndpoint = (process.env.AZURE_SPEECH_ENDPOINT || process.env.FOUNDRY_ENDPOINT || '').trim();

    // If user mistakenly put the endpoint URL in AZURE_SPEECH_REGION, normalize it
    if (this.speechRegion.startsWith('http://') || this.speechRegion.startsWith('https://')) {
      if (!this.speechEndpoint) {
        this.speechEndpoint = this.speechRegion;
      }
      this.speechRegion = '';
    }

    // Default known endpoint for this Microsoft Foundry resource if key matches
    if (!this.speechEndpoint && this.speechKey.startsWith('7Xi4i')) {
      this.speechEndpoint = 'https://nikhil-foundry-resource.cognitiveservices.azure.com/';
    }
  }

  isConfigured() {
    this.refreshConfig();
    return Boolean(
      this.speechKey &&
      this.speechKey !== 'your_actual_key' &&
      this.speechKey !== 'your_azure_speech_key' &&
      (this.speechRegion || this.speechEndpoint)
    );
  }

  getConfigStatus() {
    this.refreshConfig();
    return {
      configured: this.isConfigured(),
      region: this.speechRegion || null,
      endpoint: this.speechEndpoint ? this.speechEndpoint.replace(/\/+$/, '') : null,
      hasKey: Boolean(this.speechKey && this.speechKey !== 'your_actual_key'),
      provider: this.speechEndpoint ? 'Microsoft Foundry Endpoint' : 'Azure Speech Regional Subscription'
    };
  }

  /**
   * Builds prioritized connection strategies based on configuration and resource type.
   */
  getConnectionCandidates() {
    this.refreshConfig();
    const candidates = [];

    // 1. Explicit Endpoint (Recommended for Microsoft Foundry / Azure AI Services)
    if (this.speechEndpoint) {
      try {
        const url = new URL(this.speechEndpoint);
        candidates.push({
          type: 'endpoint',
          target: url.href,
          configFactory: () => sdk.SpeechConfig.fromEndpoint(url, this.speechKey)
        });
      } catch (err) {
        console.warn('[AzureSpeechService] Invalid endpoint URL:', err.message);
      }
    }

    // 2. Explicit Regional Subscription (if configured)
    if (this.speechRegion) {
      const reg = this.speechRegion;
      candidates.push({
        type: 'region',
        target: reg,
        configFactory: () => sdk.SpeechConfig.fromSubscription(this.speechKey, reg)
      });
    }

    // 3. Known region fallback for Southeast Asia (where nikhil-foundry-resource is located in Azure)
    if (this.speechRegion.toLowerCase() === 'centralindia' || this.speechRegion.toLowerCase() === 'southasia' || !this.speechRegion) {
      candidates.push({
        type: 'region',
        target: 'southeastasia',
        configFactory: () => sdk.SpeechConfig.fromSubscription(this.speechKey, 'southeastasia')
      });
    }

    // 4. Fallback custom endpoint if not already added
    const defaultFoundry = 'https://nikhil-foundry-resource.cognitiveservices.azure.com/';
    if (!candidates.some(c => c.target === defaultFoundry)) {
      candidates.push({
        type: 'endpoint',
        target: defaultFoundry,
        configFactory: () => sdk.SpeechConfig.fromEndpoint(new URL(defaultFoundry), this.speechKey)
      });
    }

    return candidates;
  }

  /**
   * Retrieves voices from Azure Speech dynamically with candidate fallback.
   */
  async getVoices(locale) {
    if (!this.isConfigured()) {
      let voices = OFFICIAL_VOICE_CATALOG;
      if (locale) {
        voices = voices.filter(v => v.locale.toLowerCase() === locale.toLowerCase());
      }
      return voices;
    }

    const candidates = this.getConnectionCandidates();

    for (const candidate of candidates) {
      try {
        const speechConfig = candidate.configFactory();
        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);

        const result = await new Promise((resolve, reject) => {
          synthesizer.getVoicesAsync(locale || '')
            .then(res => {
              synthesizer.close();
              resolve(res);
            })
            .catch(err => {
              synthesizer.close();
              reject(err);
            });
        });

        if (result.reason === sdk.ResultReason.VoicesListRetrieved && Array.isArray(result.voices) && result.voices.length > 0) {
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

          if (voices.length > 0) {
            return voices;
          }
        }
      } catch (err) {
        console.warn(`[AzureSpeechService] getVoices failed on ${candidate.type} (${candidate.target}):`, sanitize(err.message, this.speechKey));
      }
    }

    // If live retrieval across all candidates failed, fallback safely to official catalog
    let fallback = OFFICIAL_VOICE_CATALOG;
    if (locale) {
      fallback = fallback.filter(v => v.locale.toLowerCase() === locale.toLowerCase());
    }
    return fallback;
  }

  /**
   * Synthesizes text into natural speech using Azure Speech SDK.
   * Retries across compatible candidates (e.g. endpoint and correct region) if connection 1006 occurs.
   */
  async synthesizeSpeech({ text, voiceName, locale, style }) {
    if (!this.isConfigured()) {
      const error = new Error('Azure Speech credentials are not configured. Please set AZURE_SPEECH_KEY and AZURE_SPEECH_ENDPOINT / AZURE_SPEECH_REGION.');
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

    const candidates = this.getConnectionCandidates();
    let lastError = null;

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      try {
        console.log(`[AzureSpeechService] Attempting speech synthesis via ${candidate.type}: ${candidate.target}`);
        const speechConfig = candidate.configFactory();
        speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Riff24Khz16BitMonoPcm;

        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);

        const result = await new Promise((resolve, reject) => {
          const timeoutHandle = setTimeout(() => {
            try { synthesizer.close(); } catch (_) {}
            const timeoutErr = new Error(`Speech synthesis request timed out after 30 seconds via ${candidate.type} (${candidate.target}).`);
            timeoutErr.statusCode = 504;
            timeoutErr.code = 'TIMEOUT';
            reject(timeoutErr);
          }, 30000);

          synthesizer.speakSsmlAsync(
            ssml,
            (res) => {
              clearTimeout(timeoutHandle);
              try { synthesizer.close(); } catch (_) {}

              if (res.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                if (!res.audioData || res.audioData.byteLength === 0) {
                  const emptyAudioErr = new Error('Azure Speech returned an empty audio stream.');
                  emptyAudioErr.statusCode = 502;
                  return reject(emptyAudioErr);
                }
                const buffer = Buffer.from(res.audioData);
                resolve({
                  buffer,
                  mimeType: 'audio/wav',
                  format: 'riff-24khz-16bit-mono-pcm',
                  length: buffer.length
                });
              } else if (res.reason === sdk.ResultReason.Canceled) {
                let errorDetails = res.errorDetails || '';
                let cancellationReason = '';

                try {
                  if (sdk.CancellationDetails && typeof sdk.CancellationDetails.fromResult === 'function') {
                    const cancellation = sdk.CancellationDetails.fromResult(res);
                    errorDetails = cancellation.errorDetails || errorDetails;
                    cancellationReason = cancellation.Reason || cancellation.reason || '';
                  }
                } catch (detErr) {
                  console.warn('[AzureSpeechService] Could not parse CancellationDetails:', detErr);
                }

                const safeDetails = sanitize(errorDetails, this.speechKey);
                console.error(`[AzureSpeechService] Attempt failed (${candidate.type}: ${candidate.target}):`, {
                  reason: cancellationReason,
                  errorDetails: safeDetails
                });

                let message = `Azure Speech synthesis canceled: ${safeDetails || cancellationReason || 'Unknown error'}`;
                let statusCode = 500;
                let code = 'SYNTHESIS_CANCELED';

                if (safeDetails.includes('1006') || safeDetails.includes('contact server')) {
                  message = `Cannot contact Azure Speech server at ${candidate.target}. Please verify region / endpoint compatibility.`;
                  statusCode = 502;
                  code = 'SERVER_CONNECTION_FAILED';
                } else if (safeDetails.includes('401') || safeDetails.includes('Unauthorized') || safeDetails.includes('Authentication failed')) {
                  message = 'Invalid Azure Speech API Key. Please verify your credentials in server/.env.';
                  statusCode = 401;
                  code = 'INVALID_KEY';
                } else if (safeDetails.includes('404') || safeDetails.includes('Region') || safeDetails.includes('Not Found')) {
                  message = `Azure Speech service not found at region or endpoint. Please verify server/.env.`;
                  statusCode = 404;
                  code = 'INVALID_REGION';
                } else if (safeDetails.includes('429') || safeDetails.includes('TooManyRequests') || safeDetails.includes('quota')) {
                  message = 'Azure Speech service rate limit or quota exceeded. Please try again in a few moments.';
                  statusCode = 429;
                  code = 'RATE_LIMIT_EXCEEDED';
                } else if (safeDetails.includes('Voice') || safeDetails.includes('SSML')) {
                  message = `Speech synthesis failed for voice "${targetVoice}": ${safeDetails}`;
                  statusCode = 400;
                  code = 'VOICE_OR_SSML_ERROR';
                }

                const cancelErr = new Error(message);
                cancelErr.statusCode = statusCode;
                cancelErr.code = code;
                cancelErr.details = safeDetails;
                reject(cancelErr);
              } else {
                const unknownErr = new Error(`Speech synthesis ended with unexpected status: ${res.reason}`);
                unknownErr.statusCode = 500;
                reject(unknownErr);
              }
            },
            (err) => {
              clearTimeout(timeoutHandle);
              try { synthesizer.close(); } catch (_) {}
              const safeErr = sanitize(err.message || String(err), this.speechKey);
              const errorObj = new Error(`Azure Speech SDK error: ${safeErr}`);
              errorObj.statusCode = 500;
              reject(errorObj);
            }
          );
        });

        // Successful generation! Return result
        console.log(`[AzureSpeechService] Speech synthesis SUCCEEDED via ${candidate.type}: ${candidate.target} (${result.length} bytes)`);
        return result;
      } catch (err) {
        lastError = err;
        console.warn(`[AzureSpeechService] Candidate ${candidate.type} (${candidate.target}) failed, checking next candidate...`);
      }
    }

    // All candidates failed
    throw lastError || new Error('Speech synthesis failed across all configured candidates.');
  }
}

module.exports = new AzureSpeechService();
