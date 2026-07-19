/**
 * TEMPLATE REGISTRY
 * Single source of truth for every template in the product.
 *
 * The Templates gallery page, the invitation builder's template picker,
 * and the review summary all render themselves FROM this array — so
 * adding a brand-new template later never means hunting down several
 * different hardcoded blocks of JSX. Just push a new object here (and
 * give it its own preview style below, plus an options panel component
 * if it needs one), and it shows up everywhere automatically.
 */
export const TEMPLATE_REGISTRY = [
  {
    id: 'amour',
    name: 'Amour — Heart of Love',
    badge: 'Ready-made',
    readyMade: true,
    tagline:
      'A cinematic flagship experience — a hand-arranged flower heart guests scratch away petal by petal to reveal the invitation, in deep wine, blush and gold. Fully ready-made.',
    optionsPanelId: null,
  },
  {
    id: 'midnight',
    name: 'Midnight Gold',
    badge: 'Customizable',
    readyMade: false,
    tagline:
      'A dreamy galaxy universe in deep purples and gold — 5 opening card styles, 6 background themes and 7 cover motifs to mix and match.',
    optionsPanelId: null,
  },
  {
    id: 'silk',
    name: 'Silk & Pearl',
    badge: 'Ready-made',
    readyMade: true,
    tagline:
      'A soft botanical design in pearl, sage and dusty rose that opens with a silk curtain parting from the sides — fully ready-made, nothing to configure.',
    optionsPanelId: 'silk-options',
  },
  {
    id: 'velvet',
    name: 'Velvet Noir',
    badge: 'Ready-made',
    readyMade: true,
    tagline:
      'A dramatic theater moment in near-black, emerald and antique brass — heavy velvet curtains draw open from the sides. Fully ready-made.',
    optionsPanelId: null,
  },
  {
    id: 'wax',
    name: 'Wax & Parchment',
    badge: 'Ready-made',
    readyMade: true,
    tagline:
      'Aged parchment paper, navy ink and a red wax seal guests tap to break open — a keepsake letter feel. Fully ready-made.',
    optionsPanelId: null,
  },
  {
    id: 'royale',
    name: 'Royale Ivoire',
    badge: 'Ready-made',
    readyMade: true,
    tagline:
      'The flagship LUMORA design — a handcrafted ivory envelope with a champagne wax seal that glows, lifts and opens on all four sides as the invitation rises through a cascade of falling petals. Fully ready-made.',
    optionsPanelId: null,
  },
  {
    id: 'eternal-voyage',
    name: 'Eternal Voyage',
    badge: 'New',
    readyMade: false,
    tagline:
      'A brand-new, fully isolated voyage-themed template — currently a structural skeleton with its full section set already wired to the Builder and shared guest features.',
    optionsPanelId: null,
  },
  {
    id: 'grand-premiere',
    name: 'Grand Premiere',
    badge: 'New',
    readyMade: false,
    tagline:
      'A brand-new, fully isolated cinematic-luxury template — opening like a film premiere rather than a webpage. Phase 1: architecture only, wired to the Builder, no sections built yet.',
    optionsPanelId: null,
  },
  {
    id: 'aurora',
    name: 'Aurora',
    badge: 'New',
    readyMade: false,
    tagline:
      'A cinematic luxury invitation experience with premium opening motion and editorial storytelling, using the existing template architecture and shared guest pipeline.',
    optionsPanelId: null,
  },
];

export function templateById(id) {
  return TEMPLATE_REGISTRY.find((t) => t.id === id) || TEMPLATE_REGISTRY[0];
}

export const READY_MADE_IDS = TEMPLATE_REGISTRY.filter((t) => t.readyMade).map((t) => t.id);
