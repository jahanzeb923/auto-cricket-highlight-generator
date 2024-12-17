import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Home = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Icon name="cricket" size={40} color="#FFD700" style={styles.icon} />
          <Text style={styles.title}>Cricket Highlights Generator</Text>
        </View>
        <Text style={styles.subtitle}>
          Explore and create stunning cricket highlights effortlessly!
        </Text>
      </View>

      {/* Thumbnails Section */}
      <View style={styles.thumbnails}>
        {/* Generate Highlights Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('UploadVideo')} // Navigate to UploadVideo
        >
          <Icon name="video" size={40} color="#FFD700" style={styles.cardIcon} />
          <Image
            source={require('../images/highlights.png')} // Local image for Generate Highlights
            style={styles.cardImage}
          />
          <Text style={styles.cardText}>Generate Highlights</Text>
        </TouchableOpacity>

        {/* My Album Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Album')} // Navigate to AlbumScreen
        >
          <Icon name="folder-image" size={40} color="#FFD700" style={styles.cardIcon} />
          <Image
            source={require('../images/album.png')} // Local image for My Album
            style={styles.cardImage}
          />
          <Text style={styles.cardText}>My Album</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Dark background
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700', // Gold color for the title
  },
  subtitle: {
    fontSize: 16,
    color: '#AAA', // Light gray for the subtitle
    textAlign: 'center',
    marginTop: 10,
  },
  thumbnails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  card: {
    width: '45%',
    backgroundColor: '#222', // Dark card background
    borderRadius: 10,
    marginBottom: 20,
    elevation: 4,
    alignItems: 'center',
    padding: 10,
  },
  cardIcon: {
    marginBottom: 10,
  },
  cardImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFD700', // Gold border for images
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700', // Gold color for card text
    textAlign: 'center',
  },
});

export default Home;
