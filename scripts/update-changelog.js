const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Pre-commit hook script to automatically update CHANGELOG.md
 * with commit messages since the last release.
 *
 * Usage:
 * - Run manually: node scripts/update-changelog.js
 */

const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');

function getLastVersion() {
    try {
        const lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null', {
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'ignore'],
        })
            .trim()
            .replace(/^v/, '');
        return lastTag;
    } catch (e) {
        if (fs.existsSync(changelogPath)) {
            const changelogContent = fs.readFileSync(changelogPath, 'utf8');
            const versionMatch = changelogContent.match(/## \[(\d+\.\d+\.\d+)\]/);
            if (versionMatch) {
                return versionMatch[1];
            }
        }
        return null;
    }
}

function getCommitsSinceVersion(version) {
    try {
        const range = version ? `v${version}..HEAD` : 'HEAD';
        const commits = execSync(`git log ${range} --oneline --pretty=format:"%s"`, {
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'ignore'],
        })
            .trim()
            .split('\n')
            .filter((line) => line.trim() && !line.includes('Release v'));

        return commits;
    } catch (e) {
        return [];
    }
}

function getUnreleasedChanges() {
    if (!fs.existsSync(changelogPath)) {
        return [];
    }

    const changelogContent = fs.readFileSync(changelogPath, 'utf8');
    const unreleasedMatch = changelogContent.match(/## \[Unreleased\][\s\S]*?(?=## \[|$)/);

    if (unreleasedMatch) {
        const unreleasedSection = unreleasedMatch[0];
        const lines = unreleasedSection
            .split('\n')
            .filter(
                (line) =>
                    line.trim() &&
                    !line.startsWith('#') &&
                    !line.startsWith('---'),
            );
        return lines
            .map((line) => line.replace(/^[-*]+\s*/, ''))
            .filter((line) => line.trim());
    }

    return [];
}

function updateChangelog() {
    const lastVersion = getLastVersion();
    const newCommits = getCommitsSinceVersion(lastVersion);
    const existingUnreleased = getUnreleasedChanges();

    const allChanges = [...new Set([...existingUnreleased, ...newCommits])];

    if (allChanges.length === 0) {
        console.log('ℹ️  No new commits to add to CHANGELOG.md');
        return;
    }

    let changelogContent = '';
    if (fs.existsSync(changelogPath)) {
        changelogContent = fs.readFileSync(changelogPath, 'utf8');
    } else {
        changelogContent = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on https://keepachangelog.com/en/1.0.0/,
and this project adheres to https://semver.org/spec/v2.0.0.html.

`;
    }

    const unreleasedSection = `## [Unreleased]

${allChanges.map((change) => `- ${change}`).join('\n')}

`;

    if (changelogContent.includes('## [Unreleased]')) {
        const unreleasedMatch = changelogContent.match(/## \[Unreleased\]([\s\S]*?)(?=## \[|$)/);
        if (unreleasedMatch && /^###\s+(Changed|Fixed|Added|Removed|Deprecated|Security)/m.test(unreleasedMatch[1])) {
            console.log('ℹ️  CHANGELOG.md has structured format - preserving existing entries');
            console.log('   New commits will be added manually if needed');
            return;
        }

        changelogContent = changelogContent.replace(
            /## \[Unreleased\][\s\S]*?(?=## \[|$)/,
            unreleasedSection,
        );
    } else {
        changelogContent = changelogContent.replace(
            /(# Changelog.*?\n\n)/s,
            `$1${unreleasedSection}`,
        );
    }

    fs.writeFileSync(changelogPath, changelogContent);
    console.log(`✅ Updated CHANGELOG.md with ${allChanges.length} change(s)`);
    console.log(`   Added: ${newCommits.length} new commit(s)`);
}

if (require.main === module) {
    try {
        updateChangelog();
    } catch (error) {
        console.error('❌ Error updating CHANGELOG:', error.message);
        process.exit(1);
    }
}

module.exports = { updateChangelog, getLastVersion, getCommitsSinceVersion };


