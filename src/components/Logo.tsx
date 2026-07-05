import React from 'react';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-labelledby="title" className={className}>
      <title id="title">Nong Li Ming Mascot</title>
      
      {/* Outer glow ring */}
      <circle cx="256" cy="256" r="200" fill="none" className="stroke-primary/40 dark:stroke-primary/50" strokeWidth="4"/>
      {/* Inner decorative ring */}
      <circle cx="256" cy="256" r="160" fill="none" className="stroke-primary/30 dark:stroke-primary/40" strokeWidth="2"/>
      {/* Glowing background circle */}
      <circle cx="256" cy="256" r="130" className="fill-primary/10 dark:fill-primary/20" />
      
      {/* Main card background */}
      <rect x="116" y="116" width="280" height="280" rx="48" className="fill-card drop-shadow-xl" />
      <rect x="116" y="116" width="280" height="280" rx="48" fill="none" className="stroke-border" strokeWidth="2" />
      
      {/* Decorative corner accents */}
      <path d="M140 140 L140 180 Q140 140 180 140 Z" className="fill-primary/50" />
      <path d="M372 140 L332 140 Q372 140 372 180 Z" className="fill-accent/50" />
      <path d="M140 372 L140 332 Q140 372 180 372 Z" className="fill-accent/50" />
      <path d="M372 372 L332 372 Q372 372 372 332 Z" className="fill-primary/50" />
      
      {/* Thai letter น */}
      <text
        x="256"
        y="300"
        fontFamily="Sarabun, 'Noto Sans Thai', sans-serif"
        fontSize="160"
        fontWeight="700"
        textAnchor="middle"
        className="fill-primary"
      >น</text>
      
      {/* Subtle underline decoration */}
      <rect x="186" y="340" width="140" height="4" rx="2" className="fill-primary/60"/>
    </svg>
  );
}
