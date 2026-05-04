import type { AdminReviewsPageContentProps } from "@client/widgets/admin-reviews-screen";
import {
  ADMIN_REVIEWS_MAIN_CLASS,
  AdminReviewsPageContent,
} from "@client/widgets/admin-reviews-screen";
import { AppShell } from "@client/widgets/site-nav";
import type { AuthProps } from "@shared/auth";

export default function AdminReviews(
  props: AuthProps & AdminReviewsPageContentProps,
) {
  return (
    <AppShell auth={props.auth} mainClassName={ADMIN_REVIEWS_MAIN_CLASS}>
      <AdminReviewsPageContent items={props.items} />
    </AppShell>
  );
}
