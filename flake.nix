{
  description = "v8p.me flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
  };

  outputs = { self, nixpkgs }@inputs:
  let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};
  in {
    packages.${system}.default = (import ./nix { inherit pkgs; });

    # nixosModules.default = self.nixosModules."v8p.me";
    # nixosModules."v8p.me" = import ./nix/nixos.nix inputs;
  };
}
