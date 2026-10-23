# Speech Studio - Microsoft Foundry Text-to-Speech

Please refer to [`speech-studio/README.md`](./speech-studio/README.md) for full setup instructions, API documentation, and architecture details.

### Quick Start:

1. **Configure Azure Speech credentials**:
   Edit `speech-studio/server/.env`:
   ```bash
   AZURE_SPEECH_KEY=your_actual_azure_speech_key_here
   AZURE_SPEECH_REGION=your_azure_region_here
   PORT=5000
   ```

2. **Start Backend**:
   ```bash
   cd speech-studio/server
   npm install
   npm start
   ```

3. **Start Frontend**:
   ```bash
   cd speech-studio/client
   npm install
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser.
