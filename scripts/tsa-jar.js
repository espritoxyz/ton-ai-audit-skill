const path = require("node:path");
const { TSA_JAR_FILE_NAME, TSA_JAR_URL } = require("./constants");
const { downloadWithRedirect } = require("./downloading");
const { findTsaJarPath, getTsaHomeDirectory } = require("./paths");

async function ensureTsaInstalled() {
  const existingJarPath = findTsaJarPath();
  if (existingJarPath) {
    return existingJarPath;
  }

  const targetJarPath = path.join(getTsaHomeDirectory(), TSA_JAR_FILE_NAME);
  await downloadWithRedirect(TSA_JAR_URL, targetJarPath);

  const installedJarPath = findTsaJarPath();
  if (!installedJarPath) {
    throw new Error("TSA was not installed");
  }

  return installedJarPath;
}

module.exports = {
  ensureTsaInstalled,
};
