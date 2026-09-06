import { ThaiManuscriptIcon as BookOpenText } from '@/components/ThaiIcons';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SmartText } from '@/components/SmartText';
import { PracticeSaveButton } from '@/components/PracticeSaveButton';

const SAMPLE_STORY = `กาลครั้งหนึ่งนานมาแล้ว มีเด็กผู้ชายคนหนึ่งชื่อ นิก เขาชอบไปโรงเรียนมาก
ทุกวันนิกจะตื่นเช้า กินข้าว แล้วเดินไปโรงเรียน
ที่โรงเรียน นิกได้เรียนหนังสือและเล่นสนุกกับเพื่อนๆ`;

export function ReadingPage() {
  return (
    <div className="min-h-full flex flex-col p-6 max-w-2xl mx-auto">
      <header className="flex items-center gap-3 py-4 mb-2">
        <Link to="/" className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors" aria-label="Go back">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpenText className="w-6 h-6 text-primary" />
          Smart Reading
        </h1>
      </header>

      <main className="flex-1 flex flex-col gap-4">
        <div className="p-6 bg-card rounded-2xl border border-border shadow-sm">
          <h2 className="text-xl font-bold text-primary font-sarabun mb-4">เรื่องของนิก (Nick's Story)</h2>
          <SmartText text={SAMPLE_STORY} className="text-2xl font-sarabun whitespace-pre-wrap" />
          <div className="mt-6">
            <PracticeSaveButton kind="reading" contentKey="nicks-story" label="Nick’s story" />
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-4 text-center">
          Tap on any highlighted word to view its meaning and add it to your flashcards.
        </p>
      </main>
    </div>
  );
}
