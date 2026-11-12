import type { Metadata } from "next";
import "./reference.css";
import "./site.css";
import "./account-experience.css";
import { settings, getSession } from "@/lib/payload";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/components/Cart";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const site = await settings();
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
    ),
    title: {
      default:
        (site.siteName || "PANS Digital Hub") + " — University of Jos Chapter",
      template: "%s — " + (site.siteName || "PANS Digital Hub"),
    },
    description:
      site.description ||
      "Your PANS UNIJOS community. Build skills, find guidance, explore our legacy, and grow together.",
    openGraph: {
      title: site.siteName || "PANS Digital Hub",
      description: site.description || undefined,
      type: "website",
    },
  };
}
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [site, user] = await Promise.all([settings(), getSession()]);
  return (
    <html lang="en">
      <body>
        <CartProvider key={user?.id ?? "guest"} userID={user?.id}>
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <Header
            navigation={(site.navigation || []) as any}
            signedIn={Boolean(user)}
          />
          <main id="main">{children}</main>
          <Footer settings={site} />
        </CartProvider>
      </body>
    </html>
  );
}
