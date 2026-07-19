import { useState } from 'react';
import { motion } from 'framer-motion';
import ErrorBoundary from '../ErrorBoundary';
import { useIsMobile } from '../../hooks/useIsMobile';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import NotificationToasts from './NotificationToasts';
import DashboardHome from './DashboardHome';
import TemplatesView from './TemplatesView';
import PlaceholderView from './PlaceholderView';
import LockedView from './LockedView';
import GuestsView from './GuestsView';
import AnalyticsView from './AnalyticsView';
import GalleryView from './GalleryView';
import MusicStudioView from './MusicStudioView';
import MessagesView from './MessagesView';
import SettingsView from './SettingsView';
import InvitationsManageView from './InvitationsManageView';
import CreateInvitation from './create/CreateInvitation';

// Views a member (demo) account never gets to render, no matter how
// activeView got set — Sidebar already hides these nav items, this is
// just the second layer so there's no path (card click, stale state,
// deep link) that ever mounts the real component for a demo session.
const DEMO_LOCKED_VIEWS = {
  messages: 'Messages',
  analytics: 'Analytics',
  settings: 'Settings',
  // Both the Gallery and Music Studio libraries are scoped per-browser
  // (see lib/galleryApi.js / lib/musicApi.js owner_key), not per member
  // account — sharing a device across two member accounts would leak
  // photos/tracks between them. Rather than rearchitect that library to
  // be account-aware, it's locked entirely for members: they can still
  // add photos/music directly inside the invitation builder (Photos and
  // Music steps upload straight into that invitation, no shared library
  // involved), which covers everything a member actually needs.
  gallery: 'Gallery',
  music: 'Music Studio',
};

// `session` is { type: 'owner' } or { type: 'demo', account }. `account`
// carries `allowedTemplates` (null = every template) straight from the
// license code (see supabase/demo_accounts.sql) — always read live from
// session, never cached, so an owner permission change takes effect the
// next time this mounts (e.g. next login / session revalidation).
export default function Dashboard({ onLogout, session = { type: 'owner' } }) {
  const isDemo = session.type === 'demo';
  const allowedTemplates = isDemo ? session.account?.allowedTemplates || null : null;

  const [activeView, setActiveView] = useState('dashboard');
  // Template chosen from the gallery, carried into the builder — defaults
  // to 'midnight' for the owner (same as the original invData.template),
  // or the first template this member's code actually allows.
  const [selectedTemplate, setSelectedTemplate] = useState(
    isDemo && allowedTemplates?.length ? allowedTemplates[0] : 'midnight'
  );

  const isMobile = useIsMobile();
  // On mobile the sidebar starts closed (an overlay you summon with the
  // hamburger button); on desktop it's just always visible so this flag
  // is never consulted.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleUseTemplate(id) {
    // Defense in depth — TemplatesView already only offers allowed
    // templates, but never trust a callback value alone.
    if (allowedTemplates && !allowedTemplates.includes(id)) return;
    setSelectedTemplate(id);
    setActiveView('create');
  }

  function handleNavigate(id) {
    if (isDemo && DEMO_LOCKED_VIEWS[id]) return;
    setActiveView(id);
    // Tapping a nav item on mobile should also close the overlay —
    // otherwise it stays covering the freshly-opened view.
    if (isMobile) setSidebarOpen(false);
  }

  function renderView() {
    if (isDemo && DEMO_LOCKED_VIEWS[activeView]) return <LockedView label={DEMO_LOCKED_VIEWS[activeView]} />;
    if (activeView === 'dashboard') {
      return <DashboardHome active={activeView === 'dashboard'} onNavigate={handleNavigate} session={session} />;
    }
    if (activeView === 'templates') {
      return <TemplatesView onUseTemplate={handleUseTemplate} allowedTemplates={allowedTemplates} />;
    }
    if (activeView === 'create') {
      return <CreateInvitation selectedTemplate={selectedTemplate} session={session} />;
    }
    if (activeView === 'guests') return <GuestsView session={session} />;
    if (activeView === 'analytics') return <AnalyticsView />;
    if (activeView === 'gallery') return <GalleryView />;
    if (activeView === 'music') return <MusicStudioView />;
    if (activeView === 'messages') return <MessagesView />;
    if (activeView === 'invitations') return <InvitationsManageView session={session} />;
    if (activeView === 'settings') return <SettingsView />;
    return <PlaceholderView nav={activeView} />;
  }

  return (
    <motion.div
      id="dashboard"
      className="fixed inset-0 z-[5] grid"
      style={
        isMobile
          ? { gridTemplateColumns: '1fr', gridTemplateRows: '64px 1fr', gridTemplateAreas: '"topbar" "main"' }
          : { gridTemplateColumns: '250px 1fr', gridTemplateRows: '76px 1fr', gridTemplateAreas: '"sidebar topbar" "sidebar main"' }
      }
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {isMobile ? (
        <Sidebar
          activeView={activeView}
          onNavigate={handleNavigate}
          onLogout={onLogout}
          session={session}
          isMobile
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      ) : (
        <div style={{ gridArea: 'sidebar' }}>
          <Sidebar activeView={activeView} onNavigate={handleNavigate} onLogout={onLogout} session={session} />
        </div>
      )}
      <div style={{ gridArea: 'topbar', position: 'relative', zIndex: 40 }}>
        <Topbar
          isMobile={isMobile}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          sidebarOpen={sidebarOpen}
          session={session}
        />
      </div>
      <div
        id="main-content"
        style={{ gridArea: 'main', position: 'relative', zIndex: 1 }}
        className={isMobile ? 'overflow-y-auto px-4 pt-6 pb-10' : 'overflow-y-auto px-10 pt-[38px] pb-[60px]'}
      >
        <ErrorBoundary key={activeView}>{renderView()}</ErrorBoundary>
      </div>
      {/* Toasts surface new RSVPs/comments/messages across the owner's
          whole inbox — not scoped per account, so a demo member never
          sees them (matches Notifications being locked for that account). */}
      {!isDemo && <NotificationToasts />}
    </motion.div>
  );
}
