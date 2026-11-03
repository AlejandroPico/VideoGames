export default function AutoThemeIcon({ size = 21 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="8.2" />
      <path
        d="M12 3.8a8.2 8.2 0 0 0 0 16.4Z"
        fill="currentColor"
        stroke="none"
      />
      <path d="M12 3.8v16.4" />
    </svg>
  );
}
