import {
  ADMIN_HOME_MAIN_CLASS,
  AdminHomePageContent,
} from "@client/widgets/admin-home-screen";
import { AppShell } from "@client/widgets/site-nav";
import type { AuthProps } from "@shared/auth";

export default function AdminIndex(props: AuthProps) {
  return (
    <AppShell auth={props.auth} mainClassName={ADMIN_HOME_MAIN_CLASS}>
      <AdminHomePageContent />
    </AppShell>
  );
}
