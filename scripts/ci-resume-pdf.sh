#!/usr/bin/env bash
# CI only: install pdflatex, then build static/resume.pdf with `bun run resume`.
#
# The Ubuntu mirrors are the one dependency here that can hang for many minutes. On
# 2026-11-11 the runner couldn't resolve security.ubuntu.com, and apt spent 14 minutes
# failing, which held up a deploy and the Lightning address file with it. So installing
# TeX is bounded in time, and if it can't be installed the deploy ships the PDF the site
# already publishes, with a warning. A failure to render the PDF stays fatal: that is a
# real resume bug, not a mirror.
#
#   GH_TOKEN, GITHUB_REPOSITORY  to find the published PDF through the Pages settings
#   PUBLISHED_PDF                or give its URL directly
set -uo pipefail
cd "$(dirname "$0")/.."

# timeout runs as root, so that when it fires it can kill apt, which runs as root too.
sudo=$([ "$(id -u)" = 0 ] || echo sudo)
apt=(apt-get -o Acquire::Retries=2 -o Acquire::http::Timeout=20 -o Acquire::https::Timeout=20)
bounded() { $sudo timeout -k 10 "$1" env DEBIAN_FRONTEND=noninteractive "${apt[@]}" "${@:2}"; }

if bounded "${APT_UPDATE_TIMEOUT:-120}" update -qq &&
  bounded "${APT_INSTALL_TIMEOUT:-240}" install -y -qq --no-install-recommends texlive-latex-base >/dev/null; then
  exec bun run resume
fi

echo "::warning title=resume pdf::TeX couldn't be installed, so this deploy ships the published resume.pdf unchanged"
if [ -z "${PUBLISHED_PDF:-}" ]; then
  site=$(gh api "repos/${GITHUB_REPOSITORY}/pages" --jq .html_url) || exit 1
  PUBLISHED_PDF="${site%/}/resume.pdf"
fi
curl -fsS --retry 3 --max-time 60 -o static/resume.pdf "$PUBLISHED_PDF"
