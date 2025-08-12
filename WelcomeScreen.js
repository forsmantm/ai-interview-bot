import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const WelcomeScreen = ({ navigation }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const startInterview = () => {
    navigation.navigate('Interview', { language: selectedLanguage });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the AI Interview Bot!</Text>
      <Text style={styles.subtitle}>Please select your language:</Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedLanguage}
          onValueChange={(itemValue, itemIndex) => setSelectedLanguage(itemValue)}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          <Picker.Item label="English" value="English" />
          <Picker.Item label="Spanish" value="Spanish" />
          <Picker.Item label="German" value="German" />
          <Picker.Item label="Finnish" value="Finnish" />
        </Picker>
      </View>

      <Text style={styles.languageText}>Selected: {selectedLanguage}</Text>

      <View style={styles.startButton}>
        <Button
          title="Start Interview"
          onPress={startInterview}
          color="#007AFF"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  pickerContainer: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
  },
  picker: {
    width: '100%',
    height: 50,
  },
  pickerItem: {},
  languageText: {
    fontSize: 16,
    marginBottom: 40,
    fontWeight: 'bold',
  },
  startButton: {
    width: '100%',
  },
});

export default WelcomeScreen;