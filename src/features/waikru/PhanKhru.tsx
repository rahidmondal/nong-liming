import { motion } from 'framer-motion';
import { ThaiLotusIcon as Flower } from '@/components/ThaiIcons';
import { useWaiKru } from './useWaiKru';

export function PhanKhru() {
  const { inventory } = useWaiKru();

  const basePath = import.meta.env.BASE_URL;

  const offerings = [
    {
      id: 'dokKem',
      label: 'Dok Kem (Ixora)',
      desc: 'Sharp wit & intelligence',
      icon: (
        <img
          src={`${basePath}icons/dok_kem.jpg`}
          alt="Dok Kem"
          className="w-10 h-10 rounded-full shadow-sm object-cover"
        />
      ),
      count: inventory.dokKem,
      bg: 'bg-red-500/10 dark:bg-red-400/20',
      border: 'border-red-500/20 dark:border-red-400/30',
    },
    {
      id: 'yaPraek',
      label: 'Ya Praek (Grass)',
      desc: 'Patience & perseverance',
      icon: (
        <img
          src={`${basePath}icons/ya_praek.jpg`}
          alt="Ya Praek"
          className="w-10 h-10 rounded-full shadow-sm object-cover"
        />
      ),
      count: inventory.yaPraek,
      bg: 'bg-purple-500/10 dark:bg-purple-400/20',
      border: 'border-purple-500/20 dark:border-purple-400/30',
    },
    {
      id: 'khaoTok',
      label: 'Khao Tok (Rice)',
      desc: 'Discipline to bloom',
      icon: (
        <img
          src={`${basePath}icons/khao_tok.jpg`}
          alt="Khao Tok"
          className="w-10 h-10 rounded-full shadow-sm object-cover"
        />
      ),
      count: inventory.khaoTok,
      bg: 'bg-purple-500/10 dark:bg-purple-400/20',
      border: 'border-purple-500/20 dark:border-purple-400/30',
    },
    {
      id: 'dokMaKhue',
      label: 'Dok Ma Khue',
      desc: 'Humility & respect',
      icon: (
        <img
          src={`${basePath}icons/dok_ma_khue.jpg`}
          alt="Dok Ma Khue"
          className="w-10 h-10 rounded-full shadow-sm object-cover"
        />
      ),
      count: inventory.dokMaKhue,
      bg: 'bg-purple-500/10 dark:bg-purple-400/20',
      border: 'border-purple-500/20 dark:border-purple-400/30',
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
            <div className="relative z-10 p-2 bg-background/50 rounded-full shadow-sm border border-border">
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
