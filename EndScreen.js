import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';

const EndScreen = ({ route, navigation }) => {
  const { sessionId } = route.params;
  const [analysisReport, setAnalysisReport] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getAnalysisReport = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://192.168.68.51:3000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });
      const data = await response.json();
      setAnalysisReport(data.analysis);
    } catch (error) {
      console.error('Failed to fetch analysis report:', error);
      setAnalysisReport('Sorry, I was unable to retrieve the analysis report.');
    } finally {
      setIsLoading(false);
    }
  };

  const startNewInterview = () => {
    navigation.popToTop();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Interview Finished!</Text>
      <Text style={styles.message}>Thank you for your time. You can now view your language proficiency report.</Text>
      
      {!analysisReport && (
        <View style={styles.buttonContainer}>
          <Button
            title={isLoading ? 'Generating Report...' : 'View Results'}
            onPress={getAnalysisReport}
            disabled={isLoading}
            color="#007AFF"
          />
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Generating your report...</Text>
        </View>
      )}

      {analysisReport && (
        <ScrollView style={styles.reportContainer}>
          <Text style={styles.reportText}>{analysisReport}</Text>
        </ScrollView>
      )}

      <View style={styles.buttonContainer}>
        <Button
          title="Start a New Interview"
          onPress={startNewInterview}
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
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    marginVertical: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  reportContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  reportText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default EndScreen;