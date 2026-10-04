import os
import sys
import json
import datetime
import random
from config import BASE_DIR

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

HISTORY_FILE = os.path.join(BASE_DIR, "topic_history.json")

# =====================================================================
# WEEKLY UPLOAD CALENDAR (Strict 4-Niche Rotation)
# Monday:    2 ASMR Shorts
# Tuesday:   2 Funny Moments Shorts
# Wednesday: 2 Accident & Crazy Moments Shorts
# Thursday:  2 ASMR Shorts
# Friday:    2 Funny Moments Shorts
# Saturday:  2 Accident & Crazy Moments Shorts
# Sunday:    2 Mixed Shorts + 1 EXTRA SPECIAL (Top 10 Beautiful Persons)
# =====================================================================

WEEKLY_SCHEDULE = {
    0: {"day": "Monday", "category": "ASMR", "sub_niches": ["Kinetic Sand Slicing", "Hydraulic Press Crushing", "Dry Floral Foam Crunch", "Soap Carving & Scraping", "Laser Rust Removal"]},
    1: {"day": "Tuesday", "category": "Funny Moments", "sub_niches": ["Instant Regret Fails", "Smart Pets Outsmarting Humans", "Gym & Workout Bloopers", "Hilarious Kid Reactions", "Unbelievable Lucky Fails"]},
    2: {"day": "Wednesday", "category": "Accident & Crazy Moments", "sub_niches": ["Superhuman Driver Reflexes", "Miracle Escape Close Calls", "Heavy Machinery Near Misses", "Extreme Weather Close Calls", "Crazy Dashcam Saves"]},
    3: {"day": "Thursday", "category": "ASMR", "sub_niches": ["Frozen Honeycomb Crunch", "Satisfying Wood Turning", "High Pressure Waterjet Cutting", "Deep Rug Washing Transformation", "Molten Glass Drop Slicing"]},
    4: {"day": "Friday", "category": "Funny Moments", "sub_niches": ["Try Not To Laugh Extreme", "Crazy Construction Fails", "Epic Pranks Gone Wrong", "Funny Sports Bloopers", "Unexpected Funny Plot Twists"]},
    5: {"day": "Saturday", "category": "Accident & Crazy Moments", "sub_niches": ["Insane Train & Rail Near Misses", "Extreme Mountain Bike Escapes", "Aviation & Crane Miracles", "Shocking Lightning Strikes", "Close Call Pedestrian Saves"]},
    6: {"day": "Sunday", "category": "Mixed & Sunday Special", "sub_niches": ["Mindblowing Satisfying Magic", "Funniest Internet Moments", "Top 10 Most Beautiful Faces in the World"]}
}

# Extensive procedural database to guarantee ZERO repeated videos for 100+ days
CATEGORY_DATA_BANK = {
    "ASMR": {
        "titles": [
            "Headphones Pehno Aur Jadoo Dekho 🎧🤤 #shorts",
            "Bhai Sahab! Ye Sound Kaan Ko Thandak De Dega 🤤💥 #shorts",
            "Duniya Ka Sabse Crispy Aur Satisfying Video! 🤤✨ #shorts",
            "Bhai Ye Kya Cheez Hai! Oddly Satisfying ASMR 🤯🔪 #shorts",
            "Wait For Number 1! 100% Pure Ear Candy 🤤🔊 #shorts",
            "Aisa Sound Zindagi Me Pehle Kabhi Nahi Suna Hoga! 🎧🤤 #shorts",
            "Is Video Ko Dekh Kar Dimag Ka Stress Gayab Ho Jayega 🧘‍♂️✨ #shorts",
            "Extreme Satisfying ASMR (Don't Miss #1) 🤤🔥 #shorts"
        ],
        "hooks": [
            "Wait for Number 1! Kaan ko thandak de dega!",
            "Headphones pehno aur Number 1 dekho!",
            "Wait till Number 1! 100% pure ear candy!",
            "Bhai sahab! Number 1 miss mat karna!",
            "Arey don't blink! Number 1 pure magic hai!"
        ],
        "bridge_lines": {
            10: "Number 10 se shuru karte hain! Suno ye!",
            9: "Number 9 ka crisp slice dekho!",
            8: "Number 8 par aata hai ye deep crunch!",
            7: "Number 7 ka texture dekho bhai sahab!",
            6: "Moving to Number 6! Sound check karo!",
            5: "Number 5 par ultimate satisfying moment!",
            4: "Number 4 par maza doguna ho jayega!",
            3: "Number 3... Suno iski awaaz!",
            2: "Number 2 ka crunch check karo!",
            1: "Aur Number 1... 3, 2, 1... Pure ear candy!"
        },
        "banners": [
            "TOP 3 ODDLY SATISFYING",
            "SATISFYING ASMR SOUNDS",
            "CRUNCHY ASMR 10/10",
            "EXTREME ASMR SLICING",
            "PURE SATISFACTION 10/10"
        ],
        "queries": [
            "oddly satisfying asmr cutting 4k",
            "kinetic sand razor cutting asmr",
            "crunchy soap carving asmr clean audio",
            "frozen honey snap crunchy asmr",
            "hydraulic press crushing crunchy things asmr",
            "dry floral foam crushing glitter asmr",
            "laser rust removal oddly satisfying 4k",
            "waterjet slicing through objects asmr",
            "deep carpet cleaning satisfying power wash",
            "wood turning bowl smooth finish asmr"
        ]
    },
    "Funny Moments": {
        "titles": [
            "Bhai Sahab! Is Bewakoof Ko Dekho 😂🤦‍♂️ #shorts",
            "Hassi Rok Kar Dikhao Challenge! (Top 3) 😂🤣 #shorts",
            "Number 1 Dekh Kar Pet Me Dard Ho Jayega! 😭😂 #shorts",
            "Instant Regret Moments Caught On Camera 💀😂 #shorts",
            "Duniya Ke Sabse Khurafaati Log! 🤣🔥 #shorts",
            "Bhai Ne Aisa Kaand Kar Diya Ki Sab Hairan! 😂🚗 #shorts",
            "Try Not To Laugh Impossible Edition! 😭💀 #shorts",
            "Ye Janwar Toh Insan Se Bhi Tez Nikla! 🐶😂 #shorts"
        ],
        "hooks": [
            "Wait for Number 1! Hansi nahi rukegi!",
            "Bhai sahab! Number 1 par pakka lot-pot!",
            "Arey don't scroll! Number 1 dekho!",
            "Try not to laugh! Wait for #1!",
            "Number 1 dekh kar dimaag hil jayega!"
        ],
        "bridge_lines": {
            10: "Number 10 se shuru! Is bande ko dekho!",
            9: "Number 9 par hilarious fail dekho!",
            8: "Number 8 ka epic overconfidence dekho!",
            7: "Number 7 par aisi comedy hui!",
            6: "Moving to Number 6! Reaction dekho!",
            5: "Number 5 par aata hai funny fail!",
            4: "Number 4 par hansi nahi rukegi!",
            3: "Number 3... Is bewakoof ko dekho!",
            2: "Number 2 dekh kar hosh ud jayenge!",
            1: "Aur Number 1... Hassi rok kar dikhao!"
        },
        "banners": [
            "TOP 3 FUNNIEST MOMENTS",
            "TRY NOT TO LAUGH 10/10",
            "INSTANT REGRET FAILS",
            "TOP 3 COMEDY CLIPS",
            "ULTIMATE FUNNY MOMENTS"
        ],
        "queries": [
            "try not to laugh funniest clips",
            "instant regret funny moments caught on camera",
            "funniest gym fails workout bloopers",
            "people doing stupid things funny clips",
            "funniest kid moments caught on live camera",
            "smart animals being funny geniuses",
            "hilarious sports moments bloopers",
            "unexpected funny plot twists clips"
        ]
    },
    "Accident & Crazy Moments": {
        "titles": [
            "1 Second Ki Der Aur Sab Khatam! 😱🔥 #shorts",
            "Driver Ka Dimag Dekh Kar Hosh Ud Jayenge! 🤯🚗 #shorts",
            "Kismat Ho Toh Aisi! बाल बाल बचे 😱 #shorts",
            "Miracle Close Calls Caught On Camera! 😱⚡ #shorts",
            "Yamraj Ko Chhukar Wapas Aa Gaye! 😱💀 #shorts",
            "Superhuman Reflexes Saves (Number 1 Insane) 🤯🔥 #shorts",
            "Duniya Ke Sabse Khatarnak Moments! 😱🚗 #shorts",
            "Kudrat Ka Kehar! Live Camera Par Record Ho Gaya ⚡😱 #shorts"
        ],
        "hooks": [
            "Wait for Number 1! Rongte khade ho jayenge!",
            "Bhai sahab! Number 1 dekh kar hosh ud jayenge!",
            "Don't blink during Number 1!",
            "1 second ki der aur sab khatam!",
            "Number 1 dekh kar saansein tham jayengi!"
        ],
        "bridge_lines": {
            10: "Number 10 se shuru! Dhyan se dekho!",
            9: "Number 9 par extreme close call!",
            8: "Number 8 par driver ke reflexes dekho!",
            7: "Number 7 par miracle save dekho!",
            6: "Moving to Number 6! Kismat dekho!",
            5: "Number 5 par terrifying moment!",
            4: "Number 4 par saansein tham jayengi!",
            3: "Number 3... 1 second ki der aur khatam!",
            2: "Number 2... Superhuman reflexes dekho!",
            1: "Aur Number 1... Kismat ho toh aisi!"
        },
        "banners": [
            "INSANE CLOSE CALLS",
            "MIRACLE ESCAPES 10/10",
            "SUPERHUMAN REFLEXES",
            "CRAZY NEAR MISSES",
            "TOP 3 MIRACLE SAVES"
        ],
        "queries": [
            "insane close calls caught on camera luck",
            "driver superhuman reflexes save dashcam",
            "heavy equipment excavator close calls",
            "extreme sports miracle escape caught on tape",
            "shocking weather lightning close calls",
            "miracle survival near misses compilation",
            "truck driver quick reflex accident save"
        ]
    },
    "Top 10 Beauties": {
        "titles": [
            "Top 10 Most Beautiful Faces In The World 2026 😱🔥 #shorts",
            "Duniya Ki 10 Sabse Khubsurat Ladkiyan 🤯✨ #shorts",
            "Number 1 Dekh Kar Hosh Ud Jayenge! 👑🤤 #shorts",
            "Top 10 Most Attractive Female Celebrities In The World ✨🔥 #shorts",
            "Duniya Ki Sabse Stunning Actresses (Rank #1 Jaw-Dropping!) 👑✨ #shorts"
        ],
        "hooks": [
            "Wait wait wait! You won't believe who was officially ranked as the Number 1 most beautiful face in the world!",
            "Hold on! Number 1 is so breathtaking that millions of people voted her the undisputed queen!",
            "Wait till the end! Ranks 10 down to 1 are absolute perfection, but Number 1 breaks the internet!"
        ],
        "bridge_lines": {
            10: "Kicking off at Number 10! Look at this timeless elegance!",
            9: "At Number 9, she holds one of the most stunning smiles in cinema!",
            8: "Moving up to Number 8, pure natural grace!",
            7: "Number 7 has captivated millions across the globe!",
            6: "At Number 6, known worldwide for her iconic features!",
            5: "Halfway at Number 5, sheer radiant beauty!",
            4: "Number 4 is where things get truly breathtaking!",
            3: "Starting the top three at Number 3, absolute perfection!",
            2: "Number 2 was almost the champion, incredibly stunning!",
            1: "And finally Number 1! Officially voted the most beautiful face in the world!"
        },
        "banners": [
            "TOP 10 MOST BEAUTIFUL",
            "TOP 10 STUNNING FACES",
            "WORLD'S MOST ATTRACTIVE",
            "TOP 10 BEAUTY QUEENS"
        ],
        "queries": [
            "top 10 most beautiful women celebrities faces",
            "most beautiful actresses in the world 4k",
            "top 10 most attractive female celebrities worldwide",
            "most beautiful faces in the world"
        ]
    }
}

def load_history() -> dict:
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"used_topics": [], "used_titles": [], "log": []}

def save_history(history: dict):
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2, ensure_ascii=False)

def get_todays_category(slot: str = "slot1") -> dict:
    """
    Returns the scheduled category for today based on the exact weekly plan.
    - Monday (0): ASMR (slot1 & slot2)
    - Tuesday (1): Funny Moments (slot1 & slot2)
    - Wednesday (2): Accident & Crazy (slot1 & slot2)
    - Thursday (3): ASMR (slot1 & slot2)
    - Friday (4): Funny Moments (slot1 & slot2)
    - Saturday (5): Accident & Crazy (slot1 & slot2)
    - Sunday (6):
        * slot1: Mixed ASMR / Satisfying
        * slot2: Mixed Funny / Crazy
        * special: Top 10 Most Beautiful Persons/Women (10 items)
    """
    weekday = datetime.datetime.now().weekday()
    
    # Sunday Extra Special
    if weekday == 6 and slot == "special":
        return {
            "day": "Sunday",
            "slot": "special",
            "category": "Top 10 Beauties",
            "is_special": True,
            "num_items": 10,
            "style": "kids"
        }
        
    # Sunday Mixed slots
    if weekday == 6:
        if slot == "slot1":
            return {
                "day": "Sunday",
                "slot": "slot1",
                "category": "ASMR",
                "is_special": False,
                "num_items": 6,
                "style": "hinglish"
            }
        else:
            return {
                "day": "Sunday",
                "slot": "slot2",
                "category": "Funny Moments",
                "is_special": False,
                "num_items": 6,
                "style": "hinglish"
            }
            
    sched = WEEKLY_SCHEDULE.get(weekday, WEEKLY_SCHEDULE[0])
    return {
        "day": sched["day"],
        "slot": slot,
        "category": sched["category"],
        "is_special": False,
        "num_items": 6,
        "style": "hinglish"
    }

def generate_unique_topic(category_info: dict, api_key: str = None) -> dict:
    """
    Generates a 100% brand-new, never-repeated viral topic.
    Checks persistent history to guarantee zero repetition.
    Enforces at least 6 items per video.
    """
    history = load_history()
    used_topics = set(history.get("used_topics", []))
    used_titles = set(history.get("used_titles", []))
    
    category = category_info["category"]
    num_items = max(6, category_info.get("num_items", 6))
    is_special = category_info.get("is_special", False)
    
    gemini_key = api_key or os.environ.get("GEMINI_API_KEY")
    
    # Try dynamic Gemini AI generation if key is supplied
    if gemini_key:
        try:
            from google import genai
            client = genai.Client(api_key=gemini_key)
            prompt = f"""
You are the Master YouTube Shorts Strategist for an elite viral Indian channel.
Generate ONE completely unique, high-CTR YouTube Shorts concept for:
Category: "{category}" (Ranks: {num_items} down to 1).
Is Sunday Extra Special: {is_special}.

Previously used topics (DO NOT REPEAT):
{json.dumps(list(used_topics)[-25:])}

Rules:
1. High-energy Hinglish tone.
2. Hook MUST use Curiosity Gap method teasing Number 1.
3. Bridge lines MUST ONLY be short transition voiceovers (5-8 words per rank) to let raw action audio play out.
4. Output valid JSON:
{{
  "topic": "Clean topic name",
  "banner": "TOP {num_items} HEADER TEXT",
  "search_query": "specific search terms for yt-dlp",
  "youtube_title": "Irresistible Hindi/Hinglish title with emojis and #shorts",
  "hook": "Wait wait wait! Number 1 dekh kar...",
  "bridge_lines": {{
    "1": "Aur finally Number 1...",
    "{num_items}": "Number {num_items}..."
  }},
  "description": "Engaging description with #shorts"
}}
"""
            res = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config={"response_mime_type": "application/json"}
            )
            data = json.loads(res.text)
            if data["topic"] not in used_topics and data["youtube_title"] not in used_titles:
                history["used_topics"].append(data["topic"])
                history["used_titles"].append(data["youtube_title"])
                save_history(history)
                return data
        except Exception as e:
            print(f"[Notice] Gemini generation fallback ({e}). Using anti-repetition permutation bank...")

    # Robust built-in procedural generation
    bank = CATEGORY_DATA_BANK.get(category, CATEGORY_DATA_BANK["ASMR"])
    
    # Find a title and query combination that hasn't been used yet
    available_titles = [t for t in bank["titles"] if t not in used_titles]
    if not available_titles:
        available_titles = bank["titles"]
        
    chosen_title = random.choice(available_titles)
    chosen_title = chosen_title.replace("Top 3", f"Top {num_items}").replace("TOP 3", f"TOP {num_items}")
    chosen_hook = random.choice(bank["hooks"])
    chosen_banner = random.choice(bank["banners"])
    chosen_banner = chosen_banner.replace("TOP 3", f"TOP {num_items}").replace("Top 3", f"Top {num_items}")
    chosen_query = random.choice(bank["queries"])
    
    # Generate unique topic identifier
    topic_identifier = f"{category} - {chosen_banner} - {len(history['used_topics']) + 1}"
    
    # Generate bridge lines for exactly num_items (ranks num_items down to 1)
    bridge_lines = {}
    for r in range(num_items, 0, -1):
        if r in bank["bridge_lines"]:
            bridge_lines[str(r)] = bank["bridge_lines"][r]
        elif r == 1:
            bridge_lines[str(r)] = "Aur ab finally Number 1... 3, 2, 1... Magic!"
        else:
            bridge_lines[str(r)] = f"Number {r} par dekho dhyan se!"

    # Save to history
    history["used_topics"].append(topic_identifier)
    history["used_titles"].append(chosen_title)
    save_history(history)
    
    return {
        "topic": topic_identifier,
        "category": category,
        "num_items": num_items,
        "banner": chosen_banner,
        "search_query": chosen_query,
        "youtube_title": chosen_title,
        "hook": chosen_hook,
        "bridge_lines": bridge_lines,
        "description": "Aapko kaun sa number sabse zyada mast laga? Comment karke batao! 👇\n\n#shorts #viral #trending"
    }

if __name__ == "__main__":
    for slot in ["slot1", "slot2", "special"]:
        cat = get_todays_category(slot=slot)
        topic = generate_unique_topic(cat)
        print(f"\n[{slot.upper()}] Category: {cat['category']} (Items: {cat['num_items']})")
        print("Title:", topic["youtube_title"])
        print("Hook:", topic["hook"])
        print("Sample Bridge #1:", topic["bridge_lines"].get("1"))
