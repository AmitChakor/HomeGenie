/**
 * What this does:
 * Voice utilities for HomeGenie:
 *   - startRecording(): starts recording via expo-audio
 *   - stopRecording(): stops recording, returns the file URI
 *   - transcribeAudio(uri): uploads audio to the transcribe edge function, returns text
 *   - recordAndTranscribe(): convenience wrapper that records then transcribes
 *   - speak(text): uses expo-speech for TTS output
 *   - stopSpeaking(): stops any current TTS
 */

import { useAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio';
import * as Speech from 'expo-speech';
import { supabase } from './supabase';

// Module-level recorder handle (not a hook — used imperatively outside React)
let _recorderUri: string | null = null;
let _recorder: ReturnType<typeof useAudioRecorder> | null = null;

export async function startRecording(): Promise<void> {
  const status = await AudioModule.requestRecordingPermissionsAsync();
  if (!status.granted) {
    throw new Error('Microphone permission not granted');
  }

  // expo-audio uses hooks inside React; for imperative use we call the low-level API
  const { AudioRecorder } = await import('expo-audio');
  const recorder = new AudioRecorder(RecordingPresets.HIGH_QUALITY);
  await recorder.prepareToRecordAsync();
  recorder.record();
  // Store reference via module-level variable
  (globalThis as Record<string, unknown>).__hg_recorder = recorder;
  _recorderUri = null;
}

export async function stopRecording(): Promise<string> {
  const recorder = (globalThis as Record<string, unknown>).__hg_recorder as {
    stop: () => Promise<void>;
    uri: string | null;
    release: () => void;
  } | undefined;

  if (!recorder) throw new Error('No active recording');

  await recorder.stop();
  const uri = recorder.uri;
  recorder.release();
  (globalThis as Record<string, unknown>).__hg_recorder = null;

  if (!uri) throw new Error('Recording URI is null');
  _recorderUri = uri;
  return uri;
}

export async function transcribeAudio(uri: string): Promise<string> {
  const fileExtension = uri.split('.').pop() || 'm4a';
  const mimeType = fileExtension === 'webm' ? 'audio/webm' : 'audio/m4a';

  const formData = new FormData();
  formData.append('file', {
    uri,
    type: mimeType,
    name: `recording.${fileExtension}`,
  } as unknown as Blob);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  const result = await fetch(`${supabaseUrl}/functions/v1/transcribe`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session?.access_token ?? ''}`,
    },
    body: formData,
  });

  if (!result.ok) {
    const errorText = await result.text();
    throw new Error(`Transcription failed: ${errorText}`);
  }

  const data = await result.json();
  return data.text ?? '';
}

export async function recordAndTranscribe(): Promise<string> {
  await startRecording();
  return '';
}

export async function finishRecordAndTranscribe(): Promise<string> {
  const uri = await stopRecording();
  return transcribeAudio(uri);
}

export function speak(text: string, language = 'en'): void {
  Speech.speak(text, {
    language,
    rate: 0.95,
    pitch: 1.0,
    onDone: () => {},
    onError: (error) => console.warn('TTS error:', error),
  });
}

export function stopSpeaking(): void {
  Speech.stop();
}

export async function isSpeaking(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}
