import os
import sys
import json
import pickle
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

# Ensure UTF-8 output
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.force-ssl"
]
CREDENTIALS_FILE = os.path.join(os.path.dirname(__file__), "client_secrets.json")
TOKEN_PICKLE = os.path.join(os.path.dirname(__file__), "token.pickle")

def is_configured() -> bool:
    """Checks if credentials or auth token exist."""
    return os.path.exists(TOKEN_PICKLE) or os.path.exists(CREDENTIALS_FILE)

def get_authenticated_service():
    """
    Handles Google OAuth 2.0.
    Once authenticated, token.pickle is stored and future runs are 100% headless.
    """
    creds = None
    
    if os.path.exists(TOKEN_PICKLE):
        with open(TOKEN_PICKLE, "rb") as token:
            creds = pickle.load(token)
            
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(CREDENTIALS_FILE):
                raise FileNotFoundError(
                    "Missing 'client_secrets.json' in shorts_engine folder.\n"
                    "Follow the 3-minute Google Cloud setup to enable automated uploads."
                )
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
            
        with open(TOKEN_PICKLE, "wb") as token:
            pickle.dump(creds, token)
            
    return build("youtube", "v3", credentials=creds)

def post_engagement_comment(youtube, video_id: str, comment_text: str) -> str:
    """
    Posts a high-CTR engagement comment on the newly published Short.
    Spikes algorithm velocity and encourages viewer discussions.
    """
    try:
        req = youtube.commentThreads().insert(
            part="snippet",
            body={
                "snippet": {
                    "videoId": video_id,
                    "topLevelComment": {
                        "snippet": {
                            "textOriginal": comment_text
                        }
                    }
                }
            }
        )
        resp = req.execute()
        comment_id = resp.get("id")
        print(f"[OK] Engagement comment posted: \"{comment_text[:50]}...\" (ID: {comment_id})")
        return comment_id
    except Exception as e:
        print(f"[Notice] Auto-comment note: {e}")
        return None

def upload_short(
    video_path: str,
    title: str,
    description: str,
    tags: list = None,
    privacy_status: str = "private",  # 'public', 'private', or 'unlisted'
    pinned_comment: str = None,
    progress_callback = None
):
    """
    Uploads 9:16 vertical video to YouTube Shorts and posts auto-engagement comment.
    """
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video file does not exist: {video_path}")
        
    print(f"[*] Authenticating with YouTube Data API...")
    youtube = get_authenticated_service()
    
    if tags is None:
        tags = ["shorts", "satisfying", "viral"]
        
    # Ensure title has #shorts
    if "#shorts" not in title.lower():
        title = f"{title[:90]} #shorts"
        
    body = {
        "snippet": {
            "title": title[:100],
            "description": description,
            "tags": tags,
            "categoryId": "24"  # 24 = Entertainment
        },
        "status": {
            "privacyStatus": privacy_status,
            "selfDeclaredMadeForKids": False
        }
    }
    
    media = MediaFileUpload(
        video_path,
        chunksize=1024 * 1024 * 2,  # 2MB chunks for progress tracking
        resumable=True,
        mimetype="video/mp4"
    )
    
    print(f"[*] Starting upload: '{title}' ({privacy_status})...")
    request = youtube.videos().insert(
        part="snippet,status",
        body=body,
        media_body=media
    )
    
    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            progress = int(status.progress() * 100)
            print(f"[*] Uploading: {progress}% complete...")
            if progress_callback:
                progress_callback(progress)
                
    video_id = response.get("id")
    video_url = f"https://youtube.com/shorts/{video_id}"
    print(f"\n[SUCCESS] Upload complete!")
    print(f"🔗 YouTube Short URL: {video_url}")
    
    # Auto-post engagement comment
    comment_id = None
    if pinned_comment:
        comment_id = post_engagement_comment(youtube, video_id, pinned_comment)
        
    return {"video_id": video_id, "url": video_url, "comment_id": comment_id}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        vid = sys.argv[1]
        t = sys.argv[2] if len(sys.argv) > 2 else "Satisfying Compilation #shorts"
        d = sys.argv[3] if len(sys.argv) > 3 else "Subscribe for daily satisfying clips! #shorts"
        upload_short(vid, t, d, privacy_status="private")
    else:
        print("[*] Credentials detected! Connecting to Google to authorize...")
        try:
            get_authenticated_service()
            print("\n[SUCCESS] Authentication complete! 'token.pickle' has been generated.")
            print("[*] Your channel is now 100% authorized for autonomous headless uploads.")
        except Exception as e:
            print(f"[Error during authorization]: {e}")
