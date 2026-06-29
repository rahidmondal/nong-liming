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
import { DictionaryPage } from '@/features/dictionary/DictionaryPage';
import { ToneTrainerPage } from '@/features/toneTrainer/ToneTrainerPage';
import { LessonViewer } from '@/features/lessons/LessonViewer';
import { LessonsOverview } from '@/features/lessons/LessonsOverview';
import { UnalomePage } from '@/features/unalome/UnalomePage';
import { ReadingPage } from '@/features/reading/ReadingPage';
import { SentencePracticePage } from '@/features/sentenceBuilder/SentencePracticePage';
import { SpacedRepetitionGuide } from '@/features/settings/SpacedRepetitionGuide';
import { ToolsHub } from '@/features/tools/ToolsHub';
import { Navigation } from '@/components/Navigation';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { BASE_PATH } from './lib/constants';
import { useState, useEffect } from 'react';
import { isOnboardingComplete } from '@/lib/onboarding';
import { OnboardingWizard } from '@/features/onboarding/OnboardingWizard';

function App() {
  const [showOnboarding, setShowOnboarding] = useState<boolean>(true);

  useEffect(() => {
    setShowOnboarding(!isOnboardingComplete());
  }, []);

  if (showOnboarding) {
    return (
      <ThemeProvider defaultTheme="system" storageKey="nong-liming-ui-theme">
        <ToastProvider>
          <OnboardingWizard onComplete={() => setShowOnboarding(false)} />
        </ToastProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="nong-liming-ui-theme">
      <ToastProvider>
        <BrowserRouter basename={BASE_PATH}>
          <div className="flex flex-col min-h-dvh relative z-0">
            {/* Traditional Thai Watermark */}
            <div 
              className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.04] dark:opacity-[0.08]"
              style={{
                backgroundImage: `url('${import.meta.env.BASE_URL}images/watermark.jpg')`,
                backgroundSize: '400px',
                backgroundRepeat: 'repeat',
                mixBlendMode: 'multiply'
              }}
            />
            
            <div className="grow relative z-10 pb-20 md:pb-0 md:pl-24">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/reference" element={<ReferencePage />} />
                <Route path="/dictionary" element={<DictionaryPage />} />
                <Route path="/tone-trainer" element={<ToneTrainerPage />} />
                <Route path="/sentence-practice" element={<SentencePracticePage />} />
                <Route path="/lessons" element={<LessonsOverview />} />
                <Route path="/lessons/:id" element={<LessonViewer />} />
                <Route path="/unalome" element={<UnalomePage />} />
                <Route path="/reading" element={<ReadingPage />} />
                <Route path="/decks" element={<DecksPage />} />
                <Route path="/decks/:id/study" element={<StudyPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/builder" element={<BuilderPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/settings/algorithm" element={<SpacedRepetitionGuide />} />
                <Route path="/practice" element={<ToolsHub />} />
              </Routes>
            </div>
            <Navigation />
          </div>
          <UpdatePrompt />
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
