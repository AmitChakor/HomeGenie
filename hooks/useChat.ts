/**
 * What this does:
 * Custom hook that manages the chat conversation state.
 * - Sends messages to the chat edge function
 * - Parses the SSE stream from Claude for real-time token display
 * - Persists messages to Supabase
 * - Exposes avatarState for the Avatar component
 */

import { useCallback, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { AvatarState } from '../components/Avatar';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

interface UserContext {
  userName?: string;
  vendors?: { name: string; category: string; phone: string; whatsapp?: string }[];
}

export function useChat(userContext?: UserContext) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const abortRef = useRef<AbortController | null>(null);

  const persistMessage = useCallback(
    async (role: 'user' | 'assistant', content: string) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      await supabase.from('messages').insert({
        user_id: session.user.id,
        role,
        content,
      });
    },
    []
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      persistMessage('user', userMsg.content);

      const assistantId = `assistant-${Date.now()}`;
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsStreaming(true);
      setAvatarState('thinking');

      const abortController = new AbortController();
      abortRef.current = abortController;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';

        const chatHistory = [...messages, userMsg].slice(-20).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch(`${supabaseUrl}/functions/v1/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token ?? ''}`,
          },
          body: JSON.stringify({
            messages: chatHistory,
            userContext,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Chat failed: ${errorText}`);
        }

        setAvatarState('speaking');

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response stream');

        const decoder = new TextDecoder();
        let fullContent = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                fullContent += parsed.delta.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: fullContent } : m
                  )
                );
              }
            } catch {
              // skip unparseable lines
            }
          }
        }

        if (fullContent) {
          persistMessage('assistant', fullContent);
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: 'Sorry, something went wrong. Please try again.' }
              : m
          )
        );
        console.error('Chat error:', error);
      } finally {
        setIsStreaming(false);
        setAvatarState('idle');
        abortRef.current = null;
      }
    },
    [messages, isStreaming, userContext, persistMessage]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setAvatarState('idle');
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isStreaming,
    avatarState,
    setAvatarState,
    sendMessage,
    stopStreaming,
    clearMessages,
  };
}
