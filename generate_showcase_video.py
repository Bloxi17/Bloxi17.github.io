"""
Generate Showcase Video using Gemini API (gemini-omni-1.1-flash)
Adheres to the official gemini-api-dev skill guidelines.
"""

import os
import sys
from pathlib import Path

# Verify API Key
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("[ERROR] GEMINI_API_KEY environment variable is not set.")
    print("Please set your Gemini API key in your terminal before running this script:")
    print("  PowerShell: $env:GEMINI_API_KEY = 'your_api_key_here'")
    print("  CMD:        set GEMINI_API_KEY=your_api_key_here")
    print("Get your API key at: https://aistudio.google.com/app/apikey")
    sys.exit(1)

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("[INFO] Installing official google-genai SDK...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-U", "google-genai"])
    from google import genai
    from google.genai import types

def generate_video():
    client = genai.Client(api_key=api_key)

    reference_image_path = Path(__file__).parent / "showcase_assets" / "01_voyager_3d_showcase.jpg"
    output_video_path = Path(__file__).parent / "showcase_assets" / "voyager_3d_cinematic.mp4"

    print(f"🎬 Initiating video generation with gemini-omni-1.1-flash...")
    print(f"Using reference image: {reference_image_path}")

    # Read reference image bytes if available
    image_part = None
    if reference_image_path.exists():
        with open(reference_image_path, "rb") as f:
            image_bytes = f.read()
        image_part = types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg")

    prompt = (
        "In a single continuous, unbroken cinematic slow dolly shot, camera glides slowly past the NASA Voyager 1 "
        "spacecraft in interstellar deep space. The starlight glints off the golden high-gain antenna dish and metallic "
        "magnetometer boom. In the distant cosmic background, the rings of Saturn and swirling bands of Jupiter glow softly. "
        "Subtle green telemetry HUD reticles and orbital trajectory lines pulse smoothly with 60fps locked fluidity. "
        "No cuts, no transitions, hyper-realistic 3D WebGL museum quality."
    )

    inputs = [prompt]
    if image_part:
        inputs.append(image_part)

    try:
        interaction = client.interactions.create(
            model="gemini-omni-1.1-flash",
            input=inputs,
        )

        print(f"Interaction created (ID: {interaction.id})")
        
        # Check for output video or file link
        if hasattr(interaction, "output_video") and interaction.output_video:
            with open(output_video_path, "wb") as f:
                f.write(interaction.output_video.data)
            print(f"✅ Video successfully saved to: {output_video_path}")
        else:
            print("Response received:")
            print(interaction.output_text or interaction)

    except Exception as e:
        print(f"[!] Video generation call failed: {e}")
        print("\nNote: Video generation with gemini-omni-1.1-flash requires a Google Cloud / AI Studio account with billing enabled.")

if __name__ == "__main__":
    generate_video()
