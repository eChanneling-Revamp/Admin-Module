const { spawnSync } = require("child_process");
const { existsSync } = require("fs");
const path = require("path");

const result = spawnSync("prisma generate", {
  cwd: process.cwd(),
  encoding: "utf8",
  stdio: ["inherit", "pipe", "pipe"],
  shell: true,
});

if (result.stdout) {
  process.stdout.write(result.stdout);
}
if (result.stderr) {
  process.stderr.write(result.stderr);
}
if (result.error) {
  process.stderr.write(`${result.error.message}\n`);
}

if (result.status === 0) {
  process.exit(0);
}

const prismaClientDir = path.join(process.cwd(), "node_modules", ".prisma", "client");
const hasGeneratedClient =
  existsSync(path.join(prismaClientDir, "index.js")) &&
  existsSync(path.join(prismaClientDir, "query_engine-windows.dll.node"));

const stderrText = `${result.stderr || ""}${result.error ? `\n${result.error.message}` : ""}`;
const isWindowsEngineLockError =
  process.platform === "win32" &&
  /EPERM/i.test(stderrText) &&
  /query_engine-windows\.dll\.node/i.test(stderrText);

if (isWindowsEngineLockError && hasGeneratedClient) {
  process.stderr.write(
    "\n[warn] Prisma generate hit a Windows file lock, but an existing Prisma client is available. Continuing startup.\n"
  );
  process.stderr.write(
    "[hint] Close other backend Node processes and rerun later to refresh Prisma binaries.\n"
  );
  process.exit(0);
}

process.exit(result.status || 1);
