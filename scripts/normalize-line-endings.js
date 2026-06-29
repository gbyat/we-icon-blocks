/**
 * Convert CRLF to LF in tracked text files (one-time / maintenance).
 *
 * Usage: node scripts/normalize-line-endings.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.join(__dirname, '..');

const binaryExtensions = new Set([
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp',
    '.woff', '.woff2', '.ttf', '.eot', '.zip', '.phar', '.mo',
]);

function isBinaryFile(filePath) {
    return binaryExtensions.has(path.extname(filePath).toLowerCase());
}

function getTrackedFiles() {
    const output = execSync('git ls-files -z', {
        cwd: projectRoot,
        encoding: 'utf8',
    });

    return output.split('\0').filter(Boolean);
}

let converted = 0;

for (const relativePath of getTrackedFiles()) {
    if (isBinaryFile(relativePath)) {
        continue;
    }

    const absolutePath = path.join(projectRoot, relativePath);

    if (!fs.existsSync(absolutePath)) {
        continue;
    }

    const content = fs.readFileSync(absolutePath, 'utf8');

    if (!content.includes('\r')) {
        continue;
    }

    const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    fs.writeFileSync(absolutePath, normalized, 'utf8');
    converted += 1;
    console.log(`Normalized: ${relativePath}`);
}

console.log(`\nDone. Converted ${converted} file(s) to LF.`);
