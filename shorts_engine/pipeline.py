import os
import sys
import json
import asyncio

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

from config import OUTPUT_DIR, ASSETS_DIR
from voice_generator import generate_speech
from script_generator import generate_countdown_script
from video_editor import build_short_video
from clip_downloader import search_clips, download_clip_snippet

def run_pipeline(
    topic: str = "Satisfying Metal Cutting",
    num_items: int = 3,
    custom_video: str = None,
    gemini_key: str = None
):
    """
    Complete end-to-end automated workflow:
    1. Generates viral countdown script & hooks
    2. Synthesizes AI voiceover & word-level animated subtitles
    3. Fetches/prepares background video clips
    4. Renders final 9:16 vertical Short with all visual overlays
    5. Saves metadata for YouTube upload
    """
    print("=" * 60)
    print(f"[*] STARTING YOUTUBE SHORTS AUTOMATION PIPELINE")
    print(f"[*] Topic: {topic} | Items: {num_items}")
    print("=" * 60)
    
    # Step 1: Script Generation
    print("\n[1/4] Generating viral hook and countdown script...")
    script_data = generate_countdown_script(topic=topic, num_items=num_items, api_key=gemini_key)
    
    # Combine hook + items into continuous voiceover text
    full_voice_text = script_data["hook"] + " "
    for item in script_data["items"]:
        full_voice_text += item["text"] + " "
        
    print(f"Hook: {script_data['hook']}")
    print(f"Header: {script_data['header_banner']}")
    
    # Step 2: Voiceover & Subtitle Generation
    print("\n[2/4] Generating AI voiceover and timed subtitles...")
    slug = "".join([c if c.isalnum() else "_" for c in topic.lower()])[:25]
    audio_path = os.path.join(OUTPUT_DIR, f"{slug}_voice.mp3")
    ass_path = os.path.join(OUTPUT_DIR, f"{slug}_subtitles.ass")
    
    asyncio.run(generate_speech(full_voice_text, audio_path, ass_path))
    
    # Step 3: Video Clips Sourcing
    print("\n[3/4] Preparing video clip...")
    if custom_video and os.path.exists(custom_video):
        video_input = custom_video
        print(f"Using provided source video: {video_input}")
    else:
        # Check if we have background.mp4 in the workspace
        workspace_bg = r"g:\Portfolio ainesh\background.mp4"
        if os.path.exists(workspace_bg):
            video_input = workspace_bg
            print(f"Using default high-res workspace background: {video_input}")
        else:
            # Search YouTube and download snippet
            print(f"Searching internet for clips matching '{topic}'...")
            search_results = search_clips(topic, count=1)
            if search_results:
                best_clip = search_results[0]
                clip_file = f"{slug}_source.mp4"
                video_input = download_clip_snippet(best_clip["url"], start_time="10", duration=30, output_filename=clip_file)
            else:
                raise FileNotFoundError("No source video available.")
                
    # Step 4: Render Final 9:16 Short
    print("\n[4/4] Rendering 9:16 Short with UI overlays, banner, badges & subtitles...")
    final_output_video = os.path.join(OUTPUT_DIR, f"{slug}_FINAL_SHORT.mp4")
    
    build_short_video(
        video_input=video_input,
        voice_audio_input=audio_path,
        subtitles_ass_path=ass_path,
        output_path=final_output_video,
        header_title=script_data["header_banner"],
        badge_label="RANK #1 SATISFYING"
    )
    
    # Save YouTube Upload Metadata (Title, Description, Tags)
    meta_path = os.path.join(OUTPUT_DIR, f"{slug}_metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(script_data, f, indent=2)
        
    print("\n" + "=" * 60)
    print("[SUCCESS] WORKFLOW COMPLETE!")
    print(f"Video: {final_output_video}")
    print(f"YouTube Title: {script_data['youtube_title']}")
    print(f"Hashtags: {' '.join(script_data['hashtags'])}")
    print(f"Metadata File: {meta_path}")
    print("=" * 60)
    return final_output_video

if __name__ == "__main__":
    topic_arg = sys.argv[1] if len(sys.argv) > 1 else "Satisfying Laser Cleaning"
    run_pipeline(topic=topic_arg)
