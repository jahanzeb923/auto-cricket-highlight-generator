def detect_highlights(text, frame_number, fps, previous_runs, previous_wickets):
    """
    Detect highlights based on OCR text.
    """
    highlights = []

    try:
        current_runs, current_wickets = map(int, text.split("-"))

        # Debug: Print current runs and wickets
        print(f"Frame {frame_number}: Runs: {current_runs}, Wickets: {current_wickets}")

        highlight_type = None
        start_time = max(0, (frame_number / fps) - 8)
        end_time = (frame_number / fps) + 8

        # Check for wickets
        if current_wickets > previous_wickets and (current_wickets - previous_wickets) == 1:
            highlight_type = "Wicket"

        # Check for boundaries or sixes
        if current_runs > previous_runs:
            run_difference = current_runs - previous_runs
            if run_difference == 4:
                highlight_type = "Boundary"
            elif run_difference == 6:
                highlight_type = "Six"

        if highlight_type:
            print(f"Detected Highlight: {highlight_type}")
            highlights.append({
                "type": highlight_type,
                "frame_number": frame_number,
                "start_time": start_time,
                "end_time": end_time
            })

        return highlights, current_runs, current_wickets

    except ValueError:
        print("Error: Invalid OCR text format.")
        return highlights, previous_runs, previous_wickets


def remove_redundant_events(highlights):
    """
    Remove overlapping or redundant events based on timestamps.
    """
    filtered_highlights = []
    last_end_time = -1

    # Sort highlights by start time
    for highlight in sorted(highlights, key=lambda x: x['start_time']):
        # Add highlight only if it doesn't overlap with the last event
        if highlight['start_time'] > last_end_time:
            filtered_highlights.append(highlight)
            last_end_time = highlight['end_time']

    return filtered_highlights
