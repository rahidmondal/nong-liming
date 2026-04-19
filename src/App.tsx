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
import { SentencePracticePage } from '@/features/sentenceBuilder/SentencePracticePage';
import { SpacedRepetitionGuide } from '@/features/settings/SpacedRepetitionGuide';
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
                <Route path="/dictionary" element={<DictionaryPage />} />
                <Route path="/tone-trainer" element={<ToneTrainerPage />} />
                <Route path="/sentence-practice" element={<SentencePracticePage />} />
                <Route path="/lessons" element={<LessonsOverview />} />
                <Route path="/lessons/:id" element={<LessonViewer />} />
                <Route path="/decks" element={<DecksPage />} />
                <Route path="/decks/:id/study" element={<StudyPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/builder" element={<BuilderPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/settings/algorithm" element={<SpacedRepetitionGuide />} />
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
