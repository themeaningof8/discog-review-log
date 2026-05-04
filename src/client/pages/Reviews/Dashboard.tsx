import type { MyReviewsPageContentProps } from "@client/widgets/my-reviews-screen";
import {
  MY_REVIEWS_MAIN_CLASS,
  MyReviewsPageContent,
} from "@client/widgets/my-reviews-screen";
import { AppShell } from "@client/widgets/site-nav";
import type { AuthProps } from "@shared/auth";

export default function Dashboard(
  props: AuthProps & MyReviewsPageContentProps,
) {
  return (
    <AppShell auth={props.auth} mainClassName={MY_REVIEWS_MAIN_CLASS}>
      <MyReviewsPageContent items={props.items} />
    </AppShell>
  );
}
