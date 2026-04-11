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
          mkdir -p node_modules/@myxogastria0808
          ln -sf ${tadaima}/packages/tadaima/src node_modules/@myxogastria0808/tadaima
        '';

        installPhase = ''
          mkdir -p $out/bin
          ags bundle src/app.tsx $out/bin/greeter
        '';
      };

      # Manual greetd setup:
      #
      # 1. Build the greeter:
      #   nix build
      #
      # 2. Find the Nix store path of the built greeter:
      #   readlink ./result
      #   # Example output: /nix/store/abc123...-{{projectName}}
      #
      # 3. Pin the build result so `nix-collect-garbage` does not remove it:
      #   sudo nix build --out-link /etc/greetd/greeter-link
      #
      # 4. Configure /etc/greetd/config.toml with the store path from step 2:
      #   [terminal]
      #   vt = 1
      #   [default_session]
      #   command = "dbus-run-session cage -s -d -- /nix/store/abc123...-{{projectName}}/bin/greeter"
      #   user = "greeter"
      #
      # 5. Create cache directory and enable greetd:
      #   sudo mkdir -p /var/cache/tadaima
      #   sudo chown greeter:greeter /var/cache/tadaima
      #   sudo systemctl enable greetd.service
    };
}

