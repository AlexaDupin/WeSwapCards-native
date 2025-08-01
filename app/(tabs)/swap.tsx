import React, { useState } from 'react'
import {View, Text, TouchableOpacity, FlatList } from "react-native";
import { styles } from "@/assets/styles/swap.styles";
import { SafeAreaView } from 'react-native-safe-area-context';

const swap = ({ onSelect }) => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);

  const toggleDropdown = () => setDropdownVisible(!isDropdownVisible);

  const handleSelect = (item) => {
    setSelectedValue(item);
    onSelect(item);
    setDropdownVisible(false);
  };

  const chapters = [
    { id: 1, name: 'Brussels' },
    { id: 2, name: 'Berlin' },
    { id: 3, name: 'Paris' },
    { id: 4, name: 'London' },
    { id: 5, name: 'Brussels' },
    { id: 6, name: 'Berlin' },
    { id: 7, name: 'Paris' },
    { id: 8, name: 'London' },
    { id: 9, name: 'Brussels' },
    { id: 10, name: 'Berlin' },
    { id: 11, name: 'Paris' },
    { id: 12, name: 'London' },
    { id: 13, name: 'Brussels' },
    { id: 14, name: 'Berlin' },
    { id: 15, name: 'Paris' },
    { id: 16, name: 'London' },
    { id: 17, name: 'Brussels' },
    { id: 18, name: 'London' },
    { id: 19, name: 'Brussels' },
    { id: 20, name: 'Berlin' },
    { id: 21, name: 'Paris' },
    { id: 22, name: 'London' },
    { id: 23, name: 'Brussels' },
    { id: 24, name: 'Berlin' },
    { id: 25, name: 'Paris' },
    { id: 26, name: 'London' },
  ]

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 30 }}>Find a card</Text>

    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={toggleDropdown}>
        <Text style={styles.buttonText}>
          {selectedValue || "Select a chapter"}{" "}
        </Text>
      </TouchableOpacity>

      {isDropdownVisible && (
        <View style={styles.dropdown}>
          <FlatList
            data={chapters}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            // contentContainerStyle={{ marginBottom: 10 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.option}
                onPress={() => handleSelect(item.id)}
              >
                <Text style={styles.optionText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

    </View>
    </View>
  );
};

export default swap