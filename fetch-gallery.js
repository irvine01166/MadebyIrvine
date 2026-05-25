const fs = require('fs');
const https = require('https');

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            // Follow redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return resolve(fetchUrl(res.headers.location));
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function run() {
    console.log("Fetching Lightroom album...");
    const html = await fetchUrl('https://adobe.ly/4duIYGg');
    
    const sharesMatch = html.match(/window\.SharesConfig = (\{.*?\});/);
    if (!sharesMatch) throw new Error("Could not find SharesConfig in HTML");
    
    const sharesConfig = JSON.parse(sharesMatch[1]);
    const spaceId = sharesConfig.spaceAttributes.id;
    const albumId = sharesConfig.albumAttributes.id;
    const baseUrl = sharesConfig.spaceAttributes.base; // https://photos.adobe.io/v2/
    
    const assetsUrl = `${baseUrl}spaces/${spaceId}/albums/${albumId}/assets?embed=asset&subtype=image;video`;
    console.log(`Fetching assets from ${assetsUrl}`);
    
    let assetsData = await fetchUrl(assetsUrl);
    assetsData = assetsData.replace('while (1) {}', '').trim();
    const assetsJson = JSON.parse(assetsData);
    
    const photos = [];
    assetsJson.resources.forEach(res => {
        if (res.asset && res.asset.links && res.asset.links['/rels/rendition_type/2048']) {
            const relHref = res.asset.links['/rels/rendition_type/2048'].href;
            const fullUrl = `${baseUrl}spaces/${spaceId}/${relHref}`;
            
            // Try to extract a caption/date
            let caption = "Untitled";
            try {
                const payload = res.asset.payload || {};
                const importSource = payload.importSource || {};
                const date = payload.captureDate || importSource.importTimestamp || "";
                const dateStr = date ? date.split('T')[0] : "Date unknown";
                const filename = importSource.fileName || "Photo";
                caption = `${dateStr} - ${filename}`;
            } catch (e) {}
            
            photos.push({ url: fullUrl, caption });
        }
    });
    
    console.log(`Found ${photos.length} photos.`);
    
    if (photos.length === 0) {
        console.log("No photos found, exiting.");
        return;
    }
    
    // Read lens.html
    let lensHtml = fs.readFileSync('lens.html', 'utf8');
    
    // Generate new thumbnails HTML
    let thumbnailsHtml = '';
    photos.forEach((p, idx) => {
        const activeClass = idx === 0 ? ' active' : '';
        thumbnailsHtml += `\n                <img src="${p.url}" data-large="${p.url}" class="thumbnail${activeClass}" data-caption="${p.caption}" alt="Thumb ${idx + 1}">`;
    });
    thumbnailsHtml += '\n            ';
    
    // Replace the thumbnail track content
    lensHtml = lensHtml.replace(
        /(<div class="thumbnail-track" id="thumbnail-track">)[\s\S]*?(<\/div>)/,
        `$1${thumbnailsHtml}$2`
    );
    
    // Replace the main photo
    lensHtml = lensHtml.replace(
        /<img id="main-photo" src="[^"]+" alt="Selected Photo">/,
        `<img id="main-photo" src="${photos[0].url}" alt="Selected Photo">`
    );
    
    // Replace the main caption
    lensHtml = lensHtml.replace(
        /(<div class="photo-caption" id="main-caption">)[\s\S]*?(<\/div>)/,
        `$1\n            ${photos[0].caption}\n        $2`
    );
    
    fs.writeFileSync('lens.html', lensHtml);
    console.log("lens.html updated successfully!");
}

run().catch(console.error);
