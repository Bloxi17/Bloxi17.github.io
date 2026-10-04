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
    Returns an ASS header optimized for high-CTR YouTube Shorts:
    - Bold Impact font
    - Vibrant Yellow text (&H0000FFFF)
    - Heavy 14px black outline and 6px drop shadow
    - MarginV 680 (comfortably above YouTube's description and engagement UI)
    """
    return """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: ShortsStyle,Impact,88,&H0000FFFF,&H000000FF,&H00000000,&H90000000,-1,0,0,0,100,100,2,0,1,14,6,2,60,60,680,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

def generate_ass_subtitles(words_with_timing, output_ass_path: str):
    """
    Generate an ASS subtitle file from timed words.
    Groups words into punchy 2-word cards (MrBeast style).
    """
    events = []
    chunk_size = 2
    for i in range(0, len(words_with_timing), chunk_size):
        chunk = words_with_timing[i:i + chunk_size]
        if not chunk:
            continue
        start_ms = chunk[0]["start"]
        end_ms = chunk[-1]["end"]
        # Maintain caption visibility for at least 350ms
        end_ms = max(end_ms, start_ms + 350)
            
        text = " ".join([w["word"] for w in chunk]).upper()
        start_str = ms_to_ass_time(start_ms)
        end_str = ms_to_ass_time(end_ms)
        events.append(f"Dialogue: 0,{start_str},{end_str},ShortsStyle,,0,0,0,,{text}")
        
    with open(output_ass_path, "w", encoding="utf-8") as f:
        f.write(get_ass_header() + "\n".join(events) + "\n")

def build_master_bridge_ass(bridge_timing_list: list, output_ass_path: str):
    """
    Builds a single master ASS subtitle file for multi-clip videos where
    VO and subtitles appear ONLY during the bridge moments of each clip.
    bridge_timing_list format:
    [
        {"offset_sec": 0.0, "words": [...]},
        {"offset_sec": 7.5, "words": [...]},
        ...
    ]
    """
    events = []
    chunk_size = 2
    
    for item in bridge_timing_list:
        offset_ms = int(item["offset_sec"] * 1000)
        words = item["words"]
        
        for i in range(0, len(words), chunk_size):
            chunk = words[i:i + chunk_size]
            if not chunk:
                continue
            start_ms = offset_ms + chunk[0]["start"]
            end_ms = offset_ms + chunk[-1]["end"]
            end_ms = max(end_ms, start_ms + 350)
            
            text = " ".join([w["word"] for w in chunk]).upper()
            start_str = ms_to_ass_time(start_ms)
            end_str = ms_to_ass_time(end_ms)
            events.append(f"Dialogue: 0,{start_str},{end_str},ShortsStyle,,0,0,0,,{text}")
            
    with open(output_ass_path, "w", encoding="utf-8") as f:
        f.write(get_ass_header() + "\n".join(events) + "\n")
    print(f"[OK] Master bridge subtitles written to: {output_ass_path} ({len(events)} cards)")

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
