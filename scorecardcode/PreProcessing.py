import cv2
import numpy as np

def preprocess_image_for_ocr(cropped_img):
    """
    Preprocessing pipeline optimized for extracting numbers from a scorecard.
    :param cropped_img: Cropped region of the scorecard containing numbers.
    :return: Preprocessed image ready for OCR.
    """
    # Step 1: Convert to grayscale
    gray_img = cv2.cvtColor(cropped_img, cv2.COLOR_BGR2GRAY)

    # Step 2: Apply adaptive thresholding
    thresh_img = cv2.adaptiveThreshold(
        gray_img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )

    # Step 3: Denoise the image (optional)
    denoised_img = cv2.fastNlMeansDenoising(thresh_img, h=30)

    # Step 4: Apply a slight Gaussian blur to smoothen edges
    smoothed_img = cv2.GaussianBlur(denoised_img, (3, 3), 0)

    # Step 5: Invert the colors (if OCR requires white text on black background)
    inverted_img = cv2.bitwise_not(smoothed_img)

    return inverted_img
