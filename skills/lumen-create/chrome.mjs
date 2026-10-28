/**
 * A browser for the look, without installing anything: the Chrome (or Chromium,
 * Edge, Brave) already on the machine, run headless. `LUMEN_CHROME` names one
 * explicitly. Used by look.mjs, sheet.mjs and read.mjs.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const CANDIDATES = {
  darwin: [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  ],
  linux: ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "microsoft-edge"],
  win32: ["PROGRAMFILES", "PROGRAMFILES(X86)", "LOCALAPPDATA"].flatMap((v) => [
    `${process.env[v]}\\Google\\Chrome\\Application\\chrome.exe`,
    `${process.env[v]}\\Microsoft\\Edge\\Application\\msedge.exe`,
  ]),
};

export function findChrome() {
  if (process.env.LUMEN_CHROME) return process.env.LUMEN_CHROME;
  for (const c of CANDIDATES[process.platform] ?? []) {
    if (/[\\/]/.test(c)) {
      if (existsSync(c)) return c;
    } else if (spawnSync(process.platform === "win32" ? "where" : "which", [c]).status === 0) return c;
  }
  return null;
}

function run(args) {
  const chrome = findChrome();
  if (!chrome) throw new Error("no-browser");
  const dir = mkdtempSync(join(tmpdir(), "lumen-chrome-"));
  try {
    return spawnSync(
      chrome,
      ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--no-default-browser-check", "--allow-file-access-from-files", `--user-data-dir=${dir}`, ...(process.platform === "linux" ? ["--no-sandbox"] : []), ...args],
      { encoding: "utf8", timeout: 90000, maxBuffer: 64 * 1024 * 1024 },
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** A picture of a local html file, written to `out` (png). */
export function shot(file, out, { w = 1200, h = 800, scale = 1, transparent = false, budget = 4000 } = {}) {
  const r = run([`--window-size=${w},${h}`, `--force-device-scale-factor=${scale}`, ...(transparent ? ["--default-background-color=00000000"] : []), `--screenshot=${out}`, `--virtual-time-budget=${budget}`, pathToFileURL(file).href]);
  if (r.error) throw r.error;
  return existsSync(out);
}

/** The page's DOM once its scripts have run: what the page wrote for us to read. */
export function dom(file) {
  const r = run(["--dump-dom", "--virtual-time-budget=4000", pathToFileURL(file).href]);
  if (r.error) throw r.error;
  return r.stdout ?? "";
}
