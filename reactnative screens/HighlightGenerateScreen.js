import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HighlightGenerateScreen = () => {
  const navigation = useNavigation();

  const handleUpload = () => {
    // Implement upload functionality (e.g., open gallery)
    alert('Implement upload functionality');
  };

  const handleGenerate = () => {
    // Implement generate highlight functionality
    alert('Implement generate highlight functionality');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Highlight Generate Screen</Text>

      <TouchableOpacity style={styles.button} onPress={handleUpload}>
        <Text style={styles.buttonText}>Upload Video</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleGenerate}>
        <Text style={styles.buttonText}>Generate Highlights</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Album')}>
        <Text style={styles.buttonText}>Go to Album</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#333',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HighlightGenerateScreen;
