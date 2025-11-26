<?php

/**
 * Core plugin bootstrapper.
 *
 * @package Webentwicklerin\WeIconBlocks
 */

declare(strict_types=1);

namespace Webentwicklerin\WeIconBlocks;

use function add_action;
use function is_admin;
use function is_dir;
use function plugin_dir_path;
use function plugin_dir_url;
use function register_block_type;
use function scandir;
use function wp_enqueue_script;
use function wp_set_script_translations;

/**
 * Main plugin orchestrator.
 */
final class WE_Icon_Blocks
{
    /**
     * Singleton instance.
     *
     * @var WE_Icon_Blocks|null
     */
    private static ?WE_Icon_Blocks $instance = null;

    /**
     * Retrieve the singleton instance.
     */
    public static function get_instance(): WE_Icon_Blocks
    {
        if (null === self::$instance) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    /**
     * Kick off hooks.
     */
    public function init(): void
    {
        add_action('init', [$this, 'register_blocks']);
        add_action('plugins_loaded', [$this, 'init_github_updater'], 5);
        add_action('enqueue_block_editor_assets', [$this, 'enqueue_editor_assets']);
        add_action('enqueue_block_editor_assets', [$this, 'set_block_script_translations']);
    }

    /**
     * Placeholder for registering Gutenberg blocks + assets.
     */
    public function register_blocks(): void
    {
        $blocks_dir = plugin_dir_path(__DIR__) . 'blocks/';

        if (! is_dir($blocks_dir)) {
            return;
        }

        $block_slugs = array_filter(
            scandir($blocks_dir),
            static function ($entry) use ($blocks_dir) {
                return $entry[0] !== '.' && is_dir($blocks_dir . $entry);
            }
        );

        foreach ($block_slugs as $slug) {
            $block_path = $blocks_dir . $slug . '/block.json';

            if (file_exists($block_path)) {
                register_block_type($blocks_dir . $slug);
            }
        }
    }

    /**
     * Set script translations for block editor scripts.
     *
     * @phpstan-ignore-next-line
     */
    public function set_block_script_translations(): void
    {
        $registry = \WP_Block_Type_Registry::get_instance();
        $block_type = $registry->get_registered('webentwicklerin/icon');

        if (! $block_type) {
            return;
        }

        $languages_path = plugin_dir_path(__DIR__) . 'languages';

        // Try to get actual handles from registered block type first.
        if (! empty($block_type->editor_script_handles)) {
            foreach ($block_type->editor_script_handles as $handle) {
                wp_set_script_translations($handle, 'we-icon-blocks', $languages_path);
            }
        } else {
            // Fallback: WordPress generates handles from block name: {block-name-slug}-{script-type}-script
            $block_name_slug = str_replace('/', '-', 'webentwicklerin/icon');
            wp_set_script_translations(
                $block_name_slug . '-editor-script',
                'we-icon-blocks',
                $languages_path
            );
        }
    }

    /**
     * Enqueue editor-only helper scripts.
     */
    public function enqueue_editor_assets(): void
    {
        $plugin_url = plugin_dir_url(__DIR__);

        wp_enqueue_script(
            'we-icon-blocks-navigation-icons',
            $plugin_url . 'assets/js/add-icon-to-navigation.js',
            ['wp-hooks', 'wp-blocks'],
            '0.1.0',
            true
        );
    }

    /**
     * Initialize GitHub updater for automatic updates.
     */
    public function init_github_updater(): void
    {
        if (! (is_admin() || wp_doing_cron())) {
            return;
        }

        if (class_exists(Updater::class)) {
            new Updater(WE_ICON_BLOCKS_PLUGIN_FILE);
        }
    }
}
