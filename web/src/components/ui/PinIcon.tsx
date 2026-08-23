/**
 * The 16px location marker DESIGN-SYSTEM ch. 6.1 puts before a card's
 * location line.
 *
 * Decorative, so it is hidden from assistive technology: the place name sits
 * right beside it and says the same thing in words. It lives here rather than
 * inside a card because two different cards draw it, and two copies of one
 * path is how they stop being the same pin.
 */
export function PinIcon() {
  return (
    <svg
      aria-hidden
      className="flex-none"
      fill="none"
      height="16"
      stroke="currentColor"
      viewBox="0 0 16 16"
      width="16"
    >
      <path
        d="M8 1.5a4.7 4.7 0 0 0-4.7 4.7c0 3.5 4.7 8.3 4.7 8.3s4.7-4.8 4.7-8.3A4.7 4.7 0 0 0 8 1.5z"
        strokeWidth="1.3"
      />
      <circle cx="8" cy="6.2" fill="currentColor" r="1.6" stroke="none" />
    </svg>
  );
}
