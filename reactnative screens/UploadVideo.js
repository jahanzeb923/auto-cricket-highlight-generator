import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Dimensions,
  PanResponder,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BouncingBall from './BouncingBall';
import CricketBall from './CricketBall';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const UploadVideo = () => {
  const [videoURL, setVideoURL] = useState('');
  const [video, setVideo] = useState(null);
  const [status, setStatus] = useState({});
  const [roiSelection, setRoiSelection] = useState(null);
  
  // Model selection
  const [selectedModel, setSelectedModel] = useState(null);

  // ROI Modal and States
  const [isRoiMode, setIsRoiMode] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [videoLayout, setVideoLayout] = useState(null);

  const videoRef = useRef(null);

  // Request media library permission
  useEffect(() => {
    (async () => {
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission required',
            'We need camera roll permissions to make this work!'
          );
        }
        console.log('Media library permission status:', status);
      } catch (error) {
        console.error('Error requesting permissions:', error);
        Alert.alert('Error', 'Failed to request permissions');
      }
    })();
  }, []);

  const handleGenerate = async (finalROI = null) => {
    if (!video) {
      Alert.alert('No Video Selected', 'Please select a video before generating highlights.');
      return;
    }

    // If the selected model requires ROI and none is selected, alert the user
    if (selectedModel === 'scorecard' && !finalROI && !roiSelection) {
      Alert.alert('ROI Required', 'Please select a Region of Interest (ROI) before generating highlights.');
      return;
    }

    const usedROI = finalROI || roiSelection;

    try {
      const formData = new FormData();
      formData.append('video', {
        uri: video,
        name: 'uploaded_video.mp4',
        type: 'video/mp4',  
      });

      // Append ROI information only if available
      if (usedROI) {
        formData.append('roi', JSON.stringify(usedROI));
      }

      const response = await fetch('http://192.168.100.26:8000/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', errorText);
        Alert.alert('Error Uploading', 'Failed to upload video. Please check the server logs.');
        return;
      }

      const data = await response.json();
      console.log('Server response:', data);
      Alert.alert('Success', 'Your video has been successfully uploaded and processed!');
    } catch (error) {
      console.error('Error uploading video:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }

    // Reset after upload
    setSelectedModel(null);
    setRoiSelection(usedROI);
  };

  const handleBrowse = async ()  => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const videoUri = result.assets[0].uri;
        setVideo(videoUri);
        // Reset ROI and model when new video is selected
        setRoiSelection(null);
        setSelectedModel(null);
      } else {
        console.log('User cancelled video picker');
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const handleURLChange = (text) => {
    setVideoURL(text);
  };

  const startROISelection = async () => {
    if (!video) {
      Alert.alert('No Video', 'Please select a video first');
      return;
    }
    setIsRoiMode(true);
    setStartPoint(null);
    setEndPoint(null);
  };

  // When the user selects the Scorecard model
  const selectScorecardModel = async () => {
    setSelectedModel('scorecard');
    // Show the ROI modal
    await startROISelection();
  };

  // When the user selects the Umpire model
  const selectUmpireModel = async () => {
    setSelectedModel('umpire');
    // Umpire model does not require ROI selection. Directly call handleGenerate.
    await handleGenerate();
  };

  const finishROISelection = async () => {
    // Only finalize ROI if we have start and end points
    let finalROI = null;
    if (startPoint && endPoint) {
      finalROI = {
        x: Math.min(startPoint.x, endPoint.x),
        y: Math.min(startPoint.y, endPoint.y),
        width: Math.abs(endPoint.x - startPoint.x),
        height: Math.abs(endPoint.y - startPoint.y)
      };
      setRoiSelection(finalROI);
    }

    setIsRoiMode(false);

    // Once ROI is done and this is for scorecard
    if (selectedModel === 'scorecard') {
      // Pass the finalROI directly to handleGenerate
      Alert.alert('Processing', "The processed video will be added to the Albums folder")
      await handleGenerate(finalROI);
    }
  };

  const redoROI = () => {
    // Reset points and ROI for new selection
    setStartPoint(null);
    setEndPoint(null);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => isRoiMode,
    onMoveShouldSetPanResponder: () => isRoiMode,
    onPanResponderGrant: (evt) => {
      if (!isRoiMode || !videoLayout) return;
      const { locationX, locationY } = evt.nativeEvent;

      // Clamp to video frame
      const clampedX = Math.max(0, Math.min(locationX, videoLayout.width));
      const clampedY = Math.max(0, Math.min(locationY, videoLayout.height));

      setStartPoint({ x: clampedX, y: clampedY });
      setEndPoint({ x: clampedX, y: clampedY });
    },
    onPanResponderMove: (evt) => {
      if (!isRoiMode || !startPoint || !videoLayout) return;
      const { locationX, locationY } = evt.nativeEvent;

      // Clamp to video frame
      const clampedX = Math.max(0, Math.min(locationX, videoLayout.width));
      const clampedY = Math.max(0, Math.min(locationY, videoLayout.height));

      setEndPoint({ x: clampedX, y: clampedY });
    },
    onPanResponderRelease: () => {
      // Finalization happens on pressing Done
    },
  });

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#111111']} style={styles.background}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <BouncingBall size={80} color="#D32F2F" />
            <CricketBall size={100} color="#D32F2F" />
            <Text style={styles.title}>Cricket Highlights Generator</Text>
            <Text style={styles.description}>
              Welcome to the Cricket Highlights Generator. Generate highlights
              from your favorite cricket videos instantly!
            </Text>
          </View>

          {/* Video Upload Section */}
          <View style={styles.videoContainer}>
            <View style={styles.videoWrapper}>
              {video ? (
                <Video
                  ref={videoRef}
                  source={{ uri: video }}
                  style={styles.thumbnail}
                  resizeMode="contain"
                  isLooping
                  onPlaybackStatusUpdate={(status) => setStatus(() => status)}
                  useNativeControls={!isRoiMode}
                />
              ) : (
                <View style={[styles.thumbnail, styles.placeholderContainer]}>
                  <Text style={styles.placeholderText}>No video selected</Text>
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Enter video directory URL"
                placeholderTextColor="#666"
                style={styles.input}
                value={videoURL}
                onChangeText={handleURLChange}
              />
              <TouchableOpacity
                style={styles.browseButton}
                onPress={handleBrowse}>
                <Text style={styles.buttonText}>Browse</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Show ROI info only if ROI is selected */}
          {roiSelection && (
            <View style={styles.roiContainer}>
              <Text style={styles.roiText}>
                ROI Selected: x:{roiSelection.x.toFixed(0)}, y:{roiSelection.y.toFixed(0)}, 
                width:{roiSelection.width.toFixed(0)}, height:{roiSelection.height.toFixed(0)}
              </Text>
            </View>
          )}

          {/* Model Selection Section */}
          <View style={styles.modelSelectionContainer}>
            <Text style={styles.modelSelectionTitle}>
              Select a Model for Highlights
            </Text>
            <View style={styles.thumbnailsContainer}>
              <TouchableOpacity 
                style={styles.modelCard}
                onPress={selectScorecardModel}
              >
                <Image
                  source={require('../images/scorecard.png')}
                  style={styles.modelThumbnail}
                />
                <Text style={styles.modelText}>Scorecard Detection</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modelCard} onPress={selectUmpireModel}>
                <Image
                  source={require('../images/umpire.png')}
                  style={styles.modelThumbnail}
                />
                <Text style={styles.modelText}>Umpire Detection</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Full Screen ROI Selection Modal */}
      <Modal
        visible={isRoiMode}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsRoiMode(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalVideoContainer}>
            {video && (
              <Video
                ref={videoRef}
                source={{ uri: video }}
                style={styles.modalVideo}
                resizeMode="contain"
                isLooping={false}
                shouldPlay={false}
                useNativeControls={false}
                onPlaybackStatusUpdate={(status) => setStatus(() => status)}
                onReadyForDisplay={async () => {
                  if (videoRef.current) {
                    await videoRef.current.pauseAsync();
                  }
                }}
                onLayout={(event) => {
                  const layout = event.nativeEvent.layout;
                  setVideoLayout({
                    x: layout.x,
                    y: layout.y,
                    width: layout.width,
                    height: layout.height
                  });
                }}
              />
            )}
            {video && (
              <View
                style={[styles.overlayContainer]}
                {...panResponder.panHandlers}
              >
                {/* Current drawing ROI */}
                {startPoint && endPoint && (
                  <View
                    style={[
                      styles.roiOverlay,
                      {
                        left: Math.min(startPoint.x, endPoint.x),
                        top: Math.min(startPoint.y, endPoint.y),
                        width: Math.abs(endPoint.x - startPoint.x),
                        height: Math.abs(endPoint.y - startPoint.y),
                      },
                    ]}
                  />
                )}
              </View>
            )}
          </View>

          <View style={styles.modalControls}>
            <Text style={styles.instructionText}>
              Drag to select the score region
            </Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={redoROI} style={styles.redoButton}>
                <Text style={styles.redoButtonText}>Redo ROI</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={finishROISelection} style={styles.doneButton}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  placeholderContainer: {
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
    marginHorizontal: 30,
  },
  videoContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  videoWrapper: {
    width: 300,
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
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
  input: {
    flex: 1,
    height: 50,
    color: '#333',
  },
  browseButton: {
    backgroundColor: '#333',
    paddingVertical: 15,
    borderRadius: 25,
    width: 100,
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modelSelectionContainer: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modelSelectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  thumbnailsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginTop: 10,
  },
  modelCard: {
    width: 150,
    height: 180,
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modelThumbnail: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  modelText: {
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
    fontSize: 12,
  },
  roiContainer: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  roiText: {
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
  },
  roiOverlay: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'red',
    backgroundColor: 'rgba(255,0,0,0.2)',
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalVideoContainer: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.5,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  modalVideo: {
    width: '100%',
    height: '100%',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  modalControls: {
    marginTop: 20,
    width: SCREEN_WIDTH * 0.9,
    flexDirection: 'column',
    alignItems: 'center',
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  redoButton: {
    backgroundColor: '#444',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  redoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  doneButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default UploadVideo;
