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
};

export default function PasswordInput({
  value,
  onChangeText,
  onSubmitEditing,
  textContentType,
  autoComplete,
  placeholder = 'Enter password',
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
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
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  toggle: {
    padding: 4,
  },
});
