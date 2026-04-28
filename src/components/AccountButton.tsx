import React, { useState, useCallback } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useClerk, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export function AccountButton() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  const handleSignOut = useCallback(async () => {
    try {
      setVisible(false);
      await signOut();
      router.replace('/');
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  }, [signOut, router]);

  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)} style={styles.avatarButton}>
        <Image source={{ uri: user?.imageUrl }} style={styles.avatarImage} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <Pressable style={styles.sheet}>
            {email != null && (
              <View style={styles.emailRow}>
                <Text style={styles.emailText}>{email}</Text>
              </View>
            )}

            <Pressable
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
              onPress={handleSignOut}
            >
              <Text style={styles.signOutText}>Sign out</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.item, styles.cancelItem, pressed && styles.itemPressed]}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const AVATAR_SIZE = 34;

const styles = StyleSheet.create({
  avatarButton: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.32)',
    justifyContent: 'flex-end',
    padding: 16,
    paddingBottom: 32,
  },
  sheet: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
  },
  emailRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  emailText: {
    fontSize: 13,
    color: '#666',
  },
  item: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  itemPressed: {
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  cancelItem: {
    borderBottomWidth: 0,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    color: '#C0392B',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
});
