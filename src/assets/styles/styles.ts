import { StyleSheet } from "react-native";
import { Colors } from "../../constants/Colors";

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
        color: '#fff',
        fontSize: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
})
