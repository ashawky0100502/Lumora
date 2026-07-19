import { useState } from 'react';
import { getOwnerName, setOwnerName } from '../../../lib/settingsStore';
import { sfxClick, sfxSuccess, sfxError } from '../../../lib/sfx';
import { SettingsCard, InlineNotice } from './SettingsUI';

// Changing the name here updates the dashboard's "Welcome Back, {name}"
// greeting (see DashboardHome.jsx) — no other code needs to change.
export default function ProfileSettings() {
  const [name, setName] = useState(getOwnerName());
  const [notice, setNotice] = useState(null);

  function handleSave(e) {
    e.preventDefault();
    sfxClick();
    const result = setOwnerName(name);
    if (!result.ok) {
      sfxError();
      setNotice({ tone: 'error', text: 'Please enter a valid name (up to 40 characters).' });
      return;
    }
    sfxSuccess();
    setNotice({ tone: 'success', text: `Saved — your dashboard will now greet you as "${name.trim()}".` });
  }

  return (
    <SettingsCard
      title="Owner Profile"
      description="This name appears in your dashboard's welcome message — change it any time."
    >
      <form onSubmit={handleSave} className="flex flex-col gap-5 sm:max-w-md">
        <div className="field relative">
          <input
            id="owner-name"
            type="text"
            required
            maxLength={40}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`field-input ${name ? 'filled' : ''}`}
            style={{ paddingLeft: 18 }}
          />
          <label htmlFor="owner-name" className="field-label" style={{ left: 18 }}>
            Your Name
          </label>
        </div>
        <button type="submit" className="btn-gold w-fit rounded-xl px-8 py-3 font-semibold">
          Save Changes
        </button>
        {notice && <InlineNotice tone={notice.tone}>{notice.text}</InlineNotice>}
      </form>
    </SettingsCard>
  );
}
