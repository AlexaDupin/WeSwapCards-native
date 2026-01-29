
// src/assets/styles/cards.styles.ts
import { Platform, StyleSheet } from "react-native";

const SECONDARY = "#679591";
const TRACK = "#eaeaea";
const DEFAULT_BORDER = "#b1b1b1";
const DEFAULT_INNER = "#eaeaea";
const DEFAULT_TEXT = "#222";

const OWNED_INNER = "#dff2ee"; // approx lighten(secondary, 45%)

export const styles = StyleSheet.create({
  cardsScreen: {
    flex: 1,
    paddingTop: 16,
  },

  pageTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 18,
    paddingHorizontal: 16,
  },

  // Like .chapter-list max-width: 960 centered
  chapterListContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    alignSelf: "center",
    width: "100%",
    maxWidth: 960,
  },

  chapter: {
    marginBottom: 32,
  },

  chapterHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  chapterTitle: {
    fontFamily: "Lobster_400Regular",
    fontWeight: "600",
    fontSize: 24,
    textAlign: "left",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },

  // Progress
  chapterProgressWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },

  progressTrack: {
    width: 120,
    height: 10,
    borderRadius: 999,
    backgroundColor: TRACK,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: SECONDARY,
  },

  progressLabel: {
    fontSize: 12,
    opacity: 0.75,
  },

  // Web-like wrapped row of cards
  cardsList: {
  width: "100%",
  flexDirection: "row",
  flexWrap: "nowrap",
  alignItems: "flex-start",
  justifyContent: "space-evenly",
  },

  // Card item (web feel)
  cardItemWrapper: {
    marginRight: 4,
    marginBottom: 4,
    flexShrink: 1,
  },

  cardItemWrapperPressed: {
    opacity: 0.92,
  },

  cardItem: {
    width: 36, // ~2rem
    height: 66, // ~3rem
    borderRadius: 5,
    borderWidth: 1,
    padding: 3,
    position: "relative",
  },

  cardItemInner: {
    width: "100%",
    height: "100%",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  cardItemDefault: {
    borderColor: DEFAULT_BORDER,
  },

  cardItemOwned: {
    borderColor: SECONDARY,
    ...Platform.select({
      ios: {
        shadowColor: SECONDARY,
        shadowOpacity: 0.35,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 0 },
      },
      android: {
        elevation: 2,
      },
    }),
  },

  cardItemInnerDefault: {
    backgroundColor: DEFAULT_INNER,
  },

  cardItemInnerOwned: {
    backgroundColor: OWNED_INNER,
  },

  cardNumber: {
    fontSize: 14,
    fontWeight: "400",
    color: DEFAULT_TEXT,
  },

  cardNumberOwned: {
    fontWeight: "600",
    color: SECONDARY,
  },

  duplicateBadge: {
    position: "absolute",
    top: -2,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SECONDARY,
  },

  duplicateBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    lineHeight: 12,
  },

  // Kebab menu
  kebabButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.75,
  },

  kebabPressed: {
    opacity: 1,
    backgroundColor: "rgba(0,0,0,0.06)",
  },

  kebabDisabled: {
    opacity: 0.35,
  },

  kebabText: {
    fontSize: 20,
    lineHeight: 20,
  },

  // Modal menu
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    padding: 20,
  },

  modalSheet: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },

  modalTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    opacity: 0.8,
  },

  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
  },

  modalItemPressed: {
    backgroundColor: "rgba(0,0,0,0.06)",
  },

  modalItemText: {
    fontSize: 16,
  },

  modalCancel: {
    marginTop: 6,
    paddingVertical: 10,
    alignItems: "center",
  },

  modalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    opacity: 0.8,
  },
});



// import { StyleSheet } from "react-native";
// import { Colors } from "../../constants/Colors";

// export const styles = StyleSheet.create({
//     chapterTitle: {
//         fontFamily: 'Lobster_400Regular',
//         fontSize: 26,
//         textShadowColor: 'rgba(0,0,0,0.2)',
//         textShadowOffset: { width: 1, height: 1 },
//         textShadowRadius: 1,
//         marginBottom: 10,
//     },
//     cardsList: {
//         flex: 1,
//         flexDirection: "row"
//     },
//       transactionsListContent: {
//         paddingBottom: 20,
//     },
//     cardItemWrapper: {
//       position: 'relative',
//       overflow: 'visible',
//       paddingTop: 10
//     },
//     cardItem: {
//       width: 30,
//       height: 60,
//       borderRadius: 6,
//       backgroundColor: "#dedcd7",
//       justifyContent: "center",
//       alignItems: "center",
//       marginRight: 10,
//     },
//     cardItemSelected: {
//       borderWidth: 2,
//       borderColor: '#16bc90', // green border
//     },
//     cardNumber: {
//       fontSize: 18,
//       fontWeight: '400',
//     },
//     orangeBadge: {
//       position: 'absolute',
//       top: -4,
//       right: -4,
//       width: 12,
//       height: 12,
//       borderRadius: 6,
//       backgroundColor: Colors.primary,
//     },


//   transactionCard: {
//     backgroundColor: "white",
//     borderRadius: 12,
//     marginBottom: 10,
//     flexDirection: "row",
//     alignItems: "center",
//     // shadowColor: COLORS.shadow,
//     shadowOffset: {
//       width: 0,
//       height: 1,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },

  
//   transactionLeft: {
//     flex: 1,
//   },
//   transactionCategory: {
//     fontSize: 14,
//   },
//   transactionRight: {
//     alignItems: "flex-end",
//   },
//   transactionAmount: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 4,
//   },
//   transactionDate: {
//     fontSize: 12,
//     // color: COLORS.textLight,
//   },
//   deleteButton: {
//     padding: 15,
//     borderLeftWidth: 1,
//     // borderLeftColor: COLORS.border,
//   },
//   transactionsContainer: {
//     marginBottom: 20,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     // backgroundColor: COLORS.background,
//   },
//   emptyState: {
//     // backgroundColor: COLORS.card,
//     borderRadius: 16,
//     padding: 30,
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 10,
//     // shadowColor: COLORS.shadow,
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   emptyStateIcon: {
//     marginBottom: 16,
//   },
//   emptyStateTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     // color: COLORS.text,
//     marginBottom: 8,
//   },
//   emptyStateText: {
//     // color: COLORS.textLight,
//     fontSize: 14,
//     textAlign: "center",
//     marginBottom: 20,
//     lineHeight: 20,
//   },
//   emptyStateButton: {
//     // backgroundColor: COLORS.primary,
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   emptyStateButtonText: {
//     // color: COLORS.white,
//     fontWeight: "600",
//     marginLeft: 6,
//   },
//   transactionsHeaderContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 10,
//     paddingBottom: 5,
//   },

//   pillList: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   pill: {
//     borderRadius: 18, 
//     backgroundColor: "#E0F2FE",
//     padding: 10,
//     paddingHorizontal: 16,
//     marginRight: 10,
//     marginBottom: 15
//   },
//   pillText: {
//     fontSize: 14, 
//     textAlign: "center",
//     color:  "#0369A1",

//   },
// });