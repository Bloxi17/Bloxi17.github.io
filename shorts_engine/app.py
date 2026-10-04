import os
import sys
import json
import asyncio
import glob
from flask import Flask, request, jsonify, send_from_directory, render_template_string

# Ensure UTF-8 output
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from config import OUTPUT_DIR, ASSETS_DIR, CURATED_DIR
from voice_generator import generate_speech
from script_generator import generate_countdown_script
from multi_downloader import download_media_from_url, curate_trending_satisfying_clips
from multi_clip_editor import build_multiclip_short
from video_editor import build_short_video
from youtube_uploader import upload_short, is_configured

app = Flask(__name__)

HTML_PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OmniShorts AI Studio | Universal Multi-Platform Automation</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #07090e;
      --card-bg: rgba(16, 20, 31, 0.85);
      --card-border: rgba(255, 255, 255, 0.08);
      --card-border-glow: rgba(0, 240, 255, 0.25);
      --accent: #00f0ff;
      --accent-glow: rgba(0, 240, 255, 0.4);
      --primary: #ff0055;
      --primary-glow: rgba(255, 0, 85, 0.35);
      --gold: #ffe600;
      --text: #f0f4fc;
      --text-muted: #828ca3;
      --yt-red: #ff0000;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: radial-gradient(circle at 15% 15%, rgba(0, 240, 255, 0.06), transparent 40%),
                  radial-gradient(circle at 85% 85%, rgba(255, 0, 85, 0.06), transparent 45%),
                  var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
    }
    header {
      background: rgba(10, 13, 20, 0.85);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--card-border);
      padding: 16px 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-icon {
      width: 38px;
      height: 38px;
      background: linear-gradient(135deg, var(--accent), var(--primary));
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 0 20px var(--accent-glow);
    }
    .brand-text h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.5px;
      background: linear-gradient(90deg, #fff, #b8c8ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .brand-text p {
      font-size: 11px;
      color: var(--text-muted);
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .supported-badges {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .platform-pill {
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--card-border);
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
    }
    .main-layout {
      max-width: 1400px;
      margin: 32px auto;
      padding: 0 32px;
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 36px;
    }
    .panel {
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      border: 1px solid var(--card-border);
      border-radius: 24px;
      padding: 32px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }
    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }
    .panel-header h2 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .mode-tabs {
      display: flex;
      background: rgba(0,0,0,0.4);
      padding: 5px;
      border-radius: 12px;
      border: 1px solid var(--card-border);
      margin-bottom: 24px;
      gap: 4px;
    }
    .mode-tab {
      flex: 1;
      padding: 10px 14px;
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-weight: 600;
      font-size: 13px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .mode-tab.active {
      background: rgba(0, 240, 255, 0.15);
      color: var(--accent);
      border: 1px solid rgba(0, 240, 255, 0.3);
      box-shadow: 0 0 15px rgba(0, 240, 255, 0.1);
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 8px;
    }
    input, select, textarea {
      width: 100%;
      background: rgba(9, 12, 19, 0.8);
      border: 1px solid rgba(255,255,255,0.1);
      color: #fff;
      padding: 14px 16px;
      border-radius: 12px;
      font-family: inherit;
      font-size: 14px;
      transition: all 0.2s;
    }
    input:focus, select:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(0, 240, 255, 0.15);
    }
    .url-input-row {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
    }
    .btn-icon {
      background: rgba(255, 0, 85, 0.15);
      border: 1px solid rgba(255, 0, 85, 0.3);
      color: var(--primary);
      width: 46px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s;
    }
    .btn-icon:hover { background: rgba(255, 0, 85, 0.3); }
    .btn-add-url {
      background: rgba(0, 240, 255, 0.1);
      border: 1px dashed rgba(0, 240, 255, 0.4);
      color: var(--accent);
      width: 100%;
      padding: 12px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 20px;
      transition: all 0.2s;
    }
    .btn-add-url:hover { background: rgba(0, 240, 255, 0.18); }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .btn-generate {
      width: 100%;
      background: linear-gradient(135deg, var(--gold), #ffaa00);
      color: #000;
      border: none;
      padding: 18px;
      border-radius: 14px;
      font-size: 16px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      box-shadow: 0 8px 30px rgba(255, 230, 0, 0.25);
      transition: all 0.2s;
      margin-top: 10px;
    }
    .btn-generate:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 35px rgba(255, 230, 0, 0.4);
    }
    .btn-generate:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    /* Stepper */
    .stepper {
      display: none;
      margin-top: 24px;
      background: rgba(0,0,0,0.4);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 20px;
    }
    .step-item {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 12px;
      font-size: 13px;
      color: var(--text-muted);
    }
    .step-item:last-child { margin-bottom: 0; }
    .step-circle {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: bold;
    }
    .step-item.active { color: var(--accent); }
    .step-item.active .step-circle {
      border-color: var(--accent);
      background: var(--accent);
      color: #000;
      box-shadow: 0 0 10px var(--accent-glow);
    }
    .step-item.done { color: #55ff99; }
    .step-item.done .step-circle {
      border-color: #55ff99;
      background: #55ff99;
      color: #000;
    }
    /* Preview Column */
    .preview-column {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .iphone-frame {
      width: 320px;
      height: 640px;
      background: #000;
      border: 8px solid #232738;
      border-radius: 46px;
      overflow: hidden;
      position: relative;
      box-shadow: 0 30px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .island-notch {
      position: absolute;
      top: 14px;
      width: 90px;
      height: 22px;
      background: #000;
      border-radius: 20px;
      z-index: 20;
    }
    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .empty-mockup {
      text-align: center;
      color: var(--text-muted);
      padding: 30px;
    }
    .metadata-panel {
      display: none;
      width: 100%;
      margin-top: 24px;
      background: rgba(16, 20, 31, 0.95);
      border: 1px solid var(--card-border);
      border-radius: 18px;
      padding: 22px;
    }
    .meta-title-box {
      font-size: 14px;
      background: #090c14;
      padding: 12px 14px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.06);
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-copy {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      color: white;
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 11px;
      cursor: pointer;
    }
    .btn-copy:hover { background: rgba(255,255,255,0.15); }
    .btn-download-action {
      display: block;
      text-align: center;
      background: linear-gradient(135deg, var(--accent), #00a8ff);
      color: #000;
      text-decoration: none;
      padding: 14px;
      border-radius: 12px;
      font-weight: 800;
      font-size: 14px;
      margin-top: 14px;
      box-shadow: 0 4px 20px rgba(0, 240, 255, 0.25);
      transition: all 0.2s;
    }
    .btn-download-action:hover {
      box-shadow: 0 6px 25px rgba(0, 240, 255, 0.4);
      transform: translateY(-2px);
    }
    .btn-youtube-upload {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      background: linear-gradient(135deg, #ff0000, #cc0000);
      color: #fff;
      border: none;
      padding: 14px;
      border-radius: 12px;
      font-weight: 800;
      font-size: 14px;
      margin-top: 10px;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(255, 0, 0, 0.3);
      transition: all 0.2s;
    }
    .btn-youtube-upload:hover {
      box-shadow: 0 6px 25px rgba(255, 0, 0, 0.5);
      transform: translateY(-2px);
    }
    .btn-youtube-upload:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    .upload-status {
      display: none;
      margin-top: 10px;
      font-size: 12px;
      color: var(--accent);
      text-align: center;
      background: rgba(0,0,0,0.4);
      padding: 8px;
      border-radius: 8px;
    }
    .loader {
      border: 3px solid rgba(0,0,0,0.2);
      border-top: 3px solid #000;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>

  <header>
    <div class="brand">
      <div class="brand-icon">⚡</div>
      <div class="brand-text">
        <h1>OmniShorts AI Studio</h1>
        <p>Autonomous Viral Video Engine</p>
      </div>
    </div>
    <div class="supported-badges">
      <span class="platform-pill">YouTube</span>
      <span class="platform-pill">TikTok</span>
      <span class="platform-pill">Facebook</span>
      <span class="platform-pill">Pinterest</span>
      <span class="platform-pill">Instagram</span>
      <span class="platform-pill" style="border-color: var(--accent); color: var(--accent);">Gyan.FFmpeg 9.0</span>
    </div>
  </header>

  <div class="main-layout">
    <!-- Left Configuration Panel -->
    <div class="panel">
      <div class="panel-header">
        <h2>🛠️ Automation Composer</h2>
        <span style="font-size: 12px; color: var(--accent);">Universal Multi-Platform</span>
      </div>

      <!-- Mode Tabs -->
      <div class="mode-tabs">
        <button class="mode-tab active" id="tabUrls" onclick="switchMode('urls')">🔗 Paste Video URLs</button>
        <button class="mode-tab" id="tabAuto" onclick="switchMode('auto')">🌐 Auto-Curate Clips</button>
        <button class="mode-tab" id="tabCurated" onclick="switchMode('curated')">📁 Curated Cache</button>
      </div>

      <!-- Mode 1: URL Inputs -->
      <div id="sectionUrls">
        <label>Input Video Links (YouTube / TikTok / FB / Pinterest)</label>
        <div id="urlList">
          <div class="url-input-row">
            <input type="text" class="clip-url" placeholder="https://www.youtube.com/watch?v=... or tiktok.com/...">
            <button class="btn-icon" onclick="removeUrl(this)">✕</button>
          </div>
        </div>
        <button class="btn-add-url" onclick="addUrlInput()">+ Add Another Video URL</button>
      </div>

      <!-- Mode 2 & 3 Notice -->
      <div id="sectionAutoNotice" style="display:none; margin-bottom: 20px;">
        <p style="font-size: 13px; color: var(--accent); background: rgba(0,240,255,0.08); padding: 12px; border-radius: 10px; border: 1px solid rgba(0,240,255,0.2);">
          ⚡ <b>Auto-Curate Mode:</b> Searches YouTube & platforms for the highest-rated 4K clips matching your topic, extracts the best action hooks, and normalizes them into 9:16 automatically.
        </p>
      </div>

      <div class="form-group">
        <label>Video Topic & Viral Niche</label>
        <input type="text" id="topicInput" value="Top 6 Most Satisfying ASMR Cutting Videos" placeholder="e.g. Most Dangerous Accidents, Close Calls, Extreme Machining">
      </div>

      <div class="grid-2">
        <div class="form-group">
          <label>Number of Clips / Ranks (6 to 10)</label>
          <select id="clipCountSelect">
            <option value="6" selected>6 Clips (Recommended: Full 60s+ Short)</option>
            <option value="7">7 Clips (Epic 60s+ Compilation)</option>
            <option value="8">8 Clips (High Dopamine 65s+ Short)</option>
            <option value="9">9 Clips (Mega Retention 70s+ Short)</option>
            <option value="10">10 Clips (Maximum Viral 75s+ Short)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Target Audience & Script Style</label>
          <select id="styleSelect">
            <option value="hinglish" selected>🇮🇳 Desi Hinglish (India #1 Viral - High Energy)</option>
            <option value="kids">🎈 Kids & Youth (Wonder, Playful, "3, 2, 1... Wow!")</option>
            <option value="global">🌐 Global English (RankVault Sleek)</option>
          </select>
        </div>
      </div>

      <div class="grid-2">
        <div class="form-group">
          <label>AI Voiceover Model</label>
          <select id="voiceSelect">
            <option value="en-IN-PrabhatNeural" selected>🇮🇳 Prabhat (Indian English - Energetic & Punchy)</option>
            <option value="hi-IN-MadhurNeural">🇮🇳 Madhur (Hindi / Hinglish - Dynamic)</option>
            <option value="en-IN-NeerjaExpressiveNeural">🇮🇳 Neerja (Indian English - Storytelling)</option>
            <option value="hi-IN-SwaraNeural">🇮🇳 Swara (Hindi / Hinglish - Expressive)</option>
            <option value="en-US-ChristopherNeural">🇺🇸 Christopher (US - RankVault Deep)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Video Transition Effect</label>
          <select id="transitionSelect">
            <option value="wipeleft" selected>Push Left (Dynamic & Modern)</option>
            <option value="fade">Dissolve / Smooth Fade</option>
            <option value="smoothleft">Cinematic Soft Slide</option>
            <option value="slideleft">Fast Action Slide</option>
            <option value="circleopen">Spotlight Iris Zoom</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Top Header Title (Optional)</label>
        <input type="text" id="customBanner" placeholder="Auto-generated based on style">
      </div>

      <button class="btn-generate" id="runBtn" onclick="runPipeline()">
        <span id="btnIcon">⚡</span>
        <span id="btnText">Compose & Render Viral Short</span>
      </button>

      <!-- Stepper Status -->
      <div class="stepper" id="stepper">
        <div class="step-item" id="step1">
          <div class="step-circle">1</div>
          <span>Curating & Normalizing Video Clips</span>
        </div>
        <div class="step-item" id="step2">
          <div class="step-circle">2</div>
          <span>Generating AI Script & Edge Neural Voice</span>
        </div>
        <div class="step-item" id="step3">
          <div class="step-circle">3</div>
          <span>Stitching Multi-Clips with Dynamic Badges & Transitions</span>
        </div>
        <div class="step-item" id="step4">
          <div class="step-circle">4</div>
          <span>Burning Synced Captions & 1080x1920 60FPS Export</span>
        </div>
      </div>
    </div>

    <!-- Right Live Phone Preview Column -->
    <div class="preview-column">
      <div class="iphone-frame">
        <div class="island-notch"></div>
        <div class="empty-mockup" id="emptyMockup">
          <div style="font-size: 36px; margin-bottom: 12px;">📱</div>
          <h3 style="font-size: 16px; margin-bottom: 6px;">Live Short Preview</h3>
          <p style="font-size: 12px; opacity: 0.7;">Your 1080x1920 rendered video with transitions, dynamic badges, and subtitles will play here.</p>
        </div>
        <video id="player" controls loop playsinline style="display:none;"></video>
      </div>

      <!-- Metadata Box -->
      <div class="metadata-panel" id="metaPanel">
        <label>Generated YouTube Title</label>
        <div class="meta-title-box">
          <span id="metaTitleText">Loading...</span>
          <button class="btn-copy" onclick="copyText('metaTitleText')">Copy</button>
        </div>

        <label>Viral Hashtags</label>
        <div class="meta-title-box">
          <span id="metaTagsText">#shorts #satisfying</span>
          <button class="btn-copy" onclick="copyText('metaTagsText')">Copy</button>
        </div>

        <a id="downloadBtn" class="btn-download-action" href="#" download>
          ⬇️ Download 1080x1920 Video (MP4)
        </a>

        <!-- YouTube Upload Button -->
        <button class="btn-youtube-upload" id="ytUploadBtn" onclick="uploadToYouTube()">
          <span>▶️</span> <span>Publish Directly to YouTube Shorts</span>
        </button>
        <div class="upload-status" id="uploadStatus"></div>
      </div>
    </div>
  </div>

  <script>
    let currentMode = 'urls';
    let currentVideoPath = '';
    let currentMetadata = null;

    function switchMode(mode) {
      currentMode = mode;
      document.querySelectorAll('.mode-tab').forEach(b => b.classList.remove('active'));
      if (mode === 'urls') {
        document.getElementById('tabUrls').classList.add('active');
        document.getElementById('sectionUrls').style.display = 'block';
        document.getElementById('sectionAutoNotice').style.display = 'none';
      } else if (mode === 'auto') {
        document.getElementById('tabAuto').classList.add('active');
        document.getElementById('sectionUrls').style.display = 'none';
        document.getElementById('sectionAutoNotice').style.display = 'block';
      } else if (mode === 'curated') {
        document.getElementById('tabCurated').classList.add('active');
        document.getElementById('sectionUrls').style.display = 'none';
        document.getElementById('sectionAutoNotice').style.display = 'none';
      }
    }

    function addUrlInput() {
      const container = document.getElementById('urlList');
      const div = document.createElement('div');
      div.className = 'url-input-row';
      div.innerHTML = `
        <input type="text" class="clip-url" placeholder="https://www.youtube.com/watch?v=... or tiktok.com/...">
        <button class="btn-icon" onclick="removeUrl(this)">✕</button>
      `;
      container.appendChild(div);
    }

    function removeUrl(btn) {
      const row = btn.parentElement;
      if (document.querySelectorAll('.url-input-row').length > 1) {
        row.remove();
      } else {
        row.querySelector('input').value = '';
      }
    }

    function updateStep(stepNum) {
      for (let i = 1; i <= 4; i++) {
        const el = document.getElementById('step' + i);
        el.classList.remove('active', 'done');
        if (i < stepNum) el.classList.add('done');
        else if (i === stepNum) el.classList.add('active');
      }
    }

    async function runPipeline() {
      const topic = document.getElementById('topicInput').value.trim();
      const clipCount = parseInt(document.getElementById('clipCountSelect').value);
      const style = document.getElementById('styleSelect').value;
      const transition = document.getElementById('transitionSelect').value;
      const voice = document.getElementById('voiceSelect').value;
      const banner = document.getElementById('customBanner').value.trim();

      const urls = [];
      if (currentMode === 'urls') {
        document.querySelectorAll('.clip-url').forEach(inp => {
          if (inp.value.trim()) urls.push(inp.value.trim());
        });
      }

      const runBtn = document.getElementById('runBtn');
      const stepper = document.getElementById('stepper');
      const player = document.getElementById('player');
      const empty = document.getElementById('emptyMockup');
      const metaPanel = document.getElementById('metaPanel');

      runBtn.disabled = true;
      runBtn.innerHTML = '<span class="loader"></span> <span>Rendering Master Short...</span>';
      stepper.style.display = 'block';
      updateStep(1);

      try {
        const payload = {
          mode: currentMode,
          topic: topic,
          count: clipCount,
          style: style,
          transition: transition,
          voice: voice,
          banner: banner,
          urls: urls
        };

        const res = await fetch('/api/render_multiclip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || 'Failed to render Short.');
        }

        updateStep(4);
        setTimeout(() => {
          document.getElementById('step4').classList.add('done');
        }, 500);

        // Store video path & metadata for YouTube uploader
        currentVideoPath = data.video_path;
        currentMetadata = data.metadata;

        // Display Video
        empty.style.display = 'none';
        player.style.display = 'block';
        player.src = data.video_url + '?t=' + new Date().getTime();
        player.play();

        // Metadata
        document.getElementById('metaTitleText').innerText = data.metadata.youtube_title;
        document.getElementById('metaTagsText').innerText = data.metadata.hashtags.join(' ');
        document.getElementById('downloadBtn').href = data.video_url;
        metaPanel.style.display = 'block';

      } catch (err) {
        alert('Error: ' + err.message);
      } finally {
        runBtn.disabled = false;
        runBtn.innerHTML = '<span id="btnIcon">⚡</span> <span>Compose & Render Viral Short</span>';
      }
    }

    async function uploadToYouTube() {
      const btn = document.getElementById('ytUploadBtn');
      const status = document.getElementById('uploadStatus');

      if (!currentVideoPath) {
        alert('Please generate a video first!');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<span class="loader"></span> <span>Authenticating & Uploading...</span>';
      status.style.display = 'block';
      status.innerText = 'Connecting to YouTube Data API v3...';

      try {
        const res = await fetch('/api/upload_to_youtube', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            video_path: currentVideoPath,
            metadata: currentMetadata,
            privacy: 'private'
          })
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || 'Upload failed');
        }

        status.innerHTML = `✅ <b>Uploaded!</b> <a href="${data.url}" target="_blank" style="color:var(--accent); text-decoration:underline;">View Short</a>`;
        btn.innerHTML = '<span>✅ Uploaded to YouTube</span>';

      } catch (err) {
        alert('YouTube Upload Error: ' + err.message);
        status.innerHTML = `⚠️ ${err.message}`;
        btn.disabled = false;
        btn.innerHTML = '<span>▶️</span> <span>Publish Directly to YouTube Shorts</span>';
      }
    }

    function copyText(id) {
      const text = document.getElementById(id).innerText;
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
  </script>
</body>
</html>
"""

@app.route("/")
def index():
    return render_template_string(HTML_PAGE)

@app.route("/output/<path:filename>")
def serve_output(filename):
    return send_from_directory(OUTPUT_DIR, filename)

@app.route("/api/render_multiclip", methods=["POST"])
def api_render_multiclip():
    try:
        data = request.json or {}
        mode = data.get("mode", "curated")
        topic = data.get("topic", "Top 6 Most Satisfying ASMR Cutting Videos")
        count = max(6, int(data.get("count", 6)))
        style = data.get("style", "hinglish")
        transition = data.get("transition", "wipeleft")
        voice = data.get("voice", "en-IN-PrabhatNeural")
        custom_banner = data.get("banner", "")
        urls = data.get("urls", [])
        
        # 1. Gather Clips
        clip_paths = []
        if mode == "urls" and urls:
            print(f"[*] Downloading up to {count} custom URLs...")
            for idx, url in enumerate(urls[:count], 1):
                try:
                    p = download_media_from_url(url, filename=f"user_clip_{idx}.mp4")
                    clip_paths.append(p)
                except Exception as err:
                    print(f"[!] Warning downloading {url}: {err}")
                    
        elif mode == "auto":
            print(f"[*] Auto-curating {count} clips for topic: '{topic}'...")
            clip_paths = curate_trending_satisfying_clips(count=count, topic=topic)
            
        # Fallback to curated cache or auto-curate
        if not clip_paths:
            curated_files = glob.glob(os.path.join(CURATED_DIR, "*.mp4"))
            if len(curated_files) >= count:
                clip_paths = curated_files[:count]
            else:
                print(f"[*] Downloading {count} clips to fulfill selection...")
                clip_paths = curate_trending_satisfying_clips(count=count, topic=topic)
                if not clip_paths and curated_files:
                    # Repeat available clips if needed
                    clip_paths = (curated_files * ((count // len(curated_files)) + 1))[:count]
                    
        if not clip_paths:
            workspace_bg = r"g:\Portfolio ainesh\background.mp4"
            if os.path.exists(workspace_bg):
                clip_paths = [workspace_bg] * count
                
        if not clip_paths:
            return jsonify({"error": "No video clips could be downloaded or found."}), 400

        # 2. Generate Script & Voice
        script_data = generate_countdown_script(topic=topic, num_items=len(clip_paths), style=style)
        if custom_banner:
            script_data["header_banner"] = custom_banner.upper()
            
        full_voice = script_data["hook"] + " "
        for item in script_data["items"]:
            full_voice += item["text"] + " "
            
        slug = "".join([c if c.isalnum() else "_" for c in topic.lower()])[:25]
        audio_path = os.path.join(OUTPUT_DIR, f"{slug}_multi_voice.mp3")
        ass_path = os.path.join(OUTPUT_DIR, f"{slug}_multi_subtitles.ass")
        
        asyncio.run(generate_speech(full_voice, audio_path, ass_path, voice=voice))
        
        # 3. Multi-clip Splicing with Transitions & Dynamic Badges
        final_video_name = f"{slug}_MULTICLIP_SHORT.mp4"
        final_output = os.path.join(OUTPUT_DIR, final_video_name)
        
        build_multiclip_short(
            clip_files=clip_paths,
            voice_audio_path=audio_path,
            subtitles_ass_path=ass_path,
            output_path=final_output,
            header_title=script_data["header_banner"],
            transition=transition
        )
        
        return jsonify({
            "success": True,
            "video_url": f"/output/{final_video_name}",
            "video_path": final_output,
            "metadata": script_data,
            "clips_used": len(clip_paths)
        })
        
    except Exception as e:
        print(f"[API Error]: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/upload_to_youtube", methods=["POST"])
def api_upload_to_youtube():
    try:
        data = request.json or {}
        video_path = data.get("video_path")
        metadata = data.get("metadata", {})
        privacy = data.get("privacy", "private")
        
        if not video_path or not os.path.exists(video_path):
            return jsonify({"error": "Video file not found on disk."}), 400
            
        title = metadata.get("youtube_title", "Top Satisfying Compilation #shorts")
        desc = metadata.get("description", "Daily satisfying moments #shorts")
        tags = metadata.get("hashtags", ["shorts", "satisfying"])
        
        res = upload_short(
            video_path=video_path,
            title=title,
            description=desc,
            tags=tags,
            privacy_status=privacy
        )
        return jsonify({"success": True, "url": res["url"], "id": res["video_id"]})
    except Exception as e:
        print(f"[YouTube Upload Error]: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/run_autonomous_now", methods=["POST"])
def api_run_autonomous_now():
    try:
        from auto_master_scheduler import run_autonomous_pipeline
        data = request.json or {}
        slot = data.get("slot", "slot1")
        privacy = data.get("privacy", "public")
        force_cat = data.get("category")
        result = run_autonomous_pipeline(slot=slot, privacy=privacy, force_category=force_cat)
        return jsonify({"success": True, "result": result})
    except Exception as e:
        print(f"[Autonomous Execution Error]: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("[*] Launching OmniShorts AI Studio on http://localhost:5000 ...")
    app.run(host="127.0.0.1", port=5000, debug=False)
