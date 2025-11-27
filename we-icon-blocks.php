<?php

/**
 * Plugin Name:       WE Icon Blocks
 * Plugin URI:        https://webentwicklerin.at
 * Description:       Provides a reusable icon library, blocks, and helper scripts.
 * Version:           0.1.4
 * Author:            webentwicklerin, Gabriele Laesser
 * Author URI:        https://webentwicklerin.at
 * Text Domain:       we-icon-blocks
 * Requires PHP:      8.0
 * Requires at least: 6.0
 *
 * @package Webentwicklerin\WeIconBlocks
 */

declare(strict_types=1);

namespace Webentwicklerin\WeIconBlocks;

if (! defined('ABSPATH')) {
    exit;
}

define('WE_ICON_BLOCKS_VERSION', '0.1.4');
define('WE_ICON_BLOCKS_PLUGIN_FILE', __FILE__);
define('WE_ICON_BLOCKS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('WE_ICON_BLOCKS_PLUGIN_URL', plugin_dir_url(__FILE__));
define('WE_ICON_BLOCKS_GITHUB_REPO', 'gbyat/we-icon-blocks');

require_once __DIR__ . '/inc/icons.php';
require_once __DIR__ . '/inc/class-icon-blocks.php';

WE_Icon_Blocks::get_instance()->init();
