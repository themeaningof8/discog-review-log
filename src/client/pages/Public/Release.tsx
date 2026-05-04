import type { ReleaseDetailPageContentProps } from "@client/widgets/release-detail-screen";
import {
  RELEASE_DETAIL_MAIN_CLASS,
  ReleaseDetailPageContent,
} from "@client/widgets/release-detail-screen";
import { AppShell } from "@client/widgets/site-nav";
import type { AuthProps } from "@shared/auth";

export default function Release(
  props: AuthProps & ReleaseDetailPageContentProps,
) {
  return (
    <AppShell auth={props.auth} mainClassName={RELEASE_DETAIL_MAIN_CLASS}>
      <ReleaseDetailPageContent
        release={props.release}
        reviews={props.reviews}
      />
    </AppShell>
  );
}
