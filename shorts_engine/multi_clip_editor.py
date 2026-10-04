import os
import sys
import subprocess
import json
import asyncio
from config import FFMPEG_PATH, FFPROBE_PATH, OUTPUT_DIR, ASSETS_DIR
from voice_generator import generate_speech_segment, build_master_bridge_ass, DEFAULT_VOICE

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Cross-platform fonts (Windows / Linux / Cloud)
LOCAL_IMPACT = os.path.join(ASSETS_DIR, "fonts", "impact.ttf")
LOCAL_ARIAL = os.path.join(ASSETS_DIR, "fonts", "arialbd.ttf")
FONT_IMPACT = LOCAL_IMPACT.replace("\\", "/").replace(":", "\\:") if os.path.exists(LOCAL_IMPACT) else "C\\:/Windows/Fonts/impact.ttf"
FONT_ARIAL_BOLD = LOCAL_ARIAL.replace("\\", "/").replace(":", "\\:") if os.path.exists(LOCAL_ARIAL) else "C\\:/Windows/Fonts/arialbd.ttf"
DEFAULT_BGM = os.path.join(ASSETS_DIR, "music", "viral_beat_1.mp3")
WHOOSH_SFX = os.path.join(ASSETS_DIR, "sfx", "whoosh.wav")

def get_media_duration(filepath: str) -> float:
    """Returns duration in seconds using ffprobe."""
    if not os.path.exists(filepath):
        return 0.0
    cmd = [
        FFPROBE_PATH,
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "json",
        filepath
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if res.returncode == 0:
        try:
            data = json.loads(res.stdout)
            return float(data.get("format", {}).get("duration", 0.0))
        except Exception:
            pass
    return 0.0

def has_audio_stream(filepath: str) -> bool:
    """Checks if a video file has an audio track."""
    cmd = [
        FFPROBE_PATH,
        "-v", "error",
        "-select_streams", "a",
        "-show_entries", "stream=index",
        "-of", "json",
        filepath
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if res.returncode == 0:
        try:
            data = json.loads(res.stdout)
            return len(data.get("streams", [])) > 0
        except Exception:
            pass
    return False

def normalize_clip_with_bridge(
    input_path: str,
    output_path: str,
    duration: float,
    badge_text: str,
    bridge_audio_path: str,
    bridge_duration: float
) -> str:
    """
    Normalizes a single clip into 9:16 vertical (1080x1920), 30fps:
    1. Ambient blurred background + centered crisp foreground.
    2. Gamified Rating Badge (Red Pill with White Border).
    3. Strict Audio Separation:
       - 0.0s to {bridge_duration}s: Voiceover plays loud (1.4x), raw clip audio ducked to 0.20x.
       - {bridge_duration}s to end: NO VOICEOVER. Raw clip audio plays at 100% full volume!
    """
    safe_badge = badge_text.replace("'", "").replace(":", "")
    clip_has_audio = has_audio_stream(input_path)
    
    # Video graph
    video_filters = (
        f"[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5,eq=brightness=-0.3,fps=30[bg];"
        f"[0:v]scale=1080:-2:force_original_aspect_ratio=decrease,fps=30[fg];"
        f"[bg][fg]overlay=(W-w)/2:(H-h)/2[base];"
        f"[base]drawbox=x=60:y=520:w=580:h=78:color=0xFF1133@0.95:t=fill[b1];"
        f"[b1]drawbox=x=56:y=516:w=588:h=86:color=white@1:t=3[b2];"
        f"[b2]drawtext=text='{safe_badge}':fontfile='{FONT_ARIAL_BOLD}':fontsize=36:fontcolor=white:x=85:y=542[v_out]"
    )
    
    # Audio graph: Bridge VO + Raw clip audio ducking
    safe_bd = max(0.5, float(bridge_duration))
    if clip_has_audio:
        audio_filters = (
            f"[0:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,"
            f"volume=enable='between(t,0,{safe_bd:.2f})':volume=0.20,"
            f"volume=enable='gte(t,{safe_bd:.2f})':volume=1.0[clip_a];"
            f"[1:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,volume=1.4[vo_a];"
            f"[vo_a][clip_a]amix=inputs=2:duration=longest:dropout_transition=0[a_out]"
        )
    else:
        # Fallback to silent base audio if clip has no audio
        audio_filters = (
            f"aevalsrc=0:d={duration:.2f}:s=44100:c=stereo[silence];"
            f"[1:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,volume=1.4[vo_a];"
            f"[vo_a][silence]amix=inputs=2:duration=longest:dropout_transition=0[a_out]"
        )
        
    filter_complex = f"{video_filters};{audio_filters}"
    
    cmd = [
        FFMPEG_PATH,
        "-y",
        "-stream_loop", "-1",
        "-i", input_path,
        "-i", bridge_audio_path,
        "-filter_complex", filter_complex,
        "-map", "[v_out]",
        "-map", "[a_out]",
        "-t", f"{duration:.2f}",
        "-r", "30",
        "-c:v", "libx264",
        "-preset", "faster",
        "-crf", "18",
        "-c:a", "aac",
        "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        output_path
    ]
    
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if res.returncode != 0:
        print(f"[FFmpeg Error in normalize_clip_with_bridge]: {res.stderr[-400:]}")
        raise RuntimeError("Failed to normalize clip with bridge audio.")
        
    return output_path

def stitch_clips_with_transitions(
    clip_paths: list,
    output_stitched_path: str,
    transition: str = "wipeleft",
    transition_duration: float = 0.4
) -> str:
    """
    Stitches multiple clips using FFmpeg's xfade (video) and acrossfade (audio).
    Fast-paced cuts during transitions.
    """
    if len(clip_paths) == 1:
        cmd = [FFMPEG_PATH, "-y", "-i", clip_paths[0], "-c", "copy", output_stitched_path]
        subprocess.run(cmd, check=True, capture_output=True, text=True, encoding="utf-8", errors="replace")
        return output_stitched_path

    durations = [get_media_duration(p) for p in clip_paths]
    
    inputs = []
    for p in clip_paths:
        inputs.extend(["-i", p])
        
    filter_parts = []
    
    # Video xfade chain
    last_v = "[0:v]"
    current_offset = durations[0] - transition_duration
    for i in range(1, len(clip_paths)):
        next_v = f"[{i}:v]"
        out_v = f"[v{i}]" if i < len(clip_paths) - 1 else "[v_final]"
        filter_parts.append(
            f"{last_v}{next_v}xfade=transition={transition}:duration={transition_duration}:offset={current_offset:.2f}{out_v}"
        )
        last_v = out_v
        if i < len(clip_paths) - 1:
            current_offset += durations[i] - transition_duration

    # Audio acrossfade chain
    last_a = "[0:a]"
    for i in range(1, len(clip_paths)):
        next_a = f"[{i}:a]"
        out_a = f"[a{i}]" if i < len(clip_paths) - 1 else "[a_final]"
        filter_parts.append(
            f"{last_a}{next_a}acrossfade=d={transition_duration}:c1=tri:c2=tri{out_a}"
        )
        last_a = out_a

    filter_complex = ";".join(filter_parts)
    
    cmd = [
        FFMPEG_PATH,
        "-y",
        *inputs,
        "-filter_complex", filter_complex,
        "-map", "[v_final]",
        "-map", "[a_final]",
        "-c:v", "libx264",
        "-preset", "faster",
        "-crf", "18",
        "-c:a", "aac",
        "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        output_stitched_path
    ]
    
    print(f"[*] Applying fast-paced '{transition}' cuts across {len(clip_paths)} clips...")
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if res.returncode != 0:
        print(f"[FFmpeg stitch error]: {res.stderr[-400:]}")
        raise RuntimeError("Failed to stitch clips with transitions.")
        
    return output_stitched_path

def build_bridge_multiclip_short(
    clip_files: list,
    topic_data: dict,
    output_path: str,
    transition: str = "wipeleft",
    music_path: str = None,
    voice_model: str = DEFAULT_VOICE
) -> str:
    """
    MASTER SHORT ENGINE:
    1. Takes clips and topic metadata (hook, bridge lines, header banner).
    2. Synthesizes bridge-only VO for transitions (First 1.5-2.2s of each clip).
    3. Guarantees raw clip action audio plays at 100% full volume with ZERO VO during the main action (at least 4.5s per clip!).
    4. Subtitles appear ONLY when VO is speaking during transition bridges.
    5. Applies gamified rating badges, top header banner, and bottom animated progress bar.
    6. Mixes subtle rhythmic background beat (0.12x).
    """
    num_clips = len(clip_files)
    header_title = topic_data.get("banner", f"TOP {num_clips} SATISFYING")
    hook_text = topic_data.get("hook", "Wait for Number 1!")
    bridge_lines = topic_data.get("bridge_lines", {})
    transition_dur = 0.4
    
    # Enforce minimum total video duration of 60.5 seconds (at least 60s)
    target_min_total = 60.5
    base_per_clip = (target_min_total + (num_clips - 1) * transition_dur) / num_clips
    base_per_clip = max(6.0, base_per_clip)
    
    # Minimum uninterrupted raw action audio duration per clip:
    min_raw_time = max(4.5, base_per_clip - 3.5)
    
    # 1. Generate Voiceover Bridges & Timed Words
    temp_bridge_audios = []
    temp_words_list = []
    
    for i in range(num_clips):
        rank_num = num_clips - i
        line = bridge_lines.get(str(rank_num)) or bridge_lines.get(rank_num)
        if not line:
            line = f"Number {rank_num}... Dekho dhyan se!"
            
        # Prepend concise hook to the first clip's bridge
        if i == 0 and hook_text:
            spoken_text = f"{hook_text} {line}"
        else:
            spoken_text = line
            
        bridge_audio_path = os.path.join(ASSETS_DIR, f"bridge_vo_{i}.mp3")
        dur_sec, words = asyncio.run(generate_speech_segment(spoken_text, bridge_audio_path, voice=voice_model, rate="+22%"))
        
        temp_bridge_audios.append((bridge_audio_path, dur_sec))
        temp_words_list.append(words)

    # 2. Compute dynamic clip durations ensuring total video >= 60s & raw audio is never cut short
    clip_durations = []
    for i in range(num_clips):
        vo_path, vo_dur = temp_bridge_audios[i]
        c_dur = max(base_per_clip, vo_dur + min_raw_time)
        clip_durations.append(c_dur)
        rank_num = num_clips - i
        print(f"[*] Clip Rank #{rank_num}: VO Bridge {vo_dur:.2f}s | Uninterrupted Raw Action Audio: {c_dur - vo_dur:.2f}s (Total: {c_dur:.2f}s)")

    # 3. Build Master ASS Subtitle File with frame-accurate timeline offsets
    bridge_timings = []
    current_time_offset = 0.0
    for i in range(num_clips):
        bridge_timings.append({
            "offset_sec": current_time_offset,
            "words": temp_words_list[i]
        })
        current_time_offset += clip_durations[i] - transition_dur

    master_ass_path = os.path.join(OUTPUT_DIR, "master_bridge_subs.ass")
    build_master_bridge_ass(bridge_timings, master_ass_path)
    
    # 4. Normalize each clip with its Bridge VO + Ducking + Rating Badge
    normalized_clips = []
    for i in range(num_clips):
        rank_num = num_clips - i
        score_val = 8.8 + (i / max(1, num_clips - 1)) * 1.2
        if rank_num == 1:
            badge_text = "RANK #1 - RATING 10 / 10"
        else:
            badge_text = f"RANK #{rank_num} - RATING {score_val:.1f} / 10"
            
        cfile = clip_files[i]
        vo_path, vo_dur = temp_bridge_audios[i]
        norm_output = os.path.join(ASSETS_DIR, f"norm_clip_{i}.mp4")
        
        print(f"[*] Preparing clip {i+1}/{num_clips} (Badge: {badge_text})...")
        normalize_clip_with_bridge(
            input_path=cfile,
            output_path=norm_output,
            duration=clip_durations[i],
            badge_text=badge_text,
            bridge_audio_path=vo_path,
            bridge_duration=vo_dur
        )
        normalized_clips.append(norm_output)
        
    # 5. Stitch clips with transition
    stitched_path = os.path.join(ASSETS_DIR, "master_stitched.mp4")
    stitch_clips_with_transitions(
        normalized_clips,
        stitched_path,
        transition=transition,
        transition_duration=transition_dur
    )
    
    # 6. Master Composite: Top Yellow Banner + Animated Progress Bar + Subtitles + Subtle BGM
    stitched_dur = get_media_duration(stitched_path)
    total_duration = stitched_dur if stitched_dur > 0 else (current_time_offset + transition_dur)
    
    escaped_ass = master_ass_path.replace("\\", "/").replace(":", "\\:")
    safe_header = header_title.replace("'", "").replace(":", "")
    bg_music = music_path if (music_path and os.path.exists(music_path)) else DEFAULT_BGM
    has_music = os.path.exists(bg_music)
    
    if has_music:
        print(f"[*] Adding subtle background rhythm ({bg_music}) at 0.12x volume...")
        filter_complex = (
            f"[0:v]drawbox=x=40:y=200:w=1000:h=120:color=0xFFE600@1:t=fill[b1];"
            f"[b1]drawbox=x=36:y=196:w=1008:h=128:color=0x000000@1:t=4[b2];"
            f"[b2]drawtext=text='{safe_header}':fontfile='{FONT_IMPACT}':fontsize=58:fontcolor=black:x=(w-text_w)/2:y=230[b3];"
            f"[b3]drawbox=x=0:y=1900:w='1080*(t/{total_duration:.2f})':h=16:color=0xFFE600@1:t=fill[b4];"
            f"[b4]ass='{escaped_ass}'[vfinal];"
            # Background beat mixed low so raw action audio shines
            f"[0:a]volume=1.0[main_a];"
            f"[1:a]volume=0.12[bgm_a];"
            f"[main_a][bgm_a]amix=inputs=2:duration=first:dropout_transition=2[afinal]"
        )
        cmd = [
            FFMPEG_PATH,
            "-y",
            "-i", stitched_path,
            "-stream_loop", "-1",
            "-i", bg_music,
            "-filter_complex", filter_complex,
            "-map", "[vfinal]",
            "-map", "[afinal]",
            "-t", f"{total_duration:.2f}",
            "-c:v", "libx264",
            "-preset", "faster",
            "-crf", "18",
            "-c:a", "aac",
            "-b:a", "192k",
            "-pix_fmt", "yuv420p",
            output_path
        ]
    else:
        filter_complex = (
            f"[0:v]drawbox=x=40:y=200:w=1000:h=120:color=0xFFE600@1:t=fill[b1];"
            f"[b1]drawbox=x=36:y=196:w=1008:h=128:color=0x000000@1:t=4[b2];"
            f"[b2]drawtext=text='{safe_header}':fontfile='{FONT_IMPACT}':fontsize=58:fontcolor=black:x=(w-text_w)/2:y=230[b3];"
            f"[b3]drawbox=x=0:y=1900:w='1080*(t/{total_duration:.2f})':h=16:color=0xFFE600@1:t=fill[b4];"
            f"[b4]ass='{escaped_ass}'[vfinal]"
        )
        cmd = [
            FFMPEG_PATH,
            "-y",
            "-i", stitched_path,
            "-filter_complex", filter_complex,
            "-map", "[vfinal]",
            "-map", "0:a",
            "-t", f"{total_duration:.2f}",
            "-c:v", "libx264",
            "-preset", "faster",
            "-crf", "18",
            "-c:a", "aac",
            "-b:a", "192k",
            "-pix_fmt", "yuv420p",
            output_path
        ]

    print(f"[*] Rendering final video to: {output_path}...")
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if res.returncode != 0:
        print(f"[FFmpeg master error]: {res.stderr[-400:]}")
        raise RuntimeError("Master composite rendering failed.")
        
    print(f"\n[SUCCESS] Master Short rendered successfully: {output_path}")
    return output_path

# Backwards compatibility function
def build_multiclip_short(clip_files, voice_audio_path, subtitles_ass_path, output_path, header_title="TOP 3 SATISFYING CLIPS", transition="wipeleft", music_path=None):
    from topic_memory import generate_unique_topic, get_todays_category
    cat = get_todays_category(slot="slot1")
    topic_data = generate_unique_topic(cat)
    topic_data["banner"] = header_title
    return build_bridge_multiclip_short(clip_files, topic_data, output_path, transition=transition, music_path=music_path)

if __name__ == "__main__":
    from topic_memory import get_todays_category, generate_unique_topic
    import glob
    clips = glob.glob(os.path.join(ASSETS_DIR, "..", "curated_clips", "*.mp4"))[:3]
    if len(clips) >= 2:
        cat = get_todays_category(slot="slot1")
        top = generate_unique_topic(cat)
        out = os.path.join(OUTPUT_DIR, "preview_bridge_short.mp4")
        build_bridge_multiclip_short(clips, top, out)
