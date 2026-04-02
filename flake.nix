{
  description = "tadaima — a greetd greeter library for AGS/GJS";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

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
    { nixpkgs, ags, astal, ... }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs {
        inherit system;
      };
    in
    {
      nixosModules.default = ./nix/module.nix;

      # Example greeter derivation — demonstrates how to build a greeter with tadaima.
      packages.${system}.example = pkgs.stdenv.mkDerivation {
        name = "tadaima-example-greeter";
        src = ./examples/simple;

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
          astal.packages.${system}.greet
        ];

        installPhase = ''
          mkdir -p $out/bin
          ags bundle app.tsx $out/bin/greeter
        '';
      };
    };
}
