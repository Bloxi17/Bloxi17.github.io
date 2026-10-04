import base64
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TOKEN_PATH = os.path.join(BASE_DIR, "token.pickle")
CLIENT_SECRETS_PATH = os.path.join(BASE_DIR, "client_secrets.json")

def get_base64(filepath):
    if not os.path.exists(filepath):
        return None
    with open(filepath, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

token_b64 = get_base64(TOKEN_PATH)
client_b64 = get_base64(CLIENT_SECRETS_PATH)

print("=" * 70)
print("🔑 GITHUB ACTIONS SECRETS FOR 24/7 CLOUD AUTOMATION (100% FREE) 🔑")
print("=" * 70)
print("\nGo to your GitHub repository in your browser:")
print("👉 https://github.com/Bloxi17/Bloxi17.github.io/settings/secrets/actions\n")
print("Click 'New repository secret' and add these 2 secrets:\n")

print("-" * 70)
print("1. Secret Name: YOUTUBE_TOKEN_PICKLE")
print("Secret Value (Copy everything below):")
print("-" * 70)
print(token_b64)

print("\n" + "-" * 70)
print("2. Secret Name: YOUTUBE_CLIENT_SECRETS")
print("Secret Value (Copy everything below):")
print("-" * 70)
print(client_b64)
print("-" * 70)
