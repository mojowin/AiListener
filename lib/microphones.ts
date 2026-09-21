export type MicrophoneSource = "mac" | "iphone";

export function matchingMicrophones(devices: Pick<MediaDeviceInfo, "kind" | "deviceId" | "label">[], source: MicrophoneSource) {
  return devices.filter(device => {
    if (device.kind !== "audioinput" || !device.deviceId || ["default", "communications"].includes(device.deviceId)) return false;
    if (source === "iphone") return /iphone/i.test(device.label);
    return !/iphone/i.test(device.label) && /macbook|built[ -]?in|internal microphone/i.test(device.label);
  });
}

export async function openMicrophone(source: MicrophoneSource): Promise<MediaStream> {
  const media = navigator.mediaDevices;
  let devices = await media.enumerateDevices();
  if (!devices.some(device => device.kind === "audioinput" && device.label)) {
    // Browser permission reveals input names. No MediaRecorder is created for
    // this temporary permission stream, and it is closed before selection.
    const permission = await media.getUserMedia({ audio: true, video: false });
    try { devices = await media.enumerateDevices(); }
    finally { permission.getTracks().forEach(track => track.stop()); }
  }
  const matches = matchingMicrophones(devices, source);
  const name = source === "mac" ? "Mac built-in microphone" : "iPhone microphone";
  if (!matches.length) throw Error(source === "mac"
    ? "Mac built-in microphone is unavailable. Open this page on your MacBook and allow microphone access. No recording was started."
    : "iPhone microphone is unavailable. Connect your iPhone through Continuity Camera so macOS and this browser expose its microphone, then try again. No recording was started.");
  if (matches.length > 1) throw Error(`More than one ${name} is available. Disconnect the extra inputs, then try again. No recording was started.`);
  let selected: MediaStream;
  try {
    selected = await media.getUserMedia({ audio: { deviceId: { exact: matches[0].deviceId }, echoCancellation: true, noiseSuppression: true }, video: false });
  } catch (error) {
    if (error instanceof DOMException && ["OverconstrainedError", "NotFoundError"].includes(error.name)) throw Error(`${name} is no longer available. Reconnect it and try again. No other microphone was used.`);
    throw error;
  }
  const track = selected.getAudioTracks()[0];
  if (!track || track.getSettings().deviceId !== matches[0].deviceId) {
    selected.getTracks().forEach(track => track.stop());
    throw Error(`The browser could not verify the selected ${name}. No recording was started.`);
  }
  return selected;
}
