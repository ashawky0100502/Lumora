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


def clamp(v):
    return 0 if v < 0 else 255 if v > 255 else int(v)


def smooth(alpha, iterations=3):
    for _ in range(iterations):
        new = [0.0] * len(alpha)
        for y in range(HEIGHT):
            for x in range(WIDTH):
                idx = x + y * WIDTH
                s = alpha[idx]
                count = 1
                if x > 0:
                    s += alpha[idx - 1]; count += 1
                if x < WIDTH - 1:
                    s += alpha[idx + 1]; count += 1
                if y > 0:
                    s += alpha[idx - WIDTH]; count += 1
                if y < HEIGHT - 1:
                    s += alpha[idx + WIDTH]; count += 1
                new[idx] = s / count
        alpha[:] = new


def add_fold(alpha, base_x, width, intensity, offset_y, spread):
    for y in range(HEIGHT):
        for x in range(WIDTH):
            if base_x <= x <= base_x + width:
                nx = (x - base_x) / width * math.pi * 2
                wave = math.sin(nx * 3.4 + y * 0.012) * (1 - abs((x - (base_x + width / 2)) / (width / 2)))
                base = max(0.0, 1.0 - ((y - offset_y) / spread) ** 2)
                alpha[x + y * WIDTH] += clamp(intensity * wave * base)


def create_curtain(name, left_side=True):
    alpha = [0.0] * (WIDTH * HEIGHT)
    x0 = 0 if left_side else WIDTH - 560
    w = 560
    for y in range(HEIGHT):
        for x in range(x0, x0 + w):
            progress = (x - x0) / w
            fall = 1.0 - abs(progress * 2 - 1) * 0.75
            idx = x + y * WIDTH
            alpha[idx] += fall * (180 if left_side else 168)
            if y > 260:
                alpha[idx] -= (y - 260) * 0.12
    for phase in range(5):
        add_fold(alpha, x0, w, 26 if left_side else 24, 180 + phase * 80, 420)
    smooth(alpha, 5)
    alpha2 = [clamp(v * 0.7 + 12) for v in alpha]
    pixels = []
    for y in range(HEIGHT):
        row = bytearray()
        for x in range(WIDTH):
            a = alpha2[x + y * WIDTH]
            row.extend((255, 255, 255, a))
        pixels.append(bytes(row))
    write_png(os.path.join(ROOT, f"{name}.png"), WIDTH, HEIGHT, pixels)
    print(f"created {name}.png")

create_curtain('left-curtain', True)
create_curtain('right-curtain', False)
