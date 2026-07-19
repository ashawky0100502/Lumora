import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import EternalVoyage from './components/guest/EternalVoyage/EternalVoyage';

const data = {
  groom: 'Ahmed',
  bride: 'Yomna',
  template: 'eternal-voyage',
  sections: { music: true, letters: true, timeline: true, location: true, menu: true, rsvp: true, comments: true, messages: true },
  story: {
    title: 'Our Story',
    text: 'We met in a quiet corner of the city and found our favorite rhythm in one another.'
  },
  howWeMet: 'A chance meeting turned into a long conversation that lasted through the seasons.',
  lifeStory: 'Every chapter became brighter once we chose to walk it together.',
  brideStory: 'Every day with him feels like the beginning of something sacred and beautiful.',
  groomStory: 'She has made every ordinary moment feel like a memory worth keeping.',
  engagement: { story: 'Our engagement felt like the universe giving us permission to begin forever.' },
  quranVerse: 'And We have made you into nations and tribes that you may know one another.',
  quran: { surahName: 'Al-Hujurat', ayahNumber: '13' },
};

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <EternalVoyage data={data} theme={{}} slug="preview-slug" />
  </React.StrictMode>
);
