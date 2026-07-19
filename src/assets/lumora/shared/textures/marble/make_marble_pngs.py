from PIL import Image
from pathlib import Path

root = Path('src/assets/lumora/shared/textures/marble')
root.mkdir(parents=True, exist_ok=True)

for name, base, vein, contrast in [
    ('white-marble.png', (242, 240, 236), (212, 205, 196), 1.22),
    ('ivory-marble.png', (248, 245, 239), (224, 214, 202), 1.18),
    ('polished-marble.png', (242, 239, 231), (220, 212, 201), 1.30),
]:
    img = Image.new('RGBA', (2048, 2048), (0, 0, 0, 0))
    pixels = img.load()
    for y in range(2048):
        for x in range(2048):
            n1 = ((x * 0.013 + y * 0.007) % 17) / 16.0
            n2 = ((x * 0.021 - y * 0.011) % 19) / 18.0
            wave = n1 * 0.6 + n2 * 0.4
            t = wave ** contrast
            r = int(min(255, max(0, base[0] * (1 - t) + vein[0] * t)))
            g = int(min(255, max(0, base[1] * (1 - t) + vein[1] * t)))
            b = int(min(255, max(0, base[2] * (1 - t) + vein[2] * t)))
            pixels[x, y] = (r, g, b, 255)
    img.save(root / name)
    print('created', name)
