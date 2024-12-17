// src/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import BouncingBall from './BouncingBall'; // Import the BouncingBall component
import CricketBall from './CricketBall'; // Import the CricketBall component
import { auth } from '../FirebaseConfig';
import { signInWithEmailAndPassword } from "firebase/auth";
import { getAuth } from 'firebase/auth';


const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = () => {
    navigation.navigate('Signup');
  };
  const auth = getAuth();
 const handleLogin = async () => {
  if (email && password) {
    try {
      // Log in the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Retrieve the user's name
      const userName = userCredential.user.displayName || 'User';

      Alert.alert('Login Successful', `Welcome, ${userName}!`);
      navigation.navigate('Home'); // Navigate to Home screen
    } catch (error) {
      // Improve error handling with specific error codes
      if (error.code === 'auth/invalid-credential') {
        Alert.alert('Login Error', 'Invalid email or password. Please check and try again.');
      } else if (error.code === 'auth/user-not-found') {
        Alert.alert('Login Error', 'No user found with this email. Please sign up first.');
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert('Login Error', 'Incorrect password. Please try again.');
      } else {
        Alert.alert('Login Error', `${error.code}: ${error.message}`);
      }

      console.error('Login Error:', error.code, error.message); // Log the error for debugging
    }
  } else {
    Alert.alert('Error', 'Please enter email and password.');
  }
};
  
  

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#ffffff', '#e0e0e0']} style={styles.background}>
        <View style={styles.logoContainer}>
          <BouncingBall /> 
          <CricketBall size={100} /> 
          <Text style={styles.title}>Cricket Highlights Generator</Text>
          <Text style={styles.promptText}>Please log in to continue using our app...</Text>
        </View>

        <View style={styles.inputContainer}>
          <Icon name="email-outline" size={20} color="#666" style={styles.icon} />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#666"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="lock-outline" size={20} color="#666" style={styles.icon} />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#666"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Signup</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginVertical: 10,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#333',
  },
  button: {
    backgroundColor: '#333',
    paddingVertical: 15,
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  promptText: {
    fontSize: 14,
    color: 'rgba(102, 102, 102, 0.7)',
    textAlign: 'center',
    marginHorizontal: 40,
    marginBottom: 20,
    marginTop: 10,
  },
});

export default LoginScreen;
