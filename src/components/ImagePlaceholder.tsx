interface ImagePlaceholderProps {
  /** Describes the photo AWDEA should supply here. */
  label: string;
  className?: string;
}

/**
 * Stand-in for photography AWDEA still needs to source. Deliberately not a
 * stock photo — the previous images misrepresented the people they serve.
 */
const ImagePlaceholder = ({ label, className = '' }: ImagePlaceholderProps) => (
  <div
    role="img"
    aria-label={`Placeholder: ${label}`}
    className={`flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-[var(--color-brand)]/25 bg-[var(--color-mist)] p-6 text-center ${className}`}
  >
    <svg
      width="34"
      height="34"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="text-violet-200"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="8.5" cy="9.5" r="1.8" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M4 17.5l4.8-4.2 3.4 3 3-2.4 4.8 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <span className="max-w-[26ch] text-sm font-medium text-[var(--color-body)]">
      {label}
    </span>
  </div>
);

export default ImagePlaceholder;
