import React from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Colors } from '@/src/constants/Colors';

const TERMS_URL = 'https://weswapcards.com/terms';
const PRIVACY_URL = 'https://weswapcards.com/privacy';

type Props = {
  value: boolean;
  onValueChange: (next: boolean) => void;
};

function openLegalPage(url: string) {
  Linking.openURL(url).catch(() => {
    Alert.alert('Could not open the page', `You can read it at ${url}`);
  });
}

// Explicit terms consent at sign-up (store UGC compliance). The accepted state
// is forwarded to Clerk as legalAccepted, which records the consent timestamp.
export default function LegalConsentCheckbox({ value, onValueChange }: Props) {
  return (
    <Pressable
      style={styles.row}
      onPress={() => onValueChange(!value)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
      accessibilityLabel="I agree to the Terms of Service and Privacy Policy"
    >
      <Ionicons
        name={value ? 'checkbox' : 'square-outline'}
        size={22}
        color={value ? Colors.accent : '#666'}
      />
      <Text style={styles.label}>
        I agree to the{' '}
        <Text
          style={styles.link}
          onPress={(e) => {
            e.stopPropagation();
            openLegalPage(TERMS_URL);
          }}
        >
          Terms of Service
        </Text>{' '}
        and{' '}
        <Text
          style={styles.link}
          onPress={(e) => {
            e.stopPropagation();
            openLegalPage(PRIVACY_URL);
          }}
        >
          Privacy Policy
        </Text>
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: 12,
    paddingVertical: 4,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  link: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
