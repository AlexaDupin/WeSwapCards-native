import { StyleSheet } from 'react-native';
import { Fonts } from '@/src/constants/typography';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },

  header: {
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTitle: {
    fontFamily: Fonts.head.bold,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: Fonts.body.regular,
    fontSize: 17,
    color: '#667085',
  },

  body: { flex: 1 },

  error: { padding: 16, color: 'red' },

  blockedHint: {
    fontFamily: Fonts.body.regular,
    paddingHorizontal: 16,
    paddingVertical: 6,
    fontSize: 13,
    color: '#667085',
    textAlign: 'center',
  },

  listContent: { padding: 16, paddingBottom: 12 },

  bubble: {
    maxWidth: '78%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    marginBottom: 10,
  },

  bubbleMine: { alignSelf: 'flex-end', backgroundColor: '#0A84FF' },
  bubbleOther: { alignSelf: 'flex-start', backgroundColor: '#E9EEF3' },

  bubbleTextMine: {
    fontFamily: Fonts.body.regular,
    color: 'white',
    fontSize: 17,
    lineHeight: 22,
  },
  bubbleTextOther: {
    fontFamily: Fonts.body.regular,
    color: '#111',
    fontSize: 17,
    lineHeight: 22,
  },

  timestampMine: {
    fontFamily: Fonts.body.regular,
    marginTop: 6,
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    alignSelf: 'flex-end',
  },
  timestampOther: {
    fontFamily: Fonts.body.regular,
    marginTop: 6,
    fontSize: 11,
    color: '#667085',
    alignSelf: 'flex-end',
  },

  composer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  input: {
    fontFamily: Fonts.body.regular,
    flex: 1,
    minHeight: 42,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#F2F4F7',
    fontSize: 16,
  },

  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  statusButton: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusIconButton: {
    width: 44,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusButtonText: {
    fontFamily: Fonts.head.bold,
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },

  statusComplete: { backgroundColor: '#16A34A' },
  statusDecline: { backgroundColor: '#DC2626' },
  statusReopen: { backgroundColor: '#E5E7EB' },

  statusButtonPressed: { opacity: 0.7 },
});
