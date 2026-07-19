# Grand Premiere — `components/`

Phase 1 (architecture only) — intentionally empty.

Section components (Hero, Bride, Groom, Story, Timeline, Gallery,
Venue, Countdown, Music, RSVP, Guestbook, Private Message, Footer,
...) will live here in later phases, one file per section, mirroring
`EternalVoyage/sections/`. Every section must read its data from
`../config/builderFields.js` and follow the rule already established
for this project: Builder has data → render it; Builder has none →
`return null`. No placeholders, ever.
