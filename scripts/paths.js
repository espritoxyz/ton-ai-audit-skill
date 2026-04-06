const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  TSA_JAR_FILE_NAME,
  FIFTSTDLIB_DIRECTORY_NAME,
  IMPORTS_DIRECTORY_NAME,
} = require("./constants");
const { getJavaBinaryName } = require("./architecture");

const TSA_HOME_DIRECTORY_NAME = ".tsa";
const JRE_DIRECTORY_NAME = "jre";
const MACOS_JAVA_HOME_SUFFIX = path.join("Contents", "Home");
const BIN_DIRECTORY_NAME = "bin";

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
  return directoryPath;
}

function getTsaHomeDirectory() {
  return ensureDirectory(path.join(os.homedir(), TSA_HOME_DIRECTORY_NAME));
}

function findTsaJarPath() {
  const jarPath = path.join(getTsaHomeDirectory(), TSA_JAR_FILE_NAME);
  return fs.existsSync(jarPath) ? jarPath : null;
}

function findJavaBinaryPath() {
  const jreDirectoryPath = path.join(getTsaHomeDirectory(), JRE_DIRECTORY_NAME);
  if (!fs.existsSync(jreDirectoryPath)) {
    return null;
  }

  const directoryEntries = fs.readdirSync(jreDirectoryPath);
  if (directoryEntries.length === 0) {
    return null;
  }

  if (directoryEntries.length !== 1) {
    throw new Error(
      `Unexpected content in JRE directory: expected 1 entry, found ${directoryEntries.length}`,
    );
  }

  const javaHomePath = path.join(jreDirectoryPath, directoryEntries[0]);
  const resolvedJavaHomePath = process.platform === "darwin"
    ? path.join(javaHomePath, MACOS_JAVA_HOME_SUFFIX)
    : javaHomePath;
  const javaBinaryPath = path.join(
    resolvedJavaHomePath,
    BIN_DIRECTORY_NAME,
    getJavaBinaryName(),
  );

  return fs.existsSync(javaBinaryPath) ? javaBinaryPath : null;
}

function getFiftstdlibDirectory() {
  return path.join(getTsaHomeDirectory(), FIFTSTDLIB_DIRECTORY_NAME);
}

function getImportsDirectory() {
  return path.join(getTsaHomeDirectory(), IMPORTS_DIRECTORY_NAME);
}

function findFiftstdlibPath() {
  const dirPath = getFiftstdlibDirectory();
  return fs.existsSync(dirPath) ? dirPath : null;
}

function findImportsPath() {
  const dirPath = getImportsDirectory();
  return fs.existsSync(dirPath) ? dirPath : null;
}

module.exports = {
  findFiftstdlibPath,
  findImportsPath,
  findJavaBinaryPath,
  findTsaJarPath,
  getFiftstdlibDirectory,
  getImportsDirectory,
  getTsaHomeDirectory,
};
