import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SidePanel } from '../components/SidePanel';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SidePanel />
  </StrictMode>
);
