import {
  INVITE_ACCEPT_MAIN_CLASS,
  INVITE_INVALID_MAIN_CLASS,
  InviteAcceptPageContent,
  InviteInvalidPageContent,
} from "@client/widgets/invite-screen";
import { AppShell } from "@client/widgets/site-nav";
import type { AuthProps } from "@shared/auth";

type InvitePageProps =
  | (AuthProps & {
      ok: false;
      message: string;
    })
  | (AuthProps & {
      ok: true;
      token: string;
      email: string;
      errors: string | null;
    });

export default function Invite(props: InvitePageProps) {
  if (!props.ok) {
    return (
      <AppShell auth={props.auth} mainClassName={INVITE_INVALID_MAIN_CLASS}>
        <InviteInvalidPageContent message={props.message} />
      </AppShell>
    );
  }
  return (
    <AppShell auth={props.auth} mainClassName={INVITE_ACCEPT_MAIN_CLASS}>
      <InviteAcceptPageContent
        token={props.token}
        email={props.email}
        errors={props.errors}
      />
    </AppShell>
  );
}
