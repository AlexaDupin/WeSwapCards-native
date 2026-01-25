import { StyleSheet } from "react-native";

export const homeStyles = StyleSheet.create({
  screen: { flex: 1 },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  topBar: {
    width: "100%",
    paddingVertical: 10,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandIcon: { width: 34, height: 34, borderRadius: 10 },
  brandName: { fontSize: 22, fontWeight: "900", letterSpacing: 0.2 },

  heroCard: {
    width: "100%",
    borderRadius: 22,
    padding: 18,
    backgroundColor: "rgba(245, 230, 215, 0.55)",
    marginTop: 14,
  },
  
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.2,
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 22,
    opacity: 0.78,
    marginBottom: 8,
  },

  microMeta: {
    marginBottom: 16,
  },
  microMetaText: {
    fontSize: 13,
    fontWeight: "600",
    opacity: 0.6,
  },
  dot: { opacity: 0.45 },

  heroCtas: { marginTop: 2 },

  signInLine: {
    textAlign: "center",
    marginTop: 10,
    opacity: 0.8,
  },
  signInLink: { fontWeight: "800" },

  sectionBlock: {
    width: "100%",
    marginTop: 22,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 26, fontWeight: "800" },
  sectionAction: { fontSize: 16, fontWeight: "800", opacity: 0.7 },

  stepsCard: {
    width: "100%",
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "white",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },

  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },

  stepIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },

  stepTextWrap: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: "900", marginBottom: 2 },
  stepSubtitle: { fontSize: 13, opacity: 0.7, lineHeight: 18 },

  stepDivider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.06)",
    marginLeft: 88,
  },

  footerCta: {
    marginTop: 14,
  }
});