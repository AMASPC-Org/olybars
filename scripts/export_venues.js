const fs = require('fs');
const path = require('path');

const venues = JSON.parse(fs.readFileSync('server/src/data/venues_master.json', 'utf8'));

// Extract all unique keys
const allKeys = new Set();
venues.forEach(v => Object.keys(v).forEach(k => allKeys.add(k)));
const sortedKeys = Array.from(allKeys).sort();

// Helper to format values for CSV
function formatCSVValue(val) {
    if (val === null || val === undefined) return '';
    if (Array.isArray(val)) {
        return `"${val.map(i => typeof i === 'object' ? JSON.stringify(i).replace(/"/g, '""') : i).join(', ')}"`;
    }
    if (typeof val === 'object') {
        return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
    }
    return `"${String(val).replace(/"/g, '""')}"`;
}

// Generate CSV
const csvHeader = sortedKeys.join(',');
const csvRows = venues.map(v => sortedKeys.map(k => formatCSVValue(v[k])).join(','));
const csvContent = [csvHeader, ...csvRows].join('\n');

fs.writeFileSync('venue_directory_full.csv', csvContent);

// Generate Markdown for core fields
const coreFields = [
    { label: 'Name', key: 'name' },
    { label: 'Website', key: 'website' },
    { label: 'Facebook', key: 'facebook' },
    { label: 'Instagram', key: 'instagram' },
    { label: 'Email', key: 'email' },
    { label: 'Phone', key: 'phone' },
    { label: 'Address', key: 'address' },
    { label: 'Style', key: 'venueType' },
    { label: 'Games', key: 'gameFeatures', format: (v) => Array.isArray(v) ? v.map(g => g.name).join(', ') : '' },
    {
        label: 'Features', key: 'sceneTags', format: (v, item) => {
            const tags = Array.isArray(v) ? v.join(', ') : '';
            const food = item.foodService || '';
            const attributes = item.attributes ? Object.entries(item.attributes).filter(([k, val]) => val === true).map(([k]) => k).join(', ') : '';
            return [tags, food, attributes].filter(Boolean).join('; ');
        }
    }
];

const mdHeader = '| ' + coreFields.map(f => f.label).join(' | ') + ' |';
const mdDivider = '| ' + coreFields.map(() => '---').join(' | ') + ' |';
const mdRows = venues.slice(0, 20).map(v => {
    return '| ' + coreFields.map(f => {
        const val = v[f.key];
        const display = f.format ? f.format(val, v) : (val || '');
        return String(display).replace(/\|/g, '\\|').replace(/\n/g, ' ');
    }).join(' | ') + ' |';
});

const mdContent = [mdHeader, mdDivider, ...mdRows].join('\n');
console.log(mdContent);
if (venues.length > 20) {
    console.log(`\n*...and ${venues.length - 20} more. Full directory saved to venue_directory_full.csv*`);
}
