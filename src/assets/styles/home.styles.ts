import { StyleSheet } from "react-native";

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
        fontSize: 36,   
        fontWeight: "600",
        marginTop: 20,
        marginBottom: 20,
        textAlign: "center",

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
})

