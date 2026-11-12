#!/usr/bin/env bash
# CI only: install pdflatex, then build static/resume.pdf with `bun run resume`.
#
# The Ubuntu mirrors are the one dependency here that can hang for many minutes. On
# 2026-11-11 the runner couldn't resolve security.ubuntu.com, and apt spent 14 minutes
# failing, which held up a deploy and the Lightning address file with it. So:
#   - TeX's packages are cached per runner image, and a cache hit touches no network;
#   - fetching them from the mirror is bounded in time;
#   - if TeX still can't be installed, the deploy ships the PDF the site already
#     publishes, with a warning.
# A failure to render the PDF stays fatal: that is a real resume bug, not a mirror.
#
#   TEX_DEBS                     the cache directory of .deb files (unset: no cache)
#   GH_TOKEN, GITHUB_REPOSITORY  to find the published PDF through the Pages settings
#   PUBLISHED_PDF                or give its URL directly
set -uo pipefail
cd "$(dirname "$0")/.."

debs=${TEX_DEBS:-}
fresh=false
# timeout runs as root, so that when it fires it can kill apt and dpkg, which do too.
sudo=$([ "$(id -u)" = 0 ] || echo sudo)
apt=(apt-get -o Acquire::Retries=2 -o Acquire::http::Timeout=20 -o Acquire::https::Timeout=20)
bounded() { $sudo timeout -k 10 "$1" env DEBIAN_FRONTEND=noninteractive "${@:2}"; }
# A smoke test before trusting an install, so a bad cache can't surface as a render error.
works() { pdflatex -version >/dev/null 2>&1; }

from_cache() {
  [ -n "$debs" ] && compgen -G "$debs/*.deb" >/dev/null || return 1
  bounded 120 dpkg -i "$debs"/*.deb >/dev/null 2>&1 && works && return 0
  echo "::warning title=resume pdf::the cached TeX packages didn't install; fetching them again"
  rm -rf "$debs"
  return 1
}

from_mirror() {
  bounded "${APT_UPDATE_TIMEOUT:-120}" "${apt[@]}" update -qq || return 1
  $sudo apt-get clean
  bounded "${APT_INSTALL_TIMEOUT:-240}" "${apt[@]}" install -y -qq --no-install-recommends \
    --download-only texlive-latex-base >/dev/null || return 1
  bounded 120 dpkg -i /var/cache/apt/archives/*.deb >/dev/null || return 1
  works || return 1
  if [ -n "$debs" ]; then
    mkdir -p "$debs" && cp /var/cache/apt/archives/*.deb "$debs"/ && fresh=true
  fi
}

if from_cache || from_mirror; then
  bun run resume || exit
  # Only a set that installed and rendered is worth keeping.
  if [ "$fresh" = true ] && [ -n "${GITHUB_OUTPUT:-}" ]; then echo "fresh-debs=true" >>"$GITHUB_OUTPUT"; fi
  exit 0
fi

echo "::warning title=resume pdf::TeX couldn't be installed, so this deploy ships the published resume.pdf unchanged"
if [ -z "${PUBLISHED_PDF:-}" ]; then
  site=$(gh api "repos/${GITHUB_REPOSITORY}/pages" --jq .html_url) || exit 1
  PUBLISHED_PDF="${site%/}/resume.pdf"
fi
curl -fsS --max-time 30 --retry 2 --retry-max-time 90 -o static/resume.pdf "$PUBLISHED_PDF"
