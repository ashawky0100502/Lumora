import { useState } from 'react';
import { getOwnerUsername, verifyOwnerLogin, updateOwnerPassword } from '../../../lib/authStore';
import { sfxClick, sfxSuccess, sfxError } from '../../../lib/sfx';
import { SettingsCard, InlineNotice } from './SettingsUI';

export default function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notice, setNotice] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    sfxClick();

    if (!verifyOwnerLogin(getOwnerUsername(), currentPassword)) {
      sfxError();
      setNotice({ tone: 'error', text: 'Current password is incorrect.' });
      return;
    }
    if (newPassword.length < 6) {
      sfxError();
      setNotice({ tone: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      sfxError();
      setNotice({ tone: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    updateOwnerPassword(newPassword);
    sfxSuccess();
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setNotice({ tone: 'success', text: 'Password updated. Use it next time you sign in.' });
  }

  return (
    <SettingsCard title="Change Password" description="Update the password used to sign in to this dashboard.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:max-w-md">
        <div className="field relative">
          <input
            id="current-password"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={`field-input ${currentPassword ? 'filled' : ''}`}
            style={{ paddingLeft: 18 }}
          />
          <label htmlFor="current-password" className="field-label" style={{ left: 18 }}>
            Current Password
          </label>
        </div>

        <div className="field relative">
          <input
            id="new-password"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={`field-input ${newPassword ? 'filled' : ''}`}
            style={{ paddingLeft: 18 }}
          />
          <label htmlFor="new-password" className="field-label" style={{ left: 18 }}>
            New Password
          </label>
        </div>

        <div className="field relative">
          <input
            id="confirm-password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`field-input ${confirmPassword ? 'filled' : ''}`}
            style={{ paddingLeft: 18 }}
          />
          <label htmlFor="confirm-password" className="field-label" style={{ left: 18 }}>
            Confirm New Password
          </label>
        </div>

        <button type="submit" className="btn-gold w-fit rounded-xl px-8 py-3 font-semibold">
          Update Password
        </button>
        {notice && <InlineNotice tone={notice.tone}>{notice.text}</InlineNotice>}
      </form>
    </SettingsCard>
  );
}
