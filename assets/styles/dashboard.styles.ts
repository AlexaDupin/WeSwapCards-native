import { StyleSheet } from "react-native";
import { Colors } from "../../constants/Colors";

export const styles = StyleSheet.create({
  renderRightAccept: {
    backgroundColor: Colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    marginBottom: 10,
    alignSelf: 'stretch',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  renderRightDecline: {
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    marginBottom: 10,
    alignSelf: 'stretch',
  },
  renderLeftUnread: {
    backgroundColor: "blue",
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    marginBottom: 10,
    alignSelf: 'stretch',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  transactionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    padding: 15,
    alignItems: "center",
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionLeft: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 14,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionDate: {
    fontSize: 12,
    // color: COLORS.textLight,
  },




  
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },

  deleteButton: {
    padding: 15,
    borderLeftWidth: 1,
    // borderLeftColor: COLORS.border,
  },
  transactionsContainer: {
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: COLORS.background,
  },
  emptyState: {
    // backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    // shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    // color: COLORS.text,
    marginBottom: 8,
  },
  emptyStateText: {
    // color: COLORS.textLight,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyStateButton: {
    // backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyStateButtonText: {
    // color: COLORS.white,
    fontWeight: "600",
    marginLeft: 6,
  },
  transactionsHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 5,
  },
  transactionsList: {
    flex: 1,
  },
  transactionsListContent: {
    paddingBottom: 20,
  },
  pillList: {
    flexDirection: "row",
    alignItems: "center",
  },
  pill: {
    borderRadius: 18, 
    backgroundColor: "#E0F2FE",
    padding: 10,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 15
  },
  pillText: {
    fontSize: 14, 
    textAlign: "center",
    color:  "#0369A1",

  },
});