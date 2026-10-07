import os
import sys
import glob
from multi_clip_editor import build_bridge_multiclip_short
from config import OUTPUT_DIR, ASSETS_DIR

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def run_test():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Look for clips in curated_clips, base_clips, or engine directory
    clip_search = (
        glob.glob(os.path.join(ASSETS_DIR, "base_clips", "*.mp4")) +
        glob.glob(os.path.join(ASSETS_DIR, "..", "curated_clips", "*.mp4")) +
        glob.glob(os.path.join(ASSETS_DIR, "norm_clip_*.mp4"))
    )
    
    if len(clip_search) < 3:
        print("[*] Downloading 3 fresh test clips for preview...")
        from multi_downloader import download_niche_clips
        clips = download_niche_clips("asmr", count=3)
    else:
        clips = clip_search[:3]
        
    print(f"[*] Using clips: {clips}")
    
    test_topic = {
        "banner": "TOP 3 CRAZY SATISFYING MOMENTS",
        "hook": "Wait for Number 1!",
        "bridge_lines": {
            "3": "Number 3... Just look at this smooth cut!",
            "2": "Number 2... This sound is so relaxing!",
            "1": "And finally Number 1... The ultimate perfection!"
        }
    }
    
    out_file = os.path.join(OUTPUT_DIR, "test_floating_fonts_preview.mp4")
    print(f"[*] Rendering test short with Floating Cool Fonts to {out_file}...")
    
    build_bridge_multiclip_short(
        clip_files=clips,
        topic_data=test_topic,
        output_path=out_file,
        transition="wipeleft"
    )
    print(f"[SUCCESS] Test video ready at: {out_file}")

if __name__ == "__main__":
    run_test()
