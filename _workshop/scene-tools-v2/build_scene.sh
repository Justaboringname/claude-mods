#!/bin/zsh
# usage: build_scene.sh <scene_dir>
# Bundles <scene_dir>/scene.ts (which must export daySvg(): string and nightSvg(): string, pure string
# building, the same string on every call), writes day.svg and night.svg beside it, then checks and
# renders them with scene_tool.py (results in <scene_dir>/out/).
set -e
HERE="${0:A:h}"
DIR="${1:A}"
[ -f "$DIR/scene.ts" ] || { echo "no scene.ts in $DIR"; exit 2; }
cd "$HERE"
npx -y esbuild@0.24.0 "$DIR/scene.ts" --bundle --format=cjs --platform=node --log-level=warning --outfile="$DIR/.scene.cjs"
node -e '
const m = require(process.argv[1]); const fs = require("fs");
for (const [fn, file] of [["daySvg", "day.svg"], ["nightSvg", "night.svg"]]) {
  if (typeof m[fn] !== "function") { console.error("scene.ts does not export " + fn + "()"); process.exit(3) }
  const a = m[fn](), b = m[fn]();
  if (typeof a !== "string" || a !== b) { console.error(fn + "() must return the same string on every call"); process.exit(3) }
  fs.writeFileSync(process.argv[2] + "/" + file, a);
}' "$DIR/.scene.cjs" "$DIR"
"${PYTHON:-python3}" -I "$HERE/scene_tool.py" "$DIR"
