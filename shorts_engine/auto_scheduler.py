import os
import sys
import time
import random
from config import OUTPUT_DIR, CURATED_DIR
from multi_downloader import curate_trending_satisfying_clips
from script_generator import generate_countdown_script
from voice_generator import generate_speech
from multi_clip_editor import build_multiclip_short
from youtube_uploader import upload_short, is_configured
import asyncio

# High-converting viral niches for YouTube Shorts
VIRAL_NICHES = [
    {"topic": "Oddly Satisfying Metal Machining", "banner": "TOP 3 SATISFYING MACHINING"},
    {"topic": "Extreme Hydraulic Press Crushes", "banner": "HYDRAULIC PRESS BEST MOMENTS"},
    {"topic": "Laser Rust Cleaning Transformations", "banner": "SATISFYING LASER RESTORATIONS"},
    {"topic": "Master Woodturning Artistry", "banner": "TOP 3 MESMERIZING WOOD ART"},
    {"topic": "Deep Pressure Washing Cleans", "banner": "SATISFYING PRESSURE WASHING"}
]

def run_daily_automated_job(privacy="public"):
    """
    Completely autonomous workflow:
    1. Selects a trending niche
    2. Auto-downloads 3 viral clips
    3. Synthesizes AI voiceover & word-level subtitles
    4. Stitches with transitions, countdown badges, and banner
    5. Uploads directly to YouTube Shorts!
    """
    niche = random.choice(VIRAL_NICHES)
    topic = niche["topic"]
    banner = niche["banner"]
    
    print("=" * 60)
    print(f"🤖 RUNNING AUTONOMOUS DAILY SHORTS POSTER")
    print(f"📌 Selected Topic: {topic}")
    print("=" * 60)
    
    # 1. Download Clips
    print("\n[Step 1] Curating 3 fresh video clips...")
    clips = curate_trending_satisfying_clips(count=3, topic=f"{topic} 4k asmr")
    if len(clips) < 2:
        print("[!] Not enough clips downloaded, aborting.")
        return False
        
    # 2. Script & Voice
    print("\n[Step 2] Generating script and neural voiceover...")
    script = generate_countdown_script(topic=topic, num_items=len(clips))
    script["header_banner"] = banner
    
    full_voice = script["hook"] + " "
    for it in script["items"]:
        full_voice += it["text"] + " "
        
    slug = "".join([c if c.isalnum() else "_" for c in topic.lower()])[:20]
    voice_path = os.path.join(OUTPUT_DIR, f"auto_{slug}_voice.mp3")
    ass_path = os.path.join(OUTPUT_DIR, f"auto_{slug}_subtitles.ass")
    
    asyncio.run(generate_speech(full_voice, voice_path, ass_path))
    
    # 3. Multi-Clip Splicing & Transitions
    print("\n[Step 3] Splicing clips with transitions & overlays...")
    final_video = os.path.join(OUTPUT_DIR, f"auto_{slug}_SHORT.mp4")
    
    build_multiclip_short(
        clip_files=clips,
        voice_audio_path=voice_path,
        subtitles_ass_path=ass_path,
        output_path=final_video,
        header_title=banner,
        transition="wipeleft"
    )
    
    # 4. Upload to YouTube
    print("\n[Step 4] Checking YouTube credentials and publishing...")
    if is_configured():
        upload_res = upload_short(
            video_path=final_video,
            title=script["youtube_title"],
            description=script["description"],
            tags=script["hashtags"],
            privacy_status=privacy
        )
        print(f"\n🎉 AUTONOMOUS PUBLISH SUCCESS: {upload_res['url']}")
        return upload_res
    else:
        print("[Notice] Video rendered successfully! To enable auto-uploading, place client_secrets.json in shorts_engine.")
        return final_video

if __name__ == "__main__":
    privacy_arg = sys.argv[1] if len(sys.argv) > 1 else "private"
    run_daily_automated_job(privacy=privacy_arg)
