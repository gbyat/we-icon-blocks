#!/usr/bin/env node

/**
 * Generate WordPress Playground URL for testing the plugin.
 *
 * This script generates a URL that opens WordPress Playground with
 * the plugin pre-installed from the latest GitHub release.
 *
 * Usage:
 *   node scripts/generate-playground-url.js [version|latest]
 *
 * Examples:
 *   node scripts/generate-playground-url.js          # Latest release
 *   node scripts/generate-playground-url.js latest   # Latest release
 *   node scripts/generate-playground-url.js 0.2.3    # Specific version
 */

const fs = require('fs');
const path = require('path');

const GITHUB_REPO = 'gbyat/we-icon-blocks';
const PLUGIN_ZIP = 'we-icon-blocks.zip';
const PLAYGROUND_BASE = 'https://playground.wordpress.net';

// Get version from command line or package.json
const args = process.argv.slice(2);
let version = args[0] || 'latest';

if (version === 'latest' || version === '') {
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    version = packageData.version;
}

// Generate plugin download URL
const pluginUrl = `https://github.com/${GITHUB_REPO}/releases/download/v${version}/${PLUGIN_ZIP}`;

// Generate Playground URL using query API
const playgroundUrl = `${PLAYGROUND_BASE}/?plugin=${encodeURIComponent(pluginUrl)}`;

console.log('\n🎮 WordPress Playground Preview URL:\n');
console.log(playgroundUrl);
console.log('\n📋 Copy this URL to open WordPress Playground with the plugin pre-installed.\n');

// Also output as a clickable link for terminals that support it
if (process.stdout.isTTY) {
    console.log('🔗 Quick access:');
    console.log(`   ${playgroundUrl}\n`);
}

// Also generate blueprint URL
const blueprintUrl = `${PLAYGROUND_BASE}/?blueprint-url=${encodeURIComponent(`https://raw.githubusercontent.com/${GITHUB_REPO}/main/playground-blueprint.json`)}`;
console.log('📦 Alternative: Use Blueprint (requires blueprint file to be committed):\n');
console.log(blueprintUrl);
console.log('');

