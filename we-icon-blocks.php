<?php

/**
 * Plugin Name:       WE Icon Blocks
 * Plugin URI:        https://webentwicklerin.at
 * Description:       Provides a reusable icon library, blocks, and helper scripts.
 * Version:           0.1.0
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

require_once __DIR__ . '/inc/icons.php';
require_once __DIR__ . '/inc/class-icon-blocks.php';

WE_Icon_Blocks::get_instance()->init();
