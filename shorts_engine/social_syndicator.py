import os
import sys
import json
import urllib.request
import urllib.parse
import datetime

# Ensure UTF-8 output
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def send_telegram_alert(
    title: str,
    category: str,
    video_url: str,
    viral_reference: str = None,
    duration_sec: float = None,
    bot_token: str = None,
    chat_id: str = None
) -> bool:
    """
    Sends an instant real-time Telegram notification to your phone when a Short is published.
    Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in environment or GitHub Secrets.
    """
    token = bot_token or os.environ.get("TELEGRAM_BOT_TOKEN")
    cid = chat_id or os.environ.get("TELEGRAM_CHAT_ID")
    
    if not token or not cid:
        print("[Notice] Telegram alerts: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set. Skipping mobile ping.")
        return False
        
    ref_text = f"\n🔥 *Viral Reference:* `{viral_reference}`" if viral_reference else ""
    dur_text = f"\n⏱️ *Duration:* `{duration_sec:.1f}s`" if duration_sec else ""
    
    message = (
        f"🚀 *YOUTUBE SHORT PUBLISHED LIVE!* 🚀\n\n"
        f"📌 *Title:* {title}\n"
        f"🎯 *Category:* #{category.replace(' ', '_')}\n"
        f"🔗 *Watch Short:* [Click Here to View]({video_url})\n"
        f"{dur_text}"
        f"{ref_text}\n\n"
        f"⏰ *Time:* {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S IST')}\n"
        f"🤖 *Automated by Master Shorts Engine*"
    )
    
    try:
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        payload = json.dumps({
            "chat_id": cid,
            "text": message,
            "parse_mode": "Markdown",
            "disable_web_page_preview": False
        }).encode("utf-8")
        
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status == 200:
                print(f"📱 [Telegram Alert] Notification sent to phone successfully!")
                return True
    except Exception as e:
        print(f"[!] Telegram alert notice: {e}")
        
    return False

def post_to_instagram_reels(
    video_url_or_path: str,
    caption: str,
    access_token: str = None,
    instagram_account_id: str = None
) -> dict:
    """
    Syndicates vertical 9:16 Shorts to Instagram Reels via Meta Graph API.
    Set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_ACCOUNT_ID in environment or GitHub Secrets.
    """
    token = access_token or os.environ.get("INSTAGRAM_ACCESS_TOKEN")
    ig_id = instagram_account_id or os.environ.get("INSTAGRAM_ACCOUNT_ID")
    
    if not token or not ig_id:
        print("[Notice] Instagram Syndication: INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_ACCOUNT_ID not configured.")
        return None
        
    print(f"[*] Starting Instagram Reels syndication for account ID: {ig_id}...")
    try:
        # Step 1: Create media container for REELS
        create_url = f"https://graph.facebook.com/v19.0/{ig_id}/media"
        params = {
            "media_type": "REELS",
            "video_url": video_url_or_path,
            "caption": caption,
            "access_token": token
        }
        data = urllib.parse.urlencode(params).encode("utf-8")
        req = urllib.request.Request(create_url, data=data)
        with urllib.request.urlopen(req, timeout=15) as resp:
            res_data = json.loads(resp.read().decode("utf-8"))
            container_id = res_data.get("id")
            
        if not container_id:
            print("[!] Could not create Instagram media container.")
            return None
            
        print(f"[OK] Instagram container created: {container_id}. Publishing Reel...")
        
        # Step 2: Publish Reel container
        pub_url = f"https://graph.facebook.com/v19.0/{ig_id}/media_publish"
        pub_params = {
            "creation_id": container_id,
            "access_token": token
        }
        pub_data = urllib.parse.urlencode(pub_params).encode("utf-8")
        pub_req = urllib.request.Request(pub_url, data=pub_data)
        with urllib.request.urlopen(pub_req, timeout=15) as pub_resp:
            pub_res = json.loads(pub_resp.read().decode("utf-8"))
            reel_id = pub_res.get("id")
            print(f"🎉 [Instagram] Reel published successfully! (ID: {reel_id})")
            return {"instagram_reel_id": reel_id}
    except Exception as e:
        print(f"[!] Instagram syndication notice: {e}")
        return None

if __name__ == "__main__":
    print("[*] Testing Social Syndication Module...")
    # Test telegram alert placeholder
    send_telegram_alert(
        title="Test Oddly Satisfying #shorts",
        category="ASMR",
        video_url="https://youtube.com/shorts/test",
        duration_sec=61.2
    )
