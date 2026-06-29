"use client";

import ToonloraLogo from "@/components/ui/ToonloraLogo";

interface LP3ShellProps {
  stepLabel?: string;
  progress?: number;
  showBack?: boolean;
  onBack?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showLogo?: boolean;
  compactLogo?: boolean;
  /** Extra bottom padding when the page has no shell footer (e.g. auto-advance steps). */
  contentBottomPadding?: "none" | "default";
}

function LP3FooterDock({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40">
      <div className="pointer-events-auto border-t border-[#E7DDCC]/80 bg-[#F6F1E7]/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(10,22,40,0.06)] backdrop-blur-md">
        <div className="mx-auto w-full max-w-lg space-y-3">{children}</div>
      </div>
    </div>
  );
}

export default function LP3Shell({
  stepLabel,
  progress = 0,
  showBack = false,
  onBack,
  children,
  footer,
  showLogo = false,
  compactLogo = false,
  contentBottomPadding = "default",
}: LP3ShellProps) {
  const bottomPad = footer
    ? "pb-[calc(6.5rem+env(safe-area-inset-bottom))]"
    : contentBottomPadding === "default"
      ? "pb-4"
      : "pb-0";

  return (
    <div className="lp3-funnel relative flex h-[100dvh] flex-col overflow-hidden bg-[#F6F1E7] text-[#0A1628]">
      {(stepLabel || showBack) && (
        <header className="shrink-0 px-4 pt-3">
          <div className="mx-auto flex max-w-lg items-center gap-3">
            {showBack ? (
              <button
                type="button"
                onClick={onBack}
                className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#0A1628]/70 hover:bg-[#0A1628]/5"
                aria-label="Back"
              >
                ←
              </button>
            ) : (
              <div className="w-9" />
            )}
            <p className="flex-1 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[#2F80ED]">
              {stepLabel}
            </p>
            <div className="w-9" />
          </div>
          <div className="mx-auto mt-2 h-1 max-w-lg overflow-hidden rounded-full bg-[#0A1628]/10">
            <div
              className="h-full rounded-full bg-[#2F80ED] transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </header>
      )}

      {showLogo ? (
        <div
          className={`flex shrink-0 justify-center px-4 ${compactLogo ? "pt-1" : "pt-3"}`}
        >
          <ToonloraLogo variant="compact" iconSize={compactLogo ? 30 : 26} />
        </div>
      ) : null}

      <main
        className={`mx-auto flex w-full min-h-0 max-w-lg flex-1 flex-col overflow-y-auto overscroll-y-none px-4 ${compactLogo ? "pt-2" : "pt-3"} ${bottomPad}`}
      >
        {children}
      </main>

      {footer ? <LP3FooterDock>{footer}</LP3FooterDock> : null}
    </div>
  );
}

export { LP3FooterDock };
