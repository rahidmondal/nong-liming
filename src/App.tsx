import { ThemeProvider } from '@/components/theme-provider';
import { ToastProvider } from '@/components/toast-provider';
import { DecksPage } from '@/features/flashcards/DecksPage';
import { StatsPage } from '@/features/flashcards/StatsPage';
import { StudyPage } from '@/features/flashcards/StudyPage';
import { FullViewPage } from '@/features/full-view/FullViewPage';
import { LandingPage } from '@/features/landing/LandingPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { APP_VERSION, BASE_PATH } from './lib/constants';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="nong-liming-ui-theme">
      <ToastProvider>
        <BrowserRouter basename={BASE_PATH}>
          <div className="flex flex-col min-h-dvh">
            <div className="grow">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/full-view" element={<FullViewPage />} />
                <Route path="/decks" element={<DecksPage />} />
                <Route path="/decks/:id/study" element={<StudyPage />} />
                <Route path="/stats" element={<StatsPage />} />
              </Routes>
            </div>
            <footer className="w-full py-4 text-center text-sm text-muted-foreground border-t border-border bg-background/50 backdrop-blur-sm">
              <p>v{APP_VERSION}</p>
            </footer>
          </div>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
