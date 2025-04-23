{ pkgs ? (import <nixpkgs> {}), ... }: let
  v8pPkg = pkgs.buildNpmPackage {
    pname = "v8p.me";
    version = "0.0.1";
    src = ../.;

    npmDeps = pkgs.importNpmLock {
      npmRoot = ../.;
    };

    npmConfigHook = pkgs.importNpmLock.npmConfigHook;

    installPhase = ''
      mkdir -p $out/bin/v8p.me
      cp -r build $out/bin/v8p.me
      cp -r node_modules $out/bin/v8p.me
    '';
  };
in
pkgs.dockerTools.buildImage {
  name = "v8p.me";
  tag = "latest";

  fromImageName = "node";
  fromImageTag = "22";

  config = {
    Cmd = [ "node" "/bin/v8p.me/build" ];
  };

  copyToRoot = pkgs.buildEnv {
    name = "v8p.me";
    paths = [ v8pPkg pkgs.coreutils ];
    pathsToLink = [ "/bin" "/lib" ];
  };

  keepContentsDirlinks = true;
}
