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
    {
        label: 'Games', key: 'gameFeatures', format: (v) => {
            if (!Array.isArray(v)) return '';
            return v.map(g => `${g.name} (${g.count})`).join(', ');
        }
    },
    {
        label: 'Features', key: 'id', format: (_, item) => {
            const parts = [];
            if (item.sceneTags?.length) parts.push(`Tags: ${item.sceneTags.join(', ')}`);
            if (item.foodService) parts.push(`Food: ${item.foodService}`);
            if (item.isAllAges) parts.push('All Ages');
            if (item.isDogFriendly) parts.push('Dog Friendly');
            if (item.hasOutdoorSeating) parts.push('Outdoor');
            if (item.hasPrivateRoom) parts.push('Private Rm');
            if (item.attributes) {
                if (item.attributes.noise_level) parts.push(`Noise: ${item.attributes.noise_level}`);
            }
            return parts.join('; ');
        }
    }
];

const mdHeader = '| ' + coreFields.map(f => f.label).join(' | ') + ' |';
const mdDivider = '| ' + coreFields.map(() => '---').join(' | ') + ' |';
const mdRows = venues.map(v => {
    return '| ' + coreFields.map(f => {
        const val = v[f.key];
        const display = f.format ? f.format(val, v) : (val || '');
        return String(display).replace(/\|/g, '\\|').replace(/\n/g, ' ');
    }).join(' | ') + ' |';
});

// Since the message might be too long, I'll print the first 40 here and tell the user about the CSV for others.
// Or I can print them all if it's safe. 130 rows * ~200 chars = 26,000 chars. This is within limits usually.
const mdContent = [mdHeader, mdDivider, ...mdRows].join('\n');
console.log(mdContent);
