import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const sourceRef = "refs/remotes/origin/philippe-portrait-source";
const sourcePath = "app/layout.tsx";
const outputPath = resolve("public/images/philippe-elalouf-medical-2026.jpg");

function hasSourceRef() {
  try {
    execFileSync("git", ["show-ref", "--verify", "--quiet", sourceRef]);
    return true;
  } catch {
    return false;
  }
}

if (!hasSourceRef()) {
  execFileSync(
    "git",
    ["fetch", "--no-tags", "--depth=1", "origin", `pull/27/head:${sourceRef}`],
    { stdio: "inherit" },
  );
}

const historicalLayout = execFileSync(
  "git",
  ["show", `${sourceRef}:${sourcePath}`],
  { encoding: "utf8", maxBuffer: 5 * 1024 * 1024 },
);

const match = historicalLayout.match(/const philippePortrait = "([A-Za-z0-9+/=]+)";/);
if (!match) {
  throw new Error("Impossible de retrouver le portrait JPEG valide de Philippe dans la PR #27.");
}

const jpeg = Buffer.from(match[1], "base64");
if (jpeg.length < 1000 || jpeg[0] !== 0xff || jpeg[1] !== 0xd8 || jpeg.at(-2) !== 0xff || jpeg.at(-1) !== 0xd9) {
  throw new Error("Le portrait historique de Philippe n'est pas un JPEG valide.");
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, jpeg);
console.log(`Portrait de Philippe restauré (${jpeg.length} octets).`);
