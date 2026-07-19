import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchInvitationBySlug } from '../../lib/guestApi';
import TemplateDispatcher from './TemplateDispatcher';

export default function GuestView({ slug }) {
  const [state, setState] = useState({ loading: true, data: null, error: null });

  useEffect(() => {
    let alive = true;
    fetchInvitationBySlug(slug)
      .then((data) => {
        if (!alive) return;
        if (!data) setState({ loading: false, data: null, error: 'not-found' });
        else setState({ loading: false, data, error: null });
      })
      .catch(() => alive && setState({ loading: false, data: null, error: 'not-found' }));
    return () => {
      alive = false;
    };
  }, [slug]);

  if (state.loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#080b1a]">
        <motion.div
          className="h-10 w-10 rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'rgba(212,175,55,0.8)', borderTopColor: 'transparent' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (state.error || !state.data) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#080b1a] px-6 text-center">
        <div style={{ color: '#f0d98c', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', fontStyle: 'italic' }}>
          This invitation could not be found.
        </div>
      </div>
    );
  }

  return <TemplateDispatcher data={state.data} slug={slug} />;
}
