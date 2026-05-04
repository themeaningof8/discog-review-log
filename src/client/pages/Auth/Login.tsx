import type { LoginPageContentProps } from "@client/widgets/login-screen";
import {
  LOGIN_MAIN_CLASS,
  LoginPageContent,
} from "@client/widgets/login-screen";
import { AppShell } from "@client/widgets/site-nav";
import type { AuthProps } from "@shared/auth";

export default function Login(props: AuthProps & LoginPageContentProps) {
  return (
    <AppShell auth={props.auth} mainClassName={LOGIN_MAIN_CLASS}>
      <LoginPageContent errors={props.errors} />
    </AppShell>
  );
}
