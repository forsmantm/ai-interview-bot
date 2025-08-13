import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const WelcomeScreen = ({ navigation }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedProfession, setSelectedProfession] = useState('Computing');

  const startInterview = () => {
    navigation.navigate('Interview', {
      language: selectedLanguage,
      profession: selectedProfession.toLowerCase(),
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the AI interview!</Text>
      <Text style={styles.subtitle}>Please select your language:</Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedLanguage}
          onValueChange={(itemValue, itemIndex) => setSelectedLanguage(itemValue)}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          <Picker.Item label="English" value="English" />
          <Picker.Item label="Finnish" value="Finnish" />
          <Picker.Item label="Spanish" value="Spanish" />
          <Picker.Item label="German" value="German" />
        </Picker>
      </View>

      <Text style={styles.subtitle}>Please select your field of profession:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedProfession}
          onValueChange={(itemValue, itemIndex) => setSelectedProfession(itemValue)}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          <Picker.Item label="Computing" value="computing" />
          <Picker.Item label="Construction" value="construction" />
          <Picker.Item label="Healthcare" value="healthcare" />
        </Picker>
      </View>

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
  startButton: {
    width: '100%',
  },
});

export default WelcomeScreen;