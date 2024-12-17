import cv2
import pytesseract

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"  # Update as needed

def preprocess_image_for_ocr(image):
    """
    Preprocess the image to improve OCR accuracy.
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)  # Convert to grayscale
    resized = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)  # Enlarge image
    _, binary = cv2.threshold(resized, 150, 255, cv2.THRESH_BINARY)  # Binary threshold
    return binary

def recognize_text_in_frame(frame_path, roi):
    """
    Recognize text from a frame using OCR.
    """
    img = cv2.imread(frame_path)
    if img is None:
        print(f"Error: Could not load frame {frame_path}")
        return ""

    # Crop ROI
    x, y, w, h = roi
    cropped = img[y:y+h, x:x+w]

    # Preprocess for OCR
    preprocessed = preprocess_image_for_ocr(cropped)

    # Debug: Display preprocessed image
    cv2.imshow("Preprocessed Image for OCR", preprocessed)
    cv2.waitKey(1)

    # Apply OCR
    config = "--psm 6"
    text = pytesseract.image_to_string(preprocessed, config=config).strip()

    # Validate runs-wickets format
    if "-" in text:
        parts = text.split("-")
        if len(parts) == 2 and parts[0].isdigit() and parts[1].isdigit():
            return text

    return ""
