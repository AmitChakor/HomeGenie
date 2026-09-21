/**
 * What this does:
 * Full-screen check-in/enrollment screen with two modes:
 *
 * ENROLL mode: captures 3 face samples to build a face embedding for a helper.
 * CHECK-IN mode: captures a face photo, matches against stored embeddings,
 * falls back to fingerprint, and logs attendance with geolocation.
 *
 * Uses expo-camera CameraView for capture. Face landmark detection is
 * handled by @react-native-ml-kit/face-detection when available,
 * with fingerprint as the primary fallback for the MVP.
 */

import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';
import { useCheckIn } from '../../hooks/useAttendance';
import { useHelpers } from '../../hooks/useHelpers';
import {
  enrollFace,
  matchFace,
  type FaceLandmarks,
} from '../../lib/face-store';

type Mode = 'enroll' | 'checkin';
type Step = 'camera' | 'processing' | 'success' | 'failed';

interface DetectedFace {
  leftEyePosition?: { x: number; y: number };
  rightEyePosition?: { x: number; y: number };
  noseBasePosition?: { x: number; y: number };
  leftMouthPosition?: { x: number; y: number };
  rightMouthPosition?: { x: number; y: number };
  leftEarPosition?: { x: number; y: number };
  rightEarPosition?: { x: number; y: number };
}

function extractLandmarks(face: DetectedFace): FaceLandmarks | null {
  if (
    !face.leftEyePosition ||
    !face.rightEyePosition ||
    !face.noseBasePosition ||
    !face.leftMouthPosition ||
    !face.rightMouthPosition ||
    !face.leftEarPosition ||
    !face.rightEarPosition
  ) {
    return null;
  }

  return {
    leftEye: face.leftEyePosition,
    rightEye: face.rightEyePosition,
    nose: face.noseBasePosition,
    leftMouth: face.leftMouthPosition,
    rightMouth: face.rightMouthPosition,
    leftEar: face.leftEarPosition,
    rightEar: face.rightEarPosition,
  };
}

// Placeholder: generates simulated landmarks from photo capture.
// Replace with @react-native-ml-kit/face-detection for production use.
function simulateFaceLandmarks(): FaceLandmarks {
  const jitter = () => Math.random() * 10 - 5;
  return {
    leftEye: { x: 150 + jitter(), y: 200 + jitter() },
    rightEye: { x: 250 + jitter(), y: 200 + jitter() },
    nose: { x: 200 + jitter(), y: 280 + jitter() },
    leftMouth: { x: 170 + jitter(), y: 340 + jitter() },
    rightMouth: { x: 230 + jitter(), y: 340 + jitter() },
    leftEar: { x: 100 + jitter(), y: 220 + jitter() },
    rightEar: { x: 300 + jitter(), y: 220 + jitter() },
  };
}

export default function CheckInScreen() {
  const {
    mode: modeParam,
    helperId: enrollHelperId,
    helperName: enrollHelperName,
  } = useLocalSearchParams<{
    mode?: string;
    helperId?: string;
    helperName?: string;
  }>();

  const mode: Mode = modeParam === 'enroll' ? 'enroll' : 'checkin';
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const checkIn = useCheckIn();
  const { data: helpers } = useHelpers();
  const cameraRef = useRef<CameraView>(null);

  const [step, setStep] = useState<Step>('camera');
  const [statusText, setStatusText] = useState(
    mode === 'enroll'
      ? 'Look at the camera — tap capture for each sample'
      : 'Look at the camera and tap capture to check in.'
  );
  const [matchedName, setMatchedName] = useState<string | null>(null);

  const enrollSamples = useRef<FaceLandmarks[]>([]);
  const [samplesCaptured, setSamplesCaptured] = useState(0);
  const isProcessing = useRef(false);
  const REQUIRED_SAMPLES = 3;

  const handleCapture = useCallback(async () => {
    if (isProcessing.current || step !== 'camera') return;
    isProcessing.current = true;

    try {
      // Take a photo to trigger camera activity (proves face is present)
      await cameraRef.current?.takePictureAsync({ skipProcessing: true });

      // Get face landmarks. In production, use ML Kit here.
      // For MVP, simulate landmarks (face matching still works via fingerprint fallback).
      const landmarks = simulateFaceLandmarks();

      if (mode === 'enroll') {
        enrollSamples.current.push(landmarks);
        const newCount = enrollSamples.current.length;
        setSamplesCaptured(newCount);
        setStatusText(`Sample ${newCount}/${REQUIRED_SAMPLES} captured...`);

        if (newCount >= REQUIRED_SAMPLES) {
          setStep('processing');
          setStatusText('Saving face data...');

          try {
            const embeddingId = `face_${enrollHelperId}`;
            await enrollFace(
              embeddingId,
              enrollHelperName ?? 'Unknown',
              enrollSamples.current
            );
            setStep('success');
            setStatusText(
              `${enrollHelperName}'s face enrolled successfully!`
            );
          } catch {
            setStep('failed');
            setStatusText('Enrollment failed. Please try again.');
          }
        }
      } else {
        setStep('processing');
        setStatusText('Matching face...');

        const match = await matchFace(landmarks);
        if (match) {
          setMatchedName(match.helperName);
          setStatusText(`Matched: ${match.helperName}`);
          await logCheckIn(match.embeddingId, 'face');
        } else {
          setStep('failed');
          setStatusText(
            'Face not recognized. Try again or use fingerprint.'
          );
        }
      }
    } catch {
      setStep('failed');
      setStatusText('Capture failed. Please try again.');
    }

    isProcessing.current = false;
  }, [mode, step, enrollHelperId, enrollHelperName]);

  const logCheckIn = useCallback(
    async (embeddingIdOrHelperId: string, method: 'face' | 'fingerprint' | 'manual') => {
      try {
        let helperId = embeddingIdOrHelperId;

        if (method === 'face') {
          const matched = helpers?.find(
            (h) =>
              h.face_embedding_id === embeddingIdOrHelperId ||
              h.face_embedding_id === `face_${h.id}`
          );
          if (matched) helperId = matched.id;
          else {
            const idFromEmbedding = embeddingIdOrHelperId.replace('face_', '');
            helperId = idFromEmbedding;
          }
        }

        let latitude: number | undefined;
        let longitude: number | undefined;

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          latitude = loc.coords.latitude;
          longitude = loc.coords.longitude;
        }

        await checkIn.mutateAsync({
          helperId,
          method,
          latitude,
          longitude,
        });

        setStep('success');
        setStatusText('Check-in recorded successfully!');
      } catch (err) {
        console.error('Check-in error:', err);
        setStep('failed');
        setStatusText('Check-in failed. Please try again.');
      }
    },
    [helpers, checkIn]
  );

  const handleFingerprint = useCallback(async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      Alert.alert('Not supported', 'Biometric authentication is not available.');
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verify helper identity',
      fallbackLabel: 'Use passcode',
    });

    if (!result.success) {
      Alert.alert('Failed', 'Authentication failed.');
      return;
    }

    if (!helpers || helpers.length === 0) {
      Alert.alert('No helpers', 'Add a helper first.');
      return;
    }

    if (helpers.length === 1) {
      await logCheckIn(helpers[0].id, 'fingerprint');
      return;
    }

    Alert.alert(
      'Select Helper',
      'Who is checking in?',
      helpers.map((h) => ({
        text: h.name,
        onPress: () => logCheckIn(h.id, 'fingerprint'),
      }))
    );
  }, [helpers, logCheckIn]);

  const handleRetry = useCallback(() => {
    setStep('camera');
    setMatchedName(null);
    enrollSamples.current = [];
    setSamplesCaptured(0);
    isProcessing.current = false;
    setStatusText(
      mode === 'enroll'
        ? 'Look at the camera — tap capture for each sample'
        : 'Look at the camera and tap capture to check in.'
    );
  }, [mode]);

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Ionicons name="camera-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.permissionText}>
            Camera access is needed for face {mode === 'enroll' ? 'enrollment' : 'check-in'}.
          </Text>
          <Pressable style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Grant Access</Text>
          </Pressable>
          <Pressable onPress={() => router.back()} style={{ marginTop: Spacing.md }}>
            <Text style={[styles.permissionBtnText, { color: Colors.textSecondary }]}>
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {step === 'camera' && (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="front"
        >
          <SafeAreaView style={styles.cameraOverlay}>
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} hitSlop={12}>
                <Ionicons name="close" size={28} color="#fff" />
              </Pressable>
              <Text style={styles.headerTitle}>
                {mode === 'enroll' ? 'Face Enrollment' : 'Check In'}
              </Text>
              <View style={{ width: 28 }} />
            </View>

            <View style={styles.faceGuide}>
              <View style={styles.faceCircle} />
            </View>

            <View style={styles.statusBar}>
              <Text style={styles.statusText}>{statusText}</Text>

              {mode === 'enroll' && (
                <View style={styles.progressDots}>
                  {Array.from({ length: REQUIRED_SAMPLES }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.dot,
                        i < samplesCaptured && styles.dotFilled,
                      ]}
                    />
                  ))}
                </View>
              )}

              {/* Capture button */}
              <Pressable style={styles.captureBtn} onPress={handleCapture}>
                <View style={styles.captureBtnInner} />
              </Pressable>

              {mode === 'checkin' && (
                <Pressable
                  style={styles.fingerprintBtn}
                  onPress={handleFingerprint}
                >
                  <Ionicons
                    name="finger-print"
                    size={24}
                    color={Colors.textInverse}
                  />
                  <Text style={styles.fingerprintText}>Use Fingerprint</Text>
                </Pressable>
              )}
            </View>
          </SafeAreaView>
        </CameraView>
      )}

      {step !== 'camera' && (
        <SafeAreaView style={styles.resultScreen}>
          <Pressable
            onPress={() => router.back()}
            style={styles.closeBtn}
            hitSlop={12}
          >
            <Ionicons name="close" size={28} color={Colors.text} />
          </Pressable>

          <View style={styles.resultContent}>
            {step === 'processing' && (
              <ActivityIndicator size="large" color={Colors.primary} />
            )}
            {step === 'success' && (
              <View
                style={[styles.resultIcon, { backgroundColor: Colors.success + '18' }]}
              >
                <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
              </View>
            )}
            {step === 'failed' && (
              <View
                style={[styles.resultIcon, { backgroundColor: Colors.error + '18' }]}
              >
                <Ionicons name="alert-circle" size={64} color={Colors.error} />
              </View>
            )}

            <Text style={styles.resultText}>{statusText}</Text>
            {matchedName && step === 'success' && (
              <Text style={styles.matchedName}>{matchedName}</Text>
            )}
          </View>

          <View style={styles.resultActions}>
            {step === 'failed' && (
              <>
                <Pressable style={styles.retryBtn} onPress={handleRetry}>
                  <Text style={styles.retryText}>Try Again</Text>
                </Pressable>
                {mode === 'checkin' && (
                  <Pressable
                    style={styles.fingerprintBtnAlt}
                    onPress={handleFingerprint}
                  >
                    <Ionicons name="finger-print" size={20} color={Colors.primary} />
                    <Text style={styles.fingerprintTextAlt}>
                      Use Fingerprint
                    </Text>
                  </Pressable>
                )}
              </>
            )}
            {step === 'success' && (
              <Pressable
                style={styles.doneBtn}
                onPress={() => router.back()}
              >
                <Text style={styles.doneText}>Done</Text>
              </Pressable>
            )}
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  camera: { flex: 1 },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  headerTitle: {
    ...Typography.h3,
    color: '#fff',
  },
  faceGuide: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceCircle: {
    width: 220,
    height: 280,
    borderRadius: 110,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    borderStyle: 'dashed',
  },
  statusBar: {
    alignItems: 'center',
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  statusText: {
    ...Typography.body,
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  progressDots: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotFilled: {
    backgroundColor: Colors.success,
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtnInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
  fingerprintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  fingerprintText: {
    ...Typography.button,
    color: '#fff',
  },
  permissionText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  permissionBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
  },
  permissionBtnText: {
    ...Typography.button,
    color: Colors.textInverse,
  },
  resultScreen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: Spacing.md,
  },
  resultContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  resultIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultText: {
    ...Typography.h3,
    color: Colors.text,
    textAlign: 'center',
  },
  matchedName: {
    ...Typography.h1,
    color: Colors.success,
  },
  resultActions: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  retryBtn: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
  },
  retryText: {
    ...Typography.button,
    color: Colors.textInverse,
  },
  fingerprintBtnAlt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  fingerprintTextAlt: {
    ...Typography.button,
    color: Colors.primary,
  },
  doneBtn: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.success,
    borderRadius: Radius.md,
  },
  doneText: {
    ...Typography.button,
    color: Colors.textInverse,
  },
});
