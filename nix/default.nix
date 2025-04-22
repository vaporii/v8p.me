{ pkgs ? (import <nixpkgs> {}), ... }: let
  # nodeDocker = pkgs.dockerTools.pullImage {
  #   imageName = "node";
  #   imageDigest = "";
  #   hash = "";
  #   finalImageTag = "22.14.0";
  #   finalImageName = "node";
  # };
  # v8pPkg = pkgs.stdenv.mkDerivation {
  #   name = "v8p.me";
  #   version = "0.1.0";
  #   src = ../.;
  #   buildInputs = [ pkgs.nodejs_22 ];
  #   buildPhase = ''
  #     runHook preBuild

  #     echo "hello!"
  #     ls
  #     pwd
  #     npm install
  #     npm run build
  #     npm ci --omit dev

  #     runHook postBuild
  #   '';
  #   installPhase = ''
  #     runHook preInstall

  #     mkdir -p $out/bin

  #     cp package.json $out/package.json
  #     cp package-lock.json $out/package-lock.json
  #     cp -r build $out/build

  #     cp build/index.js $out/bin/server
  #     chmod a+x $out/bin/server

  #     runHook postInstall
  #   '';
  # };
  v8pPkg = pkgs.buildNpmPackage {
    pname = "v8p.me";
    version = "0.0.1";
    src = ../.;

    npmDeps = pkgs.importNpmLock {
      npmRoot = ../.;
    };

    npmConfigHook = pkgs.importNpmLock.npmConfigHook;

    installPhase = ''
      mkdir -p $out/build
      cp -r build $out/build
    '';
  };
in
pkgs.dockerTools.buildImage {
  name = "v8p.me";
  tag = "latest";

  # fromImage = nodeDocker;

  config = {
    Cmd = [ "${pkgs.nodejs_22}/bin/node" "${v8pPkg}/build/build" ];
  };
  
  copyToRoot = [ pkgs.nodejs_22 v8pPkg ];
}
