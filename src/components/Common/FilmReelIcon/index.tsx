import type { SVGProps } from 'react';

const FilmReelIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="m4.25 6.75 15.5-2.5.7 4.2-15.5 2.5-0.7-4.2Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="m8.1 6.13.7 4.2m4.05-4.9.7 4.2m4.05-4.9.7 4.2"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <rect
      x="5.25"
      y="11.25"
      width="13.5"
      height="7.25"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path
      d="M8 13h8M8 15.5h5"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

export default FilmReelIcon;
