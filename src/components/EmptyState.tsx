import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({
  title,
  description,
  actionLabel = "Create your first story",
  actionHref = "/create",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-groen-mint/50 px-6 py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-groen-light to-groen-primary text-4xl shadow-lg">
        📖
      </div>
      <h3 className="text-xl font-black text-gray-900">{title}</h3>
      <p className="mt-2 max-w-sm text-sm font-medium text-gray-600">
        {description}
      </p>
      <Link
        href={actionHref}
        className="mt-8 rounded-full bg-groen-deep px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:opacity-90"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
