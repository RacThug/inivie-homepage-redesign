"""
Draws the eight seed property images of docs/DATA-MODEL.md ch. 4.

Not part of either toolchain. `cms/` is Composer and `web/` is npm, and this
script belongs to neither: it is a one-off tool that produced the WebP
files committed beside it, kept so their provenance is auditable and so they
can be regenerated rather than being six binaries nobody can account for.

    pip install pillow==12.2.0 numpy==2.4.6
    python generate.py

Those two versions are the ones the committed files were drawn with, checked
against PyPI on 22 August 2026. AGENTS.md asks every version number in this
repository to carry the date it was verified, and this one earns it twice
over: resampling and compression both move between releases, so an unpinned
run can produce different bytes for an unchanged scene. On those versions a
re-run reproduces the committed files byte for byte, checked the same day.
Each scene draws from a generator seeded on its own slug, so adding a scene
leaves every file already committed untouched. Nothing in the test suite can check that for you: the suite runs on PHP
in a container with no Python in it.

Why generated rather than photographed. The repository is public, and the
photography on the live site is licensed stock: filenames such as
`manta-rays_envato.jpg` and `...-2026-03-19-23-05-37-utc-1.jpg` are Envato
Elements downloads, whose licence is bound to the subscriber and forbids
redistribution. Committing those would be a licence breach rather than a
grey area. Freely licensed photographs would clear that bar but not the
other one ch. 4 sets, which is that the seed data is reproducible from the
repository alone. A drawing has neither problem.

Each image is an abstract Balinese landscape rather than a labelled grey
box, because DESIGN-SYSTEM ch. 6.1 already renders the title, location and
category as text on the card. An image repeating them would be a caption,
and the first principle of ch. 1 is that photography leads. No text also
means no font file, so the output does not depend on what is installed.

Output is 1600 by 1200: the 4:3 of ch. 6.1, at twice the 800 by 600 floor
the upload rules in TECHNICAL-DESIGN ch. 5.3 enforce, so a seeded row would
pass the same validation an admin upload does.
"""

from __future__ import annotations

import hashlib
from pathlib import Path

import numpy as np
from PIL import Image

WIDTH, HEIGHT = 1600, 1200

# Drawn at twice the output size and resampled down. Every edge here is a
# threshold on a smooth function, and thresholds alias; supersampling is what
# keeps a ridge crest from stepping.
SUPERSAMPLE = 2


def rgb(value: str) -> np.ndarray:
    """`#rrggbb` to three floats in 0..1."""
    value = value.lstrip("#")
    return np.array([int(value[i : i + 2], 16) / 255 for i in (0, 2, 4)], dtype=np.float32)


def smoothstep(edge0: float, edge1: float, x: np.ndarray) -> np.ndarray:
    t = np.clip((x - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def over(base: np.ndarray, colour: np.ndarray, alpha: np.ndarray) -> np.ndarray:
    """Composite a flat colour onto `base` under a per pixel alpha."""
    return base * (1.0 - alpha[..., None]) + colour[None, None, :] * alpha[..., None]


def vertical_gradient(height: int, stops: list[tuple[float, str]]) -> np.ndarray:
    """A (height, 3) ramp through the given stops, positioned 0 to 1 top down."""
    positions = np.array([p for p, _ in stops], dtype=np.float32)
    colours = np.stack([rgb(c) for _, c in stops])
    t = np.linspace(0.0, 1.0, height, dtype=np.float32)

    return np.stack([np.interp(t, positions, colours[:, c]) for c in range(3)], axis=1).astype(np.float32)


def fbm(rng: np.random.Generator, height: int, width: int, cells: tuple[int, int], octaves: int = 4) -> np.ndarray:
    """
    Fractal value noise in 0..1, built by resampling random grids.

    `cells` is the coarsest grid as (rows, columns). Fewer columns than rows
    stretches the result horizontally, which is what makes the cloud layers
    read as streaks rather than as blobs.
    """
    total = np.zeros((height, width), dtype=np.float32)
    amplitude, weight = 1.0, 0.0
    rows, columns = cells

    for _ in range(octaves):
        grid = (rng.random((max(2, rows), max(2, columns))) * 255).astype(np.uint8)
        layer = Image.fromarray(grid).resize((width, height), Image.Resampling.BICUBIC)
        total += amplitude * (np.asarray(layer, dtype=np.float32) / 255.0)
        weight += amplitude
        amplitude *= 0.5
        rows, columns = rows * 2, columns * 2

    return total / weight


def ridge_profile(rng: np.random.Generator, width: int, spec: dict) -> np.ndarray:
    """
    The crest height at each column, as a fraction of image height.

    A ridge is summed sine waves at halving amplitude, which gives a skyline
    with both a shape and a texture. A cliff is a single smooth step instead,
    with the same noise laid over it, so it reads as one headland filling a
    side of the frame rather than as a row of hills.
    """
    xn = np.linspace(0.0, 1.0, width, dtype=np.float32)

    noise = np.zeros(width, dtype=np.float32)
    amplitude, frequency, weight = 1.0, spec["freq"], 0.0
    for _ in range(4):
        noise += amplitude * np.sin(2 * np.pi * frequency * xn + rng.uniform(0, 2 * np.pi))
        weight += amplitude
        amplitude *= 0.5
        frequency *= 2.1
    noise /= weight

    if spec.get("cliff"):
        # Which way the headland faces, read once: +1 puts its mass against
        # the right edge of the frame, -1 against the left. Both the step and
        # the tilt follow it, and neither looks at the string again.
        facing = 1.0 if spec["cliff"] == "right" else -1.0

        step = smoothstep(spec["edge"] - 0.16, spec["edge"] + 0.16, xn)
        if facing < 0:
            step = 1.0 - step

        # Tilted so the crest keeps climbing toward its own side of the frame.
        # A step alone gives a flat topped mesa, which reads as a cut out
        # rather than as a headland.
        crest = spec["y"] + spec["tilt"] * facing * (0.5 - xn)

        # 1.4 is comfortably below the frame, so the low side is simply absent.
        return 1.4 + (crest - 1.4) * step + spec["amp"] * noise

    return spec["y"] + spec["amp"] * noise


def draw(scene: dict, width: int, height: int) -> np.ndarray:
    """
    One scene, far to near: sky, cloud, sun, water, then the ridges in front
    of it. Later passes composite over earlier ones, so a headland occludes
    the water and the water occludes a sun resting on the horizon, without
    any pass needing to know what the others drew.
    """
    rng = np.random.default_rng(int(hashlib.sha256(scene["slug"].encode()).hexdigest()[:8], 16))

    xn = np.linspace(0.0, 1.0, width, dtype=np.float32)[None, :]
    yn = np.linspace(0.0, 1.0, height, dtype=np.float32)[:, None]
    aspect = width / height
    horizon = scene["horizon"]

    # The sky ramp is positioned over the band above the horizon, then held
    # flat below it, so the water has something to reflect at its top edge.
    sky_rows = max(2, int(round(horizon * height)))
    ramp = vertical_gradient(sky_rows, scene["sky"])
    backdrop = np.repeat(
        np.concatenate([ramp, np.repeat(ramp[-1:], height - sky_rows, axis=0)])[:, None, :], width, axis=1
    )
    img = backdrop.copy()

    above = smoothstep(horizon + 0.004, horizon - 0.004, np.repeat(yn, width, axis=1))

    cloud = scene.get("cloud")
    if cloud:
        texture = fbm(rng, height, width, cells=(10, 3))
        band = np.repeat(np.exp(-(((yn - cloud["y"]) / cloud["spread"]) ** 2)), width, axis=1)
        img = over(img, rgb(cloud["colour"]), smoothstep(0.48, 0.78, texture) * band * above * cloud["alpha"])

    sun = scene["sun"]
    distance = np.sqrt(((xn - sun["x"]) * aspect) ** 2 + (yn - sun["y"]) ** 2)
    img = over(img, rgb(sun["glow"]), np.exp(-((distance / (sun["r"] * 5.5)) ** 1.5)) * sun["strength"] * above)
    # A low sun is a disc; a high one is a brightness in the haze. Drawing the
    # disc at midday is what makes a daylight sky read as a pasted sticker.
    img = over(img, rgb(sun["core"]), smoothstep(sun["r"], sun["r"] * 0.72, distance) * above * sun["disc"])

    water = scene.get("water")
    if water:
        depth = np.repeat(np.clip((yn - horizon) / max(1e-6, 1.0 - horizon), 0.0, 1.0), width, axis=1)
        below = 1.0 - above

        top, bottom = rgb(water["top"]), rgb(water["bottom"])
        surface = top[None, None, :] * (1 - depth[..., None]) + bottom[None, None, :] * depth[..., None]
        img = img * (1 - below[..., None]) + surface * below[..., None]

        for centre, thickness, colour, alpha in water.get("bands", []):
            veil = np.repeat(np.exp(-(((yn - centre) / thickness) ** 2)), width, axis=1)
            img = over(img, rgb(colour), veil * below * alpha)

        glitter = rgb(water["glitter"])

        # The reflected column under the sun, widening and fading with depth.
        column = np.exp(-((((xn - sun["x"]) * aspect) / (0.06 + 0.42 * depth)) ** 2))
        img = over(img, glitter, column * below * (1.0 - depth) * 0.42)

        # Broken highlights on the ripples. The wave count falls with depth
        # so the near water reads as fewer, wider crests, which is the whole
        # of the perspective cue on an otherwise flat plane.
        waves = 0.5 + 0.5 * np.sin(
            2 * np.pi * (70.0 / (1.0 + 9.0 * depth)) * xn + rng.uniform(0, 2 * np.pi, size=(height, 1))
        )
        img = over(img, glitter, smoothstep(0.55, 0.97, waves) * column * below * (1.0 - 0.55 * depth) * 0.5)

    for spec in scene["ridges"]:
        profile = ridge_profile(rng, width, spec)[None, :]
        mass = smoothstep(-1.5 / height, 1.5 / height, yn - profile)

        # A ridge whose crest stands above the horizon is distant land, and
        # the water in front of it hides everything below the waterline, so
        # its mass stops there. Without this the polygon runs to the bottom
        # of the frame and paints over the sea it is supposed to sit behind.
        # A cliff is near rather than distant, so it keeps going.
        if spec["y"] < horizon and not spec.get("cliff"):
            mass = mass * above

        # Atmospheric perspective: a distant ridge is mixed toward the sky
        # directly behind it rather than toward one flat haze colour, so it
        # picks up the sunset it is standing in.
        colour = rgb(spec["colour"])[None, None, :] * (1 - spec["haze"]) + backdrop * spec["haze"]
        img = img * (1 - mass[..., None]) + colour * mass[..., None]

        mist = spec.get("mist")
        if mist:
            # Fog collects in the valley below a crest, not on top of it.
            # Centring the band on the crest instead draws a ribbon along
            # the skyline, which is the one thing mist never looks like.
            veil = np.exp(-(((yn - profile - 0.035) / 0.075) ** 2)) * (yn > profile)
            img = over(img, rgb(scene["mist_colour"]), veil * mist)

    # A little noise and a little falloff. Both are there to stop the ramps
    # from banding on a wide display, which is what a purely synthetic image
    # otherwise does the moment it is shown larger than a thumbnail.
    img += rng.normal(0.0, 0.005, img.shape).astype(np.float32)
    radius = np.sqrt(((xn - 0.5) * aspect) ** 2 + (yn - 0.5) ** 2) / 0.72
    img *= (1.0 - 0.26 * np.clip(radius, 0.0, 1.4) ** 2)[..., None]

    # Haze and vignette both pull toward the middle of the range. A small
    # contrast and saturation lift at the end puts back what they took,
    # which is the difference between atmosphere and a washed out slide.
    img = 0.5 + (img - 0.5) * 1.07
    grey = img.mean(axis=2, keepdims=True)
    img = grey + (img - grey) * 1.12

    return np.clip(img, 0.0, 1.0)


SCENES: list[dict] = [
    {
        # Dusk over Petitenget, the warm end of a Seminyak afternoon.
        "slug": "leedon-villa-seminyak",
        "horizon": 0.60,
        "sky": [(0.0, "#16203C"), (0.40, "#3A3A63"), (0.72, "#8E5B78"), (0.90, "#DE8F63"), (1.0, "#F6C089")],
        "sun": {"x": 0.66, "y": 0.573, "r": 0.052, "core": "#FFE7BE", "glow": "#FF9E5C", "disc": 1.0, "strength": 0.80},
        "cloud": {"y": 0.24, "spread": 0.20, "colour": "#5A4C6E", "alpha": 0.45},
        "water": {"top": "#7A6079", "bottom": "#141D38", "glitter": "#FFD3A0"},
        "mist_colour": "#C79A86",
        "ridges": [
            {"y": 0.588, "amp": 0.011, "freq": 1.3, "colour": "#2A2F4A", "haze": 0.58},
            {"y": 0.935, "amp": 0.022, "freq": 3.0, "colour": "#0E1526", "haze": 0.04},
        ],
    },
    {
        # Midday on the Nusa Dua lagoon, the one bright scene in the set.
        "slug": "ajowa-resort",
        "horizon": 0.55,
        "sky": [(0.0, "#3E86C9"), (0.55, "#7FB6DF"), (0.88, "#CFE6F2"), (1.0, "#EAF3F6")],
        "sun": {"x": 0.21, "y": 0.17, "r": 0.038, "core": "#FFFFFF", "glow": "#FFF6DC", "disc": 0.0, "strength": 0.42},
        "cloud": {"y": 0.30, "spread": 0.22, "colour": "#FFFFFF", "alpha": 0.62},
        "water": {
            "top": "#3FB9C2",
            "bottom": "#0A6580",
            "glitter": "#EDFFFF",
            "bands": [(0.66, 0.030, "#8FE3D6", 0.55), (0.735, 0.018, "#C6F2E8", 0.38)],
        },
        "mist_colour": "#D9EDF2",
        "ridges": [
            {"y": 0.543, "amp": 0.007, "freq": 1.1, "colour": "#2F5E52", "haze": 0.60},
        ],
    },
    {
        # The cliff above Bingin, facing the sunset the copy promises.
        "slug": "la-mewali-resort",
        "horizon": 0.58,
        "sky": [(0.0, "#2B2350"), (0.35, "#6B3663"), (0.62, "#C2545C"), (0.85, "#F2894A"), (1.0, "#FFC46B")],
        "sun": {"x": 0.40, "y": 0.555, "r": 0.068, "core": "#FFF2CC", "glow": "#FF7A3C", "disc": 1.0, "strength": 0.95},
        "cloud": {"y": 0.20, "spread": 0.16, "colour": "#7A3A5E", "alpha": 0.42},
        "water": {"top": "#B0655C", "bottom": "#241E48", "glitter": "#FFC98A"},
        "mist_colour": "#E09A72",
        "ridges": [
            {"y": 0.572, "amp": 0.006, "freq": 2.2, "colour": "#4A2F4E", "haze": 0.62},
            {
                "y": 0.42, "amp": 0.048, "freq": 1.2, "colour": "#17102A", "haze": 0.02,
                "cliff": "right", "edge": 0.60, "tilt": 0.30,
            },
        ],
    },
    {
        # Golden hour from the Batu Bolong rooftop, hazier than the rest.
        "slug": "astera-canggu",
        "horizon": 0.66,
        "sky": [(0.0, "#5E6A8C"), (0.35, "#A88A86"), (0.68, "#E3A472"), (0.88, "#F6C98C"), (1.0, "#FBE0AE")],
        "sun": {"x": 0.62, "y": 0.44, "r": 0.055, "core": "#FFF8E4", "glow": "#FFB055", "disc": 0.90, "strength": 0.80},
        "cloud": {"y": 0.22, "spread": 0.17, "colour": "#7E6A8C", "alpha": 0.58},
        "water": {"top": "#B98A6E", "bottom": "#332F4C", "glitter": "#FFE3B2"},
        "mist_colour": "#EFC79A",
        "ridges": [
            {"y": 0.651, "amp": 0.005, "freq": 1.5, "colour": "#6B5A6B", "haze": 0.72},
            {"y": 0.945, "amp": 0.016, "freq": 4.0, "colour": "#17131F", "haze": 0.03},
        ],
    },
    {
        # Blue hour on the Legian sand, minutes after the sun has gone. The
        # only scene with no disc at all: the glow is centred below the
        # horizon and only its bleed above the waterline is drawn.
        "slug": "ini-vie-villa-legian",
        "horizon": 0.63,
        "sky": [(0.0, "#101A3A"), (0.38, "#22315C"), (0.68, "#4E4A73"), (0.88, "#A96A67"), (1.0, "#E9A272")],
        "sun": {"x": 0.44, "y": 0.700, "r": 0.050, "core": "#FFD9A8", "glow": "#FF8A54", "disc": 0.0, "strength": 0.62},
        "cloud": {"y": 0.26, "spread": 0.19, "colour": "#3B4470", "alpha": 0.50},
        "water": {"top": "#6B5A70", "bottom": "#0C1430", "glitter": "#FFC28A"},
        "mist_colour": "#C9A79A",
        "ridges": [
            {"y": 0.955, "amp": 0.014, "freq": 2.8, "colour": "#0B1020", "haze": 0.05},
        ],
    },
    {
        # An overcast afternoon over the Batu Bolong break. The one grey
        # scene in the set, and the one dark sand foreground.
        "slug": "aeera-villa-canggu",
        "horizon": 0.57,
        "sky": [(0.0, "#5A6E82"), (0.42, "#8298A6"), (0.78, "#B9C6CA"), (1.0, "#D8DFDA")],
        "sun": {"x": 0.72, "y": 0.30, "r": 0.050, "core": "#FFFFFF", "glow": "#F2F0E2", "disc": 0.0, "strength": 0.50},
        "cloud": {"y": 0.27, "spread": 0.26, "colour": "#48566A", "alpha": 0.55},
        "water": {"top": "#4C7A78", "bottom": "#16323C", "glitter": "#DCEDE6"},
        "mist_colour": "#C3CFCC",
        "ridges": [
            {"y": 0.556, "amp": 0.009, "freq": 1.6, "colour": "#2C4442", "haze": 0.34},
            {"y": 0.965, "amp": 0.018, "freq": 3.4, "colour": "#141F22", "haze": 0.05},
        ],
    },
    {
        # Sunrise over the Sanur boardwalk, east facing and open to the sea.
        "slug": "seascape-sanur",
        "horizon": 0.62,
        "sky": [(0.0, "#24345E"), (0.30, "#4C5C86"), (0.60, "#9B7B92"), (0.85, "#E9A184"), (1.0, "#FBD3A6")],
        "sun": {"x": 0.52, "y": 0.606, "r": 0.044, "core": "#FFF9EA", "glow": "#FFAE72", "disc": 1.0, "strength": 0.85},
        "cloud": {"y": 0.33, "spread": 0.17, "colour": "#6E6E92", "alpha": 0.40},
        "water": {"top": "#96808C", "bottom": "#1A2748", "glitter": "#FFD9A8"},
        "mist_colour": "#E5B79A",
        "ridges": [
            {"y": 0.968, "amp": 0.004, "freq": 2.6, "colour": "#1A1626", "haze": 0.06},
        ],
    },
    {
        # The Petanu valley under morning mist. No sea, and the only scene
        # whose horizon sits high enough for the land to carry the frame.
        "slug": "svaha-retreat-ubud",
        "horizon": 0.42,
        "sky": [(0.0, "#6F9EB4"), (0.45, "#ADC8C6"), (0.80, "#DFE9DC"), (1.0, "#F4F2E4")],
        "sun": {"x": 0.30, "y": 0.26, "r": 0.042, "core": "#FFFFFF", "glow": "#FFF6D8", "disc": 0.45, "strength": 0.38},
        "cloud": {"y": 0.18, "spread": 0.15, "colour": "#FFFFFF", "alpha": 0.45},
        "mist_colour": "#EAF1EA",
        "ridges": [
            {"y": 0.445, "amp": 0.020, "freq": 1.1, "colour": "#6E8C78", "haze": 0.68, "mist": 0.40},
            {"y": 0.525, "amp": 0.028, "freq": 1.5, "colour": "#4E7159", "haze": 0.50, "mist": 0.33},
            {"y": 0.620, "amp": 0.034, "freq": 1.9, "colour": "#35573A", "haze": 0.33, "mist": 0.25},
            {"y": 0.740, "amp": 0.040, "freq": 2.4, "colour": "#21402A", "haze": 0.18, "mist": 0.17},
            {"y": 0.885, "amp": 0.048, "freq": 3.1, "colour": "#12271A", "haze": 0.06, "mist": 0.09},
        ],
    },
]


def main() -> None:
    out = Path(__file__).parent

    for scene in SCENES:
        pixels = draw(scene, WIDTH * SUPERSAMPLE, HEIGHT * SUPERSAMPLE)
        image = Image.fromarray((pixels * 255.0 + 0.5).astype(np.uint8), mode="RGB")
        image = image.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)

        path = out / f"{scene['slug']}.webp"
        image.save(path, format="WEBP", quality=86, method=6)
        print(f"{path.name}  {path.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
