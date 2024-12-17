import cv2
import os

def extract_frames(video_path, output_folder, target_fps=2):
    """
    Extract frames from the video at the target FPS.
    :param video_path: Path to the input video file.
    :param output_folder: Path to save the extracted frames.
    :param target_fps: Frames per second to extract.
    """
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    cap = cv2.VideoCapture(video_path)
    original_fps = cap.get(cv2.CAP_PROP_FPS)  # Original FPS of the video
    frame_interval = int(original_fps / target_fps)  # How many frames to skip

    frame_count = 0
    frame_index = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Save frame every frame_int
        # erval
        if frame_index % frame_interval == 0:
            frame_filename = os.path.join(output_folder, f"frame_{frame_count}.jpg")
            cv2.imwrite(frame_filename, frame)
            frame_count += 1

        frame_index += 1

    cap.release()
