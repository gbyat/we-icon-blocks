<?php

/**
 * GitHub updater for automatic plugin updates.
 *
 * @package Webentwicklerin\WeIconBlocks
 */

declare(strict_types=1);

namespace Webentwicklerin\WeIconBlocks;

use function add_action;
use function add_filter;
use function delete_transient;
use function esc_html__;
use function file_exists;
use function file_get_contents;
use function get_option;
use function get_plugin_data;
use function is_plugin_active;
use function json_decode;
use function plugin_basename;
use function set_transient;
use function version_compare;
use function wp_remote_get;
use function wp_remote_retrieve_body;

/**
 * GitHub Updater class for WE Icon Blocks.
 */
class Updater
{
    /**
     * Plugin file path.
     *
     * @var string
     */
    private $file;

    /**
     * Plugin data.
     *
     * @var array
     */
    private $plugin;

    /**
     * Plugin basename.
     *
     * @var string
     */
    private $basename;

    /**
     * Is plugin active.
     *
     * @var bool
     */
    private $active;

    /**
     * GitHub API response.
     *
     * @var object|null
     */
    private $github_response;

    /**
     * GitHub access token.
     *
     * @var string
     */
    private $access_token;

    /**
     * Constructor.
     *
     * @param string $file Plugin file path.
     */
    public function __construct($file)
    {
        $this->file     = $file;
        $this->basename = plugin_basename($this->file);
        $this->active   = is_plugin_active($this->basename);

        add_action('admin_init', array($this, 'set_plugin_properties'));
        add_filter('pre_set_site_transient_update_plugins', array($this, 'modify_transient'), 10, 1);
        add_filter('plugins_api', array($this, 'plugin_popup'), 10, 3);
        add_filter('upgrader_post_install', array($this, 'after_install'), 10, 3);
        add_action('upgrader_process_complete', array($this, 'purge'), 10, 2);
        add_action('admin_init', array($this, 'get_github_response'));
    }

    /**
     * Set plugin properties.
     */
    public function set_plugin_properties()
    {
        $this->plugin = get_plugin_data($this->file);
    }

    /**
     * Get GitHub API response.
     *
     * Note: GitHub token is NOT required for public repositories.
     * Without token: 60 requests/hour per IP.
     * With token: 5000 requests/hour.
     */
    public function get_github_response()
    {
        $this->access_token = (string) get_option('we_icon_blocks_github_token');

        $args = array(
            'timeout' => 30,
        );

        if ($this->access_token) {
            $args['headers'] = array(
                'Authorization' => 'token ' . $this->access_token,
                'Accept'        => 'application/vnd.github.v3+json',
            );
        }

        $response = wp_remote_get(
            'https://api.github.com/repos/' . WE_ICON_BLOCKS_GITHUB_REPO . '/releases/latest',
            $args
        );

        if (is_wp_error($response)) {
            return;
        }

        $this->github_response = json_decode(wp_remote_retrieve_body($response));
    }

    /**
     * Modify transient to show update.
     *
     * @param object $transient Update transient.
     * @return object
     */
    public function modify_transient($transient)
    {
        if (! $this->github_response || ! $this->active) {
            return $transient;
        }

        $current_version = $this->plugin['Version'];
        $new_version     = ltrim($this->github_response->tag_name, 'v');

        if (version_compare($current_version, $new_version, '>=')) {
            return $transient;
        }

        $download_url = null;
        if (isset($this->github_response->assets) && is_array($this->github_response->assets)) {
            foreach ($this->github_response->assets as $asset) {
                if ($asset->name === 'we-icon-blocks.zip') {
                    $download_url = $asset->browser_download_url;
                    break;
                }
            }
        }

        if (! $download_url) {
            $download_url = $this->github_response->zipball_url;
        }

        $plugin_data = array(
            'slug'        => $this->basename,
            'new_version' => $new_version,
            'url'         => $this->plugin['PluginURI'] ?? '',
            'package'     => $download_url,
            'tested'      => $this->plugin['Tested up to'] ?? '6.8.3',
            'requires'    => $this->plugin['Requires at least'] ?? '6.0',
            'requires_php' => $this->plugin['Requires PHP'] ?? '8.0',
        );

        $transient->response[$this->basename] = (object) $plugin_data;
        return $transient;
    }

    /**
     * Plugin popup for update details.
     *
     * @param false|object|array $result Plugin info.
     * @param string             $action Action.
     * @param object             $args   Arguments.
     * @return false|object|array
     */
    public function plugin_popup($result, $action, $args)
    {
        if ('plugin_information' !== $action) {
            return $result;
        }

        if (! isset($args->slug) || $args->slug !== $this->basename) {
            return $result;
        }

        if (! $this->github_response) {
            return $result;
        }

        $changelog      = '';
        $changelog_file = WE_ICON_BLOCKS_PLUGIN_DIR . 'CHANGELOG.md';
        if (file_exists($changelog_file)) {
            $changelog_content = file_get_contents($changelog_file); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
            if ($changelog_content) {
                $changelog = $this->format_markdown_for_popup($changelog_content);
            }
        }

        if (empty($changelog)) {
            $changelog = $this->github_response->body ?: esc_html__('No changelog available.', 'we-icon-blocks');
        }

        $description = $this->plugin['Description'];
        $readme_file = WE_ICON_BLOCKS_PLUGIN_DIR . 'README.md';
        if (file_exists($readme_file)) {
            $readme_content = file_get_contents($readme_file); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
            if ($readme_content) {
                $description = $this->format_markdown_for_popup($readme_content);
            }
        }

        $plugin_data = array(
            'name'              => $this->plugin['Name'],
            'slug'              => $this->basename,
            'version'           => $this->github_response->tag_name,
            'author'            => $this->plugin['AuthorName'],
            'author_profile'    => $this->plugin['AuthorURI'],
            'last_updated'      => $this->github_response->published_at,
            'homepage'          => $this->plugin['PluginURI'],
            'short_description' => $this->plugin['Description'],
            'sections'          => array(
                'description'  => $description,
                'changelog'    => $changelog,
            ),
            'download_link'     => $this->github_response->zipball_url,
            'requires'          => $this->plugin['Requires at least'] ?? '6.0',
            'tested'            => $this->plugin['Tested up to'] ?? '6.8.3',
            'requires_php'      => $this->plugin['Requires PHP'] ?? '8.0',
        );

        return (object) $plugin_data;
    }

    /**
     * Format markdown content for WordPress plugin popup.
     *
     * @param string $content Markdown content.
     * @return string
     */
    private function format_markdown_for_popup($content)
    {
        $formatted = $content;

        $formatted = preg_replace('/^### (.*)$/m', '<strong>$1</strong>', $formatted);
        $formatted = preg_replace('/^## (.*)$/m', '<h3>$1</h3>', $formatted);
        $formatted = preg_replace('/^# (.*)$/m', '<h2>$1</h2>', $formatted);

        $formatted = preg_replace('/^- (.*)$/m', '<li>$1</li>', $formatted);
        $formatted = preg_replace('/^\* (.*)$/m', '<li>$1</li>', $formatted);

        $formatted = preg_replace('/(<li>.*<\/li>)/s', '<ul>$1</ul>', $formatted);

        $formatted = preg_replace('/\*\*(.*?)\*\*/', '<strong>$1</strong>', $formatted);

        $formatted = preg_replace('/`(.*?)`/', '<code>$1</code>', $formatted);

        $formatted = nl2br($formatted);

        return $formatted;
    }

    /**
     * After install callback.
     *
     * @param bool  $response   Installation response.
     * @param array $hook_extra Extra hook data.
     * @param array $result     Installation result.
     * @return array
     */
    public function after_install($response, $hook_extra, $result)
    {
        global $wp_filesystem;

        $install_directory = plugin_dir_path($this->file);
        $wp_filesystem->move($result['destination'], $install_directory);
        $result['destination'] = $install_directory;

        $this->set_plugin_properties();

        if ($this->active) {
            activate_plugin($this->basename);
        }

        return $result;
    }

    /**
     * Purge cache after update.
     */
    public function purge()
    {
        if ($this->active) {
            delete_transient('we_icon_blocks_update_' . $this->basename);
        }
    }
}
