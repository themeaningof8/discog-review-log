import type { NewReviewPageContentProps } from "@client/widgets/new-review-screen";
import {
  NEW_REVIEW_MAIN_CLASS,
  NewReviewPageContent,
} from "@client/widgets/new-review-screen";
import { AppShell } from "@client/widgets/site-nav";
import type { AuthProps } from "@shared/auth";

export default function New(props: AuthProps & NewReviewPageContentProps) {
  return (
    <AppShell auth={props.auth} mainClassName={NEW_REVIEW_MAIN_CLASS}>
      <NewReviewPageContent
        step={props.step}
        previewError={props.previewError}
        release={props.release}
        releaseId={props.releaseId}
        allTags={props.allTags}
      />
    </AppShell>
  );
}
