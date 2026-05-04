import type { PublicReviewPageContentProps } from "@client/widgets/public-review-screen";
import {
  PUBLIC_REVIEW_MAIN_CLASS,
  PublicReviewPageContent,
} from "@client/widgets/public-review-screen";
import { AppShell } from "@client/widgets/site-nav";
import type { AuthProps } from "@shared/auth";

export default function Review(
  props: AuthProps & PublicReviewPageContentProps,
) {
  return (
    <AppShell auth={props.auth} mainClassName={PUBLIC_REVIEW_MAIN_CLASS}>
      <PublicReviewPageContent
        review={props.review}
        release={props.release}
        scores={props.scores}
      />
    </AppShell>
  );
}
