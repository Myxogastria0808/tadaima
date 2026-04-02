// Example greeter using tadaima.
// Uses Gtk.ApplicationWindow (not Astal.Window) for cage compatibility.
// cage does not support wlr-layer-shell protocol.

import app from "ags/gtk4/app";
import { Gtk } from "ags/gtk4";
import GLib from "gi://GLib";
import Gio from "gi://Gio";
import style from "./style.scss";
import { createGreeter } from "tadaima";

const WALLPAPER_PATH =
  "/run/current-system/sw/share/backgrounds/nixos/nix-wallpaper-nineish-solarized-dark.png";

const Greeter = (): void => {
  app.apply_css(style);

  const greeter = createGreeter({
    sessionDirs: [
      "/run/current-system/sw/share/wayland-sessions",
      "/run/current-system/sw/share/xsessions",
    ],
    cachePath: "/var/cache/tadaima/state.json",
  });

  const sessions = greeter.getSessions();
  const cached = greeter.getCachedState();

  let usernameEntry!: Gtk.Entry;
  let passwordEntry!: Gtk.PasswordEntry;
  let sessionDropdown!: Gtk.DropDown;
  let errorLabel!: Gtk.Label;
  let loginButton!: Gtk.Button;
  let loggingIn = false;

  const handleLogin = async () => {
    if (loggingIn) return;
    errorLabel.visible = false;

    const selectedSession = sessions[sessionDropdown.selected];
    if (!selectedSession) {
      errorLabel.label = "No session selected";
      errorLabel.visible = true;
      sessionDropdown.grab_focus();
      return;
    }

    loggingIn = true;
    loginButton.sensitive = false;
    loginButton.label = "Logging in...";

    const result = await greeter.login(
      usernameEntry.text,
      passwordEntry.text,
      selectedSession.exec,
    );

    if (result.success) {
      greeter.saveState(usernameEntry.text, selectedSession.name);
    } else {
      errorLabel.label = result.message;
      errorLabel.visible = true;
      passwordEntry.text = "";
      passwordEntry.grab_focus();
      loggingIn = false;
      loginButton.sensitive = true;
      loginButton.label = "Login";
    }
  };

  const cachedSessionIdx = cached?.session
    ? sessions.findIndex((s) => s.name === cached.session)
    : -1;

  // Wallpaper uses Gtk.Picture + Gtk.Overlay because GTK4 CSS
  // background-image: url() does not work with absolute file paths
  // when loaded via load_from_string (app.apply_css).
  // See: https://gitlab.gnome.org/GNOME/gtk/-/issues/5648
  const win = (
    <Gtk.ApplicationWindow application={app} name="greeter">
      <Gtk.Overlay>
        <Gtk.Picture
          file={Gio.File.new_for_path(WALLPAPER_PATH)}
          contentFit={Gtk.ContentFit.COVER}
          hexpand={true}
          vexpand={true}
        />
        <Gtk.Box
          $type="overlay"
          orientation={Gtk.Orientation.VERTICAL}
          valign={Gtk.Align.CENTER}
          halign={Gtk.Align.CENTER}
          cssClasses={["login-box"]}
        >
          <Gtk.Label label="Welcome to NixOS" cssClasses={["greeting"]} />
          <Gtk.Entry
            text={cached?.user ?? ""}
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
            $constructor={() =>
              Gtk.DropDown.new_from_strings(sessions.map((s) => s.name))
            }
            selected={cachedSessionIdx >= 0 ? cachedSessionIdx : 0}
            cssClasses={["session-dropdown"]}
            $={(self) => (sessionDropdown = self)}
          />
          <Gtk.Label
            label=""
            visible={false}
            cssClasses={["error"]}
            $={(self) => (errorLabel = self)}
          />
          <Gtk.Button
            label="Login"
            onClicked={handleLogin}
            $={(self) => (loginButton = self)}
          />
        </Gtk.Box>
      </Gtk.Overlay>
    </Gtk.ApplicationWindow>
  ) as Gtk.ApplicationWindow;

  win.present();
  passwordEntry.grab_focus();
};

export default Greeter;

