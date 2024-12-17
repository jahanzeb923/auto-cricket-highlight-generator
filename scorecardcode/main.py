import os
from frame_extraction import extract_frames
from ocr_text_recognition import recognize_text_in_frame
from highlight_detection import detect_highlights, remove_redundant_events
from highlight_generation import save_highlight_clips
import cv2


def navigate_frames_for_roi(frame_folder):
    frame_files = sorted(
        [f for f in os.listdir(frame_folder) if f.endswith((".jpg", ".png"))]
    )
    if not frame_files:
        raise ValueError("No frames found in the folder for ROI selection.")

    frame_index = 0
    while True:
        frame_path = os.path.join(frame_folder, frame_files[frame_index])
        frame = cv2.imread(frame_path)
        cv2.imshow("Navigate Frames", frame)
        key = cv2.waitKey(0)
        if key == 27:  # Esc
            cv2.destroyAllWindows()
            raise ValueError("ROI selection cancelled.")
        elif key == 13:  # Enter
            roi = cv2.selectROI("Select ROI", frame, fromCenter=False, showCrosshair=True)
            cv2.destroyAllWindows()
            return roi
        elif key == ord('a') or key == 81:  # Left
            frame_index = (frame_index - 1) % len(frame_files)
        elif key == ord('d') or key == 83:  # Right
            frame_index = (frame_index + 1) % len(frame_files)


def generate_cricket_highlights(video_path, output_folder, roi):
    extracted_frames_folder = "G:/HIghlightesGenerator(ScoreCard)/ScoreCard/extracted_frames"
    fps = 2

    previous_runs, previous_wickets = 0, 0
    highlights = []

    frame_files = sorted(
        [f for f in os.listdir(extracted_frames_folder) if f.endswith((".jpg", ".png"))],
        key=lambda x: int(x.split("_")[1].split(".")[0])
    )

    for frame_index, frame_filename in enumerate(frame_files):
        frame_path = os.path.join(extracted_frames_folder, frame_filename)
        text = recognize_text_in_frame(frame_path, roi)
        print(f"Frame {frame_index}: Detected OCR Text: {text}")
        if text:
            detected_highlights, previous_runs, previous_wickets = detect_highlights(
                text, frame_index, fps, previous_runs, previous_wickets
            )
            highlights.extend(detected_highlights)

    print(f"Total Highlights Detected: {len(highlights)}")
    for highlight in highlights:
        print(f"Highlight: {highlight}")

    save_highlight_clips(video_path, highlights, output_folder)


if __name__ == "__main__":
    video_path = "G:/HIghlightesGenerator(ScoreCard)/ScoreCard/input/match_video.mp4"
    extracted_frames_folder = "G:/HIghlightesGenerator(ScoreCard)/ScoreCard/extracted_frames"
    output_folder = "G:/HIghlightesGenerator(ScoreCard)/ScoreCard/outputs"

    print("Step 1: Extracting frames...")
    extract_frames(video_path, extracted_frames_folder, target_fps=2)
    print(f"Frames extracted to {extracted_frames_folder}.")

    print("Step 2: Selecting ROI...")
    roi = navigate_frames_for_roi(extracted_frames_folder)
    print(f"Selected ROI: {roi}")

    print("Step 3: Generating highlights...")
    generate_cricket_highlights(video_path, output_folder, roi)
    print(f"Highlight generation complete! Clips saved in {output_folder}.")
