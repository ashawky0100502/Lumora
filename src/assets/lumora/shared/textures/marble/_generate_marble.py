import os
import struct
import zlib
import random
import math

WIDTH = 4096
HEIGHT = 4096
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


def perlin(x, y, seed=0):
    n = int(x) + int(y) * 57 + seed * 131
    n = (n << 13) ^ n
    return (1.0 - ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0)


def smooth_noise(x, y, seed=0):
    corners = (perlin(x-1, y-1, seed) + perlin(x+1, y-1, seed) + perlin(x-1, y+1, seed) + perlin(x+1, y+1, seed)) / 16
    sides   = (perlin(x-1, y, seed) + perlin(x+1, y, seed) + perlin(x, y-1, seed) + perlin(x, y+1, seed)) / 8
    center  = perlin(x, y, seed) / 4
    return corners + sides + center


def interpolate(a, b, x):
    ft = x * math.pi
    f = (1 - math.cos(ft)) * 0.5
    return a * (1 - f) + b * f


def perlin_noise(x, y, seed=0):
    integer_X = int(x)
    fractional_X = x - integer_X
    integer_Y = int(y)
    fractional_Y = y - integer_Y
    v1 = smooth_noise(integer_X, integer_Y, seed)
    v2 = smooth_noise(integer_X+1, integer_Y, seed)
    v3 = smooth_noise(integer_X, integer_Y+1, seed)
    v4 = smooth_noise(integer_X+1, integer_Y+1, seed)
    i1 = interpolate(v1, v2, fractional_X)
    i2 = interpolate(v3, v4, fractional_X)
    return interpolate(i1, i2, fractional_Y)


def fractal_noise(x, y, octaves, persistence, seed=0):
    total = 0
    frequency = 1
    amplitude = 1
    max_value = 0
    for _ in range(octaves):
        total += perlin_noise(x * frequency, y * frequency, seed) * amplitude
        max_value += amplitude
        amplitude *= persistence
        frequency *= 2
    return total / max_value


def marble_texture(seed, base, vein_color, contrast, scale=0.00085, turbulence=5.0):
    pixels = []
    for y in range(HEIGHT):
        row = bytearray()
        for x in range(WIDTH):
            nx = x * scale
            ny = y * scale
            noise = fractal_noise(nx, ny, 5, 0.5, seed) * turbulence
            value = math.sin((nx + noise) * 3.2) * 0.5 + 0.5
            value = value ** contrast
            r = clamp(base[0] * (1 - value) + vein_color[0] * value)
            g = clamp(base[1] * (1 - value) + vein_color[1] * value)
            b = clamp(base[2] * (1 - value) + vein_color[2] * value)
            row.extend((r, g, b, 255))
        pixels.append(bytes(row))
    return pixels


def save_texture(filename, seed, base, vein_color, contrast, scale, turbulence):
    pixels = marble_texture(seed, base, vein_color, contrast, scale, turbulence)
    write_png(os.path.join(ROOT, filename), WIDTH, HEIGHT, pixels)
    print('created', filename)

save_texture('white-marble.png', 12, (240, 238, 234), (206, 200, 188), 1.25, 0.00095, 5.6)
save_texture('ivory-marble.png', 24, (250, 246, 236), (222, 212, 200), 1.2, 0.00092, 6.2)
save_texture('polished-marble.png', 36, (244, 241, 235), (218, 211, 198), 1.3, 0.00078, 6.8)
