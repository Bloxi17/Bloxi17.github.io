import re
import os

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Remove Boot sequence
html = re.sub(r"<!-- ==================== BOOT SEQUENCE ==================== -->.*?</div>\s*</div>", "", html, flags=re.DOTALL)
html = re.sub(r"/\* ======================== BOOT SEQUENCE ======================== \*/.*?(?=/\* ========================)", "", html, flags=re.DOTALL)
html = re.sub(r"// --- Boot Sequence ---.*?window\.addEventListener\('load', runBoot\);", "", html, flags=re.DOTALL)

# Remove HUD
html = re.sub(r"<!-- ==================== LIVE HUD ==================== -->.*?</div>", "", html, flags=re.DOTALL)
html = re.sub(r"<div class=\"hud.*?(?=<!-- ==================== SPOTIFY WIDGET ==================== -->)", "", html, flags=re.DOTALL)
html = re.sub(r"/\* ======================== LIVE HUD ======================== \*/.*?(?=/\* ========================)", "", html, flags=re.DOTALL)
html = re.sub(r"// --- Live Telemetry HUD ---.*?updateHUD\(\);", "", html, flags=re.DOTALL)

# Remove Spotify
html = re.sub(r"<!-- ==================== SPOTIFY WIDGET ==================== -->.*?</div>\s*</div>\s*</div>", "", html, flags=re.DOTALL)
html = re.sub(r"/\* ======================== SPOTIFY WIDGET ======================== \*/.*?(?=/\* ========================)", "", html, flags=re.DOTALL)

# Remove Easter Egg
html = re.sub(r"/\* ======================== RED ALERT \(EASTER EGG\) ======================== \*/.*?(?=/\* ========================)", "", html, flags=re.DOTALL)
html = re.sub(r"// --- Easter Egg \(Keylogger\) ---.*?(?=// --- Live Telemetry HUD ---)", "", html, flags=re.DOTALL)

# Remove Link Preview
html = re.sub(r"<!-- Link Preview Tooltip -->.*?</div>", "", html, flags=re.DOTALL)
html = re.sub(r"/\* ======================== LINK PREVIEW ======================== \*/.*?(?=/\* ========================)", "", html, flags=re.DOTALL)
html = re.sub(r"// Link Preview Hover Logic.*?(?=// Portfolio scroll reveals)", "", html, flags=re.DOTALL)

# Remove Portfolio content
html = re.sub(r"<div class=\"portfolio-scroll\">.*?(?=</section>)", "", html, flags=re.DOTALL)

# Remove extra CSS
html = re.sub(r"\.portfolio-hero \{.*?(?=/\* ======================== RESPONSIVE ======================== \*/)", "", html, flags=re.DOTALL)

# Remove Portfolio Scroll GSAP
html = re.sub(r"// Portfolio scroll reveals.*?(?=</script>)", "", html, flags=re.DOTALL)

with open("Event-Horizon-Background/index.html", "w", encoding="utf-8") as f:
    f.write(html)
