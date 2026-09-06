import type { ReactNode } from 'react';

interface IconProps {
  className?: string;
}
function Frame({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

/** A single steep Thai gable; simplified for legibility in the small brand mark. */
export function ThaiTempleIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <g strokeWidth="1.8">
        <path d="M24 5C21 15 15 23 6 28L8 31H40L42 28C33 23 27 15 24 5Z" fill="currentColor" fillOpacity=".12" />
        <path d="M12 28C17 24 21 19 24 12C27 19 31 24 36 28" />
        <path d="M6 28L4 23M42 28L44 23M24 5V2" />
        <path d="M11 32V40M16 32V40M32 32V40M37 32V40" />
        <path d="M21 40V35Q21 32 24 30Q27 32 27 35V40" fill="currentColor" fillOpacity=".18" />
        <path d="M24 22L26 25L24 27L22 25Z" fill="currentColor" stroke="none" />
        <path d="M8 41H40M5 45H43" />
      </g>
    </Frame>
  );
}

/** Open Thai sala pavilion, with a gabled roof and slender columns. */
export function ThaiPavilionIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M24 7Q20 19 5 30H43Q28 19 24 7ZM12 27Q20 20 24 14Q28 20 36 27M5 30L3 24M43 30L45 24" />
      <path d="M11 30V41M17 30V41M31 30V41M37 30V41M8 42H40M5 46H43" />
    </Frame>
  );
}

/** Folded manuscript inspired by Thai samut khoi books. */
export function ThaiManuscriptIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M5 12L17 8L31 13L43 9V36L31 40L17 35L5 39ZM17 8V35M31 13V40M8 44L18 40L31 44L43 40" />
      <path d="M9 20L13 19M9 26L13 25M21 20L27 22M21 27L27 29M35 19L39 18M35 25L39 24" />
    </Frame>
  );
}

export function ThaiLotusIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M24 6C12 17 12 27 24 36C36 27 36 17 24 6ZM16 20C11 15 6 14 3 14C3 29 10 37 24 39C38 37 45 29 45 14C42 14 37 15 32 20" />
      <path d="M11 33C6 30 3 31 2 31C7 42 16 44 24 39C32 44 41 42 46 31C45 31 42 30 37 33M24 16V28" />
    </Frame>
  );
}

export function ThaiBellIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M24 4L20 10H28L24 4ZM24 10V14M17 17Q24 12 31 17L34 33L39 37H9L14 33ZM12 41H36M22 41V45H26V41M7 16L4 22M41 16L44 22" />
      <path d="M19 23H29M17 31H31" />
    </Frame>
  );
}

export function ThaiScriptIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M8 7H40V41H8ZM12 3H36M12 45H36" />
      <path d="M18 31V20C18 13 31 13 31 20V32M18 24C26 24 26 17 21 17C17 17 16 22 20 22" />
    </Frame>
  );
}

/** Thai numeral one, with an architectural frame. */
export function ThaiNumberIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M8 9H40V39H8M12 5H36M12 43H36" />
      <path d="M31 26C31 14 15 14 15 26C15 34 31 34 31 26C31 21 22 20 22 26C22 29 26 29 26 26" />
    </Frame>
  );
}

/** Curved leaf motif inspired by Thai kanok ornament. */
export function ThaiFlameIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M29 4C31 17 13 17 17 29C10 27 9 23 10 19C1 32 12 44 24 43C40 42 43 27 35 18C36 28 30 30 27 28C22 22 37 17 29 4Z" />
      <path d="M24 42C14 33 25 31 24 25M14 46H34" />
    </Frame>
  );
}
