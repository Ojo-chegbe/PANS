"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export function MentorDialog({
  name,
  href,
  children,
}: {
  name: string;
  href: string;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleID = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <Link
        className="mentor-card-link"
        href={href}
        prefetch={false}
        aria-haspopup="dialog"
        onClick={(event) => {
          if (
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            !dialog.current?.showModal
          )
            return;
          event.preventDefault();
          dialog.current.showModal();
          setOpen(true);
        }}
      >
        View profile<span className="sr-only">: {name}</span>
      </Link>
      <dialog
        ref={dialog}
        className="mentor-dialog"
        aria-labelledby={titleID}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
            ),
          ).filter((element) => element.getClientRects().length > 0);
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
        <div className="mentor-dialog-panel">
          <div className="mentor-dialog-toolbar">
            <span className="section-tag">Meet your mentor</span>
            <button
              type="button"
              className="btn-ghost"
              autoFocus
              onClick={() => dialog.current?.close()}
            >
              Close
            </button>
          </div>
          <h2 id={titleID} className="mentor-dialog-title">
            {name}
          </h2>
          {open && children}
          <Link className="quiet-link mentor-full-profile" href={href}>
            Open full profile
          </Link>
        </div>
      </dialog>
    </>
  );
}
