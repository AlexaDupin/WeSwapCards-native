import { StyleSheet } from "react-native";
import { Colors } from "../../constants/Colors";

export const styles = StyleSheet.create({
    chapterTitle: {
        fontFamily: 'Lobster_400Regular',
        fontSize: 26,
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
        marginBottom: 10,
    },
    cardsList: {
        flex: 1,
        flexDirection: "row"
    },
      transactionsListContent: {
        paddingBottom: 20,
    },
    cardItemWrapper: {
      position: 'relative',
      overflow: 'visible',
      paddingTop: 10
    },
    cardItem: {
      width: 30,
      height: 60,
      borderRadius: 6,
      backgroundColor: "#dedcd7",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },
    cardItemSelected: {
      borderWidth: 2,
      borderColor: '#16bc90', // green border
    },
    cardNumber: {
      fontSize: 18,
      fontWeight: '400',
    },
    orangeBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: Colors.primary,
    },


  transactionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    // shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  
  transactionLeft: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 14,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    // color: COLORS.textLight,
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