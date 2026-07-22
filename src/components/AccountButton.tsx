import React, { useState, useCallback } from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors } from '@/src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useClerk, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNotifications } from '@/src/features/notifications/NotificationsProvider';
import { useDeleteAccount } from '@/src/features/auth/hooks/useDeleteAccount';
import { useExplorer } from '@/src/features/auth/context/ExplorerContext';

export function AccountButton() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { explorerName } = useExplorer();
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

  const openExternal = useCallback((url: string, fallbackMessage: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Could not open', fallbackMessage);
    });
  }, []);

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
        <Pressable
          style={[
            styles.overlay,
            { paddingBottom: Math.max(32, insets.bottom + 16) },
          ]}
          onPress={() => setVisible(false)}
        >
          <Pressable style={styles.sheet}>
            {(explorerName != null || email != null) && (
              <View style={styles.header}>
                <Image
                  source={{ uri: user?.imageUrl }}
                  style={styles.headerAvatar}
                />
                <View style={styles.headerText}>
                  {explorerName != null ? (
                    <>
                      <Text style={styles.headerName} numberOfLines={1}>
                        {explorerName}
                      </Text>
                      {email != null && (
                        <Text style={styles.headerEmail} numberOfLines={1}>
                          {email}
                        </Text>
                      )}
                    </>
                  ) : (
                    <Text style={styles.headerName} numberOfLines={1}>
                      {email}
                    </Text>
                  )}
                </View>
              </View>
            )}

            <View style={styles.item}>
              <View style={styles.toggleRow}>
                <View style={styles.rowContent}>
                  <Ionicons
                    name="notifications-outline"
                    size={20}
                    color={NEUTRAL}
                  />
                  <Text style={styles.linkItemText}>Message notifications</Text>
                </View>
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
              onPress={() =>
                openExternal(
                  `mailto:${SUPPORT_EMAIL}`,
                  `Email us at ${SUPPORT_EMAIL}`,
                )
              }
            >
              <View style={styles.rowContent}>
                <Ionicons name="mail-outline" size={20} color={NEUTRAL} />
                <View>
                  <Text style={styles.linkItemText}>Contact support</Text>
                  <Text style={styles.linkItemSubtext}>{SUPPORT_EMAIL}</Text>
                </View>
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.item,
                pressed && styles.itemPressed,
              ]}
              onPress={() =>
                openExternal(TERMS_URL, `You can read it at ${TERMS_URL}`)
              }
            >
              <View style={styles.rowContent}>
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color={NEUTRAL}
                />
                <Text style={styles.linkItemText}>Terms of Service</Text>
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.item,
                pressed && styles.itemPressed,
              ]}
              onPress={() =>
                openExternal(PRIVACY_URL, `You can read it at ${PRIVACY_URL}`)
              }
            >
              <View style={styles.rowContent}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={NEUTRAL}
                />
                <Text style={styles.linkItemText}>Privacy Policy</Text>
              </View>
            </Pressable>

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

          <Pressable style={[styles.sheet, styles.deleteCard]}>
            <Pressable
              style={({ pressed }) => [
                styles.item,
                styles.deleteRow,
                pressed && styles.itemPressed,
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
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const AVATAR_SIZE = 34;

// Published in-app contact + legal pages (store UGC compliance).
const SUPPORT_EMAIL = 'contact@weswapcards.com';
const TERMS_URL = 'https://weswapcards.com/terms';
const PRIVACY_URL = 'https://weswapcards.com/privacy';

const NEUTRAL = '#111';
const DANGER = '#B5544B';

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: NEUTRAL,
  },
  headerEmail: {
    marginTop: 2,
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
  deleteCard: {
    marginTop: 12,
  },
  deleteRow: {
    borderBottomWidth: 0,
  },
  deleteText: {
    fontSize: 16,
    color: DANGER,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleHint: {
    marginTop: 8,
    fontSize: 13,
    color: Colors.accent,
  },
  cancelItem: {
    borderBottomWidth: 0,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    color: NEUTRAL,
  },
  linkItemText: {
    fontSize: 16,
    color: NEUTRAL,
  },
  linkItemSubtext: {
    marginTop: 2,
    fontSize: 13,
    color: '#666',
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
