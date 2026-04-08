import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { initFirebase } from './firebase';

initFirebase().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
}).catch((err) => {
  console.error("Failed to initialize Firebase", err);
  document.getElementById('root')!.innerHTML = '<div style="color:white;padding:20px;">Failed to load configuration.</div>';
});
