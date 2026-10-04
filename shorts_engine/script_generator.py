import os
import sys
import json
import random

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# 1. HINGLISH PHRASES & TEMPLATES (Up to 10 items)
HINGLISH_HOOKS = [
    "Wait wait wait! Number 1 dekh kar aapke hosh ud jayenge, pakka bata raha hoon!",
    "Bhai sahab! Number 1 itna satisfying hai ki aap dekhte hi reh jaoge!",
    "Arey don't blink! Number 1 wala clip dekh kar aapka dimaag ghum jayega!",
    "Sach bata raha hoon, Number 1 dekh kar aap bologe: Bhai ye kya cheez hai!",
    "Number 1 wala clip dekh kar aapki aankhein khuli ki khuli reh jayengi!"
]

HINGLISH_RANK_LINES = {
    10: "Shuruat karte hain number ten se! Dhyan se dekho is pehle moment ko!",
    9: "Number nine par aata hai ye super clean clip, dekh kar maza hi aa jaye!",
    8: "Aur number eight par dekhiye ye crazy transformation, bilkul mindblowing!",
    7: "Number seven par ye satisfying action dekho, itna smooth ki kya kehna!",
    6: "Moving to number six! Iska texture aur smoothness dekho bhai sahab!",
    5: "Number five par aata hai ye awesome cut, accuracy dekho kitni perfect hai!",
    4: "Number four par aate hi excitement badh jayegi, dekho kaise slice ho raha hai!",
    3: "Number three par dekho dhyan se! Itna smooth slice ki sach me maza aa jaye!",
    2: "Agar ye mast laga, toh number two dekh kar hairan ho jaoge! Look at this precision!",
    1: "Aur ab finally jiska sabko intezar tha... Number one! 3, 2, 1... Bhai ye toh pure magic hai!"
}

# 2. KIDS & YOUTH PHRASES (Up to 10 items)
KIDS_HOOKS = [
    "Hold on to your seats, because Number 1 looks like actual magic!",
    "Wait wait wait! There is no way you can watch Number 1 without smiling!",
    "Are you ready for the ultimate satisfaction test? Don't blink during Number 1!",
    "Number 1 is so crazy you will literally want to watch it ten times!"
]

KIDS_RANK_LINES = {
    10: "Kicking off at Number ten! Look how satisfying this first moment is!",
    9: "Number nine is rolling in! Watch how cleanly this unfolds!",
    8: "At Number eight, check this out! It feels like pure magic!",
    7: "Number seven is so cool! Look at that bright, super smooth slice!",
    6: "Moving fast to Number six! The crunch on this is so fun to hear!",
    5: "Halfway there at Number five! Watch this colorful transformation!",
    4: "Number four is getting serious! Slices through like soft cake!",
    3: "Starting the top three! Watch closely... 3, 2, 1... Whoa!",
    2: "You think that was cool? Just wait till you see Number two!",
    1: "And the grand champion at Number one! Get ready, don't look away... 100% perfection!"
}

# 3. GLOBAL PHRASES (Up to 10 items)
GLOBAL_HOOKS = [
    "Number 1 is hands down the most illegal feeling thing you'll see all week.",
    "There is literally zero chance you can watch number 1 without your jaw hitting the floor.",
    "Do not blink when we get to number 1, because this completely broke the internet."
]

GLOBAL_RANK_LINES = {
    10: "Kicking off at number ten, just look at how cleanly this starts off.",
    9: "At number nine, this first transition is pure satisfying precision.",
    8: "Moving up to number eight, the way this material reacts is fascinating.",
    7: "Number seven steps things up with an impossibly smooth cut.",
    6: "At number six, watch the tolerance on this piece.",
    5: "Halfway at number five, the satisfying crunch here is unbelievable.",
    4: "Number four is where things get truly mind-bending.",
    3: "Starting the top three, the sheer precision here is hypnotic.",
    2: "If you think that was clean, wait till you see number two. Looks like CGI.",
    1: "And finally, the moment you've all been waiting for. Number one. Absolute perfection."
}

def generate_countdown_script(
    topic: str = "Satisfying Moments",
    num_items: int = 3,
    style: str = "hinglish",
    api_key: str = None
) -> dict:
    """
    Generates high-retention countdown scripts for anywhere from 2 up to 10 items.
    """
    num_items = max(2, min(int(num_items), 10))
    gemini_key = api_key or os.environ.get("GEMINI_API_KEY")
    
    if gemini_key:
        try:
            from google import genai
            client = genai.Client(api_key=gemini_key)
            style_instruction = {
                "hinglish": "High-energy Hinglish for Indian youth/kids ('Bhai sahab!', 'Wait for #1').",
                "kids": "Super enthusiastic playful English with excitement and wonder ('3, 2, 1... Wow!').",
                "global": "RankVault-style sleek conversational creator tone."
            }.get(style, "Hinglish")
            
            prompt = f"""
Write a viral YouTube Shorts Top {num_items} script about: "{topic}".
Style: {style_instruction}
Rules:
1. Hook must tease Number 1.
2. Generate exactly {num_items} items (ranks {num_items} down to 1).
3. If {num_items} >= 6, keep each item's sentence short (5-8 words each) so the total video fits within 50 seconds!
4. Return ONLY valid JSON:
{{
  "header_banner": "TOP {num_items} SATISFYING",
  "youtube_title": "Top {num_items} Most Satisfying Moments! 🤯 #shorts",
  "hashtags": ["#shorts", "#satisfying", "#viral", "#trending"],
  "description": "Wait till Number 1! Which one was your favorite? 👇\\n\\n#shorts #satisfying",
  "hook": "...",
  "items": [
    {{ "rank": {num_items}, "badge": "RANK #{num_items} - RATING 9.0 / 10", "text": "..." }}
  ]
}}
"""
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config={"response_mime_type": "application/json"}
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"[Notice] Gemini generation fallback ({e}). Using built-in templates...")

    # Built-in Dynamic Fallback
    if style == "hinglish":
        hook = random.choice(HINGLISH_HOOKS)
        rank_lines = HINGLISH_RANK_LINES
        titles = [
            f"Bhai Sahab! Top {num_items} Most Satisfying Moments 😱 #shorts",
            f"Wait For Number 1 🤯 (Top {num_items} Challenge!) #shorts",
            f"Top {num_items} Dekh Kar Maza Aa Jayega! 🤤 #shorts"
        ]
        banner = f"TOP {num_items} SATISFYING"
        desc = f"Aapko kaun sa number sabse zyada mast laga? Comment karke batao! 👇\n\n#shorts #satisfying #top{num_items}"
    elif style == "kids":
        hook = random.choice(KIDS_HOOKS)
        rank_lines = KIDS_RANK_LINES
        titles = [
            f"Wait For The End! Top {num_items} Moments 🚀 #shorts",
            f"Top {num_items} Inventions That Look Like Magic! 🤯 #shorts",
            f"Try Not To Say WOW (Top {num_items}) 🤤 #shorts"
        ]
        banner = f"TOP {num_items} SATISFYING MAGIC"
        desc = f"Which one was your favorite? Comment below! 👇\n\n#shorts #satisfying #top{num_items}"
    else:
        hook = random.choice(GLOBAL_HOOKS)
        rank_lines = GLOBAL_RANK_LINES
        titles = [
            f"Ranking The Top {num_items} Most Satisfying Moments On The Internet ⚡ #shorts",
            f"Top {num_items} Moments That Feel Illegal To Watch 🤯 #shorts"
        ]
        banner = f"RANKING TOP {num_items} SATISFYING"
        desc = f"Which one gave you chills? Comment below! 👇\n\n#shorts #satisfying #top{num_items}"

    items = []
    for r in range(num_items, 0, -1):
        idx = num_items - r
        # Calculate rating out of 10 scaling from 8.8 up to 10
        score_val = 8.8 + (idx / max(1, num_items - 1)) * 1.2
        if r == 1:
            badge = "RANK #1 - RATING 10 / 10"
        else:
            badge = f"RANK #{r} - RATING {score_val:.1f} / 10"
            
        line = rank_lines.get(r, f"At rank number {r}, this clip is completely crazy!")
        items.append({
            "rank": r,
            "badge": badge,
            "text": line
        })

    return {
        "header_banner": banner,
        "youtube_title": random.choice(titles),
        "hashtags": ["#shorts", "#satisfying", "#oddlysatisfying", "#viral", "#trending"],
        "description": desc,
        "hook": hook,
        "items": items
    }

if __name__ == "__main__":
    print("Testing Top 5 Hinglish script:")
    s5 = generate_countdown_script("Metal Cutting", num_items=5, style="hinglish")
    print("Title:", s5["youtube_title"])
    for it in s5["items"]:
        print(f"[{it['badge']}] {it['text']}")
        
    print("\nTesting Top 10 Kids script:")
    s10 = generate_countdown_script("Satisfying Slime", num_items=10, style="kids")
    print("Title:", s10["youtube_title"])
    print(f"Total items generated: {len(s10['items'])}")
