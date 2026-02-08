# Nong LiMing

<img src="public/pwa-icon.svg" alt="Nong LiMing Logo" width="128" height="128">

> **Your Personal Thai Learning Partner** 🇹🇭

Nong LiMing is a friendly, focused "Indic-Thai Bridge" PWA designed to accelerate Thai language acquisition. It leverages Indic-script phonetics for sound accuracy and English SVO grammar for sentence logic, turning 15-minute study blocks into meaningful progress toward real-world fluency.

## ✨ Features

- **Flashcards**: Spaced repetition system (SRS) for optimized vocabulary retention. `[In Development]`
- **Offline Ready**: Full PWA support for learning anywhere, anytime. `[Ready]`
- **Varnamala Grid**: Thai consonants mapped to Hindi/Sanskrit equivalents with class-based styling (Mid, High, Low) for intuitive tone mastery. `[Planned]`
- **Sentence Builder**: Construct Thai sentences using integrated vocabulary and grammar rules. `[Planned]`

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/) (Vite) with [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Database**: [Dexie.js](https://dexie.org/) (IndexedDB)
- **Icons**: [Lucide React](https://lucide.dev/)
- **PWA**: [Vite PWA](https://vite-pwa-org.netlify.app/)
- **Typography**: [Sarabun](https://fonts.google.com/specimen/Sarabun) (Google Fonts)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS)
- [pnpm](https://pnpm.io/)

### Installation

```bash
# Clone the repository
git clone https://github.com/rahidmondal/nong-liming.git

# Navigate to project directory
cd nong-liming

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

````

### Available Scripts

- `pnpm dev`: Start the development server.
- `pnpm build`: Build the application for production.
- `pnpm preview`: Locally preview the production build.
- `pnpm lint`: Run ESLint to check code quality.
- `pnpm format`: Format code using Prettier.

## 📂 Architecture

```text
src/
├── components/   # Shared UI components
├── data/         # Static data (consonants, vocabulary)
├── features/     # Feature-based modules (landing, decks, etc.)
├── hooks/        # Custom React hooks
├── lib/          # Utility libraries and configurations
├── store/        # Zustand state stores
└── types/        # TypeScript type definitions
```

## 📄 License

Copyright © 22026 Rahid Mondal. All rights reserved.
License details will be updated upon official release.

````
