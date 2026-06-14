import Link from "next/link";

interface PrimaryButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "solid" | "outline";
  icon?: boolean;
  className?: string;
}

export default function PrimaryButton({
  href,
  onClick,
  children,
  type = "button",
  disabled,
  variant = "solid",
  icon = true,
  className = "",
}: PrimaryButtonProps) {
  const base =
    variant === "solid"
      ? "bg-groen-primary text-white shadow-lg shadow-primary/20 hover:bg-primary"
      : "border-2 border-groen-primary bg-white text-groen-deep hover:bg-groen-mint";

  const inner = (
    <>
      <span className="text-base font-bold">{children}</span>
      {icon && variant === "solid" && (
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/95 shadow-sm">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path
              d="M4 9H14M14 9L10 5M14 9L10 13"
              stroke="#7C3AED"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </>
  );

  const classes = `group flex w-full items-center justify-between rounded-full py-4 pl-7 pr-2 transition active:scale-[0.99] disabled:opacity-50 ${base} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {inner}
    </button>
  );
}

export function ArrowButton({
  children,
  onClick,
  href,
  outline,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  outline?: boolean;
}) {
  return (
    <PrimaryButton
      href={href}
      onClick={onClick}
      variant={outline ? "outline" : "solid"}
      icon={!outline}
    >
      {children}
    </PrimaryButton>
  );
}
