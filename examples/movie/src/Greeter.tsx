// Video/image wallpaper greeter example using tadaima.
// Uses Gtk.ApplicationWindow (not Astal.Window) for cage compatibility.

import app from 'ags/gtk4/app';
import { Gtk } from 'ags/gtk4';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import style from './style.scss';
import { createGreeter } from 'tadaima';

// Wallpaper configuration.
// The file is expected to be copied (not symlinked) to the cache directory
// because the greeter runs as the `greeter` system user.
const GREETER_CACHE_DIR = '/var/cache/tadaima';
const DEFAULT_WALLPAPER = '/run/current-system/sw/share/backgrounds/nixos/nix-wallpaper-nineish-solarized-dark.png';
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.gif', '.tiff', '.svg'];
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mkv', '.avi', '.mov'];
const SUPPORTED_EXTENSIONS = [...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS];

const findWallpaper = (): string => {
  if (!GLib.file_test(GREETER_CACHE_DIR, GLib.FileTest.IS_DIR)) return DEFAULT_WALLPAPER;
  const dir = GLib.Dir.open(GREETER_CACHE_DIR, 0);
  try {
    let name: string | null;
    while ((name = dir.read_name()) !== null) {
      if (!name.startsWith('wallpaper.')) continue;
      const ext = name.substring(name.lastIndexOf('.')).toLowerCase();
      if (SUPPORTED_EXTENSIONS.includes(ext)) return `${GREETER_CACHE_DIR}/${name}`;
    }
  } finally {
    dir.close();
  }
  return DEFAULT_WALLPAPER;
};

const WALLPAPER_PATH = findWallpaper();
const isVideo = (path: string): boolean => VIDEO_EXTENSIONS.some((ext) => path.toLowerCase().endsWith(ext));

const Greeter = (): void => {
  app.apply_css(style);

  const { sessions, sessionNames, cache, createLoginHandler } = createGreeter({
    sessionDirs: ['/run/current-system/sw/share/wayland-sessions', '/run/current-system/sw/share/xsessions'],
    cachePath: '/var/cache/tadaima/state.json',
  });

  let usernameEntry!: Gtk.Entry;
  let passwordEntry!: Gtk.PasswordEntry;
  let sessionDropdown!: Gtk.DropDown;
  let errorLabel!: Gtk.Label;
  let loginButton!: Gtk.Button;

  const handleLogin = createLoginHandler({
    username: () => usernameEntry.text,
    password: () => passwordEntry.text,
    selectedSession: () => sessions[sessionDropdown.selected],
    onLoggingIn: () => {
      errorLabel.visible = false;
      loginButton.sensitive = false;
      loginButton.label = 'Logging in...';
    },
    onError: (message) => {
      errorLabel.label = message;
      errorLabel.visible = true;
      passwordEntry.text = '';
      passwordEntry.grab_focus();
      loginButton.sensitive = true;
      loginButton.label = 'Login';
    },
  });

  // Background wallpaper: supports both images and videos.
  // - Images use Gtk.Picture with contentFit COVER.
  // - Videos use Gtk.MediaFile as a paintable inside Gtk.Picture.
  //   Gtk.Video is not used because it always shows playback controls.
  // GTK4 CSS background-image: url() does not work with absolute file paths
  // when loaded via load_from_string (app.apply_css).
  // See: https://gitlab.gnome.org/GNOME/gtk/-/issues/5648
  const wallpaperFile = Gio.File.new_for_path(WALLPAPER_PATH);
  let background: Gtk.Widget;
  if (isVideo(WALLPAPER_PATH)) {
    const media = Gtk.MediaFile.new_for_file(wallpaperFile);
    media.loop = true;
    media.play();
    background = new Gtk.Picture({
      paintable: media,
      contentFit: Gtk.ContentFit.COVER,
      hexpand: true,
      vexpand: true,
    });
  } else {
    background = new Gtk.Picture({
      file: wallpaperFile,
      contentFit: Gtk.ContentFit.COVER,
      hexpand: true,
      vexpand: true,
    });
  }

  // Gtk.ApplicationWindow is used instead of Astal.Window because cage does
  // not support wlr-layer-shell. cage automatically fullscreens the window.
  const win = (
    <Gtk.ApplicationWindow application={app} name="greeter">
      <Gtk.Overlay>
        {background}
        <Gtk.Box
          $type="overlay"
          orientation={Gtk.Orientation.VERTICAL}
          valign={Gtk.Align.CENTER}
          halign={Gtk.Align.CENTER}
          cssClasses={['login-box']}
        >
          <Gtk.Label label="Welcome to NixOS" cssClasses={['greeting']} />
          <Gtk.Entry
            text={cache.username}
            placeholderText="Username"
            onActivate={() => passwordEntry.grab_focus()}
            $={(self) => (usernameEntry = self)}
          />
          <Gtk.PasswordEntry
            placeholderText="Password"
            showPeekIcon={true}
            onActivate={handleLogin}
            $={(self) => (passwordEntry = self)}
          />
          <Gtk.DropDown
            $constructor={() => Gtk.DropDown.new_from_strings(sessionNames)}
            selected={cache.sessionIndex}
            cssClasses={['session-dropdown']}
            $={(self) => (sessionDropdown = self)}
          />
          <Gtk.Label label="" visible={false} cssClasses={['error']} $={(self) => (errorLabel = self)} />
          <Gtk.Button label="Login" onClicked={handleLogin} $={(self) => (loginButton = self)} />
        </Gtk.Box>
      </Gtk.Overlay>
    </Gtk.ApplicationWindow>
  ) as Gtk.ApplicationWindow;

  win.present();
  passwordEntry.grab_focus();
};

export default Greeter;
