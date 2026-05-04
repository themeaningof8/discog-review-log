import type { EditReviewPageContentProps } from "@client/widgets/edit-review-screen";
import {
  EDIT_REVIEW_MAIN_CLASS,
  EditReviewPageContent,
} from "@client/widgets/edit-review-screen";
import { AppShell } from "@client/widgets/site-nav";
import type { AuthProps } from "@shared/auth";

export default function Edit(props: AuthProps & EditReviewPageContentProps) {
  return (
    <AppShell auth={props.auth} mainClassName={EDIT_REVIEW_MAIN_CLASS}>
      <EditReviewPageContent
        review={props.review}
        release={props.release}
        scores={props.scores}
        allTags={props.allTags}
        selectedTagIds={props.selectedTagIds}
      />
    </AppShell>
  );
}
