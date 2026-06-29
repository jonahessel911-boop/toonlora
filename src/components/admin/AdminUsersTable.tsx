"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminUserRow } from "@/lib/services/admin-users-repository";

export default function AdminUsersTable({
  refreshKey = 0,
}: {
  refreshKey?: number;
}) {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load users.");
        return;
      }
      setUsers(data.users ?? []);
    } catch {
      setError("Could not load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const handleDelete = async (user: AdminUserRow) => {
    const confirmed = window.confirm(
      `Delete ${user.fullName} (${user.email})?\n\nThis removes their account from Toonlora and revokes subscription access. This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(user.id);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Delete failed.");
        return;
      }
      setUsers((prev) => prev.filter((row) => row.id !== user.id));
    } catch {
      setError("Could not delete user.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[#323130]">Users</h2>
          <p className="text-xs text-[#605E5C]">
            Registered accounts with subscription status
          </p>
        </div>
        <span className="rounded-full bg-[#EDEBE9] px-2.5 py-1 text-xs font-semibold text-[#605E5C]">
          {users.length} total
        </span>
      </div>

      {error ? (
        <div className="rounded-lg border border-[#F1BBBC] bg-[#FDE7E9] px-3 py-2 text-sm text-[#A4262C]">
          {error}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-[#EDEBE9] bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#EDEBE9] bg-[#FAF9F8] text-[11px] uppercase tracking-wide text-[#605E5C]">
            <tr>
              <th className="px-3 py-2.5 font-semibold sm:px-4">Name</th>
              <th className="px-3 py-2.5 font-semibold sm:px-4">Email</th>
              <th className="px-3 py-2.5 font-semibold sm:px-4">Subscription</th>
              <th className="px-3 py-2.5 font-semibold sm:px-4">Renews</th>
              <th className="px-3 py-2.5 font-semibold sm:px-4">Joined</th>
              <th className="px-3 py-2.5 font-semibold sm:px-4" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-[#605E5C]"
                >
                  Loading users…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-[#605E5C]"
                >
                  No registered users yet.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-[#EDEBE9] last:border-0"
                >
                  <td className="px-3 py-2.5 font-medium text-[#323130] sm:px-4">
                    {user.fullName}
                  </td>
                  <td className="px-3 py-2.5 text-[#605E5C] sm:px-4">
                    {user.email}
                  </td>
                  <td className="px-3 py-2.5 sm:px-4">
                    {user.isActiveSubscription ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DFF6DD] px-2 py-0.5 text-xs font-semibold text-[#107C10]">
                        {user.subscriptionPlanLabel}
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-[#EDEBE9] px-2 py-0.5 text-xs font-semibold text-[#605E5C]">
                        Free
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-[#605E5C] sm:px-4">
                    {user.isActiveSubscription && user.subscriptionPeriodEnd
                      ? new Date(user.subscriptionPeriodEnd).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-[#605E5C] sm:px-4">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2.5 text-right sm:px-4">
                    <button
                      type="button"
                      onClick={() => void handleDelete(user)}
                      disabled={deletingId === user.id}
                      className="rounded border border-[#F1BBBC] px-2.5 py-1 text-xs font-semibold text-[#A4262C] hover:bg-[#FDE7E9] disabled:opacity-50"
                    >
                      {deletingId === user.id ? "…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
