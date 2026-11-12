import { requireSession } from "@/lib/payload";
import { AccountNav } from "@/components/AccountNav";
import { isStaff, type Actor } from "@/lib/domain";
export const metadata = { robots: { index: false, follow: false } };
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSession();
  return (
    <div className="wrap page-shell account-layout">
      <AccountNav
        name={user.name}
        email={user.email}
        mentor={Boolean(user.roles?.includes("mentor"))}
        contributor={Boolean(user.roles?.includes("contributor"))}
        staff={isStaff(user as Actor)}
      />
      <div className="account-content">{children}</div>
    </div>
  );
}
