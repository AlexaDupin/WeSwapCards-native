import React, { useState, useCallback } from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useClerk, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

import { useNotifications } from '@/src/features/notifications/NotificationsProvider';
import { useDeleteAccount } from '@/src/features/auth/hooks/useDeleteAccount';

export function AccountButton() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  const { enabled, permission, setEnabled, openSystemSettings } =
    useNotifications();
  const { deleting, confirmAndDelete } = useDeleteAccount();

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
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={styles.avatarButton}
      >
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

            <View style={styles.item}>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Message notifications</Text>
                <Switch
                  value={enabled === true}
                  disabled={enabled === null}
                  onValueChange={(next) => {
                    void setEnabled(next);
                  }}
                />
              </View>
              {enabled === true && permission === 'blocked' && (
                <Text style={styles.toggleHint} onPress={openSystemSettings}>
                  Notifications are turned off for this app. Tap to open
                  Settings.
                </Text>
              )}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.item,
                pressed && styles.itemPressed,
              ]}
              onPress={handleSignOut}
            >
              <View style={styles.rowContent}>
                <Ionicons name="log-out-outline" size={20} color={NEUTRAL} />
                <Text style={styles.signOutText}>Sign out</Text>
              </View>
            </Pressable>

            <View style={styles.dangerSeparator} />

            <Pressable
              style={({ pressed }) => [
                styles.item,
                styles.deleteRow,
                pressed && styles.deleteRowPressed,
              ]}
              onPress={confirmAndDelete}
              disabled={deleting}
            >
              <View
                style={[styles.rowContent, deleting && styles.itemDisabled]}
              >
                <Ionicons name="trash-outline" size={20} color={DANGER} />
                <Text style={styles.deleteText}>
                  {deleting ? 'Deleting…' : 'Delete account'}
                </Text>
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.item,
                styles.cancelItem,
                pressed && styles.itemPressed,
              ]}
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

const NEUTRAL = '#111';
const DANGER = '#C0392B';
const DANGER_TINT = '#FDECEA';

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
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dangerSeparator: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  deleteRow: {
    backgroundColor: DANGER_TINT,
  },
  deleteRowPressed: {
    backgroundColor: '#F7D9D4',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontSize: 16,
    color: '#111',
  },
  toggleHint: {
    marginTop: 8,
    fontSize: 13,
    color: '#2563eb',
  },
  cancelItem: {
    borderBottomWidth: 0,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    color: NEUTRAL,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: DANGER,
  },
  itemDisabled: {
    opacity: 0.5,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
});
