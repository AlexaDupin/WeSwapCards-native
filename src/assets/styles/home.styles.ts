import { StyleSheet } from "react-native";

export const homeStyles = StyleSheet.create({
    container: {
        width: "100%",
        paddingHorizontal: 16,
        marginTop: 30,
        paddingTop: 20,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 24
    },
    title: {
        fontSize: 36,   
        fontWeight: "600",
        marginTop: 40,
        marginBottom: 26,
        textAlign: "center",
    },
    paragraph: {
        fontSize: 20,  
        marginTop: 10,  
        textAlign: "center",
        lineHeight: 26,
        marginBottom: 20,
    },
    disclaimer: {
        fontSize: 14, 
        marginTop: 10,  
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 20,
    },
    steps: {
        flex: 1,
        flexDirection: "column",
    }, 
    subtitle: {
        fontSize: 20,
        marginBottom: 20,
        textAlign: "center"
    },
})

