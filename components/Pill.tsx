import { Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { styles } from "../assets/styles/dashboard.styles";

type Props = {
  text: string;
  isActive?: boolean;
  onPress?: () => void;
}

const Pill = ({ text, isActive, onPress }: Props ) => {
  return (
    <TouchableOpacity 
        onPress={onPress}
        style={[
            styles.pill,
            isActive && styles.pillActive,
          ]}
    >      
        <Text style={styles.pillText}>{text}</Text>
    </TouchableOpacity>
  )
}

export default Pill