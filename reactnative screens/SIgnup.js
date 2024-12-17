// src/SignupScreen.js
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
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Firebase Auth
import { auth } from '../FirebaseConfig'; // Firebase Configuration
import { updateProfile } from 'firebase/auth';
const Signup = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

const handleSignup = async () => {
    if (name && email && password) {
      try {
        console.log('agya')
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log(userCredential)

        // Update user profile with name
        await updateProfile(userCredential.user, {
          displayName: name,
        });
  
        Alert.alert('Signup Successful', 'You can now log in.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]
      );

      navigation.navigate('Login');
      } catch (error) {
        Alert.alert('Signup Error', error.message);
      }
    } else {
      Alert.alert('Error', 'Please fill all fields.');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#ffffff', '#e0e0e0']} style={styles.background}>
        <View style={styles.logoContainer}>
          <BouncingBall /> {/* Keep original component */}
          <CricketBall size={100} /> {/* Keep original component */}
          <Text style={styles.title}>Signup</Text>
          <Text style={styles.promptText}>
            Please fill up the details...
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Icon
            name="account-outline"
            size={20}
            color="#666"
            style={styles.icon}
          />
          <TextInput
            placeholder="Name"
            placeholderTextColor="#666"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon
            name="email-outline"
            size={20}
            color="#666"
            style={styles.icon}
          />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#666"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon
            name="lock-outline"
            size={20}
            color="#666"
            style={styles.icon}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#666"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
        </View>

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

export default Signup;
