import re
with open("lr.html", "r") as f:
    html = f.read()

# Finding all image urls inside the HTML (since LR might use something like /v2/spaces/.../assets/..../renditions/2048)
matches = re.findall(r"(https://[^\"\'\s]+(2048|1024|jpg|png))", html)
if matches:
    print(f"Found {len(matches)} urls. First few:")
    for m in list(set(matches))[:20]:
        print(m[0])
else:
    print("No image urls found directly.")
    
# Let's also print the beginning of the big JSON blob so we can see what it actually is
match_json = re.search(r"window\.PageResources = (\{.*?\});", html, re.DOTALL)
if match_json:
    print("\nPageResources blob start:")
    print(match_json.group(1)[:500])
