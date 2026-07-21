// styles/auth.styles.js
import { Colors } from '@/src/constants/Colors';
import { StyleSheet } from 'react-native';

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    marginVertical: 15,
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    marginBottom: 50,
  },
  subtitleText: {
    fontSize: 20,
    textAlign: 'center',
  },
  input: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 26,
    borderWidth: 1,
    fontSize: 16,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 16,
  },

  // linkText: {
  //   color: Colors.primary,
  //   fontSize: 16,
  //   fontWeight: "600",
  // },
  // verificationContainer: {
  //   flex: 1,
  //   backgroundColor: Colors.background,
  //   padding: 20,
  //   justifyContent: "center",
  //   alignItems: "center",
  // },
  // verificationTitle: {
  //   fontSize: 24,
  //   fontWeight: "bold",
  //   color: Colors.text,
  //   marginBottom: 20,
  //   textAlign: "center",
  // },
  // verificationInput: {
  //   backgroundColor: Colors.white,
  //   borderRadius: 12,
  //   padding: 15,
  //   marginBottom: 16,
  //   borderWidth: 1,
  //   borderColor: Colors.border,
  //   fontSize: 16,
  //   color: Colors.text,
  //   width: "100%",
  //   textAlign: "center",
  //   letterSpacing: 2,
  // },

  // 🔴 Error styles
  errorBox: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  errorText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
});

// Overrides layered on top of authStyles on short devices, so the taller auth
// screens (sign-up especially) fit between the status bar and the nav bar
// without the footer link falling below the fold. Don't reach for these
// directly — useAuthLayout() applies them, so every auth screen switches over
// at the same breakpoint.
export const authCompactStyles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    marginVertical: 6,
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 16,
  },
  subtitleText: {
    fontSize: 17,
  },
  input: {
    padding: 14,
    marginBottom: 14,
  },
  button: {
    marginTop: 4,
    marginBottom: 8,
  },
});

// Devices below this height (iPhone SE, small/older Androids) get the tighter
// spacing above.
export const isCompactAuth = (windowHeight: number) => windowHeight < 720;
