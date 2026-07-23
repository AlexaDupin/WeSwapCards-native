import { StyleSheet } from 'react-native';

import { Colors } from '@/src/constants/Colors';

export const styles = StyleSheet.create({
  searchInput: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F8F9FB',
    fontSize: 16,
    marginBottom: 12,
  },

  tabChips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  renderRightAccept: {
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    alignSelf: 'stretch',
  },
  renderRightDecline: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    alignSelf: 'stretch',
  },
  renderLeftUnread: {
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    alignSelf: 'stretch',
  },
  rightActions: {
    flexDirection: 'row',
    alignSelf: 'stretch',
  },
  // Flat conversation row. The white list surface + hairline dividers come from
  // the list container (`transactionsList` / `separator`), not per-row cards.
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    // Compact target height; minHeight (not height) so the row grows with
    // Dynamic Type / long text instead of clipping.
    minHeight: 72,
  },
  rowMiddle: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  rowUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  // Unread emphasis (paired with the dot): heavier name, darker secondary line,
  // accent-coloured date — the conventional message/mail-list treatment.
  rowUsernameUnread: {
    fontWeight: '700',
  },
  rowSecondary: {
    fontSize: 14,
    color: '#6C757D',
  },
  rowSecondaryUnread: {
    color: '#344054',
    fontWeight: '500',
  },
  rowRight: {
    alignSelf: 'stretch',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  rowDate: {
    fontSize: 12,
    color: '#9aa0a6',
  },
  rowDateUnread: {
    fontWeight: '600',
  },
  // Full-width white list surface. The screen wraps content in 16px horizontal
  // padding; the negative margin lets the list (and its dividers) run edge to
  // edge while each row keeps its own 16px padding so content stays aligned
  // with the header/tabs above.
  transactionsList: {
    flex: 1,
    marginHorizontal: -16,
    // Cancel the screen's 16px bottom padding so the surface runs all the way
    // down to the tab bar (no grey gap). The row content keeps its own bottom
    // breathing room via transactionsListContent.
    marginBottom: -16,
    backgroundColor: '#FFFFFF',
  },
  transactionsListContent: {
    paddingBottom: 20,
  },
  // Full-width divider between rows, inset 16 from each edge so it aligns with
  // the row padding (runs under the avatar).
  separator: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.14)',
    marginLeft: 16,
    marginRight: 16,
  },
  pillList: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  pill: {
    borderRadius: 18,
    backgroundColor: '#E0F2FE',
    padding: 10,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 15,
  },
  pillText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#0369A1',
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    // Lift it off the very bottom of the row so it sits a touch higher.
    marginBottom: 12,
  },

  emptyContainer: {
    marginTop: 8,
    // The list runs edge-to-edge (see transactionsList); keep the empty state
    // inset so it doesn't touch the screen edges.
    marginHorizontal: 16,
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.03)',
    alignItems: 'center',
  },
  // Frames the empty state's icon in the same white-on-grey lift as the action
  // pill, so the card reads as one system. No border, unlike the pill: that
  // border is an affordance cue, and this badge is decoration, not a control.
  emptyIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.7)',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.5)',
    textAlign: 'center',
    lineHeight: 18,
  },
  // The empty state's call to action. Carries no colour of its own: it reads
  // as tappable through the white lift off the muted card and the hairline
  // border, which keeps it from competing with the brand orange. A tinted pill
  // muddies instead — tint on tint is too small a step to register as a
  // control. The vertical padding also buys a ~40px tap target from 13px text.
  emptyAction: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  emptyActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
