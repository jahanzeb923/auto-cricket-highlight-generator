from moviepy.editor import VideoFileClip, concatenate_videoclips
import os


def save_highlight_clips(video_path, frames_to_include, output_dir):
    """
    Save clips in organized folders based on event types and create a sequential complete highlights video.
    """
    # Ensure subfolders for highlights exist
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(f"{output_dir}/Fours", exist_ok=True)
    os.makedirs(f"{output_dir}/Sixes", exist_ok=True)
    os.makedirs(f"{output_dir}/Wickets", exist_ok=True)

    video = VideoFileClip(video_path)
    complete_highlights = []  # List to store all highlight clips

    for frame in frames_to_include:
        subfolder = f"{output_dir}/{frame['type']}s"
        os.makedirs(subfolder, exist_ok=True)
        output_clip_path = os.path.join(subfolder,
                                        f"{frame['type']}_{frame['start_time']:.2f}-{frame['end_time']:.2f}.mp4")

        # Create individual clip
        clip = video.subclip(frame['start_time'], frame['end_time'])
        clip.write_videofile(output_clip_path, codec="libx264", audio_codec="aac")

        # Add clip to the complete highlights list
        complete_highlights.append(clip)

    # Generate the sequential complete highlights video
    if complete_highlights:
        complete_highlights_folder = os.path.join(output_dir, "Complete Highlights")
        os.makedirs(complete_highlights_folder, exist_ok=True)
        complete_highlights_path = os.path.join(complete_highlights_folder, "complete_highlights.mp4")

        # Concatenate all clips and save
        final_clip = concatenate_videoclips(complete_highlights, method="compose")
        final_clip.write_videofile(complete_highlights_path, codec="libx264", audio_codec="aac")
        print(f"Complete highlights video saved at {complete_highlights_path}")

    print(f"Highlight clips saved in {output_dir}")
