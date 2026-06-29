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
            {/* Kanok-style Organic Watermark */}
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-[0.04] dark:opacity-[0.02]">
              <svg
                className="absolute -top-[10%] -right-[10%] w-[60%] md:w-[40%] h-auto text-primary"
                viewBox="0 0 200 200"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M100,10 C150,10 190,50 190,100 C190,125 180,140 160,140 C140,140 130,125 130,100 C130,80 145,70 160,70 C175,70 190,85 190,100 C190,160 140,190 100,190 C60,190 10,160 10,100 C10,50 50,10 100,10 Z M160,85 C150,85 145,90 145,100 C145,110 150,115 160,115 C170,115 175,110 175,100 C175,90 170,85 160,85 Z" />
                <path d="M40,160 C10,130 0,90 20,50 C40,10 90,0 130,20 C160,40 170,80 150,120 C130,160 80,170 40,160 Z" opacity="0.3" />
              </svg>
              <svg
                className="absolute -bottom-[10%] -left-[10%] w-[70%] md:w-[50%] h-auto text-secondary"
                viewBox="0 0 200 200"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M100,190 C50,190 10,150 10,100 C10,75 20,60 40,60 C60,60 70,75 70,100 C70,120 55,130 40,130 C25,130 10,115 10,100 C10,40 60,10 100,10 C140,10 190,40 190,100 C190,150 150,190 100,190 Z M40,115 C50,115 55,110 55,100 C55,90 50,85 40,85 C30,85 25,90 25,100 C25,110 30,115 40,115 Z" />
              </svg>
            </div>
            
            <div className="grow relative z-10 pb-20">
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
