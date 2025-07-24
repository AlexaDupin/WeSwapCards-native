import { View, ActivityIndicator } from "react-native";
import { styles } from "../assets/styles/styles";
import { Colors } from "../constants/Colors";

const PageLoader = () => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
};
export default PageLoader;