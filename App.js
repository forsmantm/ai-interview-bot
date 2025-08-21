import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Platform,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { v4 as uuidv4 } from 'uuid';

import WelcomeScreen from './WelcomeScreen';
import EndScreen from './EndScreen';

const Stack = createStackNavigator();

const botNames = {
  'English': ['Alex', 'Jordan', 'Taylor', 'Casey', 'Sam'],
  'Finnish': ['Jari', 'Lauri', 'Satu', 'Elias', 'Aino'],
  'Spanish': ['Elena', 'Carlos', 'Sofia', 'Mateo', 'Isabella'],
  'German': ['Anna', 'Max', 'Lena', 'Felix', 'Clara'],
};

const professions = {
  'English': {
    'computing': 'computing',
    'construction': 'construction',
    'healthcare': 'healthcare',
  },
  'Finnish': {
    'computing': 'tietojenkäsittely',
    'construction': 'rakennusala',
    'healthcare': 'terveydenhuolto',
  },
  'Spanish': {
    'computing': 'computación',
    'construction': 'construcción',
    'healthcare': 'cuidado de la salud',
  },
  'German': {
    'computing': 'rechnen',
    'construction': 'konstruktion',
    'healthcare': 'gesundheitspflege',
  },
};

function getRandomName(language) {
  const names = botNames[language] || botNames['English'];
  const randomIndex = Math.floor(Math.random() * names.length);
  return names[randomIndex];
}

function getTranslatedProfession(language, profession) {
  return professions[language]?.[profession] || profession;
}

function InterviewBot({ route, navigation }) {
  const { language, profession, interviewerType } = route.params;
  const [messages, setMessages] = useState([{ text: 'Waiting for AI generated greeting...', sender: 'bot' }]);
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState('');
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef();
  const serverIp = '86.60.227.111';

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.finishButton}
          onPress={() => navigation.navigate('End', { sessionId: sessionId })}
        >
          <Text style={styles.finishButtonText}>Finish interview.</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, sessionId]);

  useEffect(() => {
    const id = uuidv4();
    setSessionId(id);

    const botName = getRandomName(language);
    const translatedProfession = getTranslatedProfession(language, profession);

    const initialGreeting = async () => {
      try {
        const response = await fetch(`http://${serverIp}:3000/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-session-id': id,
          },
          body: JSON.stringify({
            message: `Generate a casual greeting in ${language}. Introduce yourself as ${botName} and mention that we will be having a small talk about ${translatedProfession}.`,
            language,
            profession: translatedProfession,
            botName,
            interviewerType,
          }),
        });

        const data = await response.json();
        setMessages([{ text: data.reply + '\n\n', sender: 'bot' }]);
      } catch (error) {
        console.error('Failed to fetch initial greeting:', error);
        setMessages([{ text: "Sorry, I can't connect to the server.\n\n", sender: 'bot' }]);
      } finally {
        setIsLoading(false);
      }
    };
    initialGreeting();
  }, [language, profession, interviewerType]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputText.trim() === '' || isLoading) return;

    const userMessage = { text: inputText, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText('');
    setIsLoading(true);

    let success = false;
    for (let i = 0; i < 5; i++) {
      try {
        const botName = messages[0]?.sender === 'bot' ? messages[0].text.split(' ')[4].replace(/[,.]/g, '') : getRandomName(language);
        const translatedProfession = getTranslatedProfession(language, profession);

        const response = await fetch(`http://${serverIp}:3000/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-session-id': sessionId,
          },
          body: JSON.stringify({
            message: `Continue the casual small talk in ${language} about ${translatedProfession}. The user's last message is: "${inputText}"`,
            language,
            profession: translatedProfession,
            botName,
            interviewerType,
          }),
        });

        if (response.status === 503) {
          console.log(`Retry attempt ${i + 1} failed with 503 error. Retrying in 3 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          continue;
        }

        const data = await response.json();
        const botReply = { text: data.reply + '\n\n\n', sender: 'bot' };
        setMessages((prevMessages) => [...prevMessages, botReply]);
        success = true;
        break;
      } catch (error) {
        console.error('Failed to fetch from back-end:', error);
        const errorMessage = { text: "Sorry, I can't connect to the server.\n\n", sender: 'bot' };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
        break;
      }
    }

    if (success) {
      setInputText('');
    } else {
      setMessages((prevMessages) => {
        if (prevMessages[prevMessages.length - 1].sender !== 'bot' || !prevMessages[prevMessages.length - 1].text.includes("Sorry, I can't connect to the server.")) {
          return [...prevMessages, { text: "Sorry, the service is currently unavailable. Please try again later.", sender: 'bot' }];
        }
        return prevMessages;
      });
    }

    setIsLoading(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <ScrollView
        ref={scrollViewRef}
        style={[styles.messagesContainer, { paddingTop: insets.top, paddingHorizontal: 10 }]}
        contentContainerStyle={[styles.scrollContentContainer]}
      >
        {messages.map((message, index) => (
          <View key={index} style={[styles.message, message.sender === 'user' ? styles.userMessage : styles.botMessage]}>
            <Text style={[styles.messageText, message.sender === 'user' ? { color: 'white' } : { color: 'black' }]}>
              {message.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + keyboardHeight }]}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder={isLoading ? "Waiting for bot..." : "Type your answer..."}
          onSubmitEditing={handleSendMessage}
          editable={!isLoading}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage} disabled={isLoading}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Welcome">
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ title: 'Welcome' }}
          />
          <Stack.Screen
            name="Interview"
            component={InterviewBot}
            options={{ title: 'Interview' }}
          />
          <Stack.Screen
            name="End"
            component={EndScreen}
            options={{ title: 'Interview Finished', headerLeft: null }}
          />
        </Stack.Navigator>
      </NavigationContainer>
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
  messageText: {},
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
  sendButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  finishButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  finishButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});