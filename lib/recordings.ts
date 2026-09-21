export type Saved = {
  id: string;
  createdAt: number | null;
  audio: Blob;
  seconds: number;
  title: string;
  transcript: string;
  summary: string;
  prompt: string;
};
export const RECORDINGS_CHANGED = "ai-listener-recordings-changed";

function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ai-listener", 2);
    let blocked = false;
    request.onblocked = () => {
      blocked = true;
      reject(new Error("Close other AI Listener tabs, then try again to enable recording history."));
    };
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains("recording")) database.createObjectStore("recording");
      const history = database.createObjectStore("recordings", { keyPath: "id" });
      const current = request.transaction!.objectStore("recording");
      const latest = current.get("latest");
      latest.onsuccess = () => {
        if (!latest.result) return;
        // Version 1 retained only one recording and did not store its date.
        const saved: Saved = { ...latest.result, id: latest.result.id || "legacy-latest", createdAt: latest.result.createdAt ?? null };
        history.put(saved);
        current.put(saved, "latest");
      };
    };
    request.onsuccess = () => {
      if (blocked) { request.result.close(); return; }
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function persist(value: Saved): Promise<void> {
  const database = await db();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(["recording", "recordings"], "readwrite");
      try {
        transaction.objectStore("recording").put(value, "latest");
        transaction.objectStore("recordings").put(value);
      } catch (error) {
        transaction.abort();
        reject(error);
      }
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error || new Error("Recording could not be saved."));
      transaction.onerror = () => reject(transaction.error);
    });
    window.dispatchEvent(new Event(RECORDINGS_CHANGED));
  } finally { database.close(); }
}

export async function restore(): Promise<Saved | undefined> {
  const database = await db();
  try {
    return await new Promise<Saved | undefined>((resolve, reject) => {
      const request = database.transaction("recording").objectStore("recording").get("latest");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally { database.close(); }
}

export async function listRecordings(): Promise<Saved[]> {
  const database = await db();
  try {
    const entries = await new Promise<Saved[]>((resolve, reject) => {
      const request = database.transaction("recordings").objectStore("recordings").getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return entries.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  } finally { database.close(); }
}
