const gulp = require('gulp');
const log = require('fancy-log');
const fs = require('fs');
const path = require('path');
const babel = require('gulp-babel');

const web_path = "C:\\inetpub\\wwwroot\\wp_webentwicklerin\\wp-content\\plugins\\";
const thisname = 'we-icon-blocks';
const themedir = web_path + thisname;
const storage = "/home/www/wp-webentwicklerin/wp-content/plugins/" + thisname;

var globs = [
    './assets/**/*',
    './inc/**/*',
    './languages/**/*',
    './blocks/**/*',
    './**/*.php'
];


// SVG to PHP Task - Generate icons.php from SVG files
gulp.task('generate-icons', function (done) {
    const svgDir = './src/svg/';
    const outputFile = './inc/icons.php';

    if (!fs.existsSync(svgDir)) {
        log.error('SVG directory not found:', svgDir);
        done();
        return;
    }

    const files = fs.readdirSync(svgDir).filter(file => file.endsWith('.svg'));

    if (files.length === 0) {
        log.error('No SVG files found in:', svgDir);
        done();
        return;
    }

    let phpContent = `<?php
/**
 * Generated SVG Icons
 *
 * This file is auto-generated from src/svg/*.svg files
 * DO NOT EDIT MANUALLY - run 'gulp generate-icons' to rebuild
 *
 * @package Webentwicklerin\\WeIconBlocks
 * @since 0.1.0
 */

if (!function_exists('we_icon_get_icons')) {
    function we_icon_get_icons() {
        return [
`;

    files.forEach(file => {
        const iconName = path.basename(file, '.svg');
        let svgContent = fs.readFileSync(path.join(svgDir, file), 'utf8');

        // Clean SVG
        svgContent = svgContent
            .replace(/<\?xml.*?\?>/g, '')
            .replace(/<!DOCTYPE[^>]*>/g, '')
            .replace(/<title[^>]*>[\s\S]*?<\/title[^>]*>/gi, '')
            .replace(/<!--[\s\S]*?-->/g, '')
            .replace(/<desc[^>]*>[\s\S]*?<\/desc[^>]*>/gi, '')
            .replace(/\s+/g, ' ')
            .trim();

        // Escape for PHP
        svgContent = svgContent.replace(/'/g, "\\'");

        phpContent += `            '${iconName}' => '${svgContent}',\n`;
    });

    phpContent += `        ];
    }
}

/* Make icons available in JavaScript for the block editor */

if (!function_exists('we_icon_enqueue_icons_script')) {
    function we_icon_enqueue_icons_script() {
        $icons = we_icon_get_icons();
        wp_add_inline_script(
            'wp-blocks',
            'window.weIconBlocksIcons = ' . wp_json_encode($icons) . ';',
            'before'
        );
    }
    add_action('enqueue_block_editor_assets', 'we_icon_enqueue_icons_script');
}
`;

    fs.writeFileSync(outputFile, phpContent);
    log.info('Generated icons.php with', files.length, 'icons');
    done();
});

gulp.task('build-blocks-js', function () {
    return gulp.src('./src/blocks/icon/index.js')
        .pipe(babel({
            presets: [
                ['@wordpress/babel-preset-default', {
                    wordpress: true
                }]
            ]
        }))
        .pipe(gulp.dest('./blocks/icon'));
});

gulp.task('build-blocks-assets', function () {
    return gulp.src([
        './src/blocks/icon/block.json',
        './src/blocks/icon/editor.css',
        './src/blocks/icon/style.css'
    ])
        .pipe(gulp.dest('./blocks/icon'));
});

gulp.task('build-blocks', gulp.series('build-blocks-js', 'build-blocks-assets'));

gulp.task('watch', function () {
    gulp.watch('./src/svg/**/*.svg', gulp.series('generate-icons'));
    gulp.watch('./src/blocks/**/*', gulp.series('build-blocks'));
});

gulp.task('build', gulp.series(
    'generate-icons',
    'build-blocks'
));

gulp.task('default', gulp.series('build', 'watch'));
