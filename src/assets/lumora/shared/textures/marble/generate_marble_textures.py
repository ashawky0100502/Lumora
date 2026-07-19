import os
import struct
import zlib
import math

W = H = 1024
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


def hash_value(x, y, seed):
    n = (int(x) * 374761393 + int(y) * 668265263 + seed * 2147483647) & 0xffffffff
    n = (n ^ (n >> 13)) * 1274126177
    n ^= n >> 16
    return (n & 0xffffffff) / 4294967295.0


def smooth_noise(x, y, seed):
    x0 = int(x)
    y0 = int(y)
    xf = x - x0
    yf = y - y0
    x1 = x0 + 1
    y1 = y0 + 1
    a = hash_value(x0, y0, seed)
    b = hash_value(x1, y0, seed)
    c = hash_value(x0, y1, seed)
    d = hash_value(x1, y1, seed)
    u = xf * xf * (3 - 2 * xf)
    v = yf * yf * (3 - 2 * yf)
    return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v


def make_texture(filename, base, vein, contrast, seed):
    pixels = []
    for y in range(H):
        row = bytearray()
        for x in range(W):
            nx = x / W * 1.8 - 0.9
            ny = y / H * 1.8 - 0.9
            n1 = smooth_noise(nx * 4.4 + 2.1, ny * 4.4 + 1.2, seed)
            n2 = smooth_noise(nx * 8.8 + 0.4, ny * 8.8 + 3.6, seed + 11)
            wave = math.sin((nx + n1 * 2.2) * 4.2 + (ny + n2 * 1.1) * 2.0)
            grain = (n2 - 0.5) * 0.16
            t = ((wave * 0.5 + 0.5) ** contrast) + grain
            t = max(0.0, min(1.0, t))
            r = clamp(int(base[0] * (1 - t) + vein[0] * t))
            g = clamp(int(base[1] * (1 - t) + vein[1] * t))
            b = clamp(int(base[2] * (1 - t) + vein[2] * t))
            row.extend((r, g, b, 255))
        pixels.append(bytes(row))
    write_png(os.path.join(ROOT, filename), W, H, pixels)
    print('created', filename)

make_texture('white-marble.png', (242, 240, 236), (212, 205, 196), 1.22, 7)
make_texture('ivory-marble.png', (248, 245, 239), (224, 214, 202), 1.18, 13)
make_texture('polished-marble.png', (242, 239, 231), (220, 212, 201), 1.3, 21)
