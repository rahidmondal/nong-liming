import { ThemeProvider } from '@/components/theme-provider';
import { ToastProvider } from '@/components/toast-provider';
import { UpdatePrompt } from '@/components/UpdatePrompt';
import { BuilderPage } from '@/features/builder/BuilderPage';
import { DecksPage } from '@/features/flashcards/DecksPage';
import { StudyPage } from '@/features/flashcards/StudyPage';
import { LandingPage } from '@/features/landing/LandingPage';
import { ReferencePage } from '@/features/reference/ReferencePage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { StatsPage } from '@/features/stats/StatsPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { BASE_PATH } from './lib/constants';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="nong-liming-ui-theme">
      <ToastProvider>
        <BrowserRouter basename={BASE_PATH}>
          <div className="flex flex-col min-h-dvh">
            <div className="grow">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/reference" element={<ReferencePage />} />
                <Route path="/decks" element={<DecksPage />} />
                <Route path="/decks/:id/study" element={<StudyPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/builder" element={<BuilderPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </div>
          </div>
          <UpdatePrompt />
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
