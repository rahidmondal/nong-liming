/** Original illustration inspired by the user's temple, carved-roof and terraced-base references. */
export function PalaceArtwork({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 260" fill="none" aria-hidden="true" className={className}>
      {/* Receding diagonal gables. */}
      <path d="M96 42C88 79 69 102 31 125L46 150L123 135L143 103Z" fill="#B994DA" stroke="#F5E7FF" strokeWidth="2.5" />
      <path
        d="M224 42C232 79 251 102 289 125L274 150L197 135L177 103Z"
        fill="#B994DA"
        stroke="#F5E7FF"
        strokeWidth="2.5"
      />
      <path d="M122 27C111 76 92 100 48 135L74 158L144 132L162 91Z" fill="#D8BDEB" stroke="#FFF3FF" strokeWidth="3" />
      <path
        d="M198 27C209 76 228 100 272 135L246 158L176 132L158 91Z"
        fill="#D8BDEB"
        stroke="#FFF3FF"
        strokeWidth="3"
      />
      {/* Pale facade and recessed colonnades. */}
      <path d="M52 142H268V216H52Z" fill="#D9C6E5" />
      <path d="M68 150H252V211H68Z" fill="#755095" />
      <path d="M84 151V211M102 151V211M218 151V211M236 151V211" stroke="#F4E7F6" strokeWidth="7" />
      <path d="M61 142H259M61 210H259" stroke="#FFF4F8" strokeWidth="5" />
      {/* Curved pediment with ornament concentrated on its edges. */}
      <path
        d="M160 29C151 68 127 101 91 132C79 144 68 149 58 148L54 137C51 151 57 161 75 163H245C263 161 269 151 266 137L262 148C252 149 241 144 229 132C193 101 169 68 160 29Z"
        fill="#FFF5FB"
        stroke="#F5D48B"
        strokeWidth="2.5"
      />
      <path d="M160 53C146 93 126 117 102 139L87 150H233L218 139C194 117 174 93 160 53Z" fill="#A27AC1" />
      <path
        d="M160 71C148 103 132 121 111 140H209C188 121 172 103 160 71Z"
        fill="#70469A"
        stroke="#F7E7F5"
        strokeWidth="2"
      />
      <path
        d="M160 83C157 94 148 98 148 106C148 115 157 115 160 125C163 115 172 115 172 106C172 98 163 94 160 83Z"
        fill="#FFE0A1"
      />
      <path d="M133 122L138 128L133 134L128 128ZM187 122L192 128L187 134L182 128Z" fill="#E9D8F4" />
      {/* Small flame-shaped edge carvings. */}
      <path
        d="M140 74Q129 67 137 57M128 94Q113 91 119 79M112 114Q96 112 99 99M94 135Q80 133 80 121M180 74Q191 67 183 57M192 94Q207 91 201 79M208 114Q224 112 221 99M226 135Q240 133 240 121"
        stroke="#FFF1FC"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M105 75Q95 69 99 61M92 94Q79 89 82 80M79 110Q64 107 68 98M215 75Q225 69 221 61M228 94Q241 89 238 80M241 110Q256 107 252 98"
        stroke="#E9D5F8"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Broad pointed entrance arch. */}
      <path
        d="M117 215V178C117 162 135 150 160 131C185 150 203 162 203 178V215Z"
        fill="#FFF3FA"
        stroke="#E9C986"
        strokeWidth="2.5"
      />
      <path d="M132 214V182C132 170 145 162 160 149C175 162 188 170 188 182V214Z" fill="#8253A6" />
      <path d="M143 213V184L160 166L177 184V213Z" fill="#38294D" />
      <path d="M160 178V211M151 187V203M169 187V203" stroke="#DDBA77" strokeWidth="2" />
      <path d="M122 185V212M198 185V212" stroke="#DAC4E6" strokeWidth="3" />
      {/* Wide terrace and balustrade from the stepped plinth references. */}
      <path d="M44 216H276V222H44Z" fill="#FFF0F8" />
      <path d="M33 226H287V232H33Z" fill="#E2C8F0" />
      <path d="M23 237H297V242H23Z" fill="#B993D5" />
      <path
        d="M31 206H109M211 206H289M39 198V215M53 198V215M67 198V215M81 198V215M95 198V215M225 198V215M239 198V215M253 198V215M267 198V215M281 198V215"
        stroke="#F6E7F6"
        strokeWidth="3"
      />
      <path d="M135 219H185M129 229H191M122 239H198" stroke="#F5D48B" strokeWidth="2.5" />
      <path d="M14 249H306" stroke="#E9D6F7" opacity=".4" strokeWidth="2" />
    </svg>
  );
}
