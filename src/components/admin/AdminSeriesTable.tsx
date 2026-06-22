"use client";

import Link from "next/link";
import { ADMIN_GRADIENTS } from "@/components/admin/adminUi";
import type { CatalogSeries } from "@/types/catalog";

interface AdminSeriesTableProps {
  series: CatalogSeries[];
  loading: boolean;
  onEdit: (id: string) => void;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
  onDelete: (id: string, title: string) => void;
}

export default function AdminSeriesTable({
  series,
  loading,
  onEdit,
  onPublish,
  onUnpublish,
  onDelete,
}: AdminSeriesTableProps) {
  if (loading && series.length === 0) {
    return (
      <div className="rounded-xl border border-[#EDEBE9] bg-white px-6 py-16 text-center text-sm text-[#605E5C]">
        Loading catalog…
      </div>
    );
  }

  if (series.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#D2D0CE] bg-white px-6 py-16 text-center">
        <p className="text-sm font-semibold text-[#323130]">No comics in catalog</p>
        <p className="mt-1 text-sm text-[#605E5C]">
          Create your first series with the button above.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#EDEBE9] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[920px] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#EDEBE9] bg-[#FAF9F8] text-[11px] font-semibold uppercase tracking-wide text-[#605E5C]">
              <th className="px-4 py-3 w-14" />
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Genre</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Episodes</th>
              <th className="px-4 py-3">Creator</th>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Views</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDEBE9]">
            {series.map((row) => (
              <tr key={row.id} className="hover:bg-[#FAF9F8]/80">
                <td className="px-4 py-3">
                  <div
                    className={`h-12 w-9 overflow-hidden rounded-md bg-gradient-to-br shadow-sm ${row.coverGradient ?? ADMIN_GRADIENTS[0].class}`}
                  >
                    {row.coverArtUrl ? (
                      <img
                        src={row.coverArtUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/story/${row.id}`}
                    className="font-semibold text-[#0078D4] hover:underline"
                  >
                    {row.title}
                  </Link>
                  <p className="mt-0.5 max-w-[220px] truncate text-xs text-[#605E5C]">
                    {row.synopsis || "—"}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-[#F3F2F1] px-2.5 py-0.5 text-xs font-semibold text-[#323130]">
                    {row.genre}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3 text-[#323130]">{row.episodeCount}</td>
                <td className="px-4 py-3 max-w-[120px] truncate text-[#605E5C]">
                  {row.creatorDisplayName}
                </td>
                <td className="px-4 py-3 text-[#605E5C]">
                  {row.featuredRank ?? "—"}
                </td>
                <td className="px-4 py-3 text-[#605E5C]">
                  {row.viewsCount.toLocaleString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-[#605E5C]">
                  {new Date(row.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(row.id)}
                      className="rounded-md border border-[#0078D4] px-2.5 py-1 text-xs font-semibold text-[#0078D4] hover:bg-[#EFF6FC]"
                    >
                      Edit
                    </button>
                    <Link
                      href={`/story/${row.id}/read`}
                      className="rounded-md bg-[#0078D4] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#106EBE]"
                    >
                      Read
                    </Link>
                    {row.status === "published" ? (
                      <button
                        type="button"
                        onClick={() => onUnpublish(row.id)}
                        className="rounded-md border border-[#D2D0CE] px-2.5 py-1 text-xs font-semibold text-[#605E5C] hover:bg-[#F3F2F1]"
                      >
                        Unpublish
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onPublish(row.id)}
                        className="rounded-md border border-[#107C10] px-2.5 py-1 text-xs font-semibold text-[#107C10] hover:bg-[#DFF6DD]"
                      >
                        Publish
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDelete(row.id, row.title)}
                      className="rounded-md px-2.5 py-1 text-xs font-semibold text-[#A4262C] hover:bg-[#FDE7E9]"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-[#EDEBE9] bg-[#FAF9F8] px-4 py-2 text-xs text-[#605E5C]">
        {series.length} series in catalog
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: CatalogSeries["status"] }) {
  const published = status === "published";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
        published
          ? "bg-[#DFF6DD] text-[#107C10]"
          : "bg-[#F3F2F1] text-[#605E5C]"
      }`}
    >
      {status}
    </span>
  );
}
