const paths = {
  home: (
    <>
      <path d="m3 10 9-7 9 7" />
      <path d="M5 9v12h14V9M9 21v-7h6v7" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 3v4m10-4v4M3 10h18" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  filter: (
    <>
      <path d="M3 6h18M3 12h18M3 18h18" />
      <circle cx="8" cy="6" r="2" />
      <circle cx="16" cy="12" r="2" />
      <circle cx="9" cy="18" r="2" />
    </>
  ),
  notes: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M8 3v18m4-6 1-4 5-4 2 2-5 5-3 1Z" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="9" r="3" />
      <path d="M5 19c1-6 13-6 14 0" />
    </>
  ),
  logout: (
    <>
      <path d="M10 4h10v16H10m4-8H2m4-4-4 4 4 4" />
    </>
  ),
  settings: (
    <>
      <path d="m9 3 1-1h4l1 4 4 1 3 3-3 3 1 4-4 2-3-2-4 2-3-3 1-4-3-3 3-3 2-3Z" />
      <circle cx="12" cy="11" r="3" />
    </>
  ),
  back: <path d="m15 4-8 8 8 8" />,
  close: <path d="m5 5 14 14M19 5 5 19" />,
  github: (
    <>
      <path d="M9 21c-5 1-5-3-7-3m14 4v-4c0-1-1-2-1-2 5-1 6-8 3-10 0-1 0-3-1-3l-4 2H9L5 3C4 3 4 5 4 6c-3 3-2 9 3 10-1 1-1 2-1 3v3" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 10v7m0-10v.1m4 10v-7m0 3c0-4 6-4 6 0v4" />
    </>
  ),
};
export default function Icon({ name, size = 22, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name] || paths.user}
    </svg>
  );
}
