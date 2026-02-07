import { consonants } from '../../data/consonants';
import { ConsonantCard } from './ConsonantCard';

export function AlphabetGrid() {
  return (
    <section className="grid gap-4">
      <h2 className="text-2xl font-semibold">वर्णमाला — Thai Consonants</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {consonants.map(c => (
          <ConsonantCard key={c.id} consonant={c} />
        ))}
      </div>
    </section>
  );
}
