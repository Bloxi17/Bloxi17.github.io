import os
import subprocess
from config import FFMPEG_PATH, CURATED_DIR, OUTPUT_DIR

clip = os.path.join(CURATED_DIR, "rank_1_Cutting_Close-Up__ASMR.mp4")
bridge = os.path.join(OUTPUT_DIR, "test_bridge.mp3")
out = os.path.join(OUTPUT_DIR, "test_norm.mp4")
font = "C\\:/Windows/Fonts/arialbd.ttf"

filter_complex = (
    f"[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5,eq=brightness=-0.3,fps=30[bg];"
    f"[0:v]scale=1080:-2:force_original_aspect_ratio=decrease,fps=30[fg];"
    f"[bg][fg]overlay=(W-w)/2:(H-h)/2[base];"
    f"[base]drawbox=x=60:y=520:w=580:h=78:color=0xFF1133@0.95:t=fill[b1];"
    f"[b1]drawbox=x=56:y=516:w=588:h=86:color=white@1:t=3[b2];"
    f"[b2]drawtext=text='RANK #3 - RATING 9.1 / 10':fontfile='{font}':fontsize=36:fontcolor=white:x=85:y=542[v_out];"
    f"[0:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,volume=enable='between(t,0,3.4)':volume=0.20,volume=enable='gte(t,3.4)':volume=1.0[clip_a];"
    f"[1:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,volume=1.4[vo_a];"
    f"[vo_a][clip_a]amix=inputs=2:duration=first:dropout_transition=0[a_out]"
)

cmd = [
    FFMPEG_PATH,
    "-y",
    "-stream_loop", "-1",
    "-i", clip,
    "-i", bridge,
    "-filter_complex", filter_complex,
    "-map", "[v_out]",
    "-map", "[a_out]",
    "-t", "8.0",
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-crf", "18",
    "-c:a", "aac",
    "-b:a", "192k",
    "-pix_fmt", "yuv420p",
    out
]

print("Running command...")
res = subprocess.run(cmd, capture_output=True, text=True)
print("Exit code:", res.returncode)
if res.returncode != 0:
    print("Stderr:", res.stderr[-500:])
else:
    print(f"Success! Output generated: {out} ({os.path.getsize(out)} bytes)")
