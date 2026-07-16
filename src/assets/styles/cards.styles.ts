import { Colors } from '@/src/constants/Colors';
import { StyleSheet } from 'react-native';

const TRACK = '#eaeaea';

export const styles = StyleSheet.create({
  cardsScreen: {
    flex: 1,
    paddingTop: 16,
    backgroundColor: Colors.screenBackground,
  },

  // The row owns the bottom spacing so the help button centres against the
  // title instead of riding above it.
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },

  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
  },

  chapterListContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 960,
  },

  chapter: {
    marginBottom: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    paddingHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.cardBorder,
  },

  chapterHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },

  chapterTitle: {
    fontWeight: '700',
    fontSize: 22,
    color: Colors.textPrimary,
  },

  // Progress
  chapterProgressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },

  progressTrack: {
    width: 120,
    height: 10,
    borderRadius: 999,
    backgroundColor: TRACK,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: Colors.primary,
  },

  progressFillFull: {
    backgroundColor: Colors.secondary,
  },

  progressLabel: {
    fontSize: 12,
    opacity: 0.75,
  },

  cardsList: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: 5,
  },

  cardItemWrapper: {},

  cardItemWrapperPressed: {
    opacity: 0.92,
  },

  cardItem: {
    width: 36,
    height: 54,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  cardItemDefault: {
    backgroundColor: Colors.tileMissingBg,
  },

  cardItemOwned: {
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.tileOwnedBorder,
  },

  cardNumber: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.tileMissingText,
  },

  cardNumberOwned: {
    fontWeight: '600',
    color: '#2a2925',
  },

  duplicateBadge: {
    position: 'absolute',
    top: -6,
    right: -5,
    width: 16,
    height: 16,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },

  // Kebab menu
  kebabButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.75,
  },

  kebabPressed: {
    opacity: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },

  kebabDisabled: {
    opacity: 0.35,
  },

  // Modal menu
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    padding: 20,
  },

  modalSheet: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },

  modalTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    opacity: 0.8,
  },

  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
  },

  modalItemPressed: {
    backgroundColor: 'rgba(0,0,0,0.06)',
  },

  modalItemText: {
    fontSize: 16,
  },

  modalCancel: {
    marginTop: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },

  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.8,
  },

  controlsRow: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
