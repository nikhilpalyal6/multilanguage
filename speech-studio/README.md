# Speech Studio - Microsoft Foundry Text-to-Speech

A clean, modern, dark-themed Text-to-Speech web application inspired by Microsoft Foundry and powered by the official Microsoft Azure AI Speech SDK (`microsoft-cognitiveservices-speech-sdk`).

---

## 🌟 Features

- **Dynamic Azure Voice Catalog**: Automatically fetches neural voices live from Azure Speech SDK or uses the official neural voice catalog.
- **Multi-language Support**: Select from popular global and Indian languages:
  - English (India) [`en-IN`]
  - English (United States) [`en-US`]
  - Hindi (India) [`hi-IN`]
  - Punjabi (India) [`pa-IN`]
  - French (France) [`fr-FR`]
  - Spanish (Spain) [`es-ES`]
  - German (Germany) [`de-DE`]
  - Japanese (Japan) [`ja-JP`]
- **Speaking Style / Emotion Support**: Conditionally activates emotion / style dropdown (cheerful, empathetic, newscast, customer service, chat, etc.) only when supported by the selected neural voice.
- **In-Browser Audio Playback**: Instant HTML5 audio playback with play, pause, seek, volume control, and a dedicated Stop button.
- **Direct WAV Download**: Download pristine 24kHz 16-bit PCM WAV audio files named after the locale (e.g., `speech-hi-IN.wav`, `speech-en-IN.wav`).
- **Memory-Safe URL Management**: Dynamically creates and revokes blob URLs (`URL.revokeObjectURL`) to prevent browser memory leaks.
- **Enterprise Security**: Azure Speech API keys are strictly kept on the Node.js backend and never exposed to the client bundle.
- **Responsive Microsoft Foundry UI**: Dark theme (`#151515`, `#1E1E1E`, and purple accent `#8055D9`) built with plain CSS and modern React 18.

---

## 📁 Project Structure

```
speech-studio/
├── client/                     # Frontend (React 18 + Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AudioOutput.jsx     # HTML5 player & WAV download button
│   │   │   ├── Header.jsx          # Studio header, Azure badge & health indicator
│   │   │   ├── SpeechControls.jsx  # Generate button, Stop button & error alerts
│   │   │   ├── SpeechSettings.jsx  # Language, voice, and emotion dropdowns
│   │   │   └── TextInput.jsx       # Large textarea, char counter & sample text
│   │   ├── App.css                 # Plain CSS styling with Microsoft Foundry theme
│   │   ├── App.jsx                 # Main stateful application component
│   │   └── main.jsx                # React root mount
│   ├── index.html
│   ├── package.json
│   └── vite.config.js              # Dev server with proxy to backend
├── server/                     # Backend (Node.js + Express)
│   ├── src/
│   │   ├── routes/
│   │   │   └── api.js              # /api/health, /api/voices, /api/speech
│   │   ├── services/
│   │   │   └── azureSpeechService.js # Azure Speech SDK integration & SSML builder
│   │   └── server.js               # Express application entrypoint
│   ├── .env.example                # Example environment variables
│   ├── .env                        # Local environment file (DO NOT commit)
│   └── package.json
├── .gitignore
└── README.md
```

---

## 🔑 How to Obtain Your Azure Speech Key and Region

1. Sign in to the **[Azure Portal](https://portal.azure.com)** or **[Microsoft Foundry (Azure AI Studio)](https://ai.azure.com)**.
2. In the search bar, search for **Azure AI services** or **Speech**.
3. Create or select an existing **Speech Service** resource.
4. On the left sidebar of the Speech resource, navigate to **Keys and Endpoint** (under *Resource Management*).
5. Copy either **KEY 1** or **KEY 2** (this is your `AZURE_SPEECH_KEY`).
6. Copy the **Location/Region** (e.g. `eastus`, `centralindia`, `westeurope`, etc. — this is your `AZURE_SPEECH_REGION`).

---

## ⚙️ Configuration

In the `speech-studio/server` directory, create or edit `.env`:

```bash
# Path: speech-studio/server/.env

AZURE_SPEECH_KEY=your_actual_azure_speech_key_here
AZURE_SPEECH_REGION=your_azure_region_here
PORT=5000
```

> **Note**: An example template is provided in `speech-studio/server/.env.example`.

---

## 🚀 Quick Start & Terminal Commands

### 1. Install Dependencies

Open a terminal and run:

```bash
# Install Server dependencies
cd speech-studio/server
npm install

# Install Client dependencies
cd ../client
npm install
```

### 2. Run the Application

#### Option A: Run in two separate terminal windows (Recommended)

**Terminal 1 (Backend Server):**
```bash
cd speech-studio/server
npm start
# Server starts on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd speech-studio/client
npm run dev
# Vite starts on http://localhost:3000
```

#### Option B: Build Client for Production

```bash
cd speech-studio/client
npm run build
```

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Checks server health and whether Azure credentials are set |
| `GET` | `/api/voices?locale={locale}` | Returns available Azure voices, filtered by locale |
| `POST` | `/api/speech` | Synthesizes text via Azure Speech SDK and returns a binary WAV audio stream |

### Sample `POST /api/speech` Request Body
```json
{
  "text": "Hello, welcome to Speech Studio.",
  "locale": "en-IN",
  "voiceName": "en-IN-NeerjaNeural",
  "style": "cheerful",
  "outputFormat": "riff-24khz-16bit-mono-pcm"
}
```

---

## ✅ Verification & Testing Checklist

- [x] **Backend Health Check**: Open `http://localhost:5000/api/health` in your browser. Verify that `status: "ok"` is returned.
- [x] **Dynamic Voice Listing**: Open `http://localhost:5000/api/voices?locale=hi-IN`. Verify that Hindi voices (`hi-IN-SwaraNeural`, etc.) are returned with style lists.
- [x] **Frontend Navigation**: Open `http://localhost:3000` in your browser. Verify the dark theme, title "Speech Studio", and status pill in the header.
- [x] **Text Input & Live Counter**: Type or paste text into the multiline textarea; check that the character counter updates live. Test the **Clear Text** and **Sample Text** buttons.
- [x] **Language & Voice Filtering**: Switch language between English, Hindi, Punjabi, French, Spanish, German, and Japanese. Notice that the voice dropdown dynamically filters to match the selected language.
- [x] **Emotion / Style Selector**: Select a voice that supports styles (such as `en-IN-NeerjaNeural` or `en-US-JennyNeural`). Verify that the Speaking Style dropdown becomes enabled with options like *Cheerful*, *Empathetic*, etc.
- [x] **Speech Generation**: Click **Generate Speech**. Observe the loading spinner and state transition.
- [x] **Audio Playback**: Use the HTML5 player to play, pause, seek, and adjust volume. Click **Stop Playback** to instantly halt audio.
- [x] **Audio Download**: Click **Download Audio (.wav)**. Check that a valid `.wav` file is saved with the name `speech-[locale].wav` (e.g., `speech-en-IN.wav`).
