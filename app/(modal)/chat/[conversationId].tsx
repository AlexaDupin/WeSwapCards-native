import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '@clerk/clerk-expo';
import { axiosInstance } from '@/src/lib/axiosInstance';
import { useExplorer } from '@/src/features/auth/context/ExplorerContext';

type Message = {
  id: number;
  content: string;
  timestamp: string;
  sender_id: number;
  recipient_id: number;
  conversation_id: number;
  read?: boolean;
};

export default function ChatModalScreen() {
  const { conversationId, cardName, swapName, swapExplorerId } =
    useLocalSearchParams<{
      conversationId: string;
      cardName?: string;
      swapName?: string;
      swapExplorerId?: string;
    }>();

  const convId = Number(conversationId);
  const { explorerId } = useExplorer();
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listRef = useRef<FlatList<Message> | null>(null);

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const otherParticipantId = useMemo(() => {
    const other = Number(swapExplorerId);
    return Number.isFinite(other) ? other : null;
  }, [swapExplorerId]);

  const authHeaders = useCallback(async () => {
    const token = await getTokenRef.current();
    return { Authorization: `Bearer ${token}` };
  }, []);

  const fetchMessages = useCallback(async () => {
    const headers = await authHeaders();
    const resp = await axiosInstance.get(`/chat/${convId}`, { headers });
    const all = resp.data?.allMessages ?? [];
    setMessages(all);
  }, [authHeaders, convId]);

  const markRead = useCallback(async () => {
    if (!explorerId) return;
    const headers = await authHeaders();
    await axiosInstance.put(
      `/conversation/${convId}/${explorerId}`,
      {},
      { headers },
    );
  }, [authHeaders, convId, explorerId]);

  useEffect(() => {
    if (!Number.isFinite(convId) || !explorerId) return;

    let cancelled = false;

    (async () => {
      console.log('[Chat] convId', convId, 'explorerId', explorerId);

      setLoading(true);
      setError(null);

      try {
        const headers = await authHeaders();

        const resp = await axiosInstance.get(`/chat/${convId}`, {
          headers,
          timeout: 20000,
        });

        if (!cancelled) {
          setMessages(resp.data?.allMessages ?? []);
        }

        // mark as read (don’t block UI)
        axiosInstance
          .put(
            `/conversation/${convId}/${explorerId}`,
            {},
            { headers, timeout: 20000 },
          )
          .catch(() => {});
      } catch (e: any) {
        console.log(
          '[Chat] load failed',
          e?.response?.status,
          e?.response?.data,
        );
        if (!cancelled) setError('Could not load messages');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [convId, explorerId, authHeaders]);

  const sendMessage = useCallback(async () => {
    if (!text.trim()) return;
    if (!explorerId) return;
    if (!otherParticipantId) return;
    if (sending) return;

    setSending(true);
    try {
      const headers = await authHeaders();
      const payload = {
        content: text.trim(),
        timestamp: new Date().toISOString(),
        sender_id: explorerId,
        recipient_id: otherParticipantId,
        conversation_id: convId,
      };

      try {
        await axiosInstance.post(`/chat/${convId}`, payload, { headers });
      } catch (err: any) {
        console.log('Send failed:', err?.response?.status, err?.response?.data);
        throw err;
      }

      setText('');
      await fetchMessages();
      // Mark read again to keep state consistent
      await markRead();
    } finally {
      setSending(false);
    }
  }, [
    authHeaders,
    convId,
    explorerId,
    otherParticipantId,
    text,
    sending,
    fetchMessages,
    markRead,
  ]);

  const renderItem = ({ item }: { item: Message }) => {
    const isMine = item.sender_id === explorerId;
    return (
      <View
        style={{
          alignSelf: isMine ? 'flex-end' : 'flex-start',
          maxWidth: '78%',
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 18,
          marginBottom: 10,
          backgroundColor: isMine ? '#0A84FF' : '#E9EEF3',
        }}
      >
        <Text style={{ color: isMine ? 'white' : '#111', fontSize: 15 }}>
          {item.content}
        </Text>
        <Text
          style={{
            marginTop: 6,
            fontSize: 11,
            color: isMine ? 'rgba(255,255,255,0.85)' : '#667085',
            alignSelf: 'flex-end',
          }}
        >
          {new Date(item.timestamp).toLocaleString(undefined, {
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: 'white' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
    >
      {/* Header */}
      <View
        style={{
          paddingTop: 18,
          paddingHorizontal: 16,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#EEF2F6',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 6 }}>
          <Ionicons name="close" size={22} color="#111" />
        </TouchableOpacity>

        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: '700' }}>
            {swapName ?? 'Chat'}
          </Text>
          <Text numberOfLines={1} style={{ fontSize: 13, color: '#667085' }}>
            {cardName ?? ''}
          </Text>
        </View>

        <View style={{ width: 28 }} />
      </View>

      {/* Body */}
      {error ? (
        <Text style={{ padding: 16, color: 'red' }}>{error}</Text>
      ) : null}
      {loading ? (
        <View style={{ paddingTop: 24 }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          ref={(r) => (listRef.current = r)}
          contentContainerStyle={{ padding: 16, paddingBottom: 12 }}
          data={messages}
          keyExtractor={(m) => String(m.id)}
          renderItem={renderItem}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
        />
      )}

      {/* Composer */}
      <View
        style={{
          padding: 12,
          borderTopWidth: 1,
          borderTopColor: '#EEF2F6',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message…"
          placeholderTextColor="#98A2B3"
          style={{
            flex: 1,
            minHeight: 42,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 999,
            backgroundColor: '#F2F4F7',
            fontSize: 15,
          }}
          multiline
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={!text.trim() || sending}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: !text.trim() || sending ? '#C7D2FE' : '#0A84FF',
          }}
        >
          <Ionicons name="send" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
