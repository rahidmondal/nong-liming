import { ThaiTempleIcon as Map } from '@/components/ThaiIcons';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CourseHub } from '@/features/guidedStudy/CourseHub';

export function UnalomePage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <header className="flex items-center gap-3 py-4 mb-4">
        <Link to="/" aria-label="Go back" className="p-2 rounded-xl hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Map className="w-6 h-6 text-primary" />
          Your learning path
        </h1>
      </header>
      <CourseHub />
    </div>
  );
}
