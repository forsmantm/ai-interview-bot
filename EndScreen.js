import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const EndScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Well done! The interview is finished.</Text>
      <Text style={styles.subtitle}>Here are the results.</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Results"
          onPress={() => alert('Results are not yet implemented!')}
          color="#007AFF"
        />
        <View style={styles.spacer} />
        <Button
          title="Leave"
          onPress={() => navigation.popToTop()}
          color="#CCCCCC"
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 50,
  },
  spacer: {
    width: 20, // Add space between buttons
  },
});

export default EndScreen;