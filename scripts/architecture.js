const SUPPORTED_PLATFORMS = {
  darwin: "mac",
  linux: "linux",
  win32: "windows",
};

const SUPPORTED_ARCHITECTURES = {
  arm64: "aarch64",
  x64: "x64",
};

function getAdoptiumPlatform() {
  const platform = SUPPORTED_PLATFORMS[process.platform];
  if (!platform) {
    throw new Error(`Unsupported OS for Java bootstrap: ${process.platform}`);
  }

  return platform;
}

function getAdoptiumArchitecture() {
  const architecture = SUPPORTED_ARCHITECTURES[process.arch];
  if (!architecture) {
    throw new Error(`Unsupported architecture for Java bootstrap: ${process.arch}`);
  }

  return architecture;
}

function getJavaBinaryName() {
  return process.platform === "win32" ? "java.exe" : "java";
}

module.exports = {
  getAdoptiumArchitecture,
  getAdoptiumPlatform,
  getJavaBinaryName,
};
