import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AlbumScreen = () => {
  // Dummy data for saved videos
  const savedVideos = [
    { id: '1', title: 'Match Highlights - Team A vs Team B' },
    { id: '2', title: 'Final Match Highlights' },
    { id: '3', title: 'Tournament Best Moments' },
    { id: '4', title: 'Player of the Match Performances' },
  ];

  // Dummy data for umpire detection
  const umpireDetection = [
    { id: '1', title: 'Umpire Decisions - Match A' },
    { id: '2', title: 'Umpire Review Compilation' },
  ];

  // Dummy data for scorecard detection
  const scorecardDetection = [
    { id: '1', title: 'Scorecard Overview - Match A' },
    { id: '2', title: 'Scorecard Analysis Compilation' },
  ];

  const renderVideoCard = ({ item }) => (
    <View style={styles.card}>
      <Icon name="play-circle" size={40} color="#FFD700" style={styles.cardIcon} />
      <Text style={styles.cardText}>{item.title}</Text>
    </View>
  );

  const renderSection = (title, data) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={data}
        renderItem={renderVideoCard}
        keyExtractor={(item) => item.id}
        horizontal={true}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Icon name="folder-image" size={40} color="#FFD700" style={styles.icon} />
          <Text style={styles.title}>My Album</Text>
        </View>
        <Text style={styles.subtitle}>Browse your saved cricket highlights below.</Text>
      </View>

      {/* Saved Videos Section */}
      {renderSection('Saved Highlights', savedVideos)}

      {/* Umpire Detection Section */}
      {renderSection('Umpire Detection', umpireDetection)}

      {/* Scorecard Detection Section */}
      {renderSection('Scorecard Detection', scorecardDetection)}

      {/* Upload Video Button */}
      <TouchableOpacity style={styles.uploadButton} onPress={() => alert('Upload functionality coming soon!')}>
        <Icon name="video-plus" size={24} color="#fff" style={styles.uploadIcon} />
        <Text style={styles.uploadText}>Upload Video</Text>
      </TouchableOpacity>
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
    marginBottom: 20,
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700', // Gold color for section titles
    marginBottom: 10,
  },
  horizontalList: {
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222', // Dark card background
    borderRadius: 10,
    padding: 15,
    marginRight: 15,
  },
  cardIcon: {
    marginRight: 15,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700', // Gold color for card text
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700', // Gold button color
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
  },
  uploadIcon: {
    marginRight: 10,
  },
  uploadText: {
    color: '#000', // Black text for contrast
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AlbumScreen;
