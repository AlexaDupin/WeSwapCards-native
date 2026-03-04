import React, { useMemo } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { styles } from '@/src/assets/styles/chat.styles';

type ChatComposerProps = {
  text: string;
  setText: (value: string) => void;
  canSend: boolean;
  onSend: () => void;
  onFocus: () => void;
  keyboardVisible: boolean;
  bottomInset: number;
};

export default function ChatComposer({
  text,
  setText,
  canSend,
  onSend,
  onFocus,
  keyboardVisible,
  bottomInset,
}: ChatComposerProps) {
  const paddingBottom = useMemo(
    () => 12 + (keyboardVisible ? 0 : bottomInset),
    [keyboardVisible, bottomInset],
  );

  return (
    <View style={[styles.composer, { paddingBottom }]}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Message…"
        placeholderTextColor="#98A2B3"
        style={styles.input}
        multiline
        onFocus={onFocus}
      />
      <TouchableOpacity
        onPress={onSend}
        disabled={!canSend}
        style={[
          styles.sendButton,
          { backgroundColor: canSend ? '#0A84FF' : '#C7D2FE' },
        ]}
      >
        <Ionicons name="send" size={18} color="white" />
      </TouchableOpacity>
    </View>
  );
}
