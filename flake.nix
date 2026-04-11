{
  description = "tadaima — a greetd greeter library for AGS/GJS";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

    # AGS requires astal.io and astal4 at runtime for GTK4/JSX widgets.
    # tadaima's library (packages/tadaima/src/) does NOT depend on Astal — only the
    # example greeter binaries need it because they use AGS/Gnim JSX.
    ags = {
      url = "github:aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.astal.follows = "astal";
    };

    astal = {
      url = "github:aylur/astal";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      ags,
      astal,
      ...
    }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs {
        inherit system;
      };
    in
    {
      nixosModules.default = ./nix/module.nix;

      devShells.${system}.default = pkgs.mkShell {
        buildInputs = [
          pkgs.nodejs
          pkgs.corepack
          ags.packages.${system}.default
        ];
      };

      packages.${system} = {
        # Absolute minimum greeter — no wallpaper, no styling, no CSS
        minimal = pkgs.stdenv.mkDerivation {
          name = "tadaima-minimal";
          src = ./examples/minimal;

          nativeBuildInputs = with pkgs; [
            wrapGAppsHook3
            gobject-introspection
            ags.packages.${system}.default
          ];

          buildInputs = [
            pkgs.glib
            pkgs.gjs
            astal.packages.${system}.io
            astal.packages.${system}.astal4
          ];

          preBuild = ''
            mkdir -p node_modules
            ln -sf ${self}/packages/tadaima/src node_modules/tadaima
          '';

          installPhase = ''
            mkdir -p $out/bin
            ags bundle src/app.tsx $out/bin/greeter
          '';
        };

        # Bare-minimum greeter — no wallpaper, Catppuccin Mocha styling
        simple = pkgs.stdenv.mkDerivation {
          name = "tadaima-simple";
          src = ./examples/simple;

          nativeBuildInputs = with pkgs; [
            wrapGAppsHook3
            gobject-introspection
            ags.packages.${system}.default
          ];

          # astal.io and astal4 are required by AGS/Gnim JSX runtime (not by tadaima)
          buildInputs = [
            pkgs.glib
            pkgs.gjs
            astal.packages.${system}.io
            astal.packages.${system}.astal4
          ];

          preBuild = ''
            mkdir -p node_modules
            ln -sf ${self}/packages/tadaima/src node_modules/tadaima
          '';

          installPhase = ''
            mkdir -p $out/bin
            ags bundle src/app.tsx $out/bin/greeter
          '';
        };

        # Greeter with static image wallpaper and Catppuccin Mocha theme
        image = pkgs.stdenv.mkDerivation {
          name = "tadaima-image";
          src = ./examples/image;

          nativeBuildInputs = with pkgs; [
            wrapGAppsHook3
            gobject-introspection
            ags.packages.${system}.default
          ];

          # astal.io and astal4 are required by AGS/Gnim JSX runtime (not by tadaima)
          buildInputs = [
            pkgs.glib
            pkgs.gjs
            astal.packages.${system}.io
            astal.packages.${system}.astal4
          ];

          preBuild = ''
            mkdir -p node_modules
            ln -sf ${self}/packages/tadaima/src node_modules/tadaima
          '';

          installPhase = ''
            mkdir -p $out/bin
            ags bundle src/app.tsx $out/bin/greeter
          '';
        };

        # Greeter with video/image wallpaper support (requires GStreamer)
        movie = pkgs.stdenv.mkDerivation {
          name = "tadaima-movie";
          src = ./examples/movie;

          nativeBuildInputs = with pkgs; [
            wrapGAppsHook3
            gobject-introspection
            ags.packages.${system}.default
          ];

          buildInputs = [
            pkgs.glib
            pkgs.gjs
            # astal.io and astal4 are required by AGS/Gnim JSX runtime (not by tadaima)
            astal.packages.${system}.io
            astal.packages.${system}.astal4
            # Additional image format support for GdkPixbuf
            pkgs.librsvg # SVG
            pkgs.webp-pixbuf-loader # WebP
            # GStreamer plugins for video wallpaper (Gtk.MediaFile)
            pkgs.gst_all_1.gstreamer
            pkgs.gst_all_1.gst-plugins-base
            pkgs.gst_all_1.gst-plugins-good
            pkgs.gst_all_1.gst-plugins-bad
            pkgs.gst_all_1.gst-plugins-ugly
            pkgs.gst_all_1.gst-libav # FFmpeg-based codecs (H.264, H.265, etc.)
            pkgs.gst_all_1.gst-vaapi # VA-API hardware-accelerated decoding
          ];

          preBuild = ''
            mkdir -p node_modules
            ln -sf ${self}/packages/tadaima/src node_modules/tadaima
          '';

          installPhase = ''
            mkdir -p $out/bin
            ags bundle src/app.tsx $out/bin/greeter
          '';
        };
      };
    };
}

