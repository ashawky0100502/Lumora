# Lumora Asset Library

This folder contains the official Lumora asset structure for template-specific and shared visual resources. The purpose is to centralize assets for Aurora, Grand Premiere, Eternal Voyage, Royal Garden, Crystal Night, and shared application-wide material.

## Structure

- `aurora/` - Assets specific to the Aurora wedding experience
  - `backgrounds/` - large scene assets, architectural photography, environment plates
  - `overlays/` - light flare, ray, glow, or mist overlays
  - `textures/` - marble, plaster, fabric, wall finishes, and subtle wall textures
  - `particles/` - particle masks, dust, sparkle, and bokeh overlays
  - `lighting/` - volumetric light masks, directional sun ray effects, and lighting gradients
  - `marble/` - white marble surfaces, floor reflections, and stone detail textures
  - `glass/` - glass wall/window reflections, translucency passes, and window frame details
  - `curtains/` - premium fabric curtain textures, sheer drapes, and soft folds

- `grand-premiere/` - Assets for Grand Premiere scenes
  - `backgrounds/` - stage backgrounds, room environments, and architectural settings
  - `overlays/` - theatrical glow, spotlight effects, and particle layers
  - `textures/` - stage surfaces, velvet/fabric texture, and premium material detail
  - `particles/` - glitter, sparkles, and ambient particle overlays
  - `lighting/` - spotlight masks, backlight passes, and ambient theatre lighting

- `eternal-voyage/` - Assets for Eternal Voyage
- `royal-garden/` - Assets for Royal Garden
- `crystal-night/` - Assets for Crystal Night

- `shared/` - shared, reusable assets
  - `icons/` - reusable iconography assets
  - `logos/` - Lumora and template branding marks
  - `audio/` - shared sound and music assets
  - `fonts/` - font files and typography resources

## Naming conventions

- Use descriptive, lowercase names with hyphen separators.
- Avoid version-specific names unless the asset is intentionally versioned.
- Keep file names consistent across templates for shared asset categories.

Example:
- `aurora/backgrounds/glass-cathedral-sunrise.jpg`
- `aurora/overlays/soft-ray-01.png`
- `shared/icons/chevron-right.svg`

## Notes

- Do not add placeholder assets to this structure.
- Only add real final assets when they are available.
- This structure is intentionally isolated from template logic and routing.
