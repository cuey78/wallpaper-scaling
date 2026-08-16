import GObject from 'gi://GObject';
import Gio from 'gi://Gio';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as QuickSettings from 'resource:///org/gnome/shell/ui/quickSettings.js';
import * as Util from 'resource:///org/gnome/shell/misc/util.js';

const WallpaperScalingToggle = GObject.registerClass(
class WallpaperScalingToggle extends QuickSettings.QuickMenuToggle {
    _init(settings) {
        super._init({
            title: 'Wallpaper',
            iconName: 'image-x-generic-symbolic',
            toggleMode: false,
        });

        this._settings = settings;

        // Main button click → open GNOME wallpaper settings
        this.connect('clicked', () => {
            Util.spawnCommandLine('gnome-control-center background');
        });

        const options = [
            ['zoom', 'Zoom'],
            ['scaled', 'Scaled'],
            ['stretched', 'Stretched'],
            ['centered', 'Centered'],
            ['spanned', 'Spanned'],
        ];

        const current = this._settings.get_string('picture-options');
        const currentLabel = options.find(([v]) => v === current)?.[1];

        if (currentLabel)
            this.subtitle = currentLabel;

        for (const [value, label] of options) {
            const item = new PopupMenu.PopupMenuItem(label);

            item.connect('activate', () => {
                this._settings.set_string('picture-options', value);
                this.subtitle = label;
            });

            this.menu.addMenuItem(item);
        }
    }

    destroy() {
        // Clean up all menu items
        this.menu.removeAll();
        
        // Disconnect from settings
        if (this._settings) {
            this._settings = null;
        }
        
        // Call parent destroy if it exists
        if (super.destroy) {
            super.destroy();
        }
    }
});

const WallpaperIndicator = GObject.registerClass(
class WallpaperIndicator extends QuickSettings.SystemIndicator {
    _init(settings) {
        super._init();

        this._settings = settings;
        this._toggle = new WallpaperScalingToggle(settings);

        this.quickSettingsItems.push(this._toggle);

        // Check if we're already added before adding again
        const quickSettings = Main.panel.statusArea.quickSettings;
        if (!quickSettings._wallpaperIndicator) {
            quickSettings.addExternalIndicator(this);
            quickSettings._wallpaperIndicator = this;
        }
    }

    destroy() {
        // Remove from quick settings
        const quickSettings = Main.panel.statusArea.quickSettings;
        if (quickSettings._wallpaperIndicator === this) {
            quickSettings._wallpaperIndicator = null;
        }

        // Destroy the toggle
        if (this._toggle) {
            this._toggle.destroy();
            this._toggle = null;
        }

        // Call parent destroy
        if (super.destroy) {
            super.destroy();
        }
    }
});

export default class Extension {
    enable() {
        // Check if already enabled
        if (this._indicator) {
            return;
        }

        this._settings = new Gio.Settings({
            schema_id: 'org.gnome.desktop.background',
        });

        // Check if there's already an indicator from a previous session
        const quickSettings = Main.panel.statusArea.quickSettings;
        if (quickSettings._wallpaperIndicator) {
            // Remove the old one first
            quickSettings._wallpaperIndicator.destroy();
        }

        this._indicator = new WallpaperIndicator(this._settings);
    }

    disable() {
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }

        if (this._settings) {
            this._settings = null;
        }

        // Clean up any leftover references
        const quickSettings = Main.panel.statusArea.quickSettings;
        if (quickSettings._wallpaperIndicator) {
            quickSettings._wallpaperIndicator.destroy();
            quickSettings._wallpaperIndicator = null;
        }
    }
}
