# Wallpaper Scaling Toggle

A lightweight GNOME Shell extension that adds a **Wallpaper Scaling** control directly to the **Quick Settings** menu.

Instead of opening Settings every time you want to change how your wallpaper is displayed, this extension lets you switch between wallpaper scaling modes with a single click.

## Features

- 🖼️ Quick Settings integration
- ⚡ Instantly change wallpaper scaling mode
- 📌 Displays the currently selected scaling mode
- ⚙️ Opens GNOME Background Settings when the main button is clicked
- 🔄 Automatically updates if the wallpaper scaling option changes elsewhere
- 🧹 Proper cleanup of signals and menu items when disabled

## Supported Wallpaper Modes

- Zoom
- Scaled
- Stretched
- Centered
- Spanned

---

## Screenshot

<img src="/Screenshot.png" alt="App Screenshot" width="500">

Example:

---

## Requirements

- GNOME Shell 49+
- GJS (GNOME JavaScript)
- `org.gnome.desktop.background` GSettings schema

---

## Installation

Clone the repository:

```bash
git clone https://github.com/cuey78/wallpaper-scaling-toggle.git
```

Create the extensions directory if it doesn't exist:

```bash
mkdir -p ~/.local/share/gnome-shell/extensions
```

Copy the extension into your local extensions directory:

```bash
cp -r wallpaper-scaling-toggle ~/.local/share/gnome-shell/extensions/<extension-uuid>
```

Restart GNOME Shell (or log out and back in), then enable the extension:

```bash
gnome-extensions enable <extension-uuid>
```

Alternatively, enable it using the **Extensions** application.

---

## Usage

- Click the **Wallpaper** button in Quick Settings to open the GNOME Background settings.
- Open the menu to choose a wallpaper scaling mode.
- The currently selected mode is shown beneath the button title.
- If the wallpaper scaling mode changes elsewhere, the extension updates automatically.

---

## How It Works

The extension modifies the following GSettings key:

```text
org.gnome.desktop.background picture-options
```

Available values:

| Value | Description |
|-------|-------------|
| `zoom` | Fill the screen while preserving aspect ratio |
| `scaled` | Fit the entire image within the screen |
| `stretched` | Stretch the image to fill the display |
| `centered` | Display the image at its original size |
| `spanned` | Span the wallpaper across multiple monitors |

---

## License

This project is licensed under the **MIT License**.

---

Made for GNOME users who want faster access to wallpaper settings.
