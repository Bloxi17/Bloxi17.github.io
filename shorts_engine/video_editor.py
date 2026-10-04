import os
import subprocess
import json
from config import FFMPEG_PATH, FFPROBE_PATH, OUTPUT_DIR

# Windows standard font paths for guaranteed rendering without fontconfig issues
FONT_IMPACT = "C\\:/Windows/Fonts/impact.ttf"
FONT_ARIAL_BOLD = "C\\:/Windows/Fonts/arialbd.ttf"
FONT_ARIAL = "C\\:/Windows/Fonts/arial.ttf"

def get_media_info(filepath: str):
    """Returns width, height, and duration of media file using ffprobe."""
    cmd = [
        FFPROBE_PATH,
        "-v", "error",
        "-show_entries", "stream=width,height,duration",
        "-show_entries", "format=duration",
        "-of", "json",
        filepath
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    data = json.loads(result.stdout)
    
    duration = 0.0
    if "format" in data and "duration" in data["format"]:
        duration = float(data["format"]["duration"])
    elif "streams" in data and len(data["streams"]) > 0:
        for s in data["streams"]:
            if "duration" in s:
                duration = float(s["duration"])
                break
                
    width, height = 1920, 1080
    if "streams" in data:
        for s in data["streams"]:
            if "width" in s and "height" in s:
                width = int(s["width"])
                height = int(s["height"])
                break
                
    return {"width": width, "height": height, "duration": duration}

def build_short_video(
    video_input: str,
    voice_audio_input: str,
    subtitles_ass_path: str,
    output_path: str,
    header_title: str = "TOP 3 SATISFYING CLIPS",
    badge_label: str = "NO. 1 BEST MOMENT",
    max_duration: float = None
):
    """
    Assembles a high-retention 9:16 YouTube Short using FFmpeg:
    1. 9:16 Canvas (1080x1920)
    2. Blurred ambient background for landscape clips + centered original clip
    3. High-contrast Top Header Banner (Yellow/Black)
    4. Floating countdown badge
    5. Bottom animated progress bar
    6. Rapid word-level animated subtitles (ASS)
    7. Clean audio export with high-quality AAC
    """
    voice_info = get_media_info(voice_audio_input)
    target_duration = voice_info["duration"]
    if max_duration and max_duration < target_duration:
        target_duration = max_duration
        
    target_duration = max(target_duration, 1.0)
    print(f"Target video duration: {target_duration:.2f} seconds")
    
    # Path escaping for Windows FFmpeg filter
    escaped_ass = subtitles_ass_path.replace("\\", "/").replace(":", "\\:")
    
    # Filter complex using exact Windows font files
    # Note: escape special chars in text
    safe_header = header_title.replace("'", "").replace(":", "")
    safe_badge = badge_label.replace("'", "").replace(":", "")
    
    filter_complex = (
        # 1. Background layer: scale to fill 1080x1920, boxblur and darken
        f"[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5,eq=brightness=-0.3[bg];"
        # 2. Foreground layer: scale to width 1080
        f"[0:v]scale=1080:-2:force_original_aspect_ratio=decrease[fg];"
        # 3. Overlay centered vertically
        f"[bg][fg]overlay=(W-w)/2:(H-h)/2[base];"
        # 4. Top Yellow Header Box
        f"[base]drawbox=x=40:y=200:w=1000:h=120:color=0xFFE600@1:t=fill[b1];"
        f"[b1]drawbox=x=36:y=196:w=1008:h=128:color=0x000000@1:t=4[b2];"
        f"[b2]drawtext=text='{safe_header}':fontfile='{FONT_IMPACT}':fontsize=58:fontcolor=black:x=(w-text_w)/2:y=230[b3];"
        # 5. Countdown Pill Badge
        f"[b3]drawbox=x=60:y=520:w=420:h=74:color=0xFF2222@0.95:t=fill[b4];"
        f"[b4]drawbox=x=56:y=516:w=428:h=82:color=white@1:t=3[b5];"
        f"[b5]drawtext=text='{safe_badge}':fontfile='{FONT_ARIAL_BOLD}':fontsize=38:fontcolor=white:x=85:y=538[b6];"
        # 6. Animated Bottom Progress Bar
        f"[b6]drawbox=x=0:y=1900:w='1080*(t/{target_duration:.2f})':h=16:color=0xFFE600@1:t=fill[b7];"
        # 7. Burn ASS Subtitles
        f"[b7]ass='{escaped_ass}'[vfinal]"
    )
    
    cmd = [
        FFMPEG_PATH,
        "-y",
        "-stream_loop", "-1",
        "-i", video_input,
        "-i", voice_audio_input,
        "-filter_complex", filter_complex,
        "-map", "[vfinal]",
        "-map", "1:a",
        "-t", f"{target_duration:.2f}",
        "-c:v", "libx264",
        "-preset", "faster",
        "-crf", "18",
        "-c:a", "aac",
        "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        output_path
    ]
    
    print(f"Rendering short to: {output_path}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"[FFmpeg Error]:\n{result.stderr}")
        raise RuntimeError(f"FFmpeg failed with exit code {result.returncode}")
        
    print(f"[SUCCESS] Final YouTube Short generated: {output_path}")
    return output_path

if __name__ == "__main__":
    sample_video = r"g:\Portfolio ainesh\background.mp4"
    sample_voice = os.path.join(OUTPUT_DIR, "test_voice.mp3")
    sample_ass = os.path.join(OUTPUT_DIR, "test_subtitles.ass")
    final_output = os.path.join(OUTPUT_DIR, "final_short_preview.mp4")
    
    build_short_video(
        video_input=sample_video,
        voice_audio_input=sample_voice,
        subtitles_ass_path=sample_ass,
        output_path=final_output,
        header_title="TOP 3 SATISFYING CLIPS",
        badge_label="RANK #1 SATISFYING"
    )
