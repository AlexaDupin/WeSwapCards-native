import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  renderRightAccept: {
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    alignSelf: 'stretch',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
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
    marginBottom: 10,
    alignSelf: 'stretch',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  rightActions: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    marginBottom: 10,
  },
  transactionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionLeft: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 14,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionsList: {
    flex: 1,
  },
  transactionsListContent: {
    paddingBottom: 20,
  },
  pillList: {
    flexDirection: 'row',
    alignItems: 'center',
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

  unreadIconWrapper: {
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0A84FF',
  },
});
