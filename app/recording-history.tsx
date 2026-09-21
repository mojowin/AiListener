"use client";
import { useEffect, useState } from "react";
import { listRecordings, RECORDINGS_CHANGED, type Saved } from "@/lib/recordings";

function Recording({ recording }: { recording: Saved }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const source = URL.createObjectURL(recording.audio);
    setUrl(source);
    return () => URL.revokeObjectURL(source);
  }, [recording.audio]);
  const duration = Number.isFinite(recording.seconds) ? `${Math.floor(recording.seconds / 60)}:${Math.floor(recording.seconds % 60).toString().padStart(2, "0")}` : "Duration unavailable";
  const extension = recording.audio.type.includes("mp4") ? "m4a" : recording.audio.type.includes("ogg") ? "ogg" : "webm";
  const filename = (recording.title || "recording").replace(/[^\p{L}\p{N} _-]/gu, "").slice(0, 80) || "recording";
  return <li className="history-recording">
    <div className="history-details"><h3>{recording.title || "Untitled conversation"}</h3>
      <p>{recording.createdAt ? <time dateTime={new Date(recording.createdAt).toISOString()}>{new Date(recording.createdAt).toLocaleString()}</time> : "Earlier recording · date unavailable"} · {duration}</p>
    </div>
    {url && <><audio controls preload="none" src={url} aria-label={`Play ${recording.title || "recording"}`} /><a className="history-download" href={url} download={`${filename}.${extension}`}>Download audio</a></>}
  </li>;
}

export default function RecordingHistory() {
  const [recordings, setRecordings] = useState<Saved[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    let generation = 0;
    const refresh = async () => {
      const current = ++generation;
      try {
        const saved = await listRecordings();
        if (active && current === generation) { setRecordings(saved); setError(""); }
      } catch (error) {
        if (active && current === generation) setError(error instanceof Error ? `History could not be loaded. ${error.message}` : "History is unavailable. Download your current recording before leaving.");
      } finally { if (active && current === generation) setLoading(false); }
    };
    void refresh();
    window.addEventListener(RECORDINGS_CHANGED, refresh);
    window.addEventListener("focus", refresh);
    return () => { active = false; window.removeEventListener(RECORDINGS_CHANGED, refresh); window.removeEventListener("focus", refresh); };
  }, []);
  return <section className="history-card" aria-labelledby="recordings-heading">
    <h2 id="recordings-heading">Your recordings</h2>
    <p className="history-description">Saved in this browser on this device. Download important recordings; clearing browser data removes them.</p>
    {loading && <p role="status">Loading recordings…</p>}
    {error && <p className="message error" role="alert">{error}</p>}
    {!loading && !error && recordings.length === 0 && <p className="history-empty">No recordings saved in this browser yet. Completed recordings will appear here.</p>}
    {recordings.length > 0 && <ul className="history-list">{recordings.map(recording => <Recording key={recording.id} recording={recording} />)}</ul>}
  </section>;
}
