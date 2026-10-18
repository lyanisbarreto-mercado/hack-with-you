import { GearFill, HouseFill, CalendarFill, Search, FilterLeft, Journal, BoxArrowLeft } from "react-bootstrap-icons"

const bootstrapIcons = {
  home: HouseFill,
  calendar: CalendarFill,
  search: Search,
  filter: FilterLeft,
  notes: Journal,
  logout: BoxArrowLeft,
  settings: GearFill,
};

const paths = {
  user: (
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="9" r="3" />
      <path d="M5 19c1-6 13-6 14 0" />
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
  const BootstrapIcon = bootstrapIcons[name];
  if (BootstrapIcon) {
    return <BootstrapIcon size={size} aria-hidden="true" focusable="false" {...props} />;
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      aria-hidden="true"
      {...props}
    >
      {paths[name] || paths.user}
    </svg>
  );
}
