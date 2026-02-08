import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { LandingPage } from './features/landing/LandingPage';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="nong-liming-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/decks" element={<div>Decks Page Placeholder</div>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
