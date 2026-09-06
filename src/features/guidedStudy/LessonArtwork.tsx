import type { Mission } from './missionTypes';

/** Small, decorative SVG scenes stay crisp on phones and work offline. */
export function LessonArtwork({ track, className = '' }: { track: Mission['track']; className?: string }) {
  return (
    <svg viewBox="0 0 280 210" aria-hidden="true" className={className} fill="none">
      <circle cx="210" cy="40" r="18" fill="#F7C66D" />
      <path d="M25 169C50 151 60 174 83 171C117 165 129 182 164 174C195 167 225 149 262 169V193H25Z" fill="#BBA3D0" />
      <path
        d="M35 156C27 135 30 108 38 87M36 135C15 127 18 113 36 119M35 112C49 94 58 103 41 123M40 94C28 78 34 72 43 79"
        stroke="#43826B"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {track === 'conversation' ? (
        <>
          <path d="M70 91H221V178H70Z" fill="#FFFBED" stroke="#49305E" strokeWidth="3" />
          <path d="M63 87L78 53H213L228 87Z" fill="#ED9E82" stroke="#49305E" strokeWidth="3" strokeLinejoin="round" />
          {[70, 108, 146, 184].map(x => (
            <path
              key={x}
              d={`M${String(x)} 87H${String(x + 37)}V96Q${String(x + 18)} 113 ${String(x)} 96Z`}
              fill={x === 108 || x === 184 ? '#F7E0AF' : '#D47765'}
              stroke="#49305E"
              strokeWidth="2"
            />
          ))}
          <rect x="85" y="121" width="121" height="36" rx="3" fill="#E4D9F1" />
          <path d="M78 159H214" stroke="#49305E" strokeWidth="5" strokeLinecap="round" />
          <rect x="160" y="128" width="22" height="27" rx="5" fill="#FFFFFF" stroke="#49305E" strokeWidth="2" />
          <path
            d="M182 133H188Q195 143 182 147M168 121Q161 115 169 109"
            stroke="#49305E"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <rect x="95" y="61" width="96" height="25" rx="6" fill="#FFF7DD" />
          <text x="143" y="79" textAnchor="middle" fill="#49305E" fontSize="15" fontFamily="Sarabun, sans-serif">
            สวัสดี
          </text>
          <path
            d="M220 33Q249 22 262 45Q269 64 248 74L235 89L236 72Q213 69 214 52Q212 42 220 33Z"
            fill="#FFF7DD"
            stroke="#49305E"
            strokeWidth="2"
          />
          <circle cx="232" cy="50" r="2.5" fill="#49305E" />
          <circle cx="244" cy="50" r="2.5" fill="#49305E" />
          <circle cx="256" cy="50" r="2.5" fill="#49305E" />
        </>
      ) : track === 'script' ? (
        <>
          <g transform="rotate(-8 140 112)">
            <rect x="72" y="44" width="141" height="141" rx="12" fill="#ED9E82" stroke="#49305E" strokeWidth="3" />
            <rect x="63" y="34" width="141" height="141" rx="12" fill="#FFFBEF" stroke="#49305E" strokeWidth="3" />
            <path d="M88 36V174M100 78H188M100 112H188M100 147H188" stroke="#E2D5EC" strokeWidth="2" />
            {[56, 91, 127, 156].map(y => (
              <path key={y} d={`M57 ${String(y)}H72`} stroke="#49305E" strokeWidth="5" strokeLinecap="round" />
            ))}
            <text x="143" y="104" textAnchor="middle" fill="#49305E" fontSize="52" fontFamily="Sarabun, sans-serif">
              ก
            </text>
            <text x="143" y="150" textAnchor="middle" fill="#8865B1" fontSize="24" fontFamily="Sarabun, sans-serif">
              มา
            </text>
          </g>
          <g transform="rotate(29 222 121)">
            <rect x="215" y="67" width="13" height="93" rx="3" fill="#F7C66D" stroke="#49305E" strokeWidth="2" />
            <path d="M215 160L222 179L228 160" fill="#F5DDAC" stroke="#49305E" strokeWidth="2" />
            <path d="M219 172L222 179L225 172" fill="#49305E" />
          </g>
        </>
      ) : (
        <>
          <rect x="71" y="42" width="142" height="137" rx="20" fill="#FFFAEB" stroke="#49305E" strokeWidth="3" />
          <path d="M88 102V84Q88 53 142 53Q196 53 196 84V102" stroke="#ED9E82" strokeWidth="10" strokeLinecap="round" />
          <rect x="81" y="88" width="19" height="41" rx="8" fill="#ED9E82" stroke="#49305E" strokeWidth="2" />
          <rect x="184" y="88" width="19" height="41" rx="8" fill="#ED9E82" stroke="#49305E" strokeWidth="2" />
          {[15, 27, 45, 29, 17].map((height, i) => (
            <path
              key={i}
              d={`M${String(116 + i * 13)} ${String(110 - height / 2)}V${String(110 + height / 2)}`}
              stroke="#8865B1"
              strokeWidth="6"
              strokeLinecap="round"
            />
          ))}
          <path
            d="M94 153H109M118 158L131 147M139 146L152 158M162 159L174 145M183 154L194 147"
            stroke="#49305E"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="M231 86V56L248 52V80" stroke="#49305E" strokeWidth="3" />
          <ellipse cx="226" cy="87" rx="7" ry="5" fill="#ED9E82" />
          <ellipse cx="243" cy="81" rx="7" ry="5" fill="#ED9E82" />
        </>
      )}
      <path d="M48 51V63M42 57H54M239 126V138M233 132H245" stroke="#F7C66D" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="143" cy="190" rx="93" ry="5" fill="#49305E" opacity=".12" />
    </svg>
  );
}
