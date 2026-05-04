import type { AdminTagsPageContentProps } from "@client/widgets/admin-tags-screen";
import {
  ADMIN_TAGS_MAIN_CLASS,
  AdminTagsPageContent,
} from "@client/widgets/admin-tags-screen";
import { AppShell } from "@client/widgets/site-nav";
import type { AuthProps } from "@shared/auth";

export default function AdminTags(
  props: AuthProps & AdminTagsPageContentProps,
) {
  return (
    <AppShell auth={props.auth} mainClassName={ADMIN_TAGS_MAIN_CLASS}>
      <AdminTagsPageContent tags={props.tags} error={props.error} />
    </AppShell>
  );
}
