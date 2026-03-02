import { StyleSheet } from 'react-native';

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

  headerTitle: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  headerSubtitle: { fontSize: 17, color: '#667085' },

  body: { flex: 1 },

  error: { padding: 16, color: 'red' },

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

  bubbleTextMine: { color: 'white', fontSize: 17, lineHeight: 22 },
  bubbleTextOther: { color: '#111', fontSize: 17, lineHeight: 22 },

  timestampMine: {
    marginTop: 6,
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    alignSelf: 'flex-end',
  },
  timestampOther: {
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
});
