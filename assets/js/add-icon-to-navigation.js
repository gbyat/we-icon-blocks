/**
 * Add Icon Block to Navigation
 *
 * Allows the custom icon block to be used within WordPress Navigation blocks
 *
 * @package webentwicklerin
 */

(function () {
    const { addFilter } = wp.hooks;

    /**
     * Add custom icon block to allowed blocks in navigation
     */
    function addIconBlockToNavigation(settings, name) {
        if (name !== 'core/navigation') {
            return settings;
        }

        return {
            ...settings,
            allowedBlocks: [
                ...(settings.allowedBlocks ?? []),
                'webentwicklerin/icon',
            ],
        };
    }

    addFilter(
        'blocks.registerBlockType',
        'webethm/add-icon-block-to-navigation',
        addIconBlockToNavigation
    );
})();

