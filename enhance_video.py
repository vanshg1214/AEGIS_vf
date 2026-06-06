import cv2
import numpy as np
import sys
import os
from moviepy import VideoFileClip

def enhance_frame(frame):
    """
    Enhance the clarity of a frame using Unsharp Masking mathematically strictly on the 
    Luminance block, perfectly preserving the hue and color fidelity.
    Uses MoviePy's RGB image representation.
    """
    # MoviePy gives RGB, OpenCV usually expects BGR. 
    # But since LAB conversion from RGB is supported by OpenCV, we can directly convert RGB -> LAB
    lab = cv2.cvtColor(frame, cv2.COLOR_RGB2LAB)
    
    # Split the LAB image into L, A and B channels
    # L = Lightness, A = Green/Red, B = Blue/Yellow
    l_channel, a_channel, b_channel = cv2.split(lab)
    
    # 1. Mild Denoising on the Luma channel to clean up compression artifacts without blur
    # using a quick median blur to remove salt & pepper noise.
    l_denoised = cv2.medianBlur(l_channel, 3)
    
    # 2. Unsharp Masking on the L channel to improve edge clarity and sharpness
    # Create the "unsharp" (blurred) version of the luma
    gaussian_blur = cv2.GaussianBlur(l_denoised, (0, 0), 2.0)
    
    # Add the details back to the original luma. 
    # formula: sharpened = original + (original - blurred) * amount
    # using addWeighted: cv2.addWeighted(src1, alpha, src2, beta, gamma)
    # alpha=1.5, beta=-0.5 gives a standard unsharp mask with amount=0.5
    l_sharpened = cv2.addWeighted(l_denoised, 1.5, gaussian_blur, -0.5, 0)
    
    # Limit pixel values strictly to 0-255 bounds
    l_sharpened = np.clip(l_sharpened, 0, 255).astype(np.uint8)
    
    # Merge the sharpened L channel back with the original A and B channels
    lab_merged = cv2.merge((l_sharpened, a_channel, b_channel))
    
    # Convert back to RGB format for MoviePy compatibility
    enhanced_rgb = cv2.cvtColor(lab_merged, cv2.COLOR_LAB2RGB)
    
    return enhanced_rgb

def process_video(input_path, output_path):
    print(f"Loading video: {input_path}")
    if not os.path.exists(input_path):
        print("Error: Input file does not exist.")
        return

    # Load the video file
    clip = VideoFileClip(input_path)
    
    print("Applying clarity enhancements without touching color/audio tone...")
    # Apply our custom OpenCV enhancement function to every frame of the video
    enhanced_clip = clip.image_transform(enhance_frame)
    
    print(f"Saving enhanced video to: {output_path}")
    # Write the video out. 
    # Specifying audio=True keeps the original audio without modifying its pitch or tone.
    # audio_codec='aac' ensures great compatibility.
    enhanced_clip.write_videofile(
        output_path,
        codec='libx264',
        audio_codec='aac',
        temp_audiofile='temp-audio.m4a',
        remove_temp=True,
        preset='fast',  # 'fast' or 'medium' for decent speed
        threads=4
    )
    
    clip.close()
    enhanced_clip.close()
    print("Video enhancement complete!")

if __name__ == "__main__":
    input_video = r"c:\Users\Sujal\Desktop\WebDEv\Video+Form\public\Rock final.mp4"
    output_video = r"c:\Users\Sujal\Desktop\WebDEv\Video+Form\public\Rock final_enhanced.mp4"
    
    process_video(input_video, output_video)
