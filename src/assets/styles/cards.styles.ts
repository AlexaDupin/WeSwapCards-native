import { Colors } from "@/src/constants/Colors";
import { Platform, StyleSheet } from "react-native";

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
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-evenly",
    gap: 8, 
  },

  cardItemWrapper: {
    flexShrink: 1,
  },

  cardItemWrapperPressed: {
    opacity: 0.92,
  },

  cardItem: {
    width: 36,
    height: 66,
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
    borderColor: Colors.secondary,
    ...Platform.select({
      ios: {
        shadowColor: Colors.secondary,
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
    color: Colors.secondary,
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
    backgroundColor: Colors.secondary,
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