const fs = require("node:fs");
const http = require("node:http");
const https = require("node:https");
const path = require("node:path");
const { REDIRECT_STATUS_CODES } = require("./constants");

function ensureParentDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function downloadWithRedirect(url, targetFilePath) {
  ensureParentDirectory(targetFilePath);

  return new Promise((resolve, reject) => {
    const client = url.startsWith("https:") ? https : http;

    const request = client.get(url, (response) => {
      const { statusCode = 0, headers } = response;

      if (REDIRECT_STATUS_CODES.has(statusCode) && headers.location) {
        response.resume();
        downloadWithRedirect(headers.location, targetFilePath)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (statusCode < 200 || statusCode >= 300) {
        response.resume();
        reject(new Error(`Failed to download ${url}: HTTP ${statusCode}`));
        return;
      }

      const file = fs.createWriteStream(targetFilePath);
      response.pipe(file);

      file.on("finish", () => {
        file.close((closeError) => {
          if (closeError) {
            reject(closeError);
            return;
          }

          resolve();
        });
      });

      file.on("error", (fileError) => {
        fs.unlink(targetFilePath, () => reject(fileError));
      });
    });

    request.on("error", (requestError) => {
      fs.unlink(targetFilePath, () => reject(requestError));
    });
  });
}

module.exports = {
  downloadWithRedirect,
};
