#!/usr/bin/env bash
set -euo pipefail

# This revision and Pi compatibility patch match the completed 2026-10-18 scan.
SHANNON_COMMIT=2468b67d9e40d70d0b189462c5041c24e1dc886c
SHANNON_DIR="${XDG_CACHE_HOME:-${HOME}/.cache}/hyperlocal-security-audit/shannon-${SHANNON_COMMIT:0:7}"

for command_name in docker git node corepack; do
  command -v "${command_name}" >/dev/null || { echo "Missing command: ${command_name}" >&2; exit 1; }
done

if [[ ! -d "${SHANNON_DIR}/.git" ]]; then
  mkdir -p "$(dirname "${SHANNON_DIR}")"
  git clone https://github.com/KeygraphHQ/shannon.git "${SHANNON_DIR}"
fi

git -C "${SHANNON_DIR}" fetch origin "${SHANNON_COMMIT}"
git -C "${SHANNON_DIR}" checkout --detach "${SHANNON_COMMIT}"

# The audited revision needs this Pi version to resolve the worker dependencies.
node --input-type=module - "${SHANNON_DIR}/apps/worker/package.json" <<'NODE'
import fs from 'node:fs'

const file = process.argv[2]
const json = JSON.parse(fs.readFileSync(file, 'utf8'))
for (const name of [
  '@earendil-works/pi-agent-core',
  '@earendil-works/pi-ai',
  '@earendil-works/pi-coding-agent',
]) {
  json.dependencies[name] = '1.2.0'
}
fs.writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`)
NODE

node --input-type=module - "${SHANNON_DIR}/pnpm-workspace.yaml" <<'NODE'
import fs from 'node:fs'

const file = process.argv[2]
let yaml = fs.readFileSync(file, 'utf8')
yaml = yaml.replace(/\n?minimumReleaseAgeExclude:\n(?:  - .*\n)*/g, '')
yaml = `${yaml.trimEnd()}\nminimumReleaseAgeExclude:\n  - "@earendil-works/pi-*"\n`
fs.writeFileSync(file, yaml)
NODE

(
  cd "${SHANNON_DIR}"
  corepack pnpm install --no-frozen-lockfile
  corepack pnpm --filter @shannon/worker exec tsc
  corepack pnpm --filter @keygraph/shannon exec tsdown
  ./shannon build
)

echo "Shannon is ready: ${SHANNON_DIR}/shannon"
