const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read package.json
const packagePath = path.join(__dirname, '..', 'package.json');
const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const version = packageData.version;

console.log(`📦 Syncing version to ${version}...`);

// Read plugin file
const pluginPath = path.join(__dirname, '..', 'we-icon-blocks.php');
let pluginContent = fs.readFileSync(pluginPath, 'utf8');

// Update version in plugin file header
pluginContent = pluginContent.replace(/Version:\s*\d+\.\d+\.\d+/, `Version:           ${version}`);

// Add or update WE_ICON_BLOCKS_VERSION constant
if (pluginContent.includes('WE_ICON_BLOCKS_VERSION')) {
    pluginContent = pluginContent.replace(
        /define\(\s*'WE_ICON_BLOCKS_VERSION',\s*'[^']*'\s*\);/,
        `define('WE_ICON_BLOCKS_VERSION', '${version}');`,
    );
} else {
    pluginContent = pluginContent.replace(
        /namespace Webentwicklerin\\WeIconBlocks;\s*\n/,
        `namespace Webentwicklerin\\WeIconBlocks;\n\ndefine('WE_ICON_BLOCKS_VERSION', '${version}');\ndefine('WE_ICON_BLOCKS_PLUGIN_FILE', __FILE__);\ndefine('WE_ICON_BLOCKS_PLUGIN_DIR', plugin_dir_path(__FILE__));\ndefine('WE_ICON_BLOCKS_PLUGIN_URL', plugin_dir_url(__FILE__));\ndefine('WE_ICON_BLOCKS_GITHUB_REPO', 'gbyat/we-icon-blocks');\n\n`,
    );
}

// Write updated plugin file
fs.writeFileSync(pluginPath, pluginContent);
console.log('✅ Updated we-icon-blocks.php');

// Update Stable tag in README.md (WordPress readme header)
const readmePath = path.join(__dirname, '..', 'README.md');
if (fs.existsSync(readmePath)) {
    let readmeContent = fs.readFileSync(readmePath, 'utf8');

    // Update Stable tag
    if (/Stable tag:\s*/i.test(readmeContent)) {
        readmeContent = readmeContent.replace(
            /(\**Stable tag:\**\s*)[0-9]+\.[0-9]+\.[0-9]+/i,
            `$1${version}`,
        );
        console.log('✅ Updated Stable tag in README.md');
    } else {
        console.log('ℹ️  No Stable tag found in README.md');
    }

    // Update Playground link (using blueprint-url approach like wordpress.org plugins)
    const blueprintUrl = `https://raw.githubusercontent.com/gbyat/we-icon-blocks/main/playground-blueprint.json`;
    const playgroundUrl = `https://playground.wordpress.net/?blueprint-url=${encodeURIComponent(blueprintUrl)}`;

    const playgroundLinkPattern = /(\[🚀 Test in WordPress Playground \(v)([0-9]+\.[0-9]+\.[0-9]+)(\]\()([^)]+)(\))/;
    if (playgroundLinkPattern.test(readmeContent)) {
        readmeContent = readmeContent.replace(
            playgroundLinkPattern,
            `$1${version}$3${playgroundUrl}$5`,
        );
        console.log('✅ Updated Playground link in README.md');
    } else {
        // Try to find and update just the version in the link text if the pattern doesn't match exactly
        const versionInLinkPattern = /(\[🚀 Test in WordPress Playground \(v)([0-9]+\.[0-9]+\.[0-9]+)(\])/;
        if (versionInLinkPattern.test(readmeContent)) {
            readmeContent = readmeContent.replace(
                versionInLinkPattern,
                `$1${version}$3`,
            );
            console.log('✅ Updated Playground link version in README.md');
        }
    }

    fs.writeFileSync(readmePath, readmeContent);
}

// Update playground-blueprint.json with current version
const blueprintPath = path.join(__dirname, '..', 'playground-blueprint.json');
if (fs.existsSync(blueprintPath)) {
    try {
        let blueprintContent = fs.readFileSync(blueprintPath, 'utf8');

        // Update the plugin ZIP URL in the blueprint to use specific version instead of /latest/
        const versionUrlPattern = /(https:\/\/github\.com\/gbyat\/we-icon-blocks\/releases\/download\/v)([0-9]+\.[0-9]+\.[0-9]+)(\/we-icon-blocks\.zip)/;
        if (versionUrlPattern.test(blueprintContent)) {
            blueprintContent = blueprintContent.replace(
                versionUrlPattern,
                `$1${version}$3`,
            );
            fs.writeFileSync(blueprintPath, blueprintContent);
            console.log('✅ Updated playground-blueprint.json version');
        } else {
            // Try to update /latest/ to specific version
            const latestUrlPattern = /(https:\/\/github\.com\/gbyat\/we-icon-blocks\/releases\/latest\/download\/we-icon-blocks\.zip)/;
            if (latestUrlPattern.test(blueprintContent)) {
                blueprintContent = blueprintContent.replace(
                    latestUrlPattern,
                    `https://github.com/gbyat/we-icon-blocks/releases/download/v${version}/we-icon-blocks.zip`,
                );
                fs.writeFileSync(blueprintPath, blueprintContent);
                console.log('✅ Updated playground-blueprint.json from /latest/ to specific version');
            }
        }
    } catch (error) {
        console.error(`⚠️  Could not update playground-blueprint.json: ${error.message}`);
    }
}

// Update block.json files
const blocksDir = path.join(__dirname, '..', 'blocks');
const updateBlockJsonVersions = (directory) => {
    if (!fs.existsSync(directory)) {
        return;
    }

    const entries = fs.readdirSync(directory, { withFileTypes: true });

    entries.forEach((entry) => {
        const entryPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            updateBlockJsonVersions(entryPath);
            return;
        }

        if (entry.isFile() && entry.name === 'block.json') {
            try {
                const blockData = JSON.parse(fs.readFileSync(entryPath, 'utf8'));
                if (blockData.version !== version) {
                    blockData.version = version;
                    fs.writeFileSync(entryPath, `${JSON.stringify(blockData, null, 2)}\n`);
                    console.log(`✅ Updated ${path.relative(path.join(__dirname, '..'), entryPath)}`);
                } else {
                    console.log(`ℹ️  ${path.relative(path.join(__dirname, '..'), entryPath)} already at ${version}`);
                }
            } catch (error) {
                console.error(`⚠️  Could not update ${entryPath}: ${error.message}`);
            }
        }
    });
};

updateBlockJsonVersions(blocksDir);

// Update CHANGELOG.md
const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
if (!fs.existsSync(changelogPath)) {
    const initialContent = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on https://keepachangelog.com/en/1.0.0/,
and this project adheres to https://semver.org/spec/v2.0.0.html.

## [${version}] - ${new Date().toISOString().split('T')[0]}

### Added
- Initial release of WE Icon Blocks

`;
    fs.writeFileSync(changelogPath, initialContent);
    console.log('📝 Created CHANGELOG.md');
} else {
    let changelogContent = fs.readFileSync(changelogPath, 'utf8');

    const versionPattern = new RegExp(`## \\[${version.replace(/\./g, '\\.')}\\]`);
    if (!versionPattern.test(changelogContent)) {
        const dateStr = new Date().toISOString().split('T')[0];

        let gitLog = '';
        try {
            let lastTag = '';
            try {
                lastTag = execSync('git describe --tags --abbrev=0', {
                    encoding: 'utf8',
                    stdio: ['pipe', 'pipe', 'ignore'],
                }).trim();
            } catch (e) {
                lastTag = '';
            }

            const gitCommand = lastTag
                ? `git log ${lastTag}..HEAD --oneline --pretty=format:"- %s"`
                : 'git log -10 --oneline --pretty=format:"- %s"';

            gitLog = execSync(gitCommand, {
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'ignore'],
            }).trim();
        } catch (e) {
            gitLog = '- Version update';
        }

        const newEntry = `## [${version}] - ${dateStr}

${gitLog || '- Version update'}

`;

        const lines = changelogContent.split('\n');
        const firstHeadingIndex = lines.findIndex((line) => line.startsWith('## ['));

        if (firstHeadingIndex !== -1) {
            lines.splice(firstHeadingIndex, 0, newEntry);
            changelogContent = lines.join('\n');
        } else {
            changelogContent = changelogContent.replace(
                /(# Changelog.*?\n\n)/s,
                `$1${newEntry}`,
            );
        }

        if (!changelogContent.includes(`[${version}]:`)) {
            const releaseLink = `\n[${version}]: https://github.com/gbyat/we-icon-blocks/releases/tag/v${version}\n`;
            changelogContent = changelogContent.trim() + releaseLink;
        }

        fs.writeFileSync(changelogPath, changelogContent);
        console.log(`📝 Updated CHANGELOG.md with version ${version}`);
    } else {
        console.log(`ℹ️  Version ${version} already exists in CHANGELOG.md`);
    }
}

console.log(`✅ Version synchronized to ${version}`);

