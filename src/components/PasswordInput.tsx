import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  onSubmitEditing: () => void;
  textContentType: 'password' | 'newPassword';
  autoComplete: 'password' | 'password-new';
  placeholder?: string;
  /** Tighter vertical rhythm, matching authCompactStyles on short screens. */
  compact?: boolean;
};

export default function PasswordInput({
  value,
  onChangeText,
  onSubmitEditing,
  textContentType,
  autoComplete,
  placeholder = 'Enter password',
  compact = false,
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <TextInput
        style={[styles.input, compact && styles.inputCompact]}
        value={value}
        placeholder={placeholder}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType={textContentType}
        autoComplete={autoComplete}
        onChangeText={onChangeText}
        returnKeyType="done"
        onSubmitEditing={onSubmitEditing}
      />

      <TouchableOpacity
        onPress={() => setVisible((v) => !v)}
        style={styles.toggle}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel={visible ? 'Hide password' : 'Show password'}
      >
        <Ionicons
          name={visible ? 'eye-off' : 'eye'}
          size={22}
          color="#9A8478"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 26,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
  },
  containerCompact: {
    marginBottom: 14,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  inputCompact: {
    padding: 14,
  },
  toggle: {
    padding: 4,
  },
});
