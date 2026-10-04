import os
import shutil

# Try finding ffmpeg in PATH, otherwise use the winget Gyan.FFmpeg installation path
WINGET_BIN = r"C:\Users\Mridul\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build\bin"

FFMPEG_PATH = shutil.which("ffmpeg") or os.path.join(WINGET_BIN, "ffmpeg.exe")
FFPROBE_PATH = shutil.which("ffprobe") or os.path.join(WINGET_BIN, "ffprobe.exe")

# Automatically inject into PATH for all subprocesses
if os.path.exists(WINGET_BIN) and WINGET_BIN not in os.environ.get("PATH", ""):
    os.environ["PATH"] = WINGET_BIN + os.pathsep + os.environ.get("PATH", "")

# Directory configurations
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
ASSETS_DIR = os.path.join(BASE_DIR, "assets")
CURATED_DIR = os.path.join(BASE_DIR, "curated_clips")

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(ASSETS_DIR, exist_ok=True)
os.makedirs(CURATED_DIR, exist_ok=True)

if __name__ == "__main__":
    print(f"FFMPEG found at: {FFMPEG_PATH} (exists: {os.path.exists(FFMPEG_PATH)})")
    print(f"FFPROBE found at: {FFPROBE_PATH} (exists: {os.path.exists(FFPROBE_PATH)})")
    print(f"CURATED_DIR ready at: {CURATED_DIR}")
