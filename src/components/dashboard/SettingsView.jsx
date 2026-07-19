import { useState } from 'react';
import { motion } from 'framer-motion';
import { sfxClick } from '../../lib/sfx';
import ProfileSettings from './settings/ProfileSettings';
import SecuritySettings from './settings/SecuritySettings';
import LicenseSettings from './settings/LicenseSettings';
import PricingSettings from './settings/PricingSettings';
import InboxSettings from './settings/InboxSettings';
import PerformanceSettings from './settings/PerformanceSettings';

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'security', label: 'Security' },
  { id: 'licenses', label: 'License Codes' },
  { id: 'pricing', label: 'Template Pricing' },
  { id: 'inbox', label: 'Inbox' },
  { id: 'performance', label: 'Performance' },
];

export default function SettingsView() {
  const [tab, setTab] = useState('profile');

  return (
    <div>
      <div className="mb-9">
        <div className="font-display text-[1.5rem]" style={{ letterSpacing: '0.02em' }}>
          Settings
        </div>
        <div className="font-serif-alt mt-1 italic" style={{ color: 'rgba(246,244,239,0.5)' }}>
          Everything that controls how LUMORA looks and works, in one place.
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              sfxClick();
              setTab(t.id);
            }}
            className="rounded-full px-4 py-2 text-[0.8rem] transition-colors duration-300"
            style={{
              background: tab === t.id ? 'linear-gradient(120deg, var(--gold), var(--gold-soft))' : 'transparent',
              color: tab === t.id ? '#1a1206' : 'rgba(246,244,239,0.6)',
              border: `1px solid ${tab === t.id ? 'transparent' : 'rgba(212,175,55,0.2)'}`,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {tab === 'profile' && <ProfileSettings />}
        {tab === 'security' && <SecuritySettings />}
        {tab === 'licenses' && <LicenseSettings />}
        {tab === 'pricing' && <PricingSettings />}
        {tab === 'inbox' && <InboxSettings />}
        {tab === 'performance' && <PerformanceSettings />}
      </motion.div>
    </div>
  );
}
