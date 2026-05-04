import type { AuthProps } from "@shared/auth";
import type { ReactNode } from "react";
import { SiteNav } from "./SiteNav";

export type AppShellProps = AuthProps & {
  children: ReactNode;
  /** Full `className` for `<main>` (width, padding, typography). */
  mainClassName: string;
};

export function AppShell(props: AppShellProps) {
  const { auth, children, mainClassName } = props;
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <SiteNav auth={auth} />
      <main className={mainClassName}>{children}</main>
    </div>
  );
}
