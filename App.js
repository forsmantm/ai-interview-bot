import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  Button,
  Keyboard,
  Platform,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

function InterviewBot() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      if (Platform.OS === 'android') {
        setKeyboardHeight(e.endCoordinates.height);
      }
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    setMessages([...messages, { text: inputText, sender: 'user' }]);
    setInputText('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <ScrollView
        style={[styles.messagesContainer, { paddingTop: insets.top, paddingHorizontal: 10 }]}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {messages.map((message, index) => (
          <View key={index} style={[styles.message, message.sender === 'user' ? styles.userMessage : styles.botMessage]}>
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + keyboardHeight }]}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your answer..."
          onSubmitEditing={handleSendMessage} // ⬅️ New prop here
        />
        <Button title="Send" onPress={handleSendMessage} />
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <InterviewBot />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  messagesContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  message: {
    padding: 10,
    borderRadius: 15,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e5e5',
  },
  messageText: {
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
  },
});