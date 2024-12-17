import os
import pickle
import time
import cv2
import numpy as np
import subprocess
from keras import applications
from keras.applications.vgg19 import preprocess_input
from tensorflow.keras.utils import img_to_array
from keras.models import Model

#-------------------------------------
# Setup Paths
#-------------------------------------
model_load_path = os.path.abspath('G:/HighlightesGenerator(VGG)/fyp/models/vgg19_svm')
test_video_path = os.path.abspath('G:/HighlightesGenerator(VGG)/fyp/match_video1.mp4')
video_summary_save_path = os.path.abspath('G:/HighlightesGenerator(VGG)/fyp/result')

if not os.path.exists(video_summary_save_path):
    os.makedirs(video_summary_save_path)

highlight_video_path = os.path.join(video_summary_save_path, 'highlight_video.mp4')  # We'll use mp4 for final output

if not highlight_video_path:
    print("Error: Video save path is invalid.")
    exit()

start_time = time.time()

#-------------------------------------
# Load Models
#-------------------------------------
base_model = applications.vgg19.VGG19(include_top=True, weights='imagenet', input_tensor=None,
                                      input_shape=None, pooling=None, classes=1000)
model = Model(inputs=base_model.input, outputs=base_model.get_layer('fc1').output)

loaded_model1 = pickle.load(open(f'{model_load_path}/model1_vgg19_svm.sav', 'rb'))
loaded_model2 = pickle.load(open(f'{model_load_path}/model2_vgg19_svm.sav', 'rb'))

#-------------------------------------
# Open Video and Prepare for Feature Extraction
#-------------------------------------
vidcap = cv2.VideoCapture(f'{test_video_path}')
if not vidcap.isOpened():
    print("Error: Could not open video.")
    exit()

fps = vidcap.get(cv2.CAP_PROP_FPS)
if fps <= 0:
    fps = 25.0  # fallback, if for some reason FPS is 0 or not found

count = 0
bufferCount = 0

buffer = []
th = 5         # Classification threshold
buff_th = 250  # Number of frames in each buffer segment
globalCounters = {'noball': 0, 'out': 0, 'six': 0, 'wide': 0, 'noaction': 0}

# We will store segments of highlights here as (start_frame, end_frame)
highlight_segments = []
segment_start_frame = None

#-------------------------------------
# Read Frames and Classify
#-------------------------------------
while True:
    success, img = vidcap.read()
    if not success:
        print("End of video or error reading frame.")
        break

    count += 1
    bufferCount += 1
    buffer.append(img)

    # Preprocess for VGG19
    img1 = cv2.resize(img, (224, 224))
    x = img_to_array(img1)
    x = np.expand_dims(x, axis=0)
    x = preprocess_input(x)

    # Extract features
    features = model.predict(x)
    predicted_values = loaded_model1.predict(features.reshape(1, -1))

    if predicted_values == 2:
        predicted_values_2 = loaded_model2.predict(features.reshape(1, -1))
        choices = {'1': 'noball', '2': 'out', '3': 'six', '4': 'wide', '5': 'noaction'}
        result = choices.get(str(int(predicted_values_2[0])), 'default')
        if result in globalCounters:
            globalCounters[result] += 1

    # If we've reached the buffer threshold, decide if this segment is a highlight
    if bufferCount == buff_th:
        action = max(globalCounters, key=globalCounters.get)
        if globalCounters[action] > th and action != 'noaction':
            # This segment qualifies as a highlight
            segment_end_frame = count
            segment_start_frame = count - buff_th + 1  # inclusive start frame of this segment
            highlight_segments.append((segment_start_frame, segment_end_frame))

        # Reset counters and buffer
        bufferCount = 0
        globalCounters = {key: 0 for key in globalCounters}
        buffer = []

# Process any leftover frames in the buffer after the loop
if buffer:
    action = max(globalCounters, key=globalCounters.get)
    if globalCounters[action] > th and action != 'noaction':
        # Last partial segment is also highlight
        segment_end_frame = count
        segment_start_frame = count - len(buffer) + 1
        highlight_segments.append((segment_start_frame, segment_end_frame))

vidcap.release()

#-------------------------------------
# Use ffmpeg to Extract and Combine Highlight Segments with Audio
#-------------------------------------
if not highlight_segments:
    print("No highlights were detected or saved.")
else:
    # Create temporary directory for segments
    segments_dir = os.path.join(video_summary_save_path, 'temp_segments')
    if not os.path.exists(segments_dir):
        os.makedirs(segments_dir)

    # Prepare a text file for ffmpeg concatenation
    concat_list_path = os.path.join(video_summary_save_path, 'segments.txt')
    with open(concat_list_path, 'w') as f:
        # For each highlight segment, we extract that portion from the original video
        segment_index = 0
        for (start_frame, end_frame) in highlight_segments:
            segment_index += 1
            start_time_sec = (start_frame - 1) / fps
            end_time_sec = (end_frame - 1) / fps
            duration = end_time_sec - start_time_sec

            segment_path = os.path.join(segments_dir, f'segment_{segment_index}.mp4')

            # Use ffmpeg to extract the segment:
            # -ss to seek to start time, -t for duration
            # Using -c copy to avoid re-encoding (must seek with accuracy or consider re-encoding if needed)
            command = [
                'ffmpeg', '-y', '-hide_banner', '-loglevel', 'error',
                '-ss', str(start_time_sec),
                '-i', test_video_path,
                '-t', str(duration),
                '-c', 'copy',
                segment_path
            ]
            subprocess.run(command, check=True)
            f.write(f"file '{segment_path}'\n")

    # Now concatenate all segments
    # Use ffmpeg concat demuxer
    final_command = [
        'ffmpeg', '-y', '-hide_banner', '-loglevel', 'error',
        '-f', 'concat', '-safe', '0',
        '-i', concat_list_path,
        '-c', 'copy',
        highlight_video_path
    ]
    subprocess.run(final_command, check=True)

    print(f'Highlight video with audio saved at {highlight_video_path}')

print(f'Summarizing Video Completed.')
print(f'--- {time.time() - start_time} seconds ---')
