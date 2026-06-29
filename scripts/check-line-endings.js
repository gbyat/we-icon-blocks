/**
 * Fail if tracked text files contain CRLF line endings.
 *
 * Usage: node scripts/check-line-endings.js
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

const offenders = [];

for (const relativePath of getTrackedFiles()) {
    if (isBinaryFile(relativePath)) {
        continue;
    }

    const absolutePath = path.join(projectRoot, relativePath);

    if (!fs.existsSync(absolutePath)) {
        continue;
    }

    const content = fs.readFileSync(absolutePath);

    if (content.includes(0x0d)) {
        offenders.push(relativePath);
    }
}

if (offenders.length > 0) {
    console.error('CRLF line endings detected in the following files:');
    offenders.forEach((file) => console.error(`  - ${file}`));
    console.error('\nUse LF only. Run: git add --renormalize .');
    process.exit(1);
}

console.log('Line ending check passed (LF only).');
