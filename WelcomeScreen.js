import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const WelcomeScreen = ({ navigation }) => {
  const [language, setLanguage] = useState('English');
  const [profession, setProfession] = useState('computing');
  const [interviewerType, setInterviewerType] = useState('languageProficiencyExpert');

  const handleStartInterview = () => {
    navigation.navigate('Interview', { language, profession, interviewerType });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.instructions}>Please select your language, profession, and interviewer type to begin your practice interview.</Text>

      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Select Language:</Text>
        <Picker
          selectedValue={language}
          onValueChange={(itemValue) => setLanguage(itemValue)}
          style={styles.picker}
          dropdownIconColor="#000"
        >
          <Picker.Item label="English" value="English" />
          <Picker.Item label="Finnish" value="Finnish" />
          <Picker.Item label="Spanish" value="Spanish" />
          <Picker.Item label="German" value="German" />
        </Picker>
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Select Profession:</Text>
        <Picker
          selectedValue={profession}
          onValueChange={(itemValue) => setProfession(itemValue)}
          style={styles.picker}
          dropdownIconColor="#000"
        >
          <Picker.Item label="Computing" value="computing" />
          <Picker.Item label="Construction" value="construction" />
          <Picker.Item label="Healthcare" value="healthcare" />
        </Picker>
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Select Interviewer Type:</Text>
        <Picker
          selectedValue={interviewerType}
          onValueChange={(itemValue) => setInterviewerType(itemValue)}
          style={styles.picker}
          dropdownIconColor="#000"
        >
          <Picker.Item label="Language Proficiency Expert" value="languageProficiencyExpert" />
          <Picker.Item label="Language Proficiency CEFR" value="languageProficiencyCEFR" />
        </Picker>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Start Interview"
          onPress={handleStartInterview}
          color="#4CAF50"
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
    marginBottom: 10,
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center',
  },
  picker: {
    width: '100%',
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
  },
  buttonContainer: {
    width: '80%',
    marginTop: 20,
  },
});

export default WelcomeScreen;