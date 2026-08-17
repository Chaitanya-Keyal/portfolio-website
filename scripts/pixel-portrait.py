"""Render assets/pfp.png as coloured half-block characters.

The same trick chafa uses: one character per two vertical pixels, the top half
painted by the glyph and the bottom half by its background. Output is a static
Svelte component, run this only when the source photo changes.

    python3 scripts/pixel-portrait.py

Requires Pillow and numpy.
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

SRC = Path('assets/pfp.png')
OUT = Path('src/lib/components/PixelPortrait.svelte')
# Detail comes from the grid, not from filtering: the rendered box is sized to
# the text beside it, so more columns means finer pixels, not a bigger picture.
COLS = 100
PALETTE = 200
# Coverage buckets for the cut-out's soft edge. Quarters are enough to read as
# an outline, and anything under an eighth is halo rather than subject.
ALPHA_STEPS = 4
# Measured in the browser: the upper half-block glyph paints 0.6em, not the
# 0.5em you would assume, so LINE_HEIGHT is twice that to split the cell
# evenly. The advance is also 0.6em, which makes each pixel exactly square.
LINE_HEIGHT = 1.2
LUMA = np.array([0.2126, 0.7152, 0.0722])
# The photo was shot in sun and one side of the jacket lands a stop brighter
# than the rest of it, which at this resolution reads as a pale patch rather
# than as light. How far to pull those highlights back toward the suit's own
# midtone: 1.0 leaves them alone, 0 flattens the garment completely.
SUIT_HIGHLIGHTS = 0.5
# How far inside the silhouette to look for a replacement colour, in source
# pixels, wide enough to clear the halo, tight enough to stay local.
DEFRINGE_RADIUS = 6


def blur_channel(values: np.ndarray, radius: float) -> np.ndarray:
    """Gaussian blur of a 0-255 plane. PIL will only blur 8-bit."""
    plane = Image.fromarray(np.clip(values, 0, 255).astype(np.uint8), 'L')
    return np.asarray(plane.filter(ImageFilter.GaussianBlur(radius)), dtype=float)


def defringe(img: Image.Image) -> Image.Image:
    """Give the cut-out's soft edge the colour of the subject just inside it.

    Background removal leaves those pixels carrying whatever was behind the
    subject, here a blown-out sky, and now that the edge keeps its real
    alpha, that tint reads as a bright halo along the shoulders.
    """
    a = np.asarray(img).astype(float)
    rgb, alpha = a[..., :3], a[..., 3]
    solid = alpha > 240
    if not solid.any():
        return img

    # Weighted average of the solid pixels around each point: blur the colour
    # with the outside masked off, then divide by how much solid it drew from.
    weight = blur_channel(solid * 255, DEFRINGE_RADIUS)
    inside = np.dstack([blur_channel(rgb[..., c] * solid, DEFRINGE_RADIUS) for c in range(3)])
    edge = (alpha > 0) & ~solid & (weight > 8)
    rgb[edge] = np.clip(inside * 255 / np.maximum(weight, 1)[..., None], 0, 255)[edge]

    a[..., :3] = rgb
    return Image.fromarray(a.astype(np.uint8), 'RGBA')


def calm_suit(img: Image.Image) -> Image.Image:
    """Compress the highlights on the jacket, and nothing else."""
    a = np.asarray(img).astype(float)
    rgb, alpha = a[..., :3], a[..., 3]
    lum = rgb @ LUMA
    # Navy is blue-dominant, unsaturated and dark, which picks out the jacket
    # without needing to know where the face, shirt or tie are.
    spread = rgb.max(axis=2) - rgb.min(axis=2)
    suit = (alpha > 128) & (rgb[..., 2] > rgb[..., 0]) & (lum < 125) & (spread < 70)
    if not suit.any():
        return img

    midtone = float(np.median(lum[suit]))
    scale = np.ones_like(lum)
    lit = suit & (lum > midtone)
    scale[lit] = (midtone + (lum[lit] - midtone) * SUIT_HIGHLIGHTS) / lum[lit]
    # Feather the mask edge, or the boundary of the selection becomes a line.
    # Carried through 8-bit because that is the only depth PIL will blur.
    feathered = Image.fromarray(np.rint(scale * 255).astype(np.uint8), 'L')
    scale = np.asarray(feathered.filter(ImageFilter.GaussianBlur(4)), dtype=float) / 255

    a[..., :3] = np.clip(rgb * scale[..., None], 0, 255)
    return Image.fromarray(a.astype(np.uint8), 'RGBA')


def main() -> None:
    img = calm_suit(defringe(Image.open(SRC).convert('RGBA')))
    rows = round(COLS * img.height / img.width)
    rows += rows % 2                                   # two pixel rows per cell
    small = img.resize((COLS, rows), Image.LANCZOS)

    a = np.asarray(small).astype(float)
    rgb = np.ascontiguousarray(a[..., :3])
    # Keep the edge's transparency instead of flattening it onto one background:
    # a baked-in dark fringe shows up as grime once the light theme is on.
    level = np.rint(a[..., 3] / 255 * ALPHA_STEPS).astype(int)
    opaque = level > 0
    # A fully transparent pixel carries no usable colour, and letting it into
    # the quantiser spends palette entries on it.
    rgb[~opaque] = rgb[opaque].mean(axis=0)
    quant = Image.fromarray(rgb.astype(np.uint8), 'RGB').quantize(
        colors=PALETTE, method=Image.MEDIANCUT, dither=Image.NONE
    )
    idx = np.asarray(quant)
    pal = np.asarray(quant.getpalette()[: PALETTE * 3]).reshape(-1, 3)

    def cell(y: int, x: int) -> tuple[int, int] | None:
        return (int(idx[y, x]), int(level[y, x])) if opaque[y, x] else None

    grid = [
        [(cell(y, x), cell(y + 1, x)) for x in range(COLS)] for y in range(0, rows, 2)
    ]

    # Which rule each colour needs, following exactly what flush() below emits:
    # a lone bottom half is drawn as a glyph too, and only a cell with both
    # halves filled paints a background.
    as_foreground: set[tuple[int, int]] = set()
    as_background: set[tuple[int, int]] = set()
    for line in grid:
        for top, bottom in line:
            if top is not None:
                as_foreground.add(top)
                if bottom is not None:
                    as_background.add(bottom)
            elif bottom is not None:
                as_foreground.add(bottom)

    used = sorted(as_foreground | as_background)
    remap = {colour: i for i, colour in enumerate(used)}

    def ink(colour: tuple[int, int]) -> str:
        c, coverage = colour
        r, g, b = pal[c]
        if coverage >= ALPHA_STEPS:
            return f'#{r:02x}{g:02x}{b:02x}'
        return f'rgba({r},{g},{b},{coverage / ALPHA_STEPS:g})'

    css = '\n'.join(
        '\t'
        + (f'.f{i}{{color:{ink(colour)}}}' if colour in as_foreground else '')
        + (f'.b{i}{{background:{ink(colour)}}}' if colour in as_background else '')
        for colour, i in remap.items()
    )

    def span(cell: tuple[tuple[int, int] | None, tuple[int, int] | None], run: int) -> str:
        """One run of identical cells, as few characters as it can be."""
        top, bottom = cell
        if top is None and bottom is None:
            return ' ' * run
        if bottom is None:
            return f'<span class="f{remap[top]}">{"▀" * run}</span>'
        if top is None:
            return f'<span class="f{remap[bottom]}">{"▄" * run}</span>'
        # Always paint the background rather than using a full-block glyph:
        # that leaves hairline seams wherever its height misses the line box.
        return f'<span class="f{remap[top]} b{remap[bottom]}">{"▀" * run}</span>'

    lines = []
    for line in grid:
        parts: list[str] = []
        prev, run = line[0], 0
        for cell in line:
            if cell == prev:
                run += 1
            else:
                parts.append(span(prev, run))
                prev, run = cell, 1
        parts.append(span(prev, run))
        lines.append(f'<span class="r">{"".join(parts).rstrip()}</span>')

    # No newlines between rows: they would become text nodes and, with block
    # rows, add a line box between every pair.
    markup = ''.join(lines)
    OUT.write_text(
        f'''<!-- Generated from {SRC} by scripts/pixel-portrait.py. Do not edit by hand.
     {COLS} x {rows} pixels as half-block characters. -->
<pre class="portrait" aria-hidden="true">{markup}</pre>

<style>
	.portrait {{
		margin: 0;
		/* The page sets --px-size to whatever makes the portrait as tall as the
		   text beside it; the fallback only has to be sane. */
		font-size: var(--px-size, 6px);
		/* Must be twice the glyph's 0.6em block height, or the two halves of
		   each cell come out unequal (24px over 16px) and squash the picture. */
		line-height: {LINE_HEIGHT};
		white-space: pre;
		user-select: none;
		font-variant-ligatures: none;
	}}

	.r {{
		/* Block, not inline-block: an inline-block sits on the text baseline and
		   reserves descender space under each row, which shows as seams. */
		display: block;
	}}

{css}
</style>
'''
    )
    print(f'{OUT}: {COLS} x {rows} pixels, {len(used)} colours')


if __name__ == '__main__':
    main()
