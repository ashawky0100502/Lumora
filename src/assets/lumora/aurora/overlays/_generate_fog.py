import os
import struct
import zlib
import math

WIDTH = 1920
HEIGHT = 1080
ROOT = os.path.dirname(__file__)


def write_png(path, width, height, pixels):
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)

    raw = b''.join(b'\x00' + row for row in pixels)
    data = zlib.compress(raw, 9)
    with open(path, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n')
        f.write(chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)))
        f.write(chunk(b'IDAT', data))
        f.write(chunk(b'IEND', b''))


def clamp(value):
    return 0 if value < 0 else 255 if value > 255 else int(value)


def smooth(alpha, passes=2):
    for _ in range(passes):
        new = [0.0] * len(alpha)
        for y in range(HEIGHT):
            for x in range(WIDTH):
                idx = x + y * WIDTH
                total = alpha[idx]
                count = 1
                if x > 0:
                    total += alpha[idx - 1]; count += 1
                if x < WIDTH - 1:
                    total += alpha[idx + 1]; count += 1
                if y > 0:
                    total += alpha[idx - WIDTH]; count += 1
                if y < HEIGHT - 1:
                    total += alpha[idx + WIDTH]; count += 1
                new[idx] = total / count
        alpha[:] = new


def cloud_noise(alpha, scale, strength):
    for y in range(HEIGHT):
        for x in range(WIDTH):
            value = math.sin((x + y * 0.4) / scale) * 0.5 + math.cos((x * 0.7 - y * 0.6) / scale) * 0.5
            alpha[x + y * WIDTH] += max(0.0, value) * strength


def add_ellipse(alpha, cx, cy, rx, ry, intensity, opacity):
    for y in range(max(0, int(cy - ry)), min(HEIGHT, int(cy + ry))):
        dy = (y - cy) / ry
        dy2 = dy * dy
        for x in range(max(0, int(cx - rx)), min(WIDTH, int(cx + rx))):
            dx = (x - cx) / rx
            d = dx * dx + dy2
            if d < 1.0:
                alpha[x + y * WIDTH] += intensity * (1.0 - d) ** 2 * opacity


def build_alpha(shape):
    alpha = [0.0] * (WIDTH * HEIGHT)
    if shape == 'fog-01':
        add_ellipse(alpha, 880, 340, 780, 260, 140, 0.32)
        add_ellipse(alpha, 1180, 460, 420, 140, 85, 0.18)
        add_ellipse(alpha, 460, 560, 900, 300, 88, 0.22)
        cloud_noise(alpha, 220.0, 5.4)
        smooth(alpha, 4)
    elif shape == 'fog-02':
        add_ellipse(alpha, 1020, 520, 820, 280, 120, 0.28)
        add_ellipse(alpha, 620, 260, 520, 180, 72, 0.14)
        add_ellipse(alpha, 1500, 280, 340, 120, 68, 0.16)
        cloud_noise(alpha, 180.0, 4.6)
        smooth(alpha, 4)
    elif shape == 'soft-mist':
        for y in range(HEIGHT):
            edge = max(0.0, 1.0 - ((y - 750) / 260.0) ** 2)
            for x in range(WIDTH):
                alpha[x + y * WIDTH] = edge * 15
        add_ellipse(alpha, 960, 560, 1320, 280, 90, 0.22)
        cloud_noise(alpha, 270.0, 3.8)
        smooth(alpha, 3)
    for i in range(len(alpha)):
        if alpha[i] > 160:
            alpha[i] = 160
    return alpha


def pixels_from_alpha(alpha):
    rows = []
    for y in range(HEIGHT):
        row = bytearray()
        for x in range(WIDTH):
            a = clamp(alpha[x + y * WIDTH])
            row.extend((255, 255, 255, a))
        rows.append(bytes(row))
    return rows

for filename in ['fog-01.png', 'fog-02.png', 'soft-mist.png']:
    alpha = build_alpha(filename.replace('.png', ''))
    pixels = pixels_from_alpha(alpha)
    write_png(os.path.join(ROOT, filename), WIDTH, HEIGHT, pixels)
    print('created', filename)
