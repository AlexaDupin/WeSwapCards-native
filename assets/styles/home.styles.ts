import { StyleSheet } from "react-native";
import { Colors } from "../../constants/Colors";

export const homeStyles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      marginTop: 30,
      paddingTop: 20,  
    },
    scrollContent: {
        paddingBottom: 32,
    },
    title: {
        fontSize: 28,   
        fontWeight: "600",
        marginTop: 20,
        marginBottom: 20,
    },
    paragraph: {
        fontSize: 18,  
        marginTop: 10,  
        textAlign: "center",
    },
    disclaimer: {
        fontSize: 14, 
        marginTop: 10,  
        textAlign: "center",
    },
    steps: {
        flex: 1,
        flexDirection: "column",
    }, 
    subtitle: {
        fontSize: 18,
        marginBottom: 20,
    },
    
    // image: {
    //     marginTop: 20, 
    //     alignSelf: 'center',
    // }
})

