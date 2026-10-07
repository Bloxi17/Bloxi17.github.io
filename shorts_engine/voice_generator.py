import asyncio
import os
import sys
import edge_tts

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Premium neural voices for Indian YouTube Shorts
# en-IN-PrabhatNeural: High-energy, punchy Indian male voice (perfect for fast countdowns)
# hi-IN-MadhurNeural: Conversational, energetic Hindi male voice
# en-IN-NeerjaExpressiveNeural: Expressive, dramatic female voice
DEFAULT_VOICE = "en-IN-PrabhatNeural"

def ms_to_ass_time(ms: int) -> str:
    """Convert milliseconds to ASS format: H:MM:SS.cc"""
    hours = ms // 3600000
    minutes = (ms % 3600000) // 60000
    seconds = (ms % 60000) // 1000
    centiseconds = (ms % 1000) // 10
    return f"{hours}:{minutes:02d}:{seconds:02d}.{centiseconds:02d}"

def get_ass_header() -> str:
    """
    Returns an ASS header optimized for viral high-CTR YouTube Shorts:
    - Floating Cool Fonts: Luckiest Guy & Anton
    - Vibrant Electric Yellow, Neon Green & Laser Cyan
    - Heavy 16px outline + 8px shadow for maximum contrast
    - Center-aligned (Alignment 5) with smooth dynamic \move floating drift & bounce
    """
    return """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: FloatingCool,Luckiest Guy,96,&H0000FFFF,&H000000FF,&H00000000,&HA0000000,-1,0,0,0,100,100,2,0,1,16,8,5,60,60,0,1
Style: FloatingAlt,Anton,96,&H0033FF55,&H000000FF,&H00000000,&HA0000000,-1,0,0,0,100,100,2,0,1,16,8,5,60,60,0,1
Style: PopupSubscribe,Anton,68,&H00FFFFFF,&H000000FF,&H001111EE,&HA0000000,-1,0,0,0,100,100,2,0,1,14,8,5,60,60,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

# Dynamic color rotations for viral punchy subtitles:
# 1: Electric Yellow, 2: Laser Cyan, 3: Neon Green, 4: Pure White
PUNCH_COLORS = [
    r"{\c&H0000FFFF&}",  # Electric Yellow
    r"{\c&H00FFFF00&}",  # Laser Cyan
    r"{\c&H0033FF55&}",  # Neon Lime Green
    r"{\c&H00FFFFFF&}",  # Crisp White
]

ROTATION_ANGLES = [-2.5, 2.5, -1.5, 1.5, 0.0]

def generate_ass_subtitles(words_with_timing, output_ass_path: str):
    """
    Generate an ASS subtitle file with floating kinetic font animations.
    Groups words into punchy 2-word cards (MrBeast style) with floating drift.
    """
    events = []
    chunk_size = 2
    for card_idx, i in enumerate(range(0, len(words_with_timing), chunk_size)):
        chunk = words_with_timing[i:i + chunk_size]
        if not chunk:
            continue
        start_ms = chunk[0]["start"]
        end_ms = chunk[-1]["end"]
        # Maintain caption visibility for at least 380ms
        end_ms = max(end_ms, start_ms + 380)
            
        text = " ".join([w["word"] for w in chunk]).upper()
        start_str = ms_to_ass_time(start_ms)
        end_str = ms_to_ass_time(end_ms)
        
        # Kinetic floating tags: slight upward drift + scale pop bounce + dynamic color
        color_tag = PUNCH_COLORS[card_idx % len(PUNCH_COLORS)]
        rot_deg = ROTATION_ANGLES[card_idx % len(ROTATION_ANGLES)]
        rot_tag = f"\\frz{rot_deg}" if rot_deg != 0 else ""
        float_tags = f"{{\\move(540,1185,540,1155)\\fad(50,50)\\t(0,120,\\fscx114\\fscy114)\\t(120,240,\\fscx100\\fscy100){rot_tag}{color_tag}}}"
        
        events.append(f"Dialogue: 0,{start_str},{end_str},FloatingCool,,0,0,0,,{float_tags}{text}")
        
    with open(output_ass_path, "w", encoding="utf-8") as f:
        f.write(get_ass_header() + "\n".join(events) + "\n")

def build_master_bridge_ass(bridge_timing_list: list, output_ass_path: str):
    """
    Builds a single master ASS subtitle file with floating kinetic font animations.
    Subtitles appear ONLY during bridge moments with floating pop-in and glowing outline.
    Also injects high-CTR animated Subscribe & Like Pop-Up for Rank #1.
    """
    events = []
    chunk_size = 2
    card_counter = 0
    
    for idx, item in enumerate(bridge_timing_list):
        offset_ms = int(item["offset_sec"] * 1000)
        words = item["words"]
        is_rank_1 = item.get("is_rank_1", False) or (idx == len(bridge_timing_list) - 1)
        
        # Inject Animated Subscribe & Like popup card for Rank 1
        if is_rank_1 and words:
            pop_start = ms_to_ass_time(offset_ms)
            pop_end = ms_to_ass_time(offset_ms + 2400)
            popup_tags = r"{\move(540,990,540,965)\fad(120,120)\t(0,220,\fscx118\fscy118)\t(220,440,\fscx100\fscy100)\c&H0000FFFF&}"
            events.append(
                f"Dialogue: 1,{pop_start},{pop_end},PopupSubscribe,,0,0,0,,{popup_tags}🔴 AAGE DEKHNE KE LIYE LIKE & SUBSCRIBE KAREIN! 🔔"
            )
        
        for i in range(0, len(words), chunk_size):
            chunk = words[i:i + chunk_size]
            if not chunk:
                continue
            start_ms = offset_ms + chunk[0]["start"]
            end_ms = offset_ms + chunk[-1]["end"]
            end_ms = max(end_ms, start_ms + 380)
            
            text = " ".join([w["word"] for w in chunk]).upper()
            start_str = ms_to_ass_time(start_ms)
            end_str = ms_to_ass_time(end_ms)
            
            # Floating upward drift + scale pop bounce + color rotation + subtle tilt
            color_tag = PUNCH_COLORS[card_counter % len(PUNCH_COLORS)]
            rot_deg = ROTATION_ANGLES[card_counter % len(ROTATION_ANGLES)]
            rot_tag = f"\\frz{rot_deg}" if rot_deg != 0 else ""
            float_tags = f"{{\\move(540,1185,540,1155)\\fad(50,50)\\t(0,120,\\fscx114\\fscy114)\\t(120,240,\\fscx100\\fscy100){rot_tag}{color_tag}}}"
            
            events.append(f"Dialogue: 0,{start_str},{end_str},FloatingCool,,0,0,0,,{float_tags}{text}")
            card_counter += 1
            
    with open(output_ass_path, "w", encoding="utf-8") as f:
        f.write(get_ass_header() + "\n".join(events) + "\n")
    print(f"[OK] Master floating bridge subtitles with CTA popup written to: {output_ass_path} ({len(events)} cards)")

async def generate_speech_segment(text: str, output_audio: str, voice: str = DEFAULT_VOICE, rate: str = "+22%"):
    """
    Generates realistic AI voiceover for a short bridge phrase and returns
    its exact duration in seconds and timed words list.
    """
    communicate = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
    words = []
    
    with open(output_audio, "wb") as f_audio:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                f_audio.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start_ms = chunk["offset"] // 10000
                duration_ms = chunk["duration"] // 10000
                end_ms = start_ms + duration_ms
                word = chunk["text"].strip()
                if word:
                    words.append({
                        "word": word,
                        "start": start_ms,
                        "end": end_ms
                    })
                    
    duration_sec = (words[-1]["end"] / 1000.0) if words else 2.0
    return duration_sec, words

async def generate_speech(text: str, output_audio: str, output_ass: str, voice: str = DEFAULT_VOICE, rate: str = "+10%"):
    """
    Backwards-compatible full-speech generator.
    """
    duration, words = await generate_speech_segment(text, output_audio, voice=voice, rate=rate)
    generate_ass_subtitles(words, output_ass)
    print(f"[OK] Voiceover saved: {output_audio} ({duration:.2f}s)")
    return len(words)

if __name__ == "__main__":
    out_dir = os.path.join(os.path.dirname(__file__), "output")
    os.makedirs(out_dir, exist_ok=True)
    audio = os.path.join(out_dir, "test_bridge.mp3")
    dur, w = asyncio.run(generate_speech_segment("Wait for Number 1! Suno iski awaaz...", audio))
    print(f"Generated bridge audio: {dur:.2f}s with {len(w)} words")
