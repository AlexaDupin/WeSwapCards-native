import { StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Fonts } from '@/src/constants/typography';

export const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 26,
    marginTop: 20,
    marginBottom: 20,
    alignSelf: 'center',
  },
  buttonText: {
    fontFamily: Fonts.head.regular,
    color: '#fff',
    fontSize: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
