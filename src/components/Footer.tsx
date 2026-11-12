import Link from "next/link";
import { Brand } from "./Brand";
export function Footer({ settings }: { settings: any }) {
  return (
    <footer id="join">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Brand />
            <p>{settings.footerDescription}</p>
          </div>
          {settings.footerGroups?.map((group: any) => (
            <div className="footer-col" key={group.id || group.title}>
              <h4>{group.title}</h4>
              {group.links?.map((link: any) => (
                <Link key={link.url} href={link.url}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        {settings.socialLinks?.length > 0 && (
          <div className="footer-social">
            {settings.socialLinks.map((link: any) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
        <div className="footer-bottom">
          <span>{settings.copyright}</span>
          <span>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/refunds">Refunds</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
