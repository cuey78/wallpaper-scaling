import Gio from 'gi://Gio';
import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import GObject from 'gi://GObject';

const BACKGROUND_SCHEMA = 'org.gnome.desktop.background';
const PICTURE_OPTIONS_KEY = 'picture-options';

const OPTIONS = {
    'centered': 'Centered',
    'scaled': 'Scaled (Fit)',
    'stretched': 'Stretched',
    'zoom': 'Zoom (Fill)',
    'wallpaper': 'Tile',
    'spanned': 'Spanned (Multi-monitor)'
};

export default class WallpaperScalingPreferences {
    constructor(metadata) {
        this._metadata = metadata;
    }

    async fillPreferencesWindow(window) {
        const settings = new Gio.Settings({ schema_id: BACKGROUND_SCHEMA });
        
        const page = new Adw.PreferencesPage({
            title: 'Wallpaper Scaling',
            icon_name: 'preferences-desktop-wallpaper-symbolic',
        });
        window.add(page);

        const scalingGroup = new Adw.PreferencesGroup({
            title: 'Scaling Mode',
            description: 'Choose how your wallpaper is displayed on the desktop',
        });
        page.add(scalingGroup);

        const comboRow = new Adw.ComboRow({
            title: 'Picture Options',
            subtitle: 'Select wallpaper scaling mode',
        });
        scalingGroup.add(comboRow);

        const optionsKeys = Object.keys(OPTIONS);
        const stringList = new Gtk.StringList();
        optionsKeys.forEach(key => {
            stringList.append(OPTIONS[key]);
        });

        comboRow.model = stringList;

        const currentValue = settings.get_string(PICTURE_OPTIONS_KEY);
        const currentIndex = optionsKeys.indexOf(currentValue);
        if (currentIndex !== -1) {
            comboRow.selected = currentIndex;
        }

        comboRow.connect('notify::selected', () => {
            const selectedIndex = comboRow.selected;
            if (selectedIndex >= 0 && selectedIndex < optionsKeys.length) {
                settings.set_string(PICTURE_OPTIONS_KEY, optionsKeys[selectedIndex]);
            }
        });

        // Add information section
        const infoGroup = new Adw.PreferencesGroup({
            title: 'Mode Information',
            description: 'Understanding each scaling mode',
        });
        page.add(infoGroup);

        const modes = [
            ['Centered', 'Image centered without scaling. Black bars if image is smaller than screen.'],
            ['Scaled (Fit)', 'Image fits screen maintaining aspect ratio. May have black bars.'],
            ['Stretched', 'Image stretches to fill screen. May cause distortion.'],
            ['Zoom (Fill)', 'Image fills entire screen. May crop edges.'],
            ['Tile', 'Image repeats to fill the screen. Good for patterns.'],
            ['Spanned', 'Single image spans across multiple monitors.']
        ];

        modes.forEach(([title, subtitle]) => {
            const row = new Adw.ActionRow({
                title: title,
                subtitle: subtitle,
            });
            infoGroup.add(row);
        });
    }
}
