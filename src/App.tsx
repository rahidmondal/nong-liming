import { ThemeProvider } from '@/components/theme-provider';
import { ToastProvider } from '@/components/toast-provider';
import { UpdatePrompt } from '@/components/UpdatePrompt';
import { LandingPage } from '@/features/landing/LandingPage';
import { Navigation } from '@/components/Navigation';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { BASE_PATH } from './lib/constants';
import { lazy, useState } from 'react';
import { PageBoundary } from '@/components/PageBoundary';
import { isOnboardingComplete } from '@/lib/onboarding';
import { OnboardingWizard } from '@/features/onboarding/OnboardingWizard';
import { useTutorial } from '@/lib/useTutorial';

const BuilderPage = lazy(() =>
  import('@/features/builder/BuilderPage').then(module => ({ default: module.BuilderPage })),
);
const DecksPage = lazy(() => import('@/features/flashcards/DecksPage').then(module => ({ default: module.DecksPage })));
const StudyPage = lazy(() => import('@/features/flashcards/StudyPage').then(module => ({ default: module.StudyPage })));
const ReferencePage = lazy(() =>
  import('@/features/reference/ReferencePage').then(module => ({ default: module.ReferencePage })),
);
const SettingsPage = lazy(() =>
  import('@/features/settings/SettingsPage').then(module => ({ default: module.SettingsPage })),
);
const StatsPage = lazy(() => import('@/features/stats/StatsPage').then(module => ({ default: module.StatsPage })));
const DictionaryPage = lazy(() =>
  import('@/features/dictionary/DictionaryPage').then(module => ({ default: module.DictionaryPage })),
);
const ToneTrainerPage = lazy(() =>
  import('@/features/toneTrainer/ToneTrainerPage').then(module => ({ default: module.ToneTrainerPage })),
);
const LessonViewer = lazy(() =>
  import('@/features/lessons/LessonViewer').then(module => ({ default: module.LessonViewer })),
);
const LessonsOverview = lazy(() =>
  import('@/features/lessons/LessonsOverview').then(module => ({ default: module.LessonsOverview })),
);
const UnalomePage = lazy(() =>
  import('@/features/unalome/UnalomePage').then(module => ({ default: module.UnalomePage })),
);
const ReadingPage = lazy(() =>
  import('@/features/reading/ReadingPage').then(module => ({ default: module.ReadingPage })),
);
const SentencePracticePage = lazy(() =>
  import('@/features/sentenceBuilder/SentencePracticePage').then(module => ({ default: module.SentencePracticePage })),
);
const SpacedRepetitionGuide = lazy(() =>
  import('@/features/settings/SpacedRepetitionGuide').then(module => ({ default: module.SpacedRepetitionGuide })),
);
const ToolsHub = lazy(() => import('@/features/tools/ToolsHub').then(module => ({ default: module.ToolsHub })));
const GuidedStudyPage = lazy(() =>
  import('@/features/guidedStudy/GuidedStudyPage').then(module => ({ default: module.GuidedStudyPage })),
);

function AppScreens() {
  const { pathname } = useLocation();
  return (
    <PageBoundary key={pathname}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/learn/:missionId" element={<GuidedStudyPage />} />
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
    </PageBoundary>
  );
}

function TutorialController() {
  useTutorial();
  return null;
}

function App() {
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => !isOnboardingComplete());

  if (showOnboarding) {
    return (
      <ThemeProvider defaultTheme="system" storageKey="nong-liming-ui-theme">
        <ToastProvider>
          <OnboardingWizard
            onComplete={() => {
              setShowOnboarding(false);
            }}
          />
        </ToastProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="nong-liming-ui-theme">
      <ToastProvider>
        <BrowserRouter basename={BASE_PATH}>
          <TutorialController />
          <div className="flex flex-col min-h-dvh relative z-0">
            <div className="grow relative z-10 pb-20 md:pb-0 md:pl-24">
              <AppScreens />
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
