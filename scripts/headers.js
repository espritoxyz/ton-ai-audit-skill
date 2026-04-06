const fs = require("node:fs");
const path = require("node:path");
const {
  findFiftstdlibPath,
  findImportsPath,
  getFiftstdlibDirectory,
  getImportsDirectory,
} = require("./paths");

const BUNDLED_HEADERS_ROOT = path.join(__dirname, "..", "headers");
const BUNDLED_FIFTSTDLIB = path.join(BUNDLED_HEADERS_ROOT, "fiftstdlib");
const BUNDLED_IMPORTS = path.join(BUNDLED_HEADERS_ROOT, "imports");

function copyDirectorySync(source, target) {
  fs.mkdirSync(target, { recursive: true });

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      copyDirectorySync(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

function ensureHeadersInstalled() {
  const fiftstdlibPath = findFiftstdlibPath();
  const importsPath = findImportsPath();

  if (fiftstdlibPath && importsPath) {
    return { fiftstdlib: fiftstdlibPath, imports: importsPath };
  }

  const targetFiftstdlib = getFiftstdlibDirectory();
  const targetImports = getImportsDirectory();

  if (!fiftstdlibPath) {
    copyDirectorySync(BUNDLED_FIFTSTDLIB, targetFiftstdlib);
  }

  if (!importsPath) {
    copyDirectorySync(BUNDLED_IMPORTS, targetImports);
  }

  const installedFiftstdlib = findFiftstdlibPath();
  const installedImports = findImportsPath();

  if (!installedFiftstdlib || !installedImports) {
    throw new Error("Headers were not installed");
  }

  return { fiftstdlib: installedFiftstdlib, imports: installedImports };
}

module.exports = {
  ensureHeadersInstalled,
};
