/**
 * What this does:
 * Home screen — AI chat interface with animated avatar at top,
 * scrollable message list, and an input bar with text + mic + send.
 * Streams Claude responses in real time.
 */

import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../../components/Avatar';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';
import { useChat, type ChatMessage } from '../../hooks/useChat';
import { useVendors } from '../../hooks/useVendors';
import {
  finishRecordAndTranscribe,
  speak,
  startRecording,
  stopSpeaking,
} from '../../lib/voice';

export default function HomeScreen() {
  const { data: vendors } = useVendors();

  const userContext = useMemo(
    () => ({
      vendors: vendors?.map((v) => ({
        id: v.id,
        name: v.name,
        category: v.category,
        phone: v.phone,
        whatsapp: v.whatsapp ?? undefined,
      })),
    }),
    [vendors]
  );

  const {
    messages,
    isStreaming,
    avatarState,
    setAvatarState,
    sendMessage,
    stopStreaming,
  } = useChat(userContext);

  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  }, [inputText, sendMessage]);

  const handleMicPressIn = useCallback(async () => {
    try {
      stopSpeaking();
      setIsRecording(true);
      setAvatarState('listening');
      await startRecording();
    } catch (error) {
      console.warn('Recording start error:', error);
      setIsRecording(false);
      setAvatarState('idle');
    }
  }, [setAvatarState]);

  const handleMicPressOut = useCallback(async () => {
    if (!isRecording) return;
    setIsRecording(false);
    setAvatarState('thinking');

    try {
      const text = await finishRecordAndTranscribe();
      if (text.trim()) {
        sendMessage(text);
      } else {
        setAvatarState('idle');
      }
    } catch (error) {
      console.warn('Transcription error:', error);
      setAvatarState('idle');
    }
  }, [isRecording, sendMessage, setAvatarState]);

  const handleSpeakMessage = useCallback((text: string) => {
    speak(text);
  }, []);

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => {
      const isUser = item.role === 'user';
      return (
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userText : styles.assistantText,
            ]}
          >
            {item.content || (isStreaming ? '...' : '')}
          </Text>
          {!isUser && item.content.length > 0 && (
            <Pressable
              onPress={() => handleSpeakMessage(item.content)}
              style={styles.speakButton}
              accessibilityLabel="Read aloud"
            >
              <Ionicons name="volume-medium-outline" size={16} color={Colors.textTertiary} />
            </Pressable>
          )}
        </View>
      );
    },
    [isStreaming, handleSpeakMessage]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Avatar state={avatarState} size={100} />
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Say hello to HomeGenie!{'\n'}Type a message or hold the mic to speak.
              </Text>
            </View>
          }
        />

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask HomeGenie anything..."
            placeholderTextColor={Colors.textTertiary}
            multiline
            maxLength={2000}
            returnKeyType="default"
            editable={!isRecording}
            accessibilityLabel="Chat message input"
          />

          {/* Mic Button */}
          <Pressable
            onPressIn={handleMicPressIn}
            onPressOut={handleMicPressOut}
            style={[
              styles.iconButton,
              isRecording && styles.iconButtonActive,
            ]}
            accessibilityLabel="Hold to record voice"
            accessibilityRole="button"
          >
            <Ionicons
              name={isRecording ? 'mic' : 'mic-outline'}
              size={22}
              color={isRecording ? Colors.textInverse : Colors.primary}
            />
          </Pressable>

          {/* Send / Stop Button */}
          {isStreaming ? (
            <Pressable
              onPress={stopStreaming}
              style={[styles.iconButton, styles.stopButton]}
              accessibilityLabel="Stop response"
              accessibilityRole="button"
            >
              <Ionicons name="stop" size={20} color={Colors.textInverse} />
            </Pressable>
          ) : (
            <Pressable
              onPress={handleSend}
              style={[
                styles.iconButton,
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              disabled={!inputText.trim()}
              accessibilityLabel="Send message"
              accessibilityRole="button"
            >
              <Ionicons name="send" size={18} color={Colors.textInverse} />
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  messageList: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 24,
  },
  messageBubble: {
    maxWidth: '80%',
    marginVertical: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.lg,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    borderBottomRightRadius: Radius.sm,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  messageText: {
    ...Typography.body,
    lineHeight: 22,
  },
  userText: {
    color: Colors.textInverse,
  },
  assistantText: {
    color: Colors.text,
  },
  speakButton: {
    alignSelf: 'flex-end',
    marginTop: 4,
    padding: 2,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.background,
    gap: Spacing.xs,
  },
  textInput: {
    flex: 1,
    ...Typography.body,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    maxHeight: 120,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconButtonActive: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  stopButton: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
});
