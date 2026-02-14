# Nong LiMing

<img src="public/pwa-icon.svg" alt="Nong LiMing Logo" width="128" height="128">

> **Your friendly Thai learning companion** 🇹🇭

Nong LiMing helps you learn Thai in short, focused sessions. It uses familiar sounds to guide pronunciation and simple sentence structure to build confidence, so even 15 minutes can feel productive.

## ✨ Features

- **Full View**: Interactive reference for Consonants, Vowels, Numbers, and Tones with TTS audio. `[New - Since v0.4.0]`
- **Flashcards**: Review words with smart scheduling. `[Available - Since v0.3.0]`
- **Offline Ready**: Learn anywhere, even without a connection. `[Ready - Since v0.3.0]`
- **Word Builder**: Practice building syllables with instant validation. `[Available - Since v0.5.0]`
- **Writing Pad**: Practice handwriting with AI-powered OCR and speech synthesis. `[New - Since v0.5.0]`

### 📚 Full View Reference

A comprehensive interactive guide to the Thai language system:

- **Consonants**: All 44 consonants grouped by class (Mid, High, Low) with color-coded cards and Indic equivalents.
- **Vowels**: Complete set of 32 vowels (Monophthongs, Diphthongs) and special vowels.
- **Numbers**: From 0 to Billion, including pronunciation guides.
- **Tones**: Visual SVG diagrams for all 5 tones (Mid, Low, Falling, High, Rising) with audio samples.
- **Text-to-Speech**: Native browser TTS integration for instant pronunciation checking.

### 🏗️ Word Builder

Construct valid Thai syllables with a guided interface:

- **Structure Validation**: Real-time feedback on syllable structure (Initial Consonant + Vowel requirement).
- **Slot System**: Dedicates slots for Initial Consonant, Vowel, Tone Mark, and Final Consonant.
- **Smart Filtering**: Shows relevant characters for each slot with visual grouping.
- **Pronunciation**: Listen to your constructed syllable with TTS.

### ✍️ Writing Pad

Practice your Thai handwriting with instant feedback:

- **AI Recognition**: Uses Tesseract.js (LSTM) to recognize handwritten Thai characters.
- **Canvas Interface**: Smooth drawing experience with pressure sensitivity mimicry.
- **Confidence Scoring**: Visual indicators for recognition confidence.
- **Speech Synthesis**: Hear the recognized text pronounced instantly.

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
- **Database**: [Dexie.js](https://dexie.org/)
- **OCR**: [Tesseract.js](https://tesseract.projectnaptha.com/)
- **PWA**: [Vite PWA](https://vite-pwa-org.netlify.app/)
- **Icons**: [Lucide](https://lucide.dev/)
- **Font**: [Sarabun](https://fonts.google.com/specimen/Sarabun)

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

### Available Scripts

- `pnpm dev`: Start the development server.
- `pnpm build`: Build the application for production.
- `pnpm preview`: Locally preview the production build.
- `pnpm lint`: Run ESLint to check code quality.
- `pnpm format`: Format code using Prettier.

## 📄 License

Copyright © 2026 Rahid Mondal. All rights reserved.
License details will be updated upon official release.

> [![Version](https://img.shields.io/static/v1?label=version&message=0.5.0&color=blue)](https://github.com/rahidmondal/nong-liming)
