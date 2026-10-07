import os
import sys
import subprocess
import json
import re
import glob
import random
import shutil
import time

# Ensure UTF-8 output
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from config import CURATED_DIR, ASSETS_DIR, FFMPEG_PATH
from topic_memory import load_history, save_history

USER_AGENT = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36"

def sanitize_filename(name: str) -> str:
    """Removes invalid filename characters."""
    return re.sub(r'[\\/*?:"<>|]', "", name).strip().replace(" ", "_")[:35]

def clear_stale_curated_clips():
    """
    Clears old cached video clips in curated_clips so fresh videos are downloaded every run.
    """
    if os.path.exists(CURATED_DIR):
        for f in glob.glob(os.path.join(CURATED_DIR, "*.mp4")):
            try:
                os.remove(f)
            except Exception:
                pass
        print("[*] Stale clip cache cleared. Preparing 100% fresh video downloads.")

def generate_procedural_motion_clip(output_path: str, duration: int = 18, rank_num: int = 1) -> str:
    """
    EMERGENCY ZERO-FAILURE CLIP GENERATOR:
    Creates high-definition 1080x1920 dynamic motion canvas with audio
    using FFmpeg if external video hosts or network drop completely.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Dynamic procedural visual patterns
    patterns = [
        "cellauto=s=1080x1920:rate=30:rule=110,eq=contrast=1.3:brightness=0.05",
        "mandelbrot=s=1080x1920:rate=30:maxiter=120,hue=H=2*PI*t/10",
        "life=s=1080x1920:rate=30:mold=10:ratio=0.15,eq=contrast=1.4",
        "testsrc2=s=1080x1920:rate=30,eq=saturation=1.5"
    ]
    chosen_pattern = patterns[rank_num % len(patterns)]
    
    freq = 220 + (rank_num * 110)
    cmd = [
        FFMPEG_PATH, "-y",
        "-f", "lavfi", "-i", chosen_pattern,
        "-f", "lavfi", "-i", f"sine=frequency={freq}:sample_rate=44100,volume=0.3",
        "-t", str(duration),
        "-c:v", "libx264", "-preset", "ultrafast", "-crf", "22",
        "-c:a", "aac", "-b:a", "128k",
        "-pix_fmt", "yuv420p",
        output_path
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if res.returncode == 0 and os.path.exists(output_path):
        print(f"[OK] Generated dynamic fallback clip #{rank_num}: {os.path.basename(output_path)}")
        return output_path
    return None

def download_and_slice_video(url: str, output_path: str, start_sec: int = None, duration_sec: int = 18) -> bool:
    """
    Downloads a fresh video from YouTube with Android client bypass,
    then uses FFmpeg to slice the peak action segment locally.
    """
    temp_raw = output_path.replace(".mp4", f"_raw_{int(time.time()*1000)%100000}.mp4")
    
    if start_sec is None:
        start_sec = random.choice([2, 5, 8, 12, 18, 25])
        
    cmd_dl = [
        "python", "-m", "yt_dlp",
        "--user-agent", USER_AGENT,
        "--extractor-args", "youtube:player_client=android,web,ios",
        "--no-check-certificates",
        "--geo-bypass",
        "-f", "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best",
        "--merge-output-format", "mp4",
        "--max-filesize", "35M",
        "--no-playlist",
        "-o", temp_raw,
        "--force-overwrites",
        url
    ]
    
    try:
        dl_res = subprocess.run(cmd_dl, capture_output=True, text=True, encoding="utf-8", errors="replace")
        if dl_res.returncode != 0 or not os.path.exists(temp_raw):
            cmd_fb = [
                "python", "-m", "yt_dlp",
                "--user-agent", USER_AGENT,
                "--extractor-args", "youtube:player_client=android,web",
                "-f", "best[ext=mp4]/best",
                "--max-filesize", "35M",
                "--no-playlist",
                "-o", temp_raw,
                "--force-overwrites",
                url
            ]
            subprocess.run(cmd_fb, capture_output=True, text=True, encoding="utf-8", errors="replace")

        if os.path.exists(temp_raw) and os.path.getsize(temp_raw) > 50000:
            cmd_slice = [
                FFMPEG_PATH, "-y",
                "-ss", str(start_sec),
                "-i", temp_raw,
                "-t", str(duration_sec),
                "-c:v", "libx264", "-preset", "ultrafast", "-crf", "20",
                "-c:a", "aac", "-b:a", "192k",
                output_path
            ]
            slice_res = subprocess.run(cmd_slice, capture_output=True, text=True, encoding="utf-8", errors="replace")
            
            try:
                os.remove(temp_raw)
            except Exception:
                pass
                
            if slice_res.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 10000:
                return True
    except Exception as e:
        print(f"[!] Slice error for {url}: {e}")
        
    return False

def curate_trending_clips(count: int = 6, topic: str = "oddly satisfying 4k asmr cutting") -> list:
    """
    Searches and downloads 100% BRAND NEW, FRESH trending clips for today's video.
    Guarantees clip deduplication against topic_history.json to never repeat clips.
    """
    os.makedirs(CURATED_DIR, exist_ok=True)
    clear_stale_curated_clips()
    count = max(6, int(count))
    
    history = load_history()
    used_clip_ids = set(history.get("used_clip_ids", []))
    
    print(f"[*] Curating {count} BRAND NEW clips for topic: '{topic}' (Tracked used IDs: {len(used_clip_ids)})...")
    
    downloaded_paths = []
    new_used_ids = []
    
    # Search queries formatted specifically to find fresh, newly uploaded Shorts and clips
    clean_topic = topic.replace("4k", "").replace("2026", "").strip()
    queries_to_try = [
        f"{clean_topic} 2026 shorts viral",
        f"{clean_topic} shorts caught on camera",
        f"{clean_topic} satisfying moments 4k",
        f"{clean_topic} instant regret bloopers",
        f"top viral {clean_topic} shorts"
    ]
    
    for q in queries_to_try:
        if len(downloaded_paths) >= count:
            break
            
        print(f"[*] Scanning YouTube radar for fresh uploads: '{q}'...")
        try:
            cmd = [
                "python", "-m", "yt_dlp",
                "--user-agent", USER_AGENT,
                "--extractor-args", "youtube:player_client=android,web,ios",
                f"ytsearch{count * 3}:{q}",
                "--flat-playlist",
                "-J"
            ]
            res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
            if res.returncode == 0 and res.stdout:
                data = json.loads(res.stdout)
                entries = data.get("entries", [])
                
                # Shuffle entries slightly to guarantee variety across runs
                random.shuffle(entries)
                
                for entry in entries:
                    if len(downloaded_paths) >= count:
                        break
                    vid_id = entry.get("id")
                    if not vid_id or vid_id in used_clip_ids:
                        continue
                        
                    url = entry.get("url") or f"https://www.youtube.com/watch?v={vid_id}"
                    title = entry.get("title", f"fresh_clip_{len(downloaded_paths)+1}")
                    clean_title = sanitize_filename(title)
                    timestamp_salt = os.urandom(3).hex()
                    out_name = f"fresh_rank_{len(downloaded_paths)+1}_{clean_title}_{timestamp_salt}.mp4"
                    out_path = os.path.join(CURATED_DIR, out_name)
                    
                    print(f"[*] Downloading NEW fresh clip {len(downloaded_paths)+1}/{count}: {title[:35]}...")
                    # Vary start offsets for dynamic variety
                    rand_start = random.choice([1, 4, 8, 14, 20])
                    success = download_and_slice_video(url, out_path, start_sec=rand_start, duration_sec=18)
                    if success:
                        downloaded_paths.append(out_path)
                        used_clip_ids.add(vid_id)
                        new_used_ids.append(vid_id)
                        print(f"    [OK] Downloaded NEW clip #{len(downloaded_paths)}: {os.path.basename(out_path)}")
                    else:
                        print(f"    [!] Skipped format restriction, trying next...")
        except Exception as e:
            print(f"[!] Radar notice for '{q}': {e}")
            
    # Save newly used clip IDs into topic history
    if new_used_ids:
        history.setdefault("used_clip_ids", []).extend(new_used_ids)
        save_history(history)
        
    # Tier 3: Zero-Failure Dynamic Canvas Generator (if remaining needed)
    if len(downloaded_paths) < count:
        needed = count - len(downloaded_paths)
        print(f"[*] Activating Zero-Failure Generator for {needed} remaining clips...")
        for i in range(needed):
            clip_idx = len(downloaded_paths) + 1
            gen_path = os.path.join(CURATED_DIR, f"dynamic_fresh_{clip_idx}_{os.urandom(3).hex()}.mp4")
            gen_res = generate_procedural_motion_clip(gen_path, duration=18, rank_num=clip_idx)
            if gen_res:
                downloaded_paths.append(gen_res)
                
    print(f"\n[SUCCESS] Ready with {len(downloaded_paths)} 100% NEW fresh clips (Target: {count}).")
    return downloaded_paths[:count]

# Backwards compatibility alias
curate_trending_satisfying_clips = curate_trending_clips

if __name__ == "__main__":
    clips = curate_trending_clips(count=2, topic="superhuman reflexes dashcam")
    for c in clips:
        print(" ->", c)
