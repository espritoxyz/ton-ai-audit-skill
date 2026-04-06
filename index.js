#!/usr/bin/env node

const { ensureJavaInstalled } = require("./scripts/java");
const { ensureTsaInstalled } = require("./scripts/tsa-jar");
const { ensureHeadersInstalled } = require("./scripts/headers");
const {
  findFiftstdlibPath,
  findImportsPath,
  findJavaBinaryPath,
  findTsaJarPath,
} = require("./scripts/paths");

const COMMAND_INSTALL = "install";
const COMMAND_LOCATION = "location";
const SUPPORTED_COMMANDS = new Set([COMMAND_INSTALL, COMMAND_LOCATION]);
const FAILURE_PREFIX = "tsa-installer failed:";
const NOT_INSTALLED_EXIT_CODE = 1;
const JSON_INDENT_SIZE = 2;

function toPrettyJson(value) {
  return JSON.stringify(value, null, JSON_INDENT_SIZE);
}

function printResult({ location, java, fiftstdlib, func_imports, installed }) {
  console.log(toPrettyJson({ location, java, fiftstdlib, func_imports, installed }));
}

async function installCommand() {
  const [javaPath, tsaJarPath] = await Promise.all([
    ensureJavaInstalled(),
    ensureTsaInstalled(),
  ]);
  const { fiftstdlib, imports } = ensureHeadersInstalled();

  printResult({ location: tsaJarPath, java: javaPath, fiftstdlib, func_imports: imports, installed: true });
}

function locationCommand() {
  const tsaJarPath = findTsaJarPath();
  const javaPath = findJavaBinaryPath();
  const fiftstdlib = findFiftstdlibPath();
  const imports = findImportsPath();

  if (!tsaJarPath) {
    console.error(
      toPrettyJson({ location: null, java: javaPath, fiftstdlib, func_imports: imports, installed: false }),
    );
    process.exitCode = NOT_INSTALLED_EXIT_CODE;
    return;
  }

  printResult({ location: tsaJarPath, java: javaPath, fiftstdlib, func_imports: imports, installed: true });
}

function getCommand() {
  return process.argv[2];
}

function printUsage() {
  console.error("Usage: tsa-installer <install|location>");
}

async function main() {
  const command = getCommand();

  if (!SUPPORTED_COMMANDS.has(command)) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  if (command === COMMAND_INSTALL) {
    await installCommand();
    return;
  }

  locationCommand();
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`${FAILURE_PREFIX} ${message}`);
  process.exitCode = 1;
});
