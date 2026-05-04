import type { AdminUsersPageContentProps } from "@client/widgets/admin-users-screen";
import {
  ADMIN_USERS_MAIN_CLASS,
  AdminUsersPageContent,
} from "@client/widgets/admin-users-screen";
import { AppShell } from "@client/widgets/site-nav";
import type { AuthProps } from "@shared/auth";

export default function AdminUsers(
  props: AuthProps & AdminUsersPageContentProps,
) {
  return (
    <AppShell auth={props.auth} mainClassName={ADMIN_USERS_MAIN_CLASS}>
      <AdminUsersPageContent users={props.users} />
    </AppShell>
  );
}
