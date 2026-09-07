#!/usr/bin/env bash
# Builds static/resume.pdf from src/lib/data/profile.json and resume.json with
# the resume builder's renderer and its TeX files, so the PDF is the one the
# builder shows. Needs bun and pdflatex (Debian: texlive-latex-base).
#
#   RESUME_BUILDER=../oss/personal/resume-builder bun run resume   # local checkout
#   bun run resume                                                 # clones into .resume-builder
#   RESUME_PHONE="+91 ..." bun run resume                          # print a phone number
set -euo pipefail
cd "$(dirname "$0")/.."
RB="${RESUME_BUILDER:-.resume-builder}"
if [ ! -d "$RB" ]; then
	git clone -q --depth 1 https://github.com/Chaitanya-Keyal/resume-builder "$RB"
fi
(cd "$RB" && bun install --frozen-lockfile --silent)
args=(src/lib/data/profile.json src/lib/data/resume.json static/resume.pdf)
if [ -n "${RESUME_PHONE:-}" ]; then args+=(--phone "$RESUME_PHONE"); fi
bun "$RB/scripts/pdf.ts" "${args[@]}"
