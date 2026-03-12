const fs = require('fs');
const path = require('path');

const inventoryPath = path.join(__dirname, 'src', 'inventory', 'inventory.json');
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));

inventory.forEach(item => {
    // 1. Types
    if (item.type === 'house') {
        item.type = 'home';
    }

    // 2. Location
    if (item.slug === 'almond-tree-villa') {
        item.location = 'Elounda Vrouchas';
    } else {
        item.location = 'Mavrikiano Elounda';
    }

    // 3. Pools
    if (item.slug === 'almond-tree-villa') {
        let ams = new Set(item.amenities);
        ams.add('Garden');
        ams.add('Creatan garden'); // Actually "Cretan garden"? But user said Creatan.
        ams.add('Sea view');
        ams.add('Large private pool (9 m × 4 m)');
        ams.add('Private pool');
        item.amenities = Array.from(ams);
        item.pool = 'private'; // Ensure
    }

    if (item.slug === 'erato') {
        item.pool = 'private'; // Ensure
        let ams = new Set(item.amenities);
        ams.add('Private pool');
        item.amenities = Array.from(ams);
    }

    if (item.slug === 'monastiri') {
        item.pool = 'private';
        item.pool_notes = 'Private dripped pool'; // "dripped pool with a depth of 1.60m"
        item.amenities = item.amenities.map(c => c === 'Private dipping pool' ? 'Private dripped pool' : c);
        item.hard_constraints = item.hard_constraints.map(c => c === 'Private dipping pool' ? 'Private dripped pool' : c);
        let ams = new Set(item.amenities);
        ams.add('Private dripped pool');
        item.amenities = Array.from(ams);
    }

    if (item.slug === 'penelope' || item.slug === 'demetra') {
        item.pool = 'shared';
    }

    // views
    if (['argyro', 'margarita', 'leonidas', 'almond-tree-villa'].includes(item.slug)) {
        if (!item.view.toLowerCase().includes('sea view') && !item.view.toLowerCase().includes('panoramic')) {
            item.view = 'Sea view';
        }
    }

    // 4. Internal stairs
    if (item.slug === 'demetra') {
        item.internal_stairs = false;
    } else {
        item.internal_stairs = true;
    }
});

fs.writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2));

console.log('Done modifying inventory');
