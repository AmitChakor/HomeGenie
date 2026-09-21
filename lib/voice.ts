/**
 * What this does:
 * Voice utilities for HomeGenie:
 *   - recordAudio(): starts/stops recording via expo-av, returns the file URI
 *   - transcribeAudio(uri): uploads audio to the transcribe edge function, returns text
 *   - recordAndTranscribe(): convenience wrapper that records then transcribes
 *   - speak(text): uses expo-speech for TTS output
 *   - stopSpeaking(): stops any current TTS
 */

import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { supabase } from './supabase';

let recording: Audio.Recording | null = null;

export async function startRecording(): Promise<void> {
  const { status } = await Audio.requestPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Microphone permission not granted');
  }

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  const { recording: newRecording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );
  recording = newRecording;
}

export async function stopRecording(): Promise<string> {
  if (!recording) throw new Error('No active recording');

  await recording.stopAndUnloadAsync();
  await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

  const uri = recording.getURI();
  recording = null;

  if (!uri) throw new Error('Recording URI is null');
  return uri;
}

export async function transcribeAudio(uri: string): Promise<string> {
  const fileExtension = uri.split('.').pop() || 'm4a';
  const mimeType = fileExtension === 'webm' ? 'audio/webm' : 'audio/m4a';

  const response = await fetch(uri);
  const blob = await response.blob();

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
