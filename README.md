# AI Listener

Record microphone audio on a MacBook or iPhone, then automatically transcribe and summarize it after Stop. Completed recordings, summary instructions, transcripts and summaries are stored in IndexedDB on that browser/device. “Your recordings” lists saved audio newest first with playback and download. History is separate in each browser and device. The previously retained latest recording is migrated with an unknown date; older overwritten recordings cannot be recovered. Download important audio for safekeeping. In-progress audio is in memory until Stop; closing the page while recording can lose it.

## Local setup

Node 22.13+ and npm are required. Run `npm ci`, copy `.env.example` to `.env` and set `OPENAI_API_KEY` privately, then `npm run dev`. The local site is http://localhost:5173. The Sites runtime injects development-only mock authentication. Production access is owner-private through Sites. API routes require authenticated identity and validate same-origin requests.

The key must stay on the server. Never put it in client source or commit it. For hosting set OPENAI_API_KEY as a secret with the Sites environment settings. Restart local preview after changing `.env`.

## Recording behavior

MediaRecorder selects Opus/WebM where supported, otherwise MP4 for Safari. It requests only microphone audio. It does not record system audio, audio from another app, or phone calls. HTTPS is required on phones (localhost is permitted on a Mac). Keep iPhone Safari open and the device unlocked; background recording is not guaranteed. A screen wake lock is requested where supported. Tell participants they are being recorded.

Stop saves the audio locally before processing. Transcription and summarization use separate requests; a summary failure preserves the transcript, allowing a retry without transcribing again. Recording stops near 19 MB to stay below the 20 MB server limit. The exact duration depends on the browser's encoder. Download larger captured files if browser scheduling makes the recording exceed the limit. Storage may fail or be evicted by the browser; download important recordings and notes.

## AI

Audio is sent to OpenAI's transcription API using gpt-4o-transcribe, then the transcript is summarized via the Responses API using gpt-4.1-mini (store:false). Models are server-configurable. API billing and a valid key are required. Audio and transcript are processed in memory on the server; the application does not log or store them server-side. Provider retention follows the API account policy.

Docs: https://developers.openai.com/api/docs/guides/speech-to-text and https://developers.openai.com/api/docs/guides/text

## Validation

Run `npx tsc --noEmit` and `npm run build`. Real microphone capture must be verified on physical MacBook and iPhone hardware. A live AI test requires a configured key. Optional WebMCP exposes the current notes as a read-only tool; it never starts the microphone.

Project instructions are recorded in PROMPTS.md.

### Verified in this session

- Production build and TypeScript check passed.
- Local page responds successfully.
- Unauthenticated processing returns 401; cross-origin requests return 403; signed-in requests without an API key return 503 with setup guidance.
- Real AI processing is untested because no API key is configured.
- Automated browser, microphone, and mobile interaction tests were blocked by automatic approval review; physical-device testing remains outstanding. WebMCP validation was unavailable.
- Site identity is registered, but publication is pending API secret configuration.
