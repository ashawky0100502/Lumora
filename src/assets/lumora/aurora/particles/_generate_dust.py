import os
import struct
import zlib
import random

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


def build_particle_layer(color, count, min_radius, max_radius, opacity, softness):
    alpha = [0.0] * (WIDTH * HEIGHT)
    for _ in range(count):
        r = random.uniform(min_radius, max_radius)
        x = random.uniform(r, WIDTH - r)
        y = random.uniform(r, HEIGHT - r)
        intensity = random.uniform(opacity * 0.7, opacity)
        for py in range(int(y - r), int(y + r) + 1):
            if 0 <= py < HEIGHT:
                dy = (py - y) / r
                dy2 = dy * dy
                if dy2 < 1.0:
                    for px in range(int(x - r), int(x + r) + 1):
                        if 0 <= px < WIDTH:
                            dx = (px - x) / r
                            dist2 = dx * dx + dy2
                            if dist2 < 1.0:
                                alpha[px + py * WIDTH] += intensity * (1 - dist2) ** softness
    return alpha


def generate_overlay(name, color, count, min_radius, max_radius, opacity, softness, ambient):
    alpha = build_particle_layer(color, count, min_radius, max_radius, opacity, softness)
    for y in range(HEIGHT):
        base = 1.0 - abs((y - HEIGHT*0.38) / (HEIGHT*0.5))
        base = max(0.0, base) * ambient
        for x in range(WIDTH):
            alpha[x + y * WIDTH] += base
    pixels = []
    for y in range(HEIGHT):
        row = bytearray()
        for x in range(WIDTH):
            a = clamp(alpha[x + y * WIDTH])
            row.extend((255, 255, 255, a))
        pixels.append(bytes(row))
    write_png(os.path.join(ROOT, f"{name}.png"), WIDTH, HEIGHT, pixels)
    print(f"created {name}.png")

random.seed(42)
generate_overlay('white-dust', 'white', 420, 2.4, 7.8, 24, 1.8, 1.5)
generate_overlay('golden-dust', 'golden', 340, 2.2, 8.4, 20, 1.5, 1.25)
generate_overlay('tiny-floating-particles', 'tiny', 1120, 1.0, 4.2, 14, 2.4, 0.9)
