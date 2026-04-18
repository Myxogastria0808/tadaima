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
      self,
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
      nixosModules.default =
        { config, pkgs, lib, ... }:
        let
          cfg = config.services.{{projectName}};
        in
        {
          options.services.{{projectName}} = {
            enable = lib.mkEnableOption "{{projectName}} greetd greeter";

            cachePath = lib.mkOption {
              type = lib.types.str;
              default = "/var/cache/tadaima";
              description = "Directory for greeter state cache.";
            };
          };

          config = lib.mkIf cfg.enable {
            services.greetd = {
              enable = true;
              settings.default_session.command = "${pkgs.dbus}/bin/dbus-run-session ${lib.getExe pkgs.cage} -s -d -mlast -- ${
                self.packages.${system}.default
              }/bin/greeter";
            };

            systemd.tmpfiles.rules = [
              "d ${cfg.cachePath} 0755 greeter greeter -"
            ];
          };
        };

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

      # NixOS configuration usage:
      #
      # In your system flake inputs:
      #   ags = {
      #     url = "github:aylur/ags";
      #     inputs.nixpkgs.follows = "nixpkgs";
      #     inputs.astal.follows = "astal";
      #   };
      #   astal = {
      #     url = "github:aylur/astal";
      #     inputs.nixpkgs.follows = "nixpkgs";
      #   };
      #   {{projectName}} = {
      #     url = "path:./path/to/{{projectName}}";  # or github:...
      #     inputs.nixpkgs.follows = "nixpkgs";
      #     inputs.ags.follows = "ags";
      #     inputs.astal.follows = "astal";
      #   };
      #
      # In your NixOS configuration:
      #   imports = [ inputs.{{projectName}}.nixosModules.default ];
      #
      #   services.{{projectName}} = {
      #     enable = true;
      #   };
    };
}

