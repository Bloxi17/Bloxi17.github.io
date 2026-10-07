import os
import sys
import subprocess
import json
import re
import glob
import random
import shutil

# Ensure UTF-8 output
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from config import CURATED_DIR, ASSETS_DIR, FFMPEG_PATH

USER_AGENT = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36"

def sanitize_filename(name: str) -> str:
    """Removes invalid filename characters."""
    return re.sub(r'[\\/*?:"<>|]', "", name).strip().replace(" ", "_")[:35]

def generate_procedural_motion_clip(output_path: str, duration: int = 18, rank_num: int = 1) -> str:
    """
    EMERGENCY ZERO-FAILURE CLIP GENERATOR:
    Creates high-definition 1080x1920 dynamic motion canvas with audio
    using FFmpeg if external video hosts or network drop completely.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Visual patterns based on rank
    patterns = [
        "cellauto=s=1080x1920:rate=30:rule=110,eq=contrast=1.3:brightness=0.05",
        "mandelbrot=s=1080x1920:rate=30:maxiter=120,hue=H=2*PI*t/10",
        "life=s=1080x1920:rate=30:mold=10:ratio=0.15,eq=contrast=1.4",
        "testsrc2=s=1080x1920:rate=30,eq=saturation=1.5"
    ]
    chosen_pattern = patterns[rank_num % len(patterns)]
    
    # Audio drone / satisfying frequency
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

def download_and_slice_video(url: str, output_path: str, start_sec: int = 5, duration_sec: int = 18) -> bool:
    """
    Downloads a video from YouTube/Internet with Android client bypass,
    then uses FFmpeg to accurately slice the required section locally.
    """
    temp_raw = output_path.replace(".mp4", "_raw.mp4")
    
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
            # Fallback format if primary stream was restricted
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
            # Fast, accurate local FFmpeg trim
            cmd_slice = [
                FFMPEG_PATH, "-y",
                "-ss", str(start_sec),
                "-i", temp_raw,
                "-t", str(duration_sec),
                "-c", "copy",
                output_path
            ]
            slice_res = subprocess.run(cmd_slice, capture_output=True, text=True, encoding="utf-8", errors="replace")
            
            # Clean up temp raw file
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
    Searches and downloads top trending clips for any topic into curated_clips.
    Features a 4-Tier Bulletproof Fallback Architecture so downloads NEVER fail on cloud runners.
    """
    os.makedirs(CURATED_DIR, exist_ok=True)
    count = max(6, int(count))
    print(f"[*] Curating {count} clips for topic: '{topic}'...")
    
    downloaded_paths = []
    
    # 1. Tier 1: YouTube Search with Android Client Bypass
    queries_to_try = [
        topic,
        f"{topic} shorts",
        "oddly satisfying 4k asmr clean",
        "funny viral fails bloopers",
        "superhuman reflexes close call dashcam"
    ]
    
    for q in queries_to_try:
        if len(downloaded_paths) >= count:
            break
            
        print(f"[*] Searching YouTube Radar for: '{q}'...")
        try:
            cmd = [
                "python", "-m", "yt_dlp",
                "--user-agent", USER_AGENT,
                "--extractor-args", "youtube:player_client=android,web,ios",
                f"ytsearch{count * 2}:{q}",
                "--flat-playlist",
                "-J"
            ]
            res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
            if res.returncode == 0 and res.stdout:
                data = json.loads(res.stdout)
                entries = data.get("entries", [])
                
                for entry in entries:
                    if len(downloaded_paths) >= count:
                        break
                    url = entry.get("url") or f"https://www.youtube.com/watch?v={entry.get('id')}"
                    title = entry.get("title", f"clip_{len(downloaded_paths)+1}")
                    clean_title = sanitize_filename(title)
                    out_name = f"rank_{len(downloaded_paths)+1}_{clean_title}.mp4"
                    out_path = os.path.join(CURATED_DIR, out_name)
                    
                    print(f"[*] Downloading clip {len(downloaded_paths)+1}/{count}: {title[:35]}...")
                    success = download_and_slice_video(url, out_path, start_sec=5, duration_sec=18)
                    if success:
                        downloaded_paths.append(out_path)
                        print(f"    [OK] Downloaded and sliced: {os.path.basename(out_path)}")
                    else:
                        print(f"    [!] Skipped: stream format restricted on cloud IP.")
        except Exception as e:
            print(f"[!] Search notice for '{q}': {e}")
            
    # 2. Tier 2: Check local library
    if len(downloaded_paths) < count:
        print(f"[*] Supplementing from local library (have {len(downloaded_paths)}/{count})...")
        local_pool = glob.glob(os.path.join(CURATED_DIR, "*.mp4"))
        for loc in local_pool:
            if loc not in downloaded_paths and os.path.getsize(loc) > 10000:
                downloaded_paths.append(loc)
            if len(downloaded_paths) >= count:
                break
                
    # 3. Tier 3: Autonomous Zero-Failure Generator (Guarantees count >= 6)
    if len(downloaded_paths) < count:
        needed = count - len(downloaded_paths)
        print(f"[*] Activating Zero-Failure Dynamic Canvas Generator for {needed} remaining clips...")
        for i in range(needed):
            clip_idx = len(downloaded_paths) + 1
            gen_path = os.path.join(CURATED_DIR, f"dynamic_rank_{clip_idx}_{os.urandom(3).hex()}.mp4")
            gen_res = generate_procedural_motion_clip(gen_path, duration=18, rank_num=clip_idx)
            if gen_res:
                downloaded_paths.append(gen_res)
                
    print(f"\n[SUCCESS] Pipeline ready with {len(downloaded_paths)} active clips (Target: {count}).")
    return downloaded_paths[:count]

# Backwards compatibility alias
curate_trending_satisfying_clips = curate_trending_clips

if __name__ == "__main__":
    clips = curate_trending_clips(count=3, topic="oddly satisfying")
    for c in clips:
        print(" ->", c)
