import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProgressProvider } from './lib/progress';
import { ThemeProvider } from './lib/theme';
import { GlossaryPage } from './pages/GlossaryPage';
import { HomePage } from './pages/HomePage';
import { LessonPage } from './pages/LessonPage';
import { ModulePage } from './pages/ModulePage';
import { ToolPage, ToolsPage } from './pages/ToolsPage';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ProgressProvider>
        {/* HashRouter ทำให้ deploy บน GitHub Pages ได้โดยไม่ต้องตั้งค่า server rewrite */}
        <HashRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/learn/:moduleId" element={<ModulePage />} />
              <Route path="/learn/:moduleId/:lessonId" element={<LessonPage />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/tools/:toolId" element={<ToolPage />} />
              <Route path="/glossary" element={<GlossaryPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </HashRouter>
      </ProgressProvider>
    </ThemeProvider>
  </StrictMode>,
);
