const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public', 'images');
const housesDir = path.join(publicDir, 'houses');
const villaDir = path.join(publicDir, 'villa');
const galleryPath = path.join(__dirname, 'src', 'data', 'gallery.json');

const gallery = {};

function processCategory(baseDir, type) {
    if (!fs.existsSync(baseDir)) return;
    const units = fs.readdirSync(baseDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    for (const slug of units) {
        const unitDir = path.join(baseDir, slug);
        const sizeDirs = fs.readdirSync(unitDir, { withFileTypes: true })
            .filter(d => d.isDirectory() && /^\d+$/.test(d.name))
            .map(d => parseInt(d.name))
            .sort((a, b) => a - b);

        // Map to hold files for each basename: { basename: { size: fullpath, ... } }
        const imageMap = {};

        for (const size of sizeDirs) {
            const sizeDir = path.join(unitDir, size.toString());
            const files = fs.readdirSync(sizeDir).filter(f => f.endsWith('.webp') || f.endsWith('.jpg'));
            for (const file of files) {
                // Extract basename (remove ending like -480.webp, -1024.webp, --320.webp)
                const baseName = file.replace(/--?\d+\.(webp|jpg)$/, '');
                if (!imageMap[baseName]) imageMap[baseName] = {};
                imageMap[baseName][size] = `/images/${type}/${slug}/${size}/${file}`;
            }
        }

        const images = [];
        for (const [baseName, sizesObj] of Object.entries(imageMap)) {
            const sizes = Object.keys(sizesObj).map(Number).sort((a, b) => a - b);
            if (sizes.length === 0) continue;

            // Construct srcset and URL encode to handle spaces in filenames
            const srcset = sizes.map(w => `${encodeURI(sizesObj[w])} ${w}w`).join(', ');

            // Fallback src (use 1024 if available, otherwise largest)
            const fallbackSize = sizesObj[1024] ? 1024 : sizes[sizes.length - 1];
            const src = encodeURI(sizesObj[fallbackSize]);

            // Format alt
            const altRaw = baseName.replace(/-/g, ' ');
            const alt = altRaw.charAt(0).toUpperCase() + altRaw.slice(1);

            // Determine featured
            const isFeatured = baseName.includes('hero') || baseName.includes('exterior');

            // Tags
            const altL = alt.toLowerCase();
            const tags = [];
            if (altL.includes('pool')) tags.push('pool');
            if (altL.includes('view') || altL.includes('panorama') || altL.includes('bay') || altL.includes('sea')) tags.push('view');
            if (altL.includes('bedroom')) tags.push('bedroom');
            if (altL.includes('living') || altL.includes('dining')) tags.push('living-area');
            if (altL.includes('kitchen') || altL.includes('bbq')) tags.push('kitchen');
            if (altL.includes('garden') || altL.includes('terrace') || altL.includes('courtyard') || altL.includes('veranda')) tags.push('outdoor');
            if (altL.includes('facade') || altL.includes('exterior') || altL.includes('stone') || altL.includes('village')) tags.push('exterior');
            if (altL.includes('bathroom')) tags.push('bathroom');
            if (tags.length === 0) tags.push('interior');

            images.push({
                src,
                srcset,
                alt,
                isFeatured,
                tags
            });
        }

        // Ensure at least one featured
        if (images.length > 0 && !images.some(img => img.isFeatured)) {
            images[0].isFeatured = true;
        }

        // Sort so featured comes first
        images.sort((a, b) => (a.isFeatured === b.isFeatured) ? 0 : a.isFeatured ? -1 : 1);

        gallery[slug] = images;
    }
}

processCategory(housesDir, 'houses');
processCategory(villaDir, 'villa');

fs.writeFileSync(galleryPath, JSON.stringify(gallery, null, 2));
console.log('Regenerated gallery.json with real files and responsive srcset.');
