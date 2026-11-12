"use client";
import Link from "next/link";
import { useState } from "react";
import type { RecordData } from "@/lib/domain";
export function Archive({ records }: { records: RecordData[] }) {
  const [query, setQuery] = useState(""),
    [limit, setLimit] = useState(6);
  const tokens = query
    .toLowerCase()
    .replaceAll("/", " ")
    .split(/\s+/)
    .filter(Boolean);
  const filtered = records.filter((record) =>
    tokens.every((token) =>
      (
        record.session +
        " " +
        record.president +
        " " +
        JSON.stringify(record.executives)
      )
        .toLowerCase()
        .replaceAll("/", " ")
        .includes(token),
    ),
  );
  return (
    <>
      <div className="archive-search">
        <label className="sr-only" htmlFor="archive-search">
          Search by name or session
        </label>
        <input
          id="archive-search"
          type="search"
          value={query}
          placeholder="Search by name or session"
          onChange={(event) => {
            setQuery(event.target.value);
            setLimit(6);
          }}
        />
      </div>
      <p className="archive-note">
        Our archive is growing; unverified records are marked as awaiting
        details.
      </p>
      <div className="archive-list">
        {filtered.slice(0, limit).map((record) => (
          <Link
            className="archive-row"
            key={record.id}
            href={"/legacy/" + record.slug}
          >
            <div
              className={
                "archive-avatar" + (!record.verified ? " pending" : "")
              }
            >
              {record.president
                ? record.president
                    .split(" ")
                    .map((x: string) => x[0])
                    .slice(0, 3)
                    .join("")
                : "—"}
            </div>
            <span className="tenure">{record.session}</span>
            <span className="name">
              {record.president || "Record to be added"}
            </span>
            <span className="role">President</span>
          </Link>
        ))}
      </div>
      {!filtered.length && (
        <p className="empty-state">No records match your search.</p>
      )}
      <div className="archive-pagination">
        <span aria-live="polite">
          Showing {Math.min(limit, filtered.length)} of {filtered.length}{" "}
          records
        </span>
        {limit < filtered.length && (
          <button className="btn-ghost" onClick={() => setLimit(limit + 6)}>
            Show more records
          </button>
        )}
      </div>
    </>
  );
}
