{
  description = "tadaima — a greetd greeter library for AGS/GJS";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

    ags = {
      url = "github:aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      ags,
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
          ags.packages.${system}.default
        ];
      };

      packages.${system} = {
        # Bare-minimum greeter — no wallpaper, no styling, just the login form
        simple = pkgs.stdenv.mkDerivation {
          name = "tadaima-simple";
          src = ./examples/simple;

          nativeBuildInputs = with pkgs; [
            wrapGAppsHook3
            gobject-introspection
            ags.packages.${system}.default
          ];

          buildInputs = [
            pkgs.glib
            pkgs.gjs
          ];

          preBuild = ''
            mkdir -p node_modules
            ln -s ${self}/src node_modules/tadaima
          '';

          installPhase = ''
            mkdir -p $out/bin
            ags bundle app.tsx $out/bin/greeter
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

          buildInputs = [
            pkgs.glib
            pkgs.gjs
          ];

          preBuild = ''
            mkdir -p node_modules
            ln -s ${self}/src node_modules/tadaima
          '';

          installPhase = ''
            mkdir -p $out/bin
            ags bundle app.tsx $out/bin/greeter
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
            ln -s ${self}/src node_modules/tadaima
          '';

          installPhase = ''
            mkdir -p $out/bin
            ags bundle app.tsx $out/bin/greeter
          '';
        };
      };
    };
}

