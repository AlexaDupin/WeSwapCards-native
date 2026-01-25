import { Text, View, Image } from "react-native";
import { homeStyles } from "@/src/assets/styles/home.styles";

export default function TopBar() {
  return (
    <View style={homeStyles.topBar}>
        <View style={homeStyles.brandRow}>
          <Image
            source={require("@/src/assets/images/favImage.png")}
            style={homeStyles.brandIcon}
          />
          <Text style={homeStyles.brandName}>WeSwapCards</Text>
        </View>
    </View>
  );
}