from pathlib import Path
from math import sin, cos, pi, sqrt
from PIL import Image, ImageFilter

SIZE = 2048
ROOT = Path(__file__).resolve().parent


def clamp(v, lo=0.0, hi=255.0):
    return max(lo, min(hi, v))


def seamless_wave(x, y, scale, phase=0.0):
    u = (x / SIZE) * 2.0 * pi * scale
    v = (y / SIZE) * 2.0 * pi * scale
    return sin(u + phase) * 0.5 + cos(v + phase * 0.7) * 0.5


def make_clear_glass(path):
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    pixels = img.load()
    for y in range(SIZE):
        for x in range(SIZE):
            a = seamless_wave(x, y, 1.15, 0.4)
            b = seamless_wave(x, y, 2.3, 1.1)
            c = seamless_wave(x, y, 3.7, 2.2)
            tint = 0.35 + (a + b) * 0.16 + c * 0.05
            r = int(218 + tint * 18)
            g = int(232 + tint * 14)
            b_col = int(248 + tint * 10)
            alpha = int(46 + (0.5 + a * 0.5) * 18 + (b - 0.2) * 10)
            alpha = clamp(alpha, 18, 92)
            pixels[x, y] = (r, g, b_col, alpha)
    img = img.filter(ImageFilter.GaussianBlur(radius=1.2))
    img.save(path)


def make_frosted_glass(path):
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    pixels = img.load()
    for y in range(SIZE):
        for x in range(SIZE):
            n1 = seamless_wave(x, y, 3.1, 0.4)
            n2 = seamless_wave(x, y, 6.2, 1.7)
            n3 = seamless_wave(x, y, 10.5, 2.8)
            grain = (n1 + n2 + n3) / 3.0
            alpha = int(58 + grain * 24 + 10 * (0.5 - abs(n2)))
            alpha = clamp(alpha, 34, 96)
            tint = int(238 + grain * 12)
            pixels[x, y] = (tint, tint, tint + 6, alpha)
    img = img.filter(ImageFilter.GaussianBlur(radius=2.1))
    img.save(path)


def make_luxury_reflection_overlay(path):
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    pixels = img.load()
    center_x = SIZE * 0.46
    center_y = SIZE * 0.36
    for y in range(SIZE):
        for x in range(SIZE):
            dx = (x - center_x) / (SIZE * 0.28)
            dy = (y - center_y) / (SIZE * 0.24)
            dist = sqrt(dx * dx + dy * dy)
            streak = 0.5 + 0.5 * sin((x - y) / 180.0 + 0.8)
            glow = max(0.0, 1.0 - dist)
            highlight = max(0.0, 1.0 - abs((x / SIZE) - 0.72) * 1.6) * 0.6
            alpha = int(22 + glow * 70 + streak * 24 + highlight * 24)
            alpha = clamp(alpha, 18, 120)
            r = int(248 + glow * 24 + streak * 8)
            g = int(244 + glow * 16 + streak * 6)
            b = int(228 + glow * 10)
            pixels[x, y] = (r, g, b, alpha)
    img = img.filter(ImageFilter.GaussianBlur(radius=1.4))
    img.save(path)


make_clear_glass(ROOT / 'clear-glass.png')
make_frosted_glass(ROOT / 'frosted-glass.png')
make_luxury_reflection_overlay(ROOT / 'luxury-reflection-overlay.png')
print('created clear-glass.png')
print('created frosted-glass.png')
print('created luxury-reflection-overlay.png')
