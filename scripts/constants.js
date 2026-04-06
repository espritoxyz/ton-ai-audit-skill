const TSA_VERSION = "v0.5.2";
const TSA_JAR_FILE_NAME = `tsa-cli-${TSA_VERSION}.jar`;
const TSA_JAR_URL = `https://github.com/espritoxyz/tsa/releases/download/${TSA_VERSION}/tsa-cli.jar`;
const JRE_VERSION = "17";
const REDIRECT_STATUS_CODES = new Set([301, 302, 303, 307, 308]);

const FIFTSTDLIB_DIRECTORY_NAME = "fiftstdlib";
const IMPORTS_DIRECTORY_NAME = "imports";

module.exports = {
  FIFTSTDLIB_DIRECTORY_NAME,
  IMPORTS_DIRECTORY_NAME,
  JRE_VERSION,
  REDIRECT_STATUS_CODES,
  TSA_JAR_FILE_NAME,
  TSA_JAR_URL,
  TSA_VERSION,
};
