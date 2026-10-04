import os
import sys
import subprocess
import json
import re
import glob

# Ensure UTF-8 output
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from config import CURATED_DIR, ASSETS_DIR, FFMPEG_PATH

def sanitize_filename(name: str) -> str:
    """Removes invalid filename characters."""
    return re.sub(r'[\\/*?:"<>|]', "", name).strip().replace(" ", "_")[:40]

def download_media_from_url(url: str, output_dir: str = None, filename: str = None, max_duration: int = 40) -> str:
    """
    Universal downloader for YouTube, TikTok, Facebook, Pinterest, Instagram, Reddit, etc.
    """
    if not output_dir:
        output_dir = CURATED_DIR
    os.makedirs(output_dir, exist_ok=True)
    
    if not filename:
        filename = f"clip_{os.urandom(4).hex()}"
    if not filename.endswith(".mp4"):
        filename += ".mp4"
        
    out_template = os.path.join(output_dir, filename)
    
    user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    
    cmd = [
        "python", "-m", "yt_dlp",
        "--user-agent", user_agent,
        "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "--merge-output-format", "mp4",
        "--no-playlist",
        "-o", out_template,
        "--force-overwrites",
        url
    ]
    
    print(f"[*] Downloading media from: {url}")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"[!] Warning on primary format: {res.stderr[:200]}")
        cmd_fallback = [
            "python", "-m", "yt_dlp",
            "--user-agent", user_agent,
            "-f", "best",
            "--recode-video", "mp4",
            "-o", out_template,
            url
        ]
        res_fb = subprocess.run(cmd_fallback, capture_output=True, text=True)
        if res_fb.returncode != 0:
            raise RuntimeError(f"Could not download from URL: {url}\nError: {res_fb.stderr}")
            
    print(f"[OK] Downloaded successfully to: {out_template}")
    return out_template

def curate_trending_clips(count: int = 6, topic: str = "oddly satisfying 4k asmr cutting"):
    """
    Searches and downloads top trending clips for any topic into curated_clips.
    Includes robust fallback to local clips if network or extraction encounters limits.
    """
    os.makedirs(CURATED_DIR, exist_ok=True)
    count = max(6, int(count))
    print(f"[*] Curating {count} top clips for topic: '{topic}'...")
    
    downloaded_paths = []
    
    try:
        cmd = [
            "python", "-m", "yt_dlp",
            f"ytsearch{count * 2}:{topic}",
            "--flat-playlist",
            "-J"
        ]
        res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
        if res.returncode == 0:
            data = json.loads(res.stdout)
            entries = data.get("entries", [])
            clip_num = 1
            
            for entry in entries:
                if clip_num > count:
                    break
                url = entry.get("url") or f"https://www.youtube.com/watch?v={entry.get('id')}"
                title = entry.get("title", f"clip_{clip_num}")
                clean_title = sanitize_filename(title)
                out_name = f"rank_{clip_num}_{clean_title}.mp4"
                out_path = os.path.join(CURATED_DIR, out_name)
                
                # Download 17s slice (5s to 22s) with video and audio for >= 60s Shorts
                dl_cmd = [
                    "python", "-m", "yt_dlp",
                    "--download-sections", "*5-22",
                    "-f", "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best",
                    "--merge-output-format", "mp4",
                    "-o", out_path,
                    "--force-overwrites",
                    url
                ]
                print(f"[*] Downloading clip {clip_num}/{count}: {title[:40]}...")
                sub_res = subprocess.run(dl_cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
                if sub_res.returncode == 0 and os.path.exists(out_path):
                    downloaded_paths.append(out_path)
                    clip_num += 1
                else:
                    print(f"[!] Skipped entry due to download error...")
    except Exception as e:
        print(f"[Notice] Search & download notice: {e}")
        
    # If not enough clips were downloaded, fill in from existing curated clips
    if len(downloaded_paths) < count:
        print(f"[*] Supplementing from local library (have {len(downloaded_paths)}/{count})...")
        local_pool = glob.glob(os.path.join(CURATED_DIR, "*.mp4"))
        for loc in local_pool:
            if loc not in downloaded_paths:
                downloaded_paths.append(loc)
            if len(downloaded_paths) >= count:
                break
                
    print(f"\n[SUCCESS] Ready with {len(downloaded_paths)} clips.")
    return downloaded_paths[:count]

# Backwards compatibility alias
curate_trending_satisfying_clips = curate_trending_clips

if __name__ == "__main__":
    clips = curate_trending_clips(count=3, topic="hydraulic press asmr")
    for c in clips:
        print(" ->", c)
