import urllib.request
import ssl

ctx = ssl._create_unverified_context()

print("=== CHECKING VERCEL ===")
try:
    with urllib.request.urlopen("https://nasa-flame.vercel.app", context=ctx) as r:
        html = r.read().decode("utf-8")
        print("HTML length:", len(html))
        print("HTML:", html)
except Exception as e:
    print("Vercel error:", e)

print("\n=== CHECKING RENDER ===")
endpoints = [
    "https://nasa-flame-backend.onrender.com",
    "https://nasa-flame-backend.onrender.com/",
    "https://nasa-flame-backend.onrender.com/health",
    "https://nasa-flame-backend.onrender.com/docs",
    "https://nasa-flame-backend.onrender.com/api/health",
    "https://nasa-flame-backend.onrender.com/api/experiments",
]

for ep in endpoints:
    try:
        req = urllib.request.Request(ep, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, context=ctx) as r:
            body = r.read().decode("utf-8")
            print(f"{ep} => {r.status}: {body[:150]}")
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")
        print(f"{ep} => HTTP {e.code}: {body[:150]}")
    except Exception as e:
        print(f"{ep} => ERROR: {e}")
