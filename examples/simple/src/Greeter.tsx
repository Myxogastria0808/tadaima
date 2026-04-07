// Minimal greeter example using tadaima.
// No wallpaper, no styling — just the essential login form.

import app from "ags/gtk4/app";
import { Gtk } from "ags/gtk4";
import { createGreeter } from "tadaima";

const Greeter = (): void => {
  const { sessions, sessionNames, cache, createLoginHandler } = createGreeter({
    sessionDirs: ["/usr/share/wayland-sessions", "/usr/share/xsessions"],
    cachePath: "/var/cache/tadaima/state.json",
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
      loginButton.label = "Logging in...";
    },
    onError: (message) => {
      errorLabel.label = message;
      errorLabel.visible = true;
      passwordEntry.text = "";
      passwordEntry.grab_focus();
      loginButton.sensitive = true;
      loginButton.label = "Login";
    },
  });

  const win = (
    <Gtk.ApplicationWindow application={app} name="greeter">
      <Gtk.Box
        orientation={Gtk.Orientation.VERTICAL}
        valign={Gtk.Align.CENTER}
        halign={Gtk.Align.CENTER}
        spacing={8}
      >
        <Gtk.Label label="Login" />
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
          $constructor={() =>
            Gtk.DropDown.new_from_strings(sessionNames)
          }
          selected={cache.sessionIndex}
          $={(self) => (sessionDropdown = self)}
        />
        <Gtk.Label label="" visible={false} $={(self) => (errorLabel = self)} />
        <Gtk.Button
          label="Login"
          onClicked={handleLogin}
          $={(self) => (loginButton = self)}
        />
      </Gtk.Box>
    </Gtk.ApplicationWindow>
  ) as Gtk.ApplicationWindow;

  win.present();
  passwordEntry.grab_focus();
};

export default Greeter;
