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
  v8pPkg = pkgs.stdenv.mkDerivation {
    name = "v8p.me";
    version = "0.0.1";
    src = ../.;

    buildInputs = [ pkgs.nodejs ];

    buildPhase = ''
      runHook preBuild

      npm i
      npm build

      runHook postBuild
    '';

    installPhase = ''
      runHook preInstall

      mkdir -p $out/bin
      cp -r build $out/bin

      cp package.json $out/bin
      cp package-lock.json $out/bin

      cd $out/bin
      npm ci --omit dev

      runHook postInstall
    '';
  };
in
pkgs.dockerTools.buildImage {
  name = "v8p.me";
  tag = "latest";

  # fromImage = nodeDocker;

  config = {
    Cmd = [ "${pkgs.nodejs_22}/bin/node" "${v8pPkg}/bin/build" ];
  };
  
  copyToRoot = [ pkgs.nodejs_22 v8pPkg ];
}
