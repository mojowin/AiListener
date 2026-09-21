# AI Listener — project prompts

## 2026-09-18 — original request

i want to make AiListener project. record always prompts

**AI listener**

Create web app that listens MacBook computer or iPhone cell phone Audio and record it. There are buttons record and stop.

After stop button the audio record is sent to AI LLM for making transcripts and summarise it. It is used for meetings and other conversations

## Implementation assumption
Record only after an explicit Record click and stop on Stop. Preserve project prompts here. Save summary instructions alongside the latest recording on this device. Continuous/background capture has not been requested unambiguously and is not implemented.

## 2026-09-18 — microphone choice
Offer two explicit choices: “Record Mac mic” and “Record iPhone mic”. Use the corresponding explicit browser audio device; never silently fall back to the other microphone. Preserve existing recordings and API configuration.

## 2026-09-18 — recording history
List past recordings in “Your recordings”, newest first with dates, durations, playback and download. Preserve retained browser-local audio and both microphone choices. Save completed future recordings locally across reloads; do not imply cross-browser recovery.
