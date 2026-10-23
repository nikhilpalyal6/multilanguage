const express = require('express');
const router = express.Router();
const azureSpeechService = require('../services/azureSpeechService');

/**
 * GET /api/health
 * Check whether the backend is running and if Azure Speech is configured.
 */
router.get('/health', (req, res) => {
  const status = azureSpeechService.getConfigStatus();
  return res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Speech Studio API',
    azure: {
      configured: status.configured,
      region: status.region,
      hasKey: status.hasKey
    }
  });
});

/**
 * GET /api/voices?locale=hi-IN
 * Return supported Azure Speech voices, filtered by locale when provided.
 */
router.get('/voices', async (req, res) => {
  try {
    const locale = req.query.locale ? String(req.query.locale).trim() : '';
    const voices = await azureSpeechService.getVoices(locale);
    return res.json({
      success: true,
      locale: locale || 'all',
      count: voices.length,
      voices
    });
  } catch (error) {
    console.error('[API /api/voices] Error fetching voices:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve voice list.',
      message: error.message
    });
  }
});

/**
 * POST /api/speech
 * Synthesize text into speech using Azure Speech SDK and stream WAV audio.
 */
router.post('/speech', async (req, res) => {
  try {
    const { text, voiceName, locale, outputFormat, style } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Text cannot be empty. Please enter or paste some text to synthesize.'
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Text Too Long',
        message: 'Text exceeds maximum length of 5,000 characters.'
      });
    }

    const effectiveLocale = locale ? String(locale).trim() : 'en-IN';
    const effectiveVoice = voiceName ? String(voiceName).trim() : 'en-IN-NeerjaNeural';

    const result = await azureSpeechService.synthesizeSpeech({
      text,
      voiceName: effectiveVoice,
      locale: effectiveLocale,
      outputFormat,
      style: typeof style === 'string' ? style.trim() : ''
    });

    // Generate safe filename for download e.g. speech-hi-IN.wav
    const safeLocale = effectiveLocale.replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = `speech-${safeLocale}.wav`;

    res.set({
      'Content-Type': 'audio/wav',
      'Content-Length': result.length,
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Speech-Voice': effectiveVoice,
      'X-Speech-Locale': effectiveLocale
    });

    return res.send(result.buffer);
  } catch (error) {
    console.error('[API /api/speech] Error generating speech:', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.code || 'SPEECH_GENERATION_FAILED',
      message: error.message || 'An unexpected error occurred during speech synthesis.',
      details: error.details || null
    });
  }
});

module.exports = router;
