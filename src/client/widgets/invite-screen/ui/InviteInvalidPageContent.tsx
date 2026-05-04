import { Link } from "@inertiajs/react";

export const INVITE_INVALID_MAIN_CLASS =
  "mx-auto max-w-lg px-4 py-16 font-sans";

type InviteInvalidPageContentProps = { message: string };

export function InviteInvalidPageContent(props: InviteInvalidPageContentProps) {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Invitation</h1>
      <p className="mt-4 text-neutral-400">{props.message}</p>
      <p className="mt-8">
        <Link href="/" className="text-neutral-400 hover:text-white">
          ← Back home
        </Link>
      </p>
    </>
  );
}
