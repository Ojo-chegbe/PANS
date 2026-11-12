"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ActionButton } from "./ActionForm";
export function AccountNav({
  mentor,
  contributor,
  staff,
  name,
  email,
}: {
  mentor: boolean;
  contributor: boolean;
  staff: boolean;
  name: string;
  email: string;
}) {
  const path = usePathname();
  const router = useRouter();
  const links = [
    ["/account", "Overview"],
    ["/account/courses", "My courses"],
    ["/account/resources", "My resources"],
    ["/account/orders", "My orders"],
    ["/account/mentorship", "Mentorship"],
    ["/account/events", "Events"],
    ["/account/contributions", contributor ? "Contributions" : "Applications"],
    ...(mentor ? [["/account/mentor-profile", "Mentor profile"]] : []),
    ["/account/notifications", "Updates"],
    ["/account/profile", "Profile"],
  ];
  return (
    <aside className="account-sidebar">
      <Link href="/account/profile" className="account-identity">
        <span className="account-initial" aria-hidden="true">
          {name.trim().charAt(0).toUpperCase()}
        </span>
        <span>
          <strong>{name}</strong>
          <small>{email}</small>
        </span>
      </Link>
      <nav className="account-nav" aria-label="Account navigation">
        <label className="sr-only" htmlFor="account-destination">
          Account page
        </label>
        <select
          id="account-destination"
          className="account-mobile-select"
          value={
            links.find(
              ([url]) => url !== "/account" && path.startsWith(url),
            )?.[0] || "/account"
          }
          onChange={(event) => router.push(event.target.value)}
        >
          {links.map(([url, label]) => (
            <option key={url} value={url}>
              {label}
            </option>
          ))}
          {staff && <option value="/admin">Administration</option>}
        </select>
        <div className="account-nav-links">
          {links.map(([url, label]) => (
            <Link
              key={url}
              href={url}
              aria-current={
                path === url ||
                (url !== "/account" && path.startsWith(url + "/"))
                  ? "page"
                  : undefined
              }
            >
              {label}
            </Link>
          ))}
          {staff && <Link href="/admin">Administration</Link>}
        </div>
        <ActionButton action="/api/users/logout" className="text-button">
          Sign out
        </ActionButton>
      </nav>
    </aside>
  );
}
