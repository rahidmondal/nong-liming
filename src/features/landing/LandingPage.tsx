import { ThaiFlameIcon as Sparkles } from '@/components/ThaiIcons';
import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CourseHub } from '@/features/guidedStudy/CourseHub';
import { DailyChallengesPanel } from '@/features/dailyChallenges/DailyChallengesPanel';
import { PhanKhru } from '@/features/waikru/PhanKhru';

export function LandingPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-10">
      <header className="flex justify-between items-center py-6">
        <Link
          to="/"
          aria-label="น้องลีมิง — Nong LiMing home"
          className="flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4"
        >
          <img src={`${import.meta.env.BASE_URL}logo-purple.svg`} alt="" className="h-12 w-12 shrink-0" />
          <span className="flex flex-col gap-0.5">
            <span className="font-bold text-xl leading-tight">น้องลีมิง</span>
            <span className="text-[9px] font-semibold tracking-[0.2em] text-muted-foreground">NONG LIMING</span>
          </span>
        </Link>
        <Link
          to="/settings"
          aria-label="Settings"
          id="settings-link"
          className="p-3 rounded-2xl bg-card border border-border hover:bg-muted"
        >
          <Settings className="w-5 h-5" />
        </Link>
      </header>
      <main>
        <div className="py-4 mb-4">
          <p className="text-sm text-muted-foreground flex gap-2 items-center">
            <Sparkles className="w-4 h-4 text-primary" />
            Sawasdee krub! Let’s learn something useful.
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mt-3">
            A little Thai.
            <br />
            <span className="text-primary">A real step forward.</span>
          </h1>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            Learn the letters. Read your first words. Find your voice in everyday Thai.
          </p>
        </div>
        <CourseHub />
        <details className="mt-6 rounded-3xl border border-border bg-card p-5">
          <summary className="font-semibold cursor-pointer">Extra practice & your offerings</summary>
          <div className="mt-5 space-y-5">
            <DailyChallengesPanel />
            <PhanKhru />
          </div>
        </details>
      </main>
    </div>
  );
}
