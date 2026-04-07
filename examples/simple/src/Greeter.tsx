// Minimal greeter example using tadaima.
// No wallpaper, no styling — just the essential login form.

import app from "ags/gtk4/app";
import { Gtk } from "ags/gtk4";
import { createGreeter } from "tadaima";

const Greeter = (): void => {
  const greeter = createGreeter({
    sessionDirs: ["/usr/share/wayland-sessions", "/usr/share/xsessions"],
    cachePath: "/var/cache/tadaima/state.json",
  });

  const sessions = greeter.getSessions();
  const cached = greeter.getCachedState();

  let usernameEntry!: Gtk.Entry;
  let passwordEntry!: Gtk.PasswordEntry;
  let sessionDropdown!: Gtk.DropDown;
  let errorLabel!: Gtk.Label;
  let loginButton!: Gtk.Button;

  const loginHandler = greeter.createLoginHandler({
    onLoggingIn: () => {
      errorLabel.visible = false;
      loginButton.sensitive = false;
      loginButton.label = "Logging in...";
    },
    onSuccess: () => {},
    onError: (message) => {
      errorLabel.label = message;
      errorLabel.visible = true;
      passwordEntry.text = "";
      passwordEntry.grab_focus();
      loginButton.sensitive = true;
      loginButton.label = "Login";
    },
  });

  const handleLogin = () => {
    const selectedSession = sessions[sessionDropdown.selected];
    if (!selectedSession) {
      errorLabel.label = "No session selected";
      errorLabel.visible = true;
      return;
    }
    loginHandler.handle(
      usernameEntry.text,
      passwordEntry.text,
      selectedSession.exec,
      selectedSession.name,
    );
  };

  const cachedSessionIdx = cached?.session
    ? sessions.findIndex((s) => s.name === cached.session)
    : -1;

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

