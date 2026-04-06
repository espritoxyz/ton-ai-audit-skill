const fs = require("node:fs");
const unzipper = require("unzipper");

function extractZip(zipFilePath, targetDirectoryPath) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(zipFilePath)
      .pipe(unzipper.Extract({ path: targetDirectoryPath }))
      .on("close", resolve)
      .on("error", reject);
  });
}

module.exports = {
  extractZip,
};
