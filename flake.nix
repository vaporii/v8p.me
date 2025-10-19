{
  description = "v8p.me flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
  };

  outputs = { nixpkgs, ... }:
  let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};
  in {
    packages.${system}.default = (import ./nix { inherit pkgs; });

    devShells.${system}.default = pkgs.mkShell {
      packages = [
        pkgs.nodejs_latest
        pkgs.python3
      ];
    };

    # nixosModules.default = self.nixosModules."v8p.me";
    # nixosModules."v8p.me" = import ./nix/nixos.nix inputs;
  };
}
