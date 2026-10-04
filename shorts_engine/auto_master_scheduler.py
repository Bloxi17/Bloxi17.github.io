import os
import sys
import datetime
import json
import time

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from config import OUTPUT_DIR, CURATED_DIR
from topic_memory import get_todays_category, generate_unique_topic, load_history, save_history
from viral_trend_analyzer import run_viral_intelligence
from multi_downloader import curate_trending_clips
from multi_clip_editor import build_bridge_multiclip_short
from youtube_uploader import upload_short, is_configured
from social_syndicator import send_telegram_alert, post_to_instagram_reels

def run_autonomous_pipeline(slot: str = "slot1", privacy: str = "public", force_category: str = None) -> dict:
    """
    MASTER AUTONOMOUS YOUTUBE SHORTS GENERATION & UPLOAD ENGINE
    - Step 0: Dashboard Review + Live Internet Trend Scraping + 'Why It Boomed' Deconstruction
    - Step 1: Strict Weekly 4-Niche Schedule & Non-Repeating Viral Concept Synthesis
    - Step 2: Curation of ≥ 6 High-Quality Video Clips Matching Live Breakout Queries
    - Step 3: High-CTR ≥ 60s Video Compilation (Bridge VO, Raw Action Audio, Komika Badges & Subtitles)
    - Step 4: Autonomous Headless YouTube Shorts Public Upload with High-Velocity SEO Tags
    - Step 5: Persistent Telemetry & Learning History
    """
    print("\n" + "=" * 70)
    print("🔥 LAUNCHING MASTER YOUTUBE SHORTS AUTONOMOUS AI ENGINE 🔥")
    print(f"⏰ Execution Time: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🎯 Slot: {slot.upper()} | Privacy: {privacy.upper()}")
    print("=" * 70)

    # 1. Determine scheduled category for today
    cat_info = get_todays_category(slot=slot)
    if force_category:
        cat_info["category"] = force_category
        cat_info["num_items"] = 10 if force_category == "Top 10 Beauties" else 6
    else:
        cat_info["num_items"] = max(6, cat_info.get("num_items", 6))

    print(f"\n[1/5] Scheduled Target: {cat_info['day']} | Niche: {cat_info['category']} | Target Items: {cat_info['num_items']}")

    # 2. Step 0: Review Dashboard & Internet Breakout Trends ("Why It Boomed")
    print("\n[2/5] Running Viral Intelligence Engine (Dashboard + Live Trend Radar)...")
    viral_intel = run_viral_intelligence(cat_info)
    topic_data = viral_intel["concept"]
    
    # Ensure title / topic is unique in persistent history
    history = load_history()
    used_titles = set(history.get("used_titles", []))
    if topic_data["youtube_title"] in used_titles:
        topic_data = generate_unique_topic(cat_info)
    else:
        history.setdefault("used_topics", []).append(topic_data["topic"])
        history.setdefault("used_titles", []).append(topic_data["youtube_title"])
        save_history(history)

    print(f"\n🎯 Synthesized Replicated Concept:")
    print(f"      📌 Topic:   {topic_data['topic']}")
    print(f"      📺 Title:   {topic_data['youtube_title']}")
    print(f"      🔥 Hook:    {topic_data['hook']}")
    print(f"      🏷️  Banner:  {topic_data['banner']}")
    print(f"      🔍 Query:   {topic_data.get('search_query')}")

    # 3. Curate viral clips with original action audio
    query = topic_data.get("search_query", f"{cat_info['category']} 4k asmr")
    num_clips = cat_info["num_items"]
    print(f"\n[3/5] Curating {num_clips} viral clips for query: '{query}'...")
    clips = curate_trending_clips(count=num_clips, topic=query)
    
    if len(clips) < 2:
        print("[!] Not enough clips downloaded, falling back to curated local clips...")
        import glob
        clips = glob.glob(os.path.join(CURATED_DIR, "*.mp4"))[:num_clips]

    if len(clips) < 2:
        raise RuntimeError("Insufficient clips available to render video.")

    print(f"[OK] {len(clips)} source clips ready.")

    # 4. Compile Short with Bridge-Only VO & Raw Action Audio (≥ 60s length)
    slug = "".join([c if c.isalnum() else "_" for c in topic_data['topic'].lower()])[:20]
    timestamp_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    final_output_path = os.path.join(OUTPUT_DIR, f"{slot}_{slug}_{timestamp_str}.mp4")

    print(f"\n[4/5] Rendering High-CTR Short with Bridge VO & Raw Action Audio...")
    build_bridge_multiclip_short(
        clip_files=clips,
        topic_data=topic_data,
        output_path=final_output_path,
        transition="wipeleft",
        voice_model="en-IN-PrabhatNeural"
    )

    # 5. Autonomous Upload to YouTube Shorts
    print(f"\n[5/5] Autonomous Headless Upload to YouTube ({privacy.upper()})...")
    upload_result = None
    tags = viral_intel["viral_factors"].get("extracted_high_velocity_tags", ["shorts", "viral", "trending"])
    for default_tag in ["shorts", "viral", "trending", cat_info['category'].lower().replace(" ", "")]:
        if default_tag not in tags:
            tags.append(default_tag)

    # Formulate high-engagement pinned comment
    if cat_info["category"] == "ASMR":
        pinned_comment = "Aapko kaun sa sound sabse zyada satisfying laga? Rank 1 ya koi aur? Comment me batao aur Channel ko Subscribe zaroor karo! 🎧👇"
    elif cat_info["category"] == "Funny Moments":
        pinned_comment = "Number 1 dekh kar kis-kis ki hansi nahi ruki? 😂 Comment karke batao aur aise hi daily comedy ke liye Like & Subscribe karein! 🔥👇"
    elif cat_info["category"] == "Accident & Crazy Moments":
        pinned_comment = "Kismat ho toh aisi! 😱 Aapko kaun sa save sabse impossible laga? Comment karo aur Subscribe karo! 👇🔥"
    else:
        pinned_comment = "Aapke hisab se Number 1 par kaun hona chahiye tha? Comment your top pick & Subscribe for daily shorts! 👑👇"

    if is_configured():
        upload_result = upload_short(
            video_path=final_output_path,
            title=topic_data["youtube_title"],
            description=topic_data["description"],
            tags=tags,
            privacy_status=privacy,
            pinned_comment=pinned_comment
        )
        print(f"\n🎉 [LIVE] YouTube Short Published Successfully!")
        print(f"🔗 URL: {upload_result['url']}")
        
        # 6. Real-time Telegram Alert & Multi-Platform Syndication
        try:
            send_telegram_alert(
                title=topic_data["youtube_title"],
                category=cat_info["category"],
                video_url=upload_result["url"],
                viral_reference=viral_intel["viral_factors"].get("boomed_short_title")
            )
            post_to_instagram_reels(
                video_url_or_path=final_output_path,
                caption=f"{topic_data['youtube_title']}\n\n#shorts #reels #viral #trending"
            )
        except Exception as e:
            print(f"[Notice] Syndication alert note: {e}")
    else:
        print("[Notice] client_secrets.json not configured for upload; video rendered locally.")

    # Log to topic history with viral intelligence telemetry
    history = load_history()
    log_entry = {
        "timestamp": datetime.datetime.now().isoformat(),
        "slot": slot,
        "category": cat_info["category"],
        "title": topic_data["youtube_title"],
        "output_path": final_output_path,
        "video_url": upload_result["url"] if upload_result else None,
        "viral_factors": {
            "boomed_reference": viral_intel["viral_factors"].get("boomed_short_title"),
            "hook_strategy": viral_intel["viral_factors"].get("hook_strategy"),
            "tags": tags
        }
    }
    history.setdefault("log", []).append(log_entry)
    save_history(history)

    print("\n" + "=" * 70)
    print("✅ PIPELINE EXECUTION FINISHED SUCCESSFULLY")
    print(f"📁 Video: {final_output_path}")
    if upload_result:
        print(f"🌐 Live URL: {upload_result['url']}")
    print("=" * 70)

    return {
        "status": "success",
        "topic": topic_data,
        "video_path": final_output_path,
        "upload": upload_result,
        "viral_intel": viral_intel
    }

if __name__ == "__main__":
    # Command line usage: python auto_master_scheduler.py [slot1|slot2|special] [public|private]
    slot_arg = sys.argv[1] if len(sys.argv) > 1 else "slot1"
    
    # Translate legacy morning/evening parameters
    if slot_arg.lower() in ["morning", "slot1", "1"]:
        target_slot = "slot1"
    elif slot_arg.lower() in ["evening", "slot2", "2"]:
        target_slot = "slot2"
    elif slot_arg.lower() in ["special", "sunday_special", "3"]:
        target_slot = "special"
    else:
        target_slot = "slot1"

    priv_arg = sys.argv[2] if len(sys.argv) > 2 else "public"
    force_cat = sys.argv[3] if len(sys.argv) > 3 else None

    run_autonomous_pipeline(slot=target_slot, privacy=priv_arg, force_category=force_cat)
