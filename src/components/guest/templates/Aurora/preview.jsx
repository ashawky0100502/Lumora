import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import Aurora from "./Aurora";
import { resolvePreviewDraftData } from "./lib/previewDraft";
import "./styles/opening.css";

function AuroraPreview() {
  const [draftData, setDraftData] = useState(() => resolvePreviewDraftData(undefined, null, {}));

  useEffect(() => {
    function readDraft(event) {
      setDraftData(resolvePreviewDraftData(undefined, event?.detail || null, {}));
    }

    readDraft();
    window.addEventListener('storage', readDraft);
    window.addEventListener('focus', readDraft);
    window.addEventListener('lumora:preview-refresh', readDraft);

    let channel = null;
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('lumora-wizard-draft');
      channel.addEventListener('message', (event) => {
        if (event?.data?.type === 'draft-updated') {
          setDraftData(resolvePreviewDraftData(undefined, event.data.draft || null, {}));
        }
      });
    }

    return () => {
      window.removeEventListener('storage', readDraft);
      window.removeEventListener('focus', readDraft);
      window.removeEventListener('lumora:preview-refresh', readDraft);
      channel?.close();
    };
  }, []);

  return <Aurora data={draftData || {}} />;
}

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <AuroraPreview />
    </React.StrictMode>
  );
}
