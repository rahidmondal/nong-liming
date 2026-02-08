import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { LandingPage } from './features/landing/LandingPage';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="nong-liming-ui-theme">
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <div className="grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/decks" element={<div>Decks Page Placeholder</div>} />
            </Routes>
          </div>
          <footer className="w-full py-4 text-center text-sm text-muted-foreground border-t border-border bg-background/50 backdrop-blur-sm">
            <p>v{import.meta.env.PACKAGE_VERSION}</p>
          </footer>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
