import React from 'react';
import ReactDOM from 'react-dom/client';
import '../src/components/guest/GrandPremiere/styles/GrandPremiere.css';
import PrivateMessage from '../src/components/guest/GrandPremiere/components/PrivateMessage';

const data = {
  language: 'en',
  groom: 'Aiden',
  bride: 'Maya',
  sections: { messages: true },
};

const slug = 'test-statue';

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ minHeight: '100vh', background: '#100a05', padding: 24 }}>
    <PrivateMessage data={data} slug={slug} />
  </div>
);
