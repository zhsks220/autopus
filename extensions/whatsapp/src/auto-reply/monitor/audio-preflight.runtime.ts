import { transcribeFirstAudio as transcribeFirstAudioImpl } from "autopus/plugin-sdk/media-runtime";

type TranscribeFirstAudio = typeof import("autopus/plugin-sdk/media-runtime").transcribeFirstAudio;

export async function transcribeFirstAudio(
  ...args: Parameters<TranscribeFirstAudio>
): ReturnType<TranscribeFirstAudio> {
  return await transcribeFirstAudioImpl(...args);
}
