import type { HomePageContentProps } from "@client/widgets/home-screen";
import { HOME_MAIN_CLASS, HomePageContent } from "@client/widgets/home-screen";
import { AppShell } from "@client/widgets/site-nav";
import type { AuthProps } from "@shared/auth";

export default function Home(props: AuthProps & HomePageContentProps) {
  return (
    <AppShell auth={props.auth} mainClassName={HOME_MAIN_CLASS}>
      <HomePageContent items={props.items} />
    </AppShell>
  );
}
