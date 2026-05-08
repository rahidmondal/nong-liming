import { motion } from 'framer-motion';
import { Flower, Leaf, Sparkles, Star } from 'lucide-react';
import { useWaiKru } from './useWaiKru';

export function PhanKhru() {
  const { inventory } = useWaiKru();

  const offerings = [
    {
      id: 'dokKem',
      label: 'Dok Kem (Ixora)',
      desc: 'Sharp wit & intelligence',
      icon: <Flower className="w-6 h-6 text-red-500" />,
      count: inventory.dokKem,
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
    },
    {
      id: 'yaPraek',
      label: 'Ya Praek (Bermuda Grass)',
      desc: 'Resilience & patience',
      icon: <Leaf className="w-6 h-6 text-green-500" />,
      count: inventory.yaPraek,
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
    },
    {
      id: 'khaoTok',
      label: 'Khao Tok (Popped Rice)',
      desc: 'Discipline & blooming',
      icon: <Sparkles className="w-6 h-6 text-amber-500" />,
      count: inventory.khaoTok,
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      id: 'dokMaKhue',
      label: 'Dok Ma Khue (Eggplant Flower)',
      desc: 'Humility & respect',
      icon: <Star className="w-6 h-6 text-purple-500" />,
      count: inventory.dokMaKhue,
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
  ];

  return (
    <div className="p-6 bg-card rounded-2xl border border-border shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Flower className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Phan Khru Offerings</h2>
          <p className="text-sm text-muted-foreground">Traditional symbols of a student's readiness to learn</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {offerings.map(offering => (
          <motion.div
            key={offering.id}
            whileHover={{ y: -2 }}
            className={`p-4 rounded-xl border ${offering.border} ${offering.bg} flex flex-col items-center text-center gap-2 relative overflow-hidden`}
          >
            <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none scale-150">
              {offering.icon}
            </div>
            <div className="relative z-10 p-3 bg-background rounded-full shadow-sm">
              {offering.icon}
            </div>
            <div className="relative z-10 mt-1">
              <p className="text-sm font-bold text-foreground">{offering.label}</p>
              <p className="text-[10px] text-muted-foreground mb-2 leading-tight px-1">{offering.desc}</p>
              <div className="inline-block px-3 py-1 bg-background rounded-full border border-border text-xs font-bold font-mono text-primary">
                {offering.count}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
