import urllib.request
import json
import re
import ssl

def fetch_url(url):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx) as response:
        return response.read().decode('utf-8')

def run():
    print("Fetching Lightroom album...")
    try:
        html = fetch_url('https://adobe.ly/4duIYGg')
    except Exception as e:
        print("Error fetching adobe.ly:", e)
        return

    # Extract IDs directly using Regex because SharesConfig is a JS object (not strict JSON)
    space_id_match = re.search(r'spaceAttributes:\s*\{[^}]*"id":"([^"]+)"', html)
    album_id_match = re.search(r'albumAttributes:\s*\{[^}]*"id":"([^"]+)"', html)
    base_url_match = re.search(r'"base":"([^"]+)"', html)
    
    if not (space_id_match and album_id_match and base_url_match):
        print("Could not find spaceId or albumId in HTML")
        return

    space_id = space_id_match.group(1)
    album_id = album_id_match.group(1)
    base_url = base_url_match.group(1) # https://photos.adobe.io/v2/
    
    assets_url = f"{base_url}spaces/{space_id}/albums/{album_id}/assets?embed=asset&subtype=image;video"
    print(f"Fetching assets from {assets_url}")
    
    try:
        assets_data = fetch_url(assets_url)
    except Exception as e:
        print("Error fetching assets API:", e)
        return

    assets_data = assets_data.replace('while (1) {}', '').strip()
    assets_json = json.loads(assets_data)
    
    photos = []
    for res in assets_json.get('resources', []):
        asset = res.get('asset', {})
        links = asset.get('links', {})
        if '/rels/rendition_type/2048' in links:
            rel_href = links['/rels/rendition_type/2048']['href']
            full_url = f"{base_url}spaces/{space_id}/{rel_href}?api_key=LightroomMobileWeb1"
            
            # Try to extract caption/date
            caption = "Untitled"
            try:
                payload = asset.get('payload', {})
                import_source = payload.get('importSource', {})
                date = payload.get('captureDate') or import_source.get('importTimestamp') or ""
                date_str = date.split('T')[0] if date else "Date unknown"
                filename = import_source.get('fileName') or "Photo"
                caption = f"{date_str} - {filename}"
            except Exception:
                pass
            
            photos.append({'url': full_url, 'caption': caption})
    
    print(f"Found {len(photos)} photos.")
    if not photos:
        print("No photos found, exiting.")
        return

    try:
        with open('lens.html', 'r', encoding='utf-8') as f:
            lens_html = f.read()
    except Exception as e:
        print("Error reading lens.html:", e)
        return

    # Generate new thumbnails HTML
    thumbnails_html = ''
    for idx, p in enumerate(photos):
        active_class = ' active' if idx == 0 else ''
        thumbnails_html += f'\n                <img src="{p["url"]}" data-large="{p["url"]}" class="thumbnail{active_class}" data-caption="{p["caption"]}" alt="Thumb {idx + 1}">'
    thumbnails_html += '\n            '
    
    # Replace the thumbnail track content
    lens_html = re.sub(
        r'(<div class="thumbnail-track" id="thumbnail-track">)[\s\S]*?(</div>)',
        f'\\1{thumbnails_html}\\2',
        lens_html
    )
    
    # Replace the main photo
    lens_html = re.sub(
        r'<img id="main-photo" src="[^"]+" alt="Selected Photo">',
        f'<img id="main-photo" src="{photos[0]["url"]}" alt="Selected Photo">',
        lens_html
    )
    
    # Replace the main caption
    lens_html = re.sub(
        r'(<div class="photo-caption" id="main-caption">)[\s\S]*?(</div>)',
        f'\\1\n            {photos[0]["caption"]}\n        \\2',
        lens_html
    )
    
    with open('lens.html', 'w', encoding='utf-8') as f:
        f.write(lens_html)
        
    print("lens.html updated successfully!")

if __name__ == '__main__':
    run()
