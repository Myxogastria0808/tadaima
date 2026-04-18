# NixOS module for tadaima greeter.
#
# Configures greetd to launch a user-provided greeter binary inside cage.
#
# Launch chain: greetd → dbus-run-session → cage → greeter binary
#
# Usage in NixOS configuration:
#   imports = [ tadaima.nixosModules.default ];
#   services.tadaima = {
#     enable = true;
#     package = myGreeterDerivation;
#   };
{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.services.tadaima;
in
{
  options.services.tadaima = {
    enable = lib.mkEnableOption "tadaima greetd greeter";

    package = lib.mkOption {
      type = lib.types.package;
      description = "The bundled greeter binary package (built with `ags bundle`).";
    };

    cachePath = lib.mkOption {
      type = lib.types.str;
      default = "/var/cache/tadaima";
      description = "Directory for greeter state cache (user/session persistence).";
    };
  };

  config = lib.mkIf cfg.enable {
    # The greetd NixOS module automatically creates the `greeter` system user
    # and sets default VT to 1. Neither `user` nor `vt` need to be specified.
    #
    # dbus-run-session: provides a D-Bus session bus for AGS/Astal's D-Bus
    # registration (Bus.own_name) and prevents GTK4's ~20s portal timeout.
    # Note: tadaima's greetd IPC uses Unix sockets, not D-Bus.
    #
    # cage: minimal Wayland kiosk compositor. Used instead of Hyprland because
    # greeter uses Gtk.ApplicationWindow (not Astal.Window which requires
    # wlr-layer-shell). cage runs the greeter as a single, maximized application.
    # Flags: -s (permit VT switching), -d (suppress CSD title bar),
    #        -mlast (use only last connected monitor)
    services.greetd = {
      enable = true;
      settings.default_session.command = "${pkgs.dbus}/bin/dbus-run-session ${lib.getExe pkgs.cage} -s -d -mlast -- ${cfg.package}/bin/greeter";
    };

    # Cache directory owned by the greeter user for state persistence.
    systemd.tmpfiles.rules = [
      "d ${cfg.cachePath} 0755 greeter greeter -"
    ];
  };
}

