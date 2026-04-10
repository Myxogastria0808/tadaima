{
  description = "{{projectName}} — a tadaima greeter";

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

    tadaima = {
      url = "github:Myxogastria0808/tadaima";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.ags.follows = "ags";
      inputs.astal.follows = "astal";
    };
  };

  outputs =
    {
      nixpkgs,
      ags,
      astal,
      tadaima,
      ...
    }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs {
        inherit system;
      };
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        buildInputs = [
          pkgs.nodejs
          pkgs.corepack
          ags.packages.${system}.default
        ];
      };

      packages.${system}.default = pkgs.stdenv.mkDerivation {
        name = "{{projectName}}";
        src = ./.;

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
          ln -sf ${tadaima}/packages/tadaima/src node_modules/tadaima
        '';

        installPhase = ''
          mkdir -p $out/bin
          ags bundle src/app.tsx $out/bin/greeter
        '';
      };

      # Manual greetd setup:
      #
      # 1. Build and install:
      #   nix build
      #   sudo cp ./result/bin/greeter /usr/local/bin/greeter
      #
      # 2. Configure /etc/greetd/config.toml:
      #   [terminal]
      #   vt = 1
      #   [default_session]
      #   command = "dbus-run-session cage -s -d -- /usr/local/bin/greeter"
      #   user = "greeter"
      #
      # 3. Create cache directory and enable greetd:
      #   sudo mkdir -p /var/cache/tadaima
      #   sudo chown greeter:greeter /var/cache/tadaima
      #   sudo systemctl enable greetd.service
    };
}

