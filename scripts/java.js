const fs = require("node:fs");
const path = require("node:path");
const tar = require("tar");
const { JRE_VERSION } = require("./constants");
const { downloadWithRedirect } = require("./downloading");
const { getAdoptiumArchitecture, getAdoptiumPlatform } = require("./architecture");
const { getTsaHomeDirectory, findJavaBinaryPath } = require("./paths");
const { extractZip } = require("./unzip");

const WINDOWS_PLATFORM = "windows";
const ZIP_EXTENSION = "zip";
const TAR_GZ_EXTENSION = "tar.gz";
const JRE_DIRECTORY_NAME = "jre";

function getJavaDownloadUrl() {
  return `https://api.adoptium.net/v3/binary/latest/${JRE_VERSION}/ga/${getAdoptiumPlatform()}/${getAdoptiumArchitecture()}/jre/hotspot/normal/eclipse`;
}

async function unpackArchive(archivePath, extractPath) {
  fs.mkdirSync(extractPath, { recursive: true });

  if (archivePath.endsWith(`.${ZIP_EXTENSION}`)) {
    await extractZip(archivePath, extractPath);
    return;
  }

  await tar.extract({
    file: archivePath,
    cwd: extractPath,
  });
}

async function ensureJavaInstalled() {
  const existingJavaPath = findJavaBinaryPath();
  if (existingJavaPath) {
    return existingJavaPath;
  }

  const tsaHomeDirectory = getTsaHomeDirectory();
  const isWindows = getAdoptiumPlatform() === WINDOWS_PLATFORM;
  const archiveExtension = isWindows ? ZIP_EXTENSION : TAR_GZ_EXTENSION;
  const archivePath = path.join(tsaHomeDirectory, `jre.${archiveExtension}`);
  const jreDirectoryPath = path.join(tsaHomeDirectory, JRE_DIRECTORY_NAME);

  await downloadWithRedirect(getJavaDownloadUrl(), archivePath);
  await unpackArchive(archivePath, jreDirectoryPath);
  fs.unlinkSync(archivePath);

  const installedJavaPath = findJavaBinaryPath();
  if (!installedJavaPath) {
    throw new Error("Java was not installed");
  }

  return installedJavaPath;
}

module.exports = {
  ensureJavaInstalled,
};
