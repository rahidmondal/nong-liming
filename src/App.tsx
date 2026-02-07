function App() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-5 pb-20 pt-16 sm:px-8">
        <header className="grid gap-6">
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">Indic-Thai Bridge PWA</p>
            <span className="h-1 w-20 rounded-full bg-(--accent)" />
          </div>
          <div className="grid gap-4">
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">Nong Liming</h1>
            <p className="max-w-2xl text-lg text-(--muted)">
              A smart digital companion for mastering Thai literacy through Devanagari phonetics with English SVO
              grammar logic.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm">Micro-learning</span>
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm">Developer-focused</span>
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm">Advanced fluency</span>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-3xl border border-(--border) bg-(--card) p-6 shadow-[0_20px_40px_rgba(4,8,18,0.2)] backdrop-blur">
            <h2 className="text-lg font-semibold">Why it works</h2>
            <p className="mt-2 text-sm text-(--muted)">
              Thai script is mapped to its Devanagari close match for precise phonetics, while English provides the SVO
              grammar logic that keeps lessons fast and intuitive.
            </p>
          </article>
          <article className="rounded-3xl border border-(--border) bg-(--card) p-6 shadow-[0_20px_40px_rgba(4,8,18,0.2)] backdrop-blur">
            <h2 className="text-lg font-semibold">15-minute focus</h2>
            <p className="mt-2 text-sm text-(--muted)">
              Sessions are designed for tight schedules, turning short bursts into a high-efficiency curriculum with
              clear progress.
            </p>
          </article>
          <article className="rounded-3xl border border-(--border) bg-(--card) p-6 shadow-[0_20px_40px_rgba(4,8,18,0.2)] backdrop-blur">
            <h2 className="text-lg font-semibold">Beyond travel phrases</h2>
            <p className="mt-2 text-sm text-(--muted)">
              Vocabulary is filtered toward advanced professional phrasing and complex sentence structures so learning
              scales past basic fluency.
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}

export default App;
