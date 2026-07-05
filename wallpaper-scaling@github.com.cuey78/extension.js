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

        // ✅ Main button click → open GNOME wallpaper settings
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

        // Track menu items for cleanup
        this._menuItems = [];

        for (const [value, label] of options) {
            const item = new PopupMenu.PopupMenuItem(label);
            this._menuItems.push(item);

            item.connect('activate', () => {
                this._settings.set_string('picture-options', value);
                this.subtitle = label;
            });

            this.menu.addMenuItem(item);
        }
        
        // Listen for changes to update subtitle
        this._settingsChangedId = this._settings.connect(
            'changed::picture-options',
            () => {
                const newValue = this._settings.get_string('picture-options');
                const newLabel = options.find(([v]) => v === newValue)?.[1];
                if (newLabel) this.subtitle = newLabel;
            }
        );
    }
    
    destroy() {
        // Clean up signal connections
        if (this._settingsChangedId) {
            this._settings.disconnect(this._settingsChangedId);
            this._settingsChangedId = null;
        }
        
        // Clean up menu items
        if (this._menuItems) {
            this._menuItems.forEach(item => item.destroy());
            this._menuItems = null;
        }
        
        super.destroy();
    }
});

const WallpaperIndicator = GObject.registerClass(
class WallpaperIndicator extends QuickSettings.SystemIndicator {
    _init(settings) {
        super._init();

        this._settings = settings;
        this._toggle = new WallpaperScalingToggle(settings);

        this.quickSettingsItems.push(this._toggle);

        Main.panel.statusArea.quickSettings.addExternalIndicator(this);
    }
    
    destroy() {
        // Clean up the toggle
        if (this._toggle) {
            this._toggle.destroy();
            this._toggle = null;
        }
        
        super.destroy();
    }
});

// Use a module-level variable to track if we're already loaded
let isExtensionLoaded = false;

export default class Extension {
    enable() {
        // Prevent double-loading
        if (isExtensionLoaded) {
            console.warn('Wallpaper Scaling Toggle: Already loaded, skipping');
            return;
        }
        
        this._settings = new Gio.Settings({
            schema_id: 'org.gnome.desktop.background',
        });

        this._indicator = new WallpaperIndicator(this._settings);
        isExtensionLoaded = true;
    }

    disable() {
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
        
        this._settings = null;
        isExtensionLoaded = false;
    }
}
