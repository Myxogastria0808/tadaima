// Video wallpaper greeter example using tadaima.
// Expects an MP4 wallpaper at /var/cache/tadaima/wallpaper.mp4.
// Use `wallpaper add -g <video>` to set it.

import app from 'ags/gtk4/app';
import { Gtk } from 'ags/gtk4';
import Gio from 'gi://Gio';
import style from './style.scss';
import { createGreeter } from '@myxogastria0808/tadaima';

const WALLPAPER_PATH = '/var/cache/tadaima/wallpaper.mp4';

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

  const wallpaperFile = Gio.File.new_for_path(WALLPAPER_PATH);
  const media = Gtk.MediaFile.new_for_file(wallpaperFile);
  media.loop = true;
  media.play();

  const win = (
    <Gtk.ApplicationWindow application={app} name="greeter">
      <Gtk.Overlay>
        <Gtk.Picture paintable={media} contentFit={Gtk.ContentFit.COVER} hexpand={true} vexpand={true} />
        <Gtk.Box
          $type="overlay"
          orientation={Gtk.Orientation.VERTICAL}
          valign={Gtk.Align.CENTER}
          halign={Gtk.Align.CENTER}
          cssClasses={['login-box']}
        >
          <Gtk.Label label="Login" cssClasses={['greeting']} />
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
