/**
 * What this does:
 * Bottom-sheet modal for voice-driven grocery input.
 * Flow: Hold mic → record → Whisper transcription → Claude parses into
 * structured items → user reviews/edits → confirms to add all items.
 */

import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';
import {
  parseGroceryText,
  type ParsedGroceryItem,
} from '../lib/grocery-parser';
import {
  finishRecordAndTranscribe,
  startRecording,
} from '../lib/voice';

type Step = 'idle' | 'recording' | 'transcribing' | 'parsing' | 'review';

interface VoiceCaptureSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (items: ParsedGroceryItem[]) => void;
}

export default function VoiceCaptureSheet({
  visible,
  onClose,
  onConfirm,
}: VoiceCaptureSheetProps) {
  const [step, setStep] = useState<Step>('idle');
  const [transcript, setTranscript] = useState('');
  const [parsedItems, setParsedItems] = useState<ParsedGroceryItem[]>([]);
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStep('idle');
    setTranscript('');
    setParsedItems([]);
    setManualInput('');
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleMicPressIn = useCallback(async () => {
    try {
      setError(null);
      setStep('recording');
      await startRecording();
    } catch (err) {
      setError('Could not start recording. Check microphone permissions.');
      setStep('idle');
    }
  }, []);

  const handleMicPressOut = useCallback(async () => {
    if (step !== 'recording') return;

    setStep('transcribing');
    try {
      const text = await finishRecordAndTranscribe();
      if (!text.trim()) {
        setError('Could not hear anything. Try again.');
        setStep('idle');
        return;
      }
      setTranscript(text);
      setStep('parsing');

      const items = await parseGroceryText(text);
      setParsedItems(items);
      setStep('review');
    } catch (err) {
      setError('Something went wrong. Please try again or type manually.');
      setStep('idle');
    }
  }, [step]);

  const handleManualParse = useCallback(async () => {
    if (!manualInput.trim()) return;

    setError(null);
    setStep('parsing');
    try {
      const items = await parseGroceryText(manualInput);
      setParsedItems(items);
      setTranscript(manualInput);
      setStep('review');
    } catch (err) {
      setError('Failed to parse items. Try simpler phrasing.');
      setStep('idle');
    }
  }, [manualInput]);

  const removeItem = useCallback((index: number) => {
    setParsedItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleConfirm = useCallback(() => {
    if (parsedItems.length === 0) return;
    onConfirm(parsedItems);
    handleClose();
  }, [parsedItems, onConfirm, handleClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Add Grocery Items</Text>
          <Pressable onPress={handleClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step: Idle / Recording */}
          {(step === 'idle' || step === 'recording') && (
            <View style={styles.captureSection}>
              <Text style={styles.instruction}>
                Hold the mic and say your grocery items.{'\n'}
                e.g. "2 kg atta, 1 litre milk, dozen eggs"
              </Text>

              <Pressable
                onPressIn={handleMicPressIn}
                onPressOut={handleMicPressOut}
                style={[
                  styles.micButton,
                  step === 'recording' && styles.micButtonActive,
                ]}
                accessibilityLabel="Hold to record grocery items"
              >
                <Ionicons
                  name={step === 'recording' ? 'mic' : 'mic-outline'}
                  size={48}
                  color={
                    step === 'recording' ? Colors.textInverse : Colors.primary
                  }
                />
              </Pressable>

              <Text style={styles.micLabel}>
                {step === 'recording' ? 'Listening...' : 'Hold to speak'}
              </Text>

              {/* Manual input fallback */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or type</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.manualRow}>
                <TextInput
                  style={styles.manualInput}
                  value={manualInput}
                  onChangeText={setManualInput}
                  placeholder="2kg atta, 1L milk, eggs..."
                  placeholderTextColor={Colors.textTertiary}
                  multiline
                  accessibilityLabel="Type grocery items"
                />
                <Pressable
                  style={[
                    styles.parseButton,
                    !manualInput.trim() && styles.parseButtonDisabled,
                  ]}
                  onPress={handleManualParse}
                  disabled={!manualInput.trim()}
                >
                  <Ionicons name="arrow-forward" size={20} color={Colors.textInverse} />
                </Pressable>
              </View>
            </View>
          )}

          {/* Step: Transcribing / Parsing */}
          {(step === 'transcribing' || step === 'parsing') && (
            <View style={styles.loadingSection}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>
                {step === 'transcribing'
                  ? 'Converting speech to text...'
                  : 'Parsing your grocery items...'}
              </Text>
              {transcript && step === 'parsing' && (
                <Text style={styles.transcriptPreview}>"{transcript}"</Text>
              )}
            </View>
          )}

          {/* Step: Review */}
          {step === 'review' && (
            <View style={styles.reviewSection}>
              <Text style={styles.transcriptLabel}>You said:</Text>
              <Text style={styles.transcriptPreview}>"{transcript}"</Text>

              <Text style={styles.itemsLabel}>
                Parsed items ({parsedItems.length}):
              </Text>

              {parsedItems.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQty}>
                      {item.quantity}
                      {item.unit ? ` ${item.unit}` : ''}
                      {item.notes ? ` · ${item.notes}` : ''}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => removeItem(index)}
                    hitSlop={8}
                    accessibilityLabel={`Remove ${item.name}`}
                  >
                    <Ionicons name="close-circle" size={22} color={Colors.error} />
                  </Pressable>
                </View>
              ))}

              {parsedItems.length === 0 && (
                <Text style={styles.emptyText}>
                  All items removed. Record again or type manually.
                </Text>
              )}
            </View>
          )}

          {/* Error */}
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom Actions */}
        {step === 'review' && (
          <View style={styles.footer}>
            <Pressable style={styles.retryButton} onPress={reset}>
              <Ionicons name="refresh" size={18} color={Colors.primary} />
              <Text style={styles.retryText}>Redo</Text>
            </Pressable>

            <Pressable
              style={[
                styles.confirmButton,
                parsedItems.length === 0 && styles.confirmDisabled,
              ]}
              onPress={handleConfirm}
              disabled={parsedItems.length === 0}
            >
              <Ionicons name="checkmark" size={20} color={Colors.textInverse} />
              <Text style={styles.confirmText}>
                Add {parsedItems.length} item{parsedItems.length !== 1 ? 's' : ''}
              </Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    ...Typography.h3,
    color: Colors.text,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  captureSection: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  instruction: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  micButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    borderWidth: 3,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonActive: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  micLabel: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  manualRow: {
    flexDirection: 'row',
    width: '100%',
    gap: Spacing.sm,
    alignItems: 'flex-end',
  },
  manualInput: {
    flex: 1,
    ...Typography.body,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 48,
    color: Colors.text,
    backgroundColor: Colors.surface,
    textAlignVertical: 'top',
  },
  parseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  parseButtonDisabled: {
    opacity: 0.4,
  },
  loadingSection: {
    alignItems: 'center',
    paddingTop: 80,
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  reviewSection: {
    gap: Spacing.sm,
  },
  transcriptLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  transcriptPreview: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
  },
  itemsLabel: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  itemQty: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.error + '10',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  retryText: {
    ...Typography.button,
    color: Colors.primary,
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
  },
  confirmDisabled: {
    opacity: 0.4,
  },
  confirmText: {
    ...Typography.button,
    color: Colors.textInverse,
  },
});
