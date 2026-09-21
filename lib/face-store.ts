/**
 * What this does:
 * On-device face embedding storage using expo-secure-store.
 * Stores face landmark data captured during enrollment and provides
 * a cosine-similarity match for check-in verification.
 *
 * PRIVACY: All data stays on-device. Nothing is uploaded.
 *
 * A "face embedding" here is a normalized array of landmark positions
 * from ML Kit face detection. For production, replace with a proper
 * face embedding model (e.g. FaceNet/ArcFace via TFLite).
 */

import * as SecureStore from 'expo-secure-store';

export interface FaceLandmarks {
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
  nose: { x: number; y: number };
  leftMouth: { x: number; y: number };
  rightMouth: { x: number; y: number };
  leftEar: { x: number; y: number };
  rightEar: { x: number; y: number };
}

export interface FaceEmbedding {
  id: string;
  helperName: string;
  samples: number[][];
  enrolledAt: string;
}

const STORE_KEY = 'homegenie_face_embeddings';

function landmarksToVector(landmarks: FaceLandmarks): number[] {
  const points = [
    landmarks.leftEye,
    landmarks.rightEye,
    landmarks.nose,
    landmarks.leftMouth,
    landmarks.rightMouth,
    landmarks.leftEar,
    landmarks.rightEar,
  ];

  // Normalize relative to nose (center point)
  const cx = landmarks.nose.x;
  const cy = landmarks.nose.y;

  // Use inter-eye distance as scale factor
  const eyeDist = Math.sqrt(
    Math.pow(landmarks.rightEye.x - landmarks.leftEye.x, 2) +
      Math.pow(landmarks.rightEye.y - landmarks.leftEye.y, 2)
  );
  const scale = eyeDist > 0 ? eyeDist : 1;

  const vector: number[] = [];
  for (const p of points) {
    vector.push((p.x - cx) / scale);
    vector.push((p.y - cy) / scale);
  }

  return vector;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom > 0 ? dot / denom : 0;
}

async function loadEmbeddings(): Promise<FaceEmbedding[]> {
  const raw = await SecureStore.getItemAsync(STORE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as FaceEmbedding[];
  } catch {
    return [];
  }
}

async function saveEmbeddings(embeddings: FaceEmbedding[]): Promise<void> {
  await SecureStore.setItemAsync(STORE_KEY, JSON.stringify(embeddings));
}

export async function enrollFace(
  embeddingId: string,
  helperName: string,
  landmarkSamples: FaceLandmarks[]
): Promise<void> {
  const vectors = landmarkSamples.map(landmarksToVector);

  const existing = await loadEmbeddings();
  const filtered = existing.filter((e) => e.id !== embeddingId);

  filtered.push({
    id: embeddingId,
    helperName,
    samples: vectors,
    enrolledAt: new Date().toISOString(),
  });

  await saveEmbeddings(filtered);
}

export interface MatchResult {
  embeddingId: string;
  helperName: string;
  confidence: number;
}

const MATCH_THRESHOLD = 0.80;

export async function matchFace(
  landmarks: FaceLandmarks
): Promise<MatchResult | null> {
  const vector = landmarksToVector(landmarks);
  const embeddings = await loadEmbeddings();

  let bestMatch: MatchResult | null = null;

  for (const embedding of embeddings) {
    let maxSim = 0;
    for (const sample of embedding.samples) {
      const sim = cosineSimilarity(vector, sample);
      if (sim > maxSim) maxSim = sim;
    }

    if (maxSim >= MATCH_THRESHOLD) {
      if (!bestMatch || maxSim > bestMatch.confidence) {
        bestMatch = {
          embeddingId: embedding.id,
          helperName: embedding.helperName,
          confidence: maxSim,
        };
      }
    }
  }

  return bestMatch;
}

export async function deleteFaceEmbedding(
  embeddingId: string
): Promise<void> {
  const existing = await loadEmbeddings();
  await saveEmbeddings(existing.filter((e) => e.id !== embeddingId));
}

export async function getAllEmbeddingIds(): Promise<string[]> {
  const embeddings = await loadEmbeddings();
  return embeddings.map((e) => e.id);
}

export async function clearAllFaceData(): Promise<void> {
  await SecureStore.deleteItemAsync(STORE_KEY);
}
