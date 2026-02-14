interface ToneDiagramProps {
  type: string;
}

const TONE_COLORS: Record<string, string> = {
  mid: '#3b82f6',
  low: '#22c55e',
  falling: '#ef4444',
  high: '#f59e0b',
  rising: '#a855f7',
};

const TONE_PATHS: Record<string, string> = {
  // Flat line in the middle
  mid: 'M 10,30 L 110,30',
  // Line going from mid to low
  low: 'M 10,25 C 40,25 70,40 110,45',
  // Line going high then dropping
  falling: 'M 10,20 C 30,15 50,15 65,20 C 80,25 95,40 110,48',
  // Line going from mid up to high
  high: 'M 10,40 C 40,35 70,20 110,15',
  // Line dipping then rising
  rising: 'M 10,25 C 30,35 50,40 65,38 C 80,35 95,22 110,15',
};

export function ToneDiagram({ type }: ToneDiagramProps) {
  const color = TONE_COLORS[type] ?? '#888';
  const path = TONE_PATHS[type] ?? TONE_PATHS.mid;

  return (
    <svg viewBox="0 0 120 60" className="w-full h-12" aria-label={`${type} tone contour`} role="img">
      {/* Grid lines for pitch reference */}
      <line
        x1="10"
        y1="15"
        x2="110"
        y2="15"
        stroke="var(--muted-foreground)"
        strokeOpacity="0.15"
        strokeDasharray="2"
      />
      <line
        x1="10"
        y1="30"
        x2="110"
        y2="30"
        stroke="var(--muted-foreground)"
        strokeOpacity="0.15"
        strokeDasharray="2"
      />
      <line
        x1="10"
        y1="45"
        x2="110"
        y2="45"
        stroke="var(--muted-foreground)"
        strokeOpacity="0.15"
        strokeDasharray="2"
      />

      {/* Pitch labels */}
      <text x="2" y="18" fontSize="6" fill="var(--muted-foreground)" opacity="0.5">
        H
      </text>
      <text x="2" y="33" fontSize="6" fill="var(--muted-foreground)" opacity="0.5">
        M
      </text>
      <text x="2" y="48" fontSize="6" fill="var(--muted-foreground)" opacity="0.5">
        L
      </text>

      {/* Tone contour line */}
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />

      {/* Start dot */}
      <circle
        cx={/M\s*([\d.]+)/.exec(path)?.[1] ?? '10'}
        cy={/M\s*[\d.]+,([\d.]+)/.exec(path)?.[1] ?? '30'}
        r="3"
        fill={color}
      />
    </svg>
  );
}
