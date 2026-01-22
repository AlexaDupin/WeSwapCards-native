import { StyleSheet } from "react-native";
import { Colors } from "../../constants/Colors";

export const styles = StyleSheet.create({
    container: {
        margin: 20,
      },
      button: {
        padding: 15,
        backgroundColor: Colors.primary,
        borderRadius: 5,
      },
      buttonText: {
        color: "white",
        textAlign: "center",
      },
      dropdown: {
        marginTop: 5,        
        backgroundColor: "white",
        borderRadius: 5,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        marginBottom: 120
      },
      option: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
      },
      optionText: {
        fontSize: 16,
      },
})