const fs = require('fs');
const path = require('path');

const galleryPath = path.join(__dirname, 'src', 'data', 'gallery.json');
const publicDir = path.join(__dirname, 'public');

const gallery = JSON.parse(fs.readFileSync(galleryPath, 'utf8'));

if (gallery.dimitra) {
    gallery.demetra = gallery.dimitra;
    delete gallery.dimitra;
}

for (const slug of Object.keys(gallery)) {
    const isVilla = slug === 'almond-tree-villa';
    const typeDir = isVilla ? 'villa' : 'houses';
    const unitDir = path.join(publicDir, 'images', typeDir, slug);

    // if unitDir doesn't exist, skip
    if (!fs.existsSync(unitDir)) {
        console.warn(`Directory not found for slug ${slug}: ${unitDir}`);
        continue;
    }

    const sizesAvailable = fs.readdirSync(unitDir, { withFileTypes: true })
        .filter(d => d.isDirectory() && /^\d+$/.test(d.name))
        .map(d => parseInt(d.name))
        .sort((a, b) => a - b);

    for (const img of gallery[slug]) {
        const src = img.src; // e.g. /images/houses/argyro/1024/argyro-bathroom-01-1024.webp

        // Extract the filename and baseName
        const parts = src.split('/');
        const filename = decodeURI(parts[parts.length - 1]);

        // Most filenames look like argyro-bathroom-01-1024.webp or -480.webp or --320.webp
        // Find baseName by removing the resolution and extension pattern.
        const baseNameMatch = filename.match(/^(.*?)(?:--?\d+)?\.(webp|jpg)$/);
        if (!baseNameMatch) {
            console.warn('Could not parse basename for', filename);
            continue;
        }
        const baseName = baseNameMatch[1];

        const matchedSizes = [];
        for (const size of sizesAvailable) {
            const sizeDir = path.join(unitDir, size.toString());
            if (!fs.existsSync(sizeDir)) continue;

            const filesInSize = fs.readdirSync(sizeDir);
            // Find a file that corresponds to this baseName
            // Try exact match or baseName + -size + .webp/.jpg
            const fileMatch = filesInSize.find(f => {
                const fNoExt = f.replace(/\.(webp|jpg)$/, '');
                const targetSuffix1 = `${baseName}-${size}`;
                const targetSuffix2 = `${baseName}--${size}`;
                return f.startsWith(baseName) && (fNoExt.endsWith(`-${size}`) || fNoExt.endsWith(`--${size}`) || fNoExt === baseName);
            });

            if (fileMatch) {
                matchedSizes.push({
                    size,
                    url: `/images/${typeDir}/${slug}/${size}/${encodeURI(fileMatch)}`
                });
            }
        }

        if (matchedSizes.length > 0) {
            img.srcset = matchedSizes.map(m => `${m.url} ${m.size}w`).join(', ');
        } else {
            console.log('No matched sizes for', baseName);
        }
    }
}

fs.writeFileSync(galleryPath, JSON.stringify(gallery, null, 2));
console.log('Successfully injected srcsets without overwriting manual tags.');
