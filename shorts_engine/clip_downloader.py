import os
import subprocess
import json
from config import ASSETS_DIR, FFMPEG_PATH

def search_clips(query: str, count: int = 3):
    """
    Searches the internet for high-quality video clips on a topic using yt-dlp.
    Returns list of dicts with title, url, duration, and id.
    """
    search_term = f"ytsearch{count}:{query}"
    cmd = [
        "python", "-m", "yt_dlp",
        search_term,
        "--flat-playlist",
        "-J"
    ]
    print(f"Searching for clips: '{query}'...")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"[Search error]: {result.stderr}")
        return []
        
    try:
        data = json.loads(result.stdout)
        entries = data.get("entries", [])
        clips = []
        for e in entries:
            clips.append({
                "title": e.get("title", ""),
                "url": e.get("url") or f"https://www.youtube.com/watch?v={e.get('id')}",
                "duration": e.get("duration", 0),
                "id": e.get("id")
            })
        return clips
    except Exception as err:
        print(f"[Parse error]: {err}")
        return []

def download_clip_snippet(url: str, start_time: str, duration: int, output_filename: str):
    """
    Downloads ONLY the needed segment (e.g. 10-15 seconds) directly using yt-dlp,
    saving bandwidth and download time.
    """
    if not output_filename.endswith(".mp4"):
        output_filename += ".mp4"
    out_path = os.path.join(ASSETS_DIR, output_filename)
    
    # Calculate end time or use download-sections
    # format: "*10-25" (from 10s to 25s)
    cmd = [
        "python", "-m", "yt_dlp",
        "--download-sections", f"*{start_time}-{int(start_time)+duration if start_time.isdigit() else duration}",
        "-f", "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best",
        "--merge-output-format", "mp4",
        "-o", out_path,
        "--force-overwrites",
        url
    ]
    print(f"Downloading snippet ({duration}s) from {url}...")
    subprocess.run(cmd, capture_output=True, text=True)
    return out_path if os.path.exists(out_path) else None

if __name__ == "__main__":
    results = search_clips("oddly satisfying cutting asmr", count=3)
    for idx, r in enumerate(results, 1):
        print(f"[{idx}] {r['title']} ({r['url']})")
